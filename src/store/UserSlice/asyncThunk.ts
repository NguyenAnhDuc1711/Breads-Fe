import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { initialUserState, IUser } from ".";
import {
  COLLECTION_PATH,
  Route,
  USER_PATH,
} from "../../Breads-Shared/APIConfig";
import PageConstant from "../../Breads-Shared/Constants/PageConstants";
import {
  DELETE,
  GET,
  PATCH,
  POST,
  PUT,
  setAccessToken,
  ensureFreshAccessToken,
  notifyTokenRefreshed,
} from "../../config/API";
// LOAD-BEARING IMPORT — đừng xoá dù trông như chỉ dùng ở logout().
// Chính import này làm module src/socket.ts được evaluate, và đó là nơi
// onTokenRefreshed(...) đăng ký callback reconnect. Xoá import ⇒ toàn bộ
// đường notify của FR-6 (login) và FR-8 (bootstrap) chết im lặng.
import Socket from "../../socket";
import { initialMsgState } from "../MessageSlice";
import { initialPostState, updateListPost } from "../PostSlice";
import { initialUtilState } from "../UtilSlice";

export const validateEmailByCode = createAsyncThunk(
  "user/validateEmailByCode",
  async (payload: any, { rejectWithValue }) => {
    try {
      const data = await POST({
        path: Route.USER + USER_PATH.VALIDATE_USER_EMAIL,
        payload,
      });
      return data;
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const signUp = createAsyncThunk(
  "user/signUp",
  async (payload: any, { rejectWithValue }) => {
    try {
      const data = await POST({
        path: Route.USER + USER_PATH.SIGN_UP,
        payload,
      });
      if (data) {
        // localStorage.setItem("userId", data?._id);
        return data;
      }
      return null;
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const login = createAsyncThunk(
  "user/login",
  async (payload: any, { rejectWithValue }) => {
    try {
      const data: IUser | undefined | null = await POST({
        path: Route.USER + USER_PATH.LOGIN,
        payload,
      });
      if (data) {
        const objectIdRegex = /^[a-fA-F0-9]{24}$/;
        if (data?._id && objectIdRegex.test(data?._id)) {
          localStorage.setItem("userId", data?._id);
        }
        // Store access token in memory (not localStorage for security)
        if (data?.accessToken) {
          setAccessToken(data.accessToken);
          // FR-6: báo cho socket biết đã có token mới để nó .connect() ngay,
          // không phải chờ một lỗi 401 ngẫu nhiên nào khác xảy ra trước.
          notifyTokenRefreshed();
        }
      }
      return data;
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        return rejectWithValue(err.response?.data);
      }
    }
  },
);

/**
 * FR-8: sau F5, accessToken in-memory đã mất nhưng SSR đã xác nhận có
 * session qua cookie (hasInitialUser === true). Gọi thẳng /refresh-token
 * qua facade single-flight để lấy token mới trong ĐÚNG 1 round-trip —
 * không đi qua getMe() (sẽ tốn thêm 1 vòng 401 vô ích chỉ để biết điều
 * SSR đã trả lời rồi).
 *
 * Thunk này CỐ Ý không có case reducer trong UserSlice: nó không đổi state
 * nào cả. Nó tồn tại ở dạng thunk (thay vì gọi thẳng trong useEffect) để
 * quan sát được trong Redux DevTools như mọi luồng auth khác, và để có một
 * chỗ duy nhất tiến hoá xử lý thất bại về sau.
 *
 * Thất bại (vd: user chỉ còn cookie jwt legacy) được nuốt qua
 * rejectWithValue — KHÔNG throw ra ngoài, KHÔNG điều hướng. Việc redirect
 * /login thuộc response interceptor ở API call kế tiếp.
 */
export const bootstrapSession = createAsyncThunk(
  "user/bootstrapSession",
  async (_, { rejectWithValue }) => {
    try {
      await ensureFreshAccessToken();
      return true;
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const getMe = createAsyncThunk("user/getMe", async (_, thunkAPI) => {
  try {
    const data = await GET({
      path: Route.USER + USER_PATH.ME,
    });
    if (data && data._id) {
      localStorage.setItem("userId", data._id);
      return data;
    }
    return thunkAPI.rejectWithValue("Session expired or user not found");
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
    return thunkAPI.rejectWithValue(err);
  }
});

export const logout = createAsyncThunk("user/logout", async (_, thunkAPI) => {
  try {
    const data = await POST({
      path: Route.USER + USER_PATH.LOGOUT,
    });
    // Clear in-memory access token
    setAccessToken(null);
    // Disconnect socket to prevent stale connections
    Socket.disconnect();
    localStorage.removeItem("userId");
    if (typeof document !== "undefined") {
      document.cookie = "refreshToken=; path=/; max-age=0; SameSite=Lax";
      // Also clear legacy jwt cookie
      document.cookie = "jwt=; path=/; max-age=0; SameSite=Lax";
    }
    return data;
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
});

export const updateUser = createAsyncThunk(
  "user/updateUser",
  async (payload: any, thunkAPI) => {
    try {
      const userId = payload?.userId;
      if (userId) {
        delete payload.userId;
      }
      // Task 020 (D-1): PUT /users/update/:id -> PUT /users/:id (id trong constant).
      const data = await PUT({
        path: Route.USER + USER_PATH.UPDATE.replace(":id", userId),
        payload,
      });
      return data;
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        return thunkAPI.rejectWithValue(err.response?.data);
      }
    }
  },
);

export const addPostToCollection = createAsyncThunk(
  "user/addToCollection",
  async (payload: any, thunkAPI) => {
    try {
      const { userId, postId } = payload;
      // Task 013/021 (D-1): PATCH /collections/add -> PATCH /collections/:userId/items
      // (userId trong path, postId trong body).
      await PATCH({
        path: Route.COLLECTION + COLLECTION_PATH.ADD.replace(":userId", userId),
        payload: {
          postId: postId,
        },
      });
      return postId;
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        return thunkAPI.rejectWithValue(err.response?.data);
      }
    }
  },
);

export const removePostFromCollection = createAsyncThunk(
  "user/removeFromCollection",
  async (payload: any, thunkAPI) => {
    try {
      const rootState: any = thunkAPI.getState();
      const dispatch = thunkAPI.dispatch;
      const displayPageData = rootState.util.displayPageData;
      const { userId, postId } = payload;
      // Task 013/021 (D-1): PATCH /collections/remove -> DELETE /collections/:userId/items/:postId
      // (method đổi PATCH -> DELETE, cả 2 id trong path, không còn body).
      await DELETE({
        path: Route.COLLECTION + COLLECTION_PATH.REMOVE.replace(":userId", userId).replace(
          ":postId",
          postId,
        ),
      });
      if (displayPageData === PageConstant.SAVED) {
        const newListPost = rootState.post.listPost.filter(
          (post) => post._id !== postId,
        );
        dispatch(updateListPost(newListPost));
        return {
          postId: postId,
        };
      }
      return {
        postId: postId,
      };
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        return thunkAPI.rejectWithValue(err.response?.data);
      }
    }
  },
);

export const followUser = createAsyncThunk(
  "user/handleFollow",
  async (payload: any, thunkAPI) => {
    try {
      const { userFlId } = payload;
      // Bước 4 (access-control-hardening): KHÔNG gửi `userId` nữa — server lấy người follow từ JWT.
      // Caller (`FollowBtn`) vẫn truyền `userId` vào thunk vì reducer dùng nó cho state cục bộ.
      await PUT({
        path: Route.USER + USER_PATH.FOLLOW,
        payload: {
          userFlId,
        },
      });
      return userFlId;
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        return thunkAPI.rejectWithValue(err.response?.data);
      }
    }
  },
);

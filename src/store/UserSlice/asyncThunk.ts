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
        if (data?.accessToken) {
          setAccessToken(data.accessToken);
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
    setAccessToken(null);
    Socket.disconnect();
    localStorage.removeItem("userId");
    if (typeof document !== "undefined") {
      document.cookie = "refreshToken=; path=/; max-age=0; SameSite=Lax";
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

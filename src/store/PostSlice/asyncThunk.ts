import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { IPost } from ".";
import { POST_PATH, Route } from "../../Breads-Shared/APIConfig";
import { DELETE, GET, PATCH, POST, PUT } from "../../config/API";
import { openNewPostNotify, showToast, updateHasMoreData } from "../UtilSlice";

export const createPost = createAsyncThunk(
  "post/create",
  async (
    {
      postPayload,
      action,
    }: {
      postPayload: IPost;
      action: string;
    },
    thunkApi
  ) => {
    try {
      if (postPayload.survey?.length) {
        postPayload.survey = postPayload.survey.filter(
          (option) => option.value.trim() !== ""
        );
      }
      const dispatch = thunkApi.dispatch;
      const rootState: any = thunkApi.getState();
      const currerntPage = rootState.util.currentPage;
      // Bước 3 (access-control-hardening): `authorId` KHÔNG còn được gửi lên — server lấy tác giả
      // từ JWT. Vẫn tách ra ở đây (thay vì để `z.object()` bên Be strip đi) để hợp đồng API nói
      // đúng sự thật: danh tính không phải là một field payload mà client được quyền đặt.
      const { authorId: _ignoredAuthorId, ...postPayloadToSend } = postPayload as any;
      const data = await POST({
        path: Route.POST + POST_PATH.CREATE,
        payload: postPayloadToSend,
        params: {
          action: action,
        },
      });
      const errMsg = data?.error;
      if (data && !errMsg) {
        dispatch(openNewPostNotify());
      }
      if (errMsg) {
        dispatch(
          showToast({
            title: "Error",
            description: errMsg,
            status: "error",
          })
        );
      }
      return {
        data,
        currentPage: currerntPage,
      };
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        return thunkApi.rejectWithValue(err.response?.data);
      }
    }
  }
);

export const editPost = createAsyncThunk(
  "post/update",
  async (payload: any, thunkApi) => {
    try {
      // Bước 3: bỏ `userId: userInfo._id` khỏi payload — quyền sửa do server đối chiếu
      // `post.authorId` với `req.user._id`, không với giá trị client gửi kèm.
      // Task 020 (D-1): PUT /posts/update -> PUT /posts/:id — id giờ nằm trong path (T011).
      const data = await PUT({
        path: Route.POST + POST_PATH.UPDATE.replace(":id", payload._id),
        payload,
      });
      return data;
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        return thunkApi.rejectWithValue(err.response?.data);
      }
    }
  }
);

export const deletePost = createAsyncThunk(
  "post/delete",
  async (payload: any, thunkApi) => {
    try {
      const rootState: any = thunkApi.getState();
      const currentPage = rootState.util.currentPage;
      const { postId } = payload;
      // Bước 3: bỏ `params: { userId }` — cùng lý do `editPost` ở trên.
      await DELETE({
        path: Route.POST + "/" + postId,
      });
      return {
        postId,
        currentPage,
      };
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        return thunkApi.rejectWithValue(err.response?.data);
      }
    }
  }
);

export const getPosts = createAsyncThunk(
  "post/getPosts",
  async (params: any, thunkApi) => {
    try {
      if (!params?.page) {
        params.page = 1;
      }
      if (!params?.limit) {
        params.limit = 20;
      }
      const posts: any = await GET({
        path: Route.POST + POST_PATH.GET_ALL,
        params,
      });
      if (Array.isArray(posts)) {
        const hasMoreData = posts.length !== 0;
        thunkApi.dispatch(updateHasMoreData(hasMoreData));
        return {
          posts: posts,
          isNewPage: params?.isNewPage ?? false,
        };
      }
      return thunkApi.rejectWithValue(posts);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        return thunkApi.rejectWithValue(err.response?.data);
      }
    }
  }
);

// BE không còn nhúng `replies` đầy đủ trong response getPost (post.model.ts đã bỏ field mảng
// nhúng) — danh sách reply giờ tải riêng, phân trang, cùng convention isNewPage/page với `getPosts`.
export const getPostReplies = createAsyncThunk(
  "post/getPostReplies",
  async (
    { postId, page, isNewPage }: { postId: string; page: number; isNewPage?: boolean },
    thunkApi
  ) => {
    try {
      const data: any = await GET({
        path: Route.POST + POST_PATH.REPLIES.replace(":id", postId),
        params: { page, limit: 20 },
      });
      const replies = Array.isArray(data?.replies) ? data.replies : [];
      thunkApi.dispatch(updateHasMoreData(replies.length !== 0));
      return {
        postId,
        replies,
        isNewPage: isNewPage ?? false,
      };
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        return thunkApi.rejectWithValue(err.response?.data);
      }
    }
  }
);

export const selectSurveyOption = createAsyncThunk(
  "post/tickSurvey",
  async (payload: any, thunkApi) => {
    try {
      // Task 020 (D-1): PUT /posts/tick-post-survey -> POST /posts/:id/survey-ticks (method đổi
      // PUT -> POST, id post vào path; postId có sẵn trong payload từ caller).
      // Bước 3: chỉ gửi `optionId` + `isAdd`. `userId`/`postId` vẫn nằm trong `payload` vì reducer
      // dùng chúng để cập nhật state cục bộ (`return payload` bên dưới), nhưng KHÔNG được gửi lên:
      // phiếu ghi cho ai là do server quyết theo JWT.
      await POST({
        path: Route.POST + POST_PATH.TICK_SURVEY.replace(":id", payload.postId),
        payload: { optionId: payload.optionId, isAdd: payload.isAdd },
      });
      return payload;
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        return thunkApi.rejectWithValue(err.response?.data);
      }
    }
  }
);

export const updatePostVisibility = createAsyncThunk(
  "post/updatePostVisibility",
  async (payload: any, thunkApi) => {
    try {
      // Task 020 (D-1): POST /posts/update-post-visibility -> PATCH /posts/:id/visibility (method
      // đổi POST -> PATCH, postId chuyển từ body vào path — body chỉ còn userId/visibility).
      const { postId, ...body } = payload;
      await PATCH({
        path: Route.POST + POST_PATH.UPDATE_POST_VISIBILITY.replace(":id", postId),
        payload: body,
      });
      return payload.postId;
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        return thunkApi.rejectWithValue(err.response?.data);
      }
    }
  }
);

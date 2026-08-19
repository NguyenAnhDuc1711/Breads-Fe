import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { IPost } from ".";
import { POST_PATH, Route } from "../../Breads-Shared/APIConfig";
import PageConstant from "../../Breads-Shared/Constants/PageConstants";
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
      const data = await POST({
        path: Route.POST + POST_PATH.CREATE,
        payload: postPayload,
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
      const rootState: any = thunkApi.getState();
      const userInfo = rootState.user.userInfo;
      payload = {
        ...payload,
        userId: userInfo._id,
      };
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
      const userInfo = rootState.user.userInfo;
      const currentPage = rootState.util.currentPage;
      const { postId } = payload;
      await DELETE({
        path: Route.POST + "/" + postId,
        params: { userId: userInfo._id },
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

export const getPost = createAsyncThunk(
  "post/getPost",
  async (postId: string, thunkApi) => {
    try {
      const data = await GET({
        path: Route.POST + "/" + postId,
      });
      if (data?._id) {
        return data;
      }
      return thunkApi.rejectWithValue(data);
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

export const getUserPosts = createAsyncThunk(
  "post/getUserPosts",
  async (userId: string, thunkApi) => {
    try {
      const rootState: any = thunkApi.getState();
      const displayPageData = rootState.util.displayPageData;
      const data = await GET({
        path: Route.POST + POST_PATH.GET_ALL,
        params: {
          userId: userId,
          filter: { page: PageConstant.USER, value: displayPageData },
        },
      });
      if (Array.isArray(data)) {
        return data;
      }
      return thunkApi.rejectWithValue(data);
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
      await POST({
        path: Route.POST + POST_PATH.TICK_SURVEY.replace(":id", payload.postId),
        payload,
      });
      return payload;
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        return thunkApi.rejectWithValue(err.response?.data);
      }
    }
  }
);

export const updatePostStatus = createAsyncThunk(
  "post/updatePostStatus",
  async (payload: any, thunkApi) => {
    try {
      // Task 020 (D-1): POST /posts/update-post-status -> PATCH /posts/:id/status (method đổi
      // POST -> PATCH, postId chuyển từ body vào path — body chỉ còn userId/status).
      const { postId, ...body } = payload;
      await PATCH({
        path: Route.POST + POST_PATH.UPDATE_POST_STATUS.replace(":id", postId),
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

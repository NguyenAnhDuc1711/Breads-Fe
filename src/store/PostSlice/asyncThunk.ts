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

import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { IPost } from ".";
import { POST_PATH, Route } from "../../Breads-Shared/APIConfig";
import PageConstant from "../../Breads-Shared/Constants/PageConstants";
import { DELETE, GET, POST, PUT } from "../../config/API";
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
      const data = await PUT({
        path: Route.POST + POST_PATH.UPDATE,
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
      await PUT({
        path: Route.POST + POST_PATH.TICK_SURVEY,
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
      await POST({
        path: Route.POST + POST_PATH.UPDATE_POST_STATUS,
        payload,
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
      await POST({
        path: Route.POST + POST_PATH.UPDATE_POST_VISIBILITY,
        payload,
      });
      return payload.postId;
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        return thunkApi.rejectWithValue(err.response?.data);
      }
    }
  }
);

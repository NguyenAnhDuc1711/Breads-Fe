import { createAsyncThunk } from "@reduxjs/toolkit";
import { updateHasMoreData } from "../UtilSlice";
import { formatDateToDDMMYYYY } from "../../util";
import { GET } from "../../config/API";
import { MESSAGE_PATH, Route } from "../../Breads-Shared/APIConfig";
import {
  MessageResponse,
  ConversationResponse,
} from "../../Breads-Shared/Types";
import { AxiosError } from "axios";

export const getConversations = createAsyncThunk(
  "message/getConversations",
  async (payload: any, thunkApi) => {
    try {
      const rawData = payload.data ?? [];
      const data = rawData.map((c: any) => new ConversationResponse(c));
      const isLoadNew = payload.isLoadNew;
      const globalTotal = payload.globalTotal;
      const dispatch = thunkApi.dispatch;
      const hasMoreData = data?.length !== 0 ? true : false;
      dispatch(updateHasMoreData(hasMoreData));
      return { data, isLoadNew, globalTotal };
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        return thunkApi.rejectWithValue(err.response?.data);
      }
    }
  }
);

export const getMsgs = createAsyncThunk(
  "message/getMsgs",
  (data: any, thunkApi) => {
    try {
      const { msgs, isNew } = data;
      const normalizedMsgs = (msgs ?? []).map(
        (msg: any) => new MessageResponse(msg)
      );
      const dateSet = [
        ...new Set(
          normalizedMsgs.map((msg) =>
            formatDateToDDMMYYYY(new Date(msg?.createdAt))
          )
        ),
      ];
      const splitMsgsByDate: Record<string, any> = {};
      dateSet.forEach((date: any) => {
        const msgsByDate = normalizedMsgs.filter(
          (msg) => formatDateToDDMMYYYY(new Date(msg?.createdAt)) === date
        );
        splitMsgsByDate[date] = msgsByDate;
      });
      return { msgs: splitMsgsByDate, isNew: isNew };
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        return thunkApi.rejectWithValue(err.response?.data);
      }
    }
  }
);

export const getConversationById = createAsyncThunk(
  "message/getConversation",
  async (conversationId: string, thunkApi) => {
    try {
      const rootState: any = thunkApi.getState();
      const userId = rootState.user.userInfo._id;
      const conversation = await GET({
        path:
          Route.MESSAGE +
          MESSAGE_PATH.GET_CONVERSATION_BY_ID.replace(
            ":conversationId",
            conversationId
          ),
        params: {
          userId: userId ? userId : localStorage.getItem("userId"),
        },
      });
      return conversation
        ? new ConversationResponse(conversation)
        : conversation;
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        return thunkApi.rejectWithValue(err.response?.data);
      }
    }
  }
);


export const getMsgsFromSearchValue = createAsyncThunk(
  "message/getMsgsFromSearchValue",
  async (payload, thunkApi) => {
    try {
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        return thunkApi.rejectWithValue(err.response?.data);
      }
    }
  }
);

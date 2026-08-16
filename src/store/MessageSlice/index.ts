import { createSlice } from "@reduxjs/toolkit";
import { getConversationById, getConversations, getMsgs } from "./asyncThunk";
import { formatDateToDDMMYYYY } from "../../util";
import dayjs from "../../util/dayjs";
import { IUser } from "../UserSlice";
import { Media } from "../../Breads-Shared/Types";

export interface MsgState {
  conversations: any;
  userSelected: IUser | null;
  messages: any;
  selectedConversation: any;
  selectedMsg: any;
  msgInfo: any;
  loadingConversations: boolean;
  loadingUploadMsg: boolean;
  loadingMsgs: boolean;
  isLoading: boolean;
  currentPageMsg: number;
  currentPageConversation: number;
  limitConversation: number;
  sendNextBox: {
    open: boolean;
    conversations: any;
  };
  msgAction: string;
}

export type { Media };

export interface IMessage {
  _id?: string;
  content: string;
  files: any;
  media: Media[];
  icon: string;
  sender?: any;
  usersSeen?: string[];
  createdAt?: Date | string | null;
  file?: any;
  links?: any;
  reacts?: any;
  isRetrieve?: boolean;
  respondTo?: IMessage;
  updatedAt?: Date | string | null;
  type?: string;
}

export const defaulMessageInfo: IMessage = {
  content: "",
  files: [],
  media: [],
  /*
  {
    url: "",
    type: "",
  }
  */
  icon: "",
};

export const initialMsgState: MsgState = {
  conversations: [], //List user message
  userSelected: null,
  messages: {}, //List message in a conversation
  selectedConversation: null,
  selectedMsg: null,
  msgInfo: defaulMessageInfo,
  loadingConversations: false,
  loadingUploadMsg: false,
  loadingMsgs: false,
  isLoading: false,
  currentPageMsg: 1,
  currentPageConversation: 1,
  limitConversation: 15,
  sendNextBox: {
    open: false,
    conversations: [],
  },
  msgAction: "",
};

const msgSlice = createSlice({
  name: "message",
  initialState: initialMsgState,
  reducers: {
    updateCurrentPageMsg: (state, action) => {
      state.currentPageMsg = action.payload;
    },
    updateMsgInfo: (state, action) => {
      state.msgInfo = action.payload;
    },
    selectConversation: (state, action) => {
      state.selectedConversation = action.payload;
      state.messages = {};
    },
    updateSelectedConversation: (state, action) => {
      const key: string = action.payload.key;
      const value: any = action.payload.value;
      if (state.selectedConversation) {
        if (key in state.selectedConversation) {
          state.selectedConversation[key] = value;
        }
      }
    },
    addNewMsg: (state, action) => {
      const msgsInfo = action.payload;
      if (!msgsInfo?.length) {
        return;
      }
      const conversationId = msgsInfo[0]?.conversationId;
      if (conversationId === state.selectedConversation?._id) {
        if (!state.messages) {
          state.messages = {};
        }
        const msgCreateDate = formatDateToDDMMYYYY(
          new Date(msgsInfo[0]?.createdAt)
        );
        const isValidDate = Array.isArray(state.messages[msgCreateDate]);
        if (isValidDate) {
          state.messages[msgCreateDate] = [
            ...state.messages[msgCreateDate],
            ...msgsInfo,
          ];
        } else {
          state.messages[msgCreateDate] = [...msgsInfo];
        }
      }
      // Update last message
      const lastMsg = msgsInfo[msgsInfo.length - 1];
      if (state.selectedConversation?._id === conversationId) {
        state.selectedConversation.lastMsg = lastMsg;
      }
      const conversationIndex = state.conversations.findIndex(
        (item: any) => item?._id === conversationId
      );
      if (conversationIndex !== -1) {
        state.conversations[conversationIndex] = {
          ...state.conversations[conversationIndex],
          lastMsg: lastMsg,
        };
      }
      state.selectedMsg = null;
      state.loadingUploadMsg = false;
    },
    updateLoadingUpload: (state, action) => {
      state.loadingUploadMsg = action.payload;
    },
    updateMsg: (state, action) => {
      const msgUpdate = action.payload;
      if (!msgUpdate?._id || !state.messages) {
        return;
      }
      const msgDateConvert = msgUpdate?.createdAt
        ? formatDateToDDMMYYYY(new Date(msgUpdate?.createdAt))
        : dayjs(msgUpdate?.createdAt).format("DD/MM/YYYY");

      // 1. Direct date bucket lookup
      if (Array.isArray(state.messages[msgDateConvert])) {
        const msgInListIndex = state.messages[msgDateConvert].findIndex(
          (msg: any) => msg?._id === msgUpdate._id
        );
        if (msgInListIndex !== -1) {
          state.messages[msgDateConvert][msgInListIndex] = msgUpdate;
          return;
        }
      }

      // 2. Fallback: Search across all date buckets in state.messages
      for (const dateKey of Object.keys(state.messages)) {
        const list = state.messages[dateKey];
        if (Array.isArray(list)) {
          const idx = list.findIndex(
            (msg: any) => msg?._id === msgUpdate._id
          );
          if (idx !== -1) {
            state.messages[dateKey][idx] = msgUpdate;
            return;
          }
        }
      }
    },
    selectMsg: (state, action) => {
      state.selectedMsg = action.payload;
    },
    updateConversations: (state, action) => {
      const conversations = action.payload;
      for (let conversation of conversations) {
        const converstaionIndex = state.conversations.findIndex(
          ({ _id }) => _id === conversation?._id
        );
        if (converstaionIndex !== -1) {
          state.conversations.splice(converstaionIndex, 1);
        } else {
          if (state.limitConversation - 1 === 0) {
            state.limitConversation = 15;
            state.currentPageConversation += 1;
          } else {
            state.limitConversation -= 1;
          }
        }
        state.conversations.unshift(conversation);
      }
    },
    updateCurrentPageConversation: (state, action) => {
      state.currentPageConversation = action.payload;
    },
    updateSendNextBox: (state, action) => {
      const { key, value } = action.payload;
      state.sendNextBox[key] = value;
    },
    updateMsgAction: (state, action) => {
      state.msgAction = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getConversations.pending, (state, action) => {
      state.loadingConversations = true;
    });
    builder.addCase(getConversations.fulfilled, (state, action) => {
      if (action.payload) {
        const newConversations = action.payload.data;
        const isLoadNew = action.payload.isLoadNew;
        if (!isLoadNew) {
          state.conversations.push(...newConversations);
        } else {
          state.conversations = newConversations;
        }
        state.loadingConversations = false;
        state.limitConversation = 15;
      }
    });
    builder.addCase(getMsgs.pending, (state) => {
      state.loadingMsgs = true;
    });
    builder.addCase(getMsgs.fulfilled, (state, action) => {
      const { msgs, isNew }: any = action.payload;
      if (isNew) {
        state.messages = msgs;
      } else {
        let currentMsgState = JSON.parse(JSON.stringify(state.messages));
        const listDate = Object.keys(msgs);
        for (let i = listDate.length - 1; i >= 0; i--) {
          let date = listDate[i];
          if (date in currentMsgState) {
            currentMsgState[date] = [...msgs[date], ...currentMsgState[date]];
          } else {
            const convertToEntries = Object.entries(currentMsgState);
            convertToEntries.unshift([date, msgs[date]]);
            currentMsgState = {};
            convertToEntries.forEach(([key, value]) => {
              currentMsgState[key] = value;
            });
          }
        }
        state.messages = currentMsgState;
      }
      state.loadingMsgs = false;
    });
    builder.addCase(getConversationById.fulfilled, (state, action) => {
      const conversation = action.payload;
      state.selectedConversation = conversation;
    });
  },
});

export const {
  updateMsgInfo,
  selectConversation,
  addNewMsg,
  updateLoadingUpload,
  updateCurrentPageMsg,
  updateMsg,
  updateSelectedConversation,
  selectMsg,
  updateConversations,
  updateCurrentPageConversation,
  updateSendNextBox,
  updateMsgAction,
} = msgSlice.actions;
export default msgSlice.reducer;

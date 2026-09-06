import { createEntityAdapter, createSlice, EntityState } from "@reduxjs/toolkit";
import { getConversationById, getConversations, getMsgs } from "./asyncThunk";
import { formatDateToDDMMYYYY } from "../../util";
import dayjs from "../../util/dayjs";
import { IUser } from "../UserSlice";
import {
  Media,
  IMessage,
  IMessageDraft,
  IConversation,
  MessageResponse,
  ConversationResponse,
} from "../../Breads-Shared/Types";

export type { Media, IMessage, IMessageDraft, IConversation };
export { MessageResponse, ConversationResponse };

// --- Entity Adapter ---
// _id is optional in IConversation (same pattern as PostSlice).
// Only conversations with _id should be added to the entity state.
const conversationsAdapter = createEntityAdapter<IConversation, string>({
  selectId: (conversation) => conversation._id!,
});

// Extra state fields beyond what EntityState provides
export interface MsgExtraState {
  userSelected: IUser | null;
  messages: any;
  selectedConversation: IConversation | null;
  selectedMsg: IMessage | null;
  msgInfo: IMessageDraft;
  loadingConversations: boolean;
  loadingUploadMsg: boolean;
  loadingMsgs: boolean;
  isLoading: boolean;
  currentPageMsg: number;
  currentPageConversation: number;
  limitConversation: number;
  globalTotal: number;
  sendNextBox: {
    open: boolean;
    conversations: any;
  };
  msgAction: string;
}

export type MsgState = EntityState<IConversation, string> & MsgExtraState;

export const defaulMessageInfo: IMessageDraft = {
  content: "",
  files: [],
  media: [],
  icon: "",
};

export const initialMsgState: MsgState = conversationsAdapter.getInitialState({
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
  globalTotal: 0,
  sendNextBox: {
    open: false,
    conversations: [],
  },
  msgAction: "",
});

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
      state.selectedConversation = action.payload
        ? new ConversationResponse(action.payload)
        : null;
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
      const rawMsgs = action.payload;
      if (!rawMsgs?.length) {
        return;
      }
      const msgsInfo = rawMsgs.map((m: any) => new MessageResponse(m));
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
      const lastMsg = msgsInfo[msgsInfo.length - 1];
      if (state.selectedConversation && state.selectedConversation._id === conversationId) {
        state.selectedConversation.lastMsg = lastMsg;
      }
      // O(1) lookup instead of findIndex
      if (conversationId && state.entities[conversationId]) {
        conversationsAdapter.updateOne(state, {
          id: conversationId,
          changes: { lastMsg },
        });
      }
      state.selectedMsg = null;
      state.loadingUploadMsg = false;
    },
    updateLoadingUpload: (state, action) => {
      state.loadingUploadMsg = action.payload;
    },
    updateMsg: (state, action) => {
      if (!action.payload?._id || !state.messages) {
        return;
      }
      const msgUpdate = new MessageResponse(action.payload);
      const msgDateConvert = msgUpdate?.createdAt
        ? formatDateToDDMMYYYY(new Date(msgUpdate?.createdAt))
        : dayjs(msgUpdate?.createdAt).format("DD/MM/YYYY");

      if (Array.isArray(state.messages[msgDateConvert])) {
        const msgInListIndex = state.messages[msgDateConvert].findIndex(
          (msg: any) => msg?._id === msgUpdate._id
        );
        if (msgInListIndex !== -1) {
          state.messages[msgDateConvert][msgInListIndex] = msgUpdate;
          return;
        }
      }

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
      state.selectedMsg = action.payload
        ? new MessageResponse(action.payload)
        : null;
    },
    updateConversations: (state, action) => {
      const rawConversations = action.payload ?? [];
      const conversations = rawConversations.map(
        (c: any) => new ConversationResponse(c)
      );
      for (let conversation of conversations) {
        if (!conversation._id) continue;
        const existsInAdapter = !!state.entities[conversation._id];
        if (existsInAdapter) {
          // Remove from current position (will be re-added at front)
          conversationsAdapter.removeOne(state, conversation._id);
        } else {
          // New conversation — adjust pagination tracking
          if (state.limitConversation - 1 === 0) {
            state.limitConversation = 15;
            state.currentPageConversation += 1;
          } else {
            state.limitConversation -= 1;
          }
        }
        // Prepend: add to entities and insert id at front
        conversationsAdapter.addOne(state, conversation);
        const idx = state.ids.indexOf(conversation._id);
        if (idx > 0) {
          state.ids.splice(idx, 1);
          state.ids.unshift(conversation._id);
        }
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
    updateUnreadCount: (state, action) => {
      const { conversationId, unreadCount } = action.payload;
      // O(1) lookup instead of findIndex
      if (conversationId && state.entities[conversationId]) {
        conversationsAdapter.updateOne(state, {
          id: conversationId,
          changes: { unreadCount },
        });
      }
      if (state.selectedConversation && state.selectedConversation._id === conversationId) {
        state.selectedConversation.unreadCount = unreadCount;
      }
    },
    updateGlobalTotal: (state, action) => {
      state.globalTotal = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getConversations.pending, (state, action) => {
      state.loadingConversations = true;
    });
    builder.addCase(getConversations.fulfilled, (state, action) => {
      if (action.payload) {
        const rawConversations = action.payload.data ?? [];
        const newConversations: IConversation[] = rawConversations
          .map((c: any) => new ConversationResponse(c))
          .filter((c: IConversation) => c._id);
        const isLoadNew = action.payload.isLoadNew;
        if (!isLoadNew) {
          // Append — keep existing + add new (dedup by id)
          conversationsAdapter.addMany(state, newConversations);
        } else {
          // Load new — replace all
          conversationsAdapter.setAll(state, newConversations);
        }
        state.loadingConversations = false;
        state.limitConversation = 15;
        if (typeof action.payload.globalTotal === "number") {
          state.globalTotal = action.payload.globalTotal;
        }
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
      state.selectedConversation = conversation
        ? new ConversationResponse(conversation)
        : conversation;
    });
  },
});

// --- Selectors ---
import type { AppState } from "../index";

export const {
  selectAll: selectAllConversations,
  selectById: selectConversationById,
  selectIds: selectConversationIds,
  selectEntities: selectConversationEntities,
  selectTotal: selectTotalConversations,
} = conversationsAdapter.getSelectors((state: AppState) => state.message);

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
  updateUnreadCount,
  updateGlobalTotal,
} = msgSlice.actions;
export default msgSlice.reducer;

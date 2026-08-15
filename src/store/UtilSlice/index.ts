import { createSlice } from "@reduxjs/toolkit";
import { changePage } from "./asyncThunk";
import { Media } from "../MessageSlice";

export interface UtilState {
  currentPage: string;
  prevPage: string;
  seeMediaInfo: {
    open: boolean;
    media: Media[];
    currentMediaIndex: number;
  };
  displayPageData: string;
  hasMoreData: boolean;
  newPostNotify: boolean;
  openLoginPopup: boolean;
  toast: {
    title: string;
    description: string;
    status: "info" | "warning" | "success" | "error" | "loading";
    isVisible: boolean;
  };
}

export const initialUtilState: UtilState = {
  currentPage: "",
  prevPage: "",
  seeMediaInfo: {
    open: false,
    media: [],
    currentMediaIndex: -1,
  },
  displayPageData: "",
  hasMoreData: false,
  newPostNotify: false,
  openLoginPopup: false,
  toast: {
    title: "",
    description: "",
    status: "info",
    isVisible: false,
  },
};

const utilSlice = createSlice({
  name: "util",
  initialState: initialUtilState,
  reducers: {
    updateSeeMedia: (state, action) => {
      state.seeMediaInfo = action.payload;
    },
    changeDisplayPageData: (state, action) => {
      state.displayPageData = action.payload;
    },
    updateHasMoreData: (state, action) => {
      state.hasMoreData = action.payload;
    },
    openNewPostNotify: (state) => {
      state.newPostNotify = !state.newPostNotify;
    },
    openLoginPopupAction: (state) => {
      state.openLoginPopup = !state.openLoginPopup;
    },
    closeLoginPopupAction: (state) => {
      state.openLoginPopup = false;
    },
    showToast: (state, action) => {
      const { title, description, status } = action.payload;
      state.toast = {
        title,
        description,
        status,
        isVisible: true,
      };
    },
    clearToast: (state) => {
      state.toast.isVisible = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(changePage.fulfilled, (state, action) => {
      const { nextPage, currentPage } = action.payload;
      state.prevPage = currentPage || state.currentPage;
      state.currentPage = nextPage || state.currentPage;
    });
  },
});

export const {
  updateSeeMedia,
  changeDisplayPageData,
  updateHasMoreData,
  openNewPostNotify,
  openLoginPopupAction,
  closeLoginPopupAction,
  showToast,
  clearToast,
} = utilSlice.actions;
export default utilSlice.reducer;

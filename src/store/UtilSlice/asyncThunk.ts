import { createAsyncThunk } from "@reduxjs/toolkit";
import { reloadListPost } from "../PostSlice";

type PageUpdate = {
  nextPage?: string;
  currentPage?: string;
};

export const changePage = createAsyncThunk(
  "util/changePage",
  (payload: PageUpdate) => {
    const { nextPage, currentPage } = payload;
    return {
      currentPage: currentPage ?? "",
      nextPage: nextPage,
    };
  }
);

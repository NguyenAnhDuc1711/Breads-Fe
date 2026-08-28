import { createSlice } from "@reduxjs/toolkit";

export interface ReportState {
  openPopup: boolean;
  reportInfo: {
    content: string;
    media: any;
  };
}

export const intialReportState: ReportState = {
  openPopup: false,
  reportInfo: {
    content: "",
    media: [],
  },
};

const reportSlice = createSlice({
  name: "report",
  initialState: intialReportState,
  reducers: {
    openPopup: (state) => {
      state.openPopup = !state.openPopup;
    },
    updateReportInfo: (state, action) => {
      const { key, value } = action.payload;
      state.reportInfo[key] = value;
    },
  },
});

export const { updateReportInfo, openPopup } = reportSlice.actions;
export default reportSlice.reducer;

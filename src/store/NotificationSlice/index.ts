import { createSlice } from "@reduxjs/toolkit";
import { INotification } from "../../Breads-Shared/Types";

export type { INotification };

export interface NotificationState {
  hasNewNotification: boolean;
}

export const initialNotificationState: NotificationState = {
  hasNewNotification: false,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState: initialNotificationState,
  reducers: {
    updateHasNotification: (state, action) => {
      state.hasNewNotification = action.payload;
    },
  },
});

export const { updateHasNotification } = notificationSlice.actions;
export default notificationSlice.reducer;

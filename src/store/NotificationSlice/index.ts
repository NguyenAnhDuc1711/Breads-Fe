import { createSlice } from "@reduxjs/toolkit";
import { getNotificattions } from "./asyncThunk";
import { INotification, NotificationResponse } from "../../Breads-Shared/Types";

export type { INotification };

export interface NotificationState {
  notifications: INotification[];
  hasNewNotification: boolean;
  isLoading: boolean;
}

export const initialNotificationState: NotificationState = {
  notifications: [],
  hasNewNotification: false,
  isLoading: false,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState: initialNotificationState,
  reducers: {
    updateHasNotification: (state, action) => {
      state.hasNewNotification = action.payload;
    },
    addNotification: (state, action) => {
      if (action.payload) {
        state.notifications.unshift(new NotificationResponse(action.payload));
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getNotificattions.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getNotificattions.fulfilled, (state, action) => {
      const rawNotifications = action.payload;
      const normalizedNotifications: INotification[] = Array.isArray(
        rawNotifications
      )
        ? rawNotifications.map((item) => new NotificationResponse(item))
        : [];
      if (state.notifications.length) {
        state.notifications.push(...normalizedNotifications);
      } else {
        state.notifications = normalizedNotifications;
      }
      state.isLoading = false;
    });
  },
});


export const { updateHasNotification, addNotification } =
  notificationSlice.actions;
export default notificationSlice.reducer;

import { createAsyncThunk } from "@reduxjs/toolkit";
import { GET } from "../../config/API";
import { Route, NOTIFICATION_PATH } from "../../Breads-Shared/APIConfig";
import { AxiosError } from "axios";

export const getNotificattions = createAsyncThunk(
  "notification/getNotifications",
  async (payload: any, thunkApi) => {
    try {
      // Task 021 (D-1): POST /notifications/get -> GET /notifications (page/limit query, T013).
      const { page, limit } = payload;
      const data = await GET({
        path: Route.NOTIFICATION + NOTIFICATION_PATH.GET,
        params: {
          page: page,
          limit: limit,
        },
      });
      return data;
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        thunkApi.rejectWithValue(err.response?.data);
      }
    }
  }
);

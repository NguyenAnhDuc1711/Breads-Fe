import { NOTIFICATION_PATH, Route } from "../../Breads-Shared/APIConfig";
import { INotification, NotificationResponse } from "../../Breads-Shared/Types";
import { api } from "./baseApi";

export interface GetNotificationsArgs {
  userId: string;
  page: number;
  limit: number;
}

export const notificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<INotification[], GetNotificationsArgs>({
      query: ({ page, limit }) => ({
        path: Route.NOTIFICATION + NOTIFICATION_PATH.GET,
        params: { page, limit },
      }),
      transformResponse: (rawNotifications: any) =>
        Array.isArray(rawNotifications)
          ? rawNotifications.map((item) => new NotificationResponse(item))
          : [],
      providesTags: ["Notification"],
    }),
  }),
});

export const { useGetNotificationsQuery } = notificationApi;

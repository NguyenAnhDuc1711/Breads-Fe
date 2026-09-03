import { REPORT_PATH, Route } from "../../Breads-Shared/APIConfig";
import { api } from "./baseApi";

// Bước 9: `userId` (người báo cáo) bỏ khỏi payload — server lấy từ JWT.
export interface SendReportPayload {
  content: string;
  media: any;
}

export const reportApi = api.injectEndpoints({
  endpoints: (builder) => ({
    sendReport: builder.mutation<any, SendReportPayload>({
      query: (payload) => ({
        path: Route.REPORT + REPORT_PATH.CREATE,
        method: "POST",
        payload,
      }),
    }),
  }),
});

export const { useSendReportMutation } = reportApi;

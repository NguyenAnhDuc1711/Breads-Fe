import { createApi, BaseQueryFn } from "@reduxjs/toolkit/query/react";
import { DELETE, GET, PATCH, POST, PUT } from "../../config/API";

type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiBaseQueryArgs {
  path: string;
  method?: ApiMethod;
  payload?: Record<string, any>;
  params?: Record<string, any>;
}

const methodFns: Record<ApiMethod, (opts: any) => Promise<any>> = {
  GET,
  POST,
  PUT,
  PATCH,
  DELETE,
};

const apiBaseQuery: BaseQueryFn<ApiBaseQueryArgs, unknown, unknown> = async ({
  path,
  method = "GET",
  payload,
  params,
}) => {
  const data = await methodFns[method]({ path, payload, params });
  if (data && (data.errorType || data.error)) {
    return { error: data };
  }
  return { data };
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: apiBaseQuery,
  tagTypes: ["Report", "Notification", "User", "Post"],
  endpoints: () => ({}),
});

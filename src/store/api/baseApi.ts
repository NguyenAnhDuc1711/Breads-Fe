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

// Wraps the existing GET/POST/PUT/PATCH/DELETE helpers (config/API.ts) —
// keeps the shared axios instance, token-refresh interceptor and path
// prefix as the single source of truth instead of a separate fetch-based
// baseQuery. Those helpers swallow AxiosError into an `{errorType, error}`
// shaped object instead of throwing, so a request is only surfaced to RTK
// Query as an error when the response matches that shape.
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

// Single shared RTK Query instance — feature slices add their own
// endpoints via `api.injectEndpoints` (see store/api/reportApi.ts) instead
// of each calling `createApi` separately.
export const api = createApi({
  reducerPath: "api",
  baseQuery: apiBaseQuery,
  tagTypes: ["Report", "Notification", "User", "Post"],
  endpoints: () => ({}),
});

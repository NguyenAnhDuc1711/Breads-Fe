import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { Route, USER_PATH } from "../Breads-Shared/APIConfig";

export const serverUrl: string =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface ApiOptions {
  path: string;
  params?: Record<string, any>;
  payload?: Record<string, any>;
}

// ---------------------------------------------------------------------------
// In-memory access token management
// ---------------------------------------------------------------------------
let accessToken: string | null = null;

export const getAccessToken = (): string | null => accessToken;

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};

// Callback invoked after a successful token refresh — used by the socket
// module to reconnect with the new token without creating circular imports.
let onTokenRefreshedCallback: (() => void) | null = null;

export const onTokenRefreshed = (callback: () => void): void => {
  onTokenRefreshedCallback = callback;
};

// ---------------------------------------------------------------------------
// Refresh token queue — ensures only ONE refresh request runs at a time
// ---------------------------------------------------------------------------
let isRefreshing = false;
let failedQueue: {
  resolve: (token: string | null) => void;
  reject: (error: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Call the refresh-token endpoint to get a new access token.
 * The refresh token is sent automatically via httpOnly cookie.
 */
const refreshAccessToken = async (): Promise<string> => {
  const url = serverUrl + "/api" + Route.USER + USER_PATH.REFRESH_TOKEN;
  const { data } = await axios.post(
    url,
    {},
    {
      withCredentials: true,
      // Send the (potentially expired) access token so the BE can identify
      // the user in case of token-reuse detection.
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined,
    },
  );
  const newToken = data?.metadata?.accessToken;
  if (!newToken) throw new Error("No access token in refresh response");
  setAccessToken(newToken);
  return newToken;
};

// ---------------------------------------------------------------------------
// Axios Interceptors
// ---------------------------------------------------------------------------
if (typeof window !== "undefined") {
  // Request interceptor: attach access token to every request
  axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  // Response interceptor: handle 401 TOKEN_EXPIRED with silent refresh
  axios.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // If the refresh endpoint itself fails → don't retry, go to login
      const isRefreshRequest = originalRequest?.url?.includes(
        USER_PATH.REFRESH_TOKEN,
      );

      if (
        error.response?.status === 401 &&
        !originalRequest?._retry &&
        !isRefreshRequest
      ) {
        const responseData = error.response?.data as any;
        const isTokenExpired = responseData?.code === "TOKEN_EXPIRED";

        if (isTokenExpired) {
          if (isRefreshing) {
            // Another refresh is already in-flight — queue this request
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return axios(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            const newToken = await refreshAccessToken();
            processQueue(null, newToken);
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            // Notify listeners (e.g. socket) about the new token
            onTokenRefreshedCallback?.();
            return axios(originalRequest);
          } catch (refreshError) {
            processQueue(refreshError, null);
            // Refresh failed — session is truly expired
            setAccessToken(null);
            localStorage.removeItem("userId");
            if (typeof document !== "undefined") {
              document.cookie =
                "refreshToken=; path=/; max-age=0; SameSite=Lax";
            }
            window.location.href = "/login";
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }

        // Non-TOKEN_EXPIRED 401 (e.g. truly unauthorized) — redirect to login
        if (
          !window.location.pathname.startsWith("/login") &&
          !window.location.pathname.startsWith("/signup")
        ) {
          localStorage.removeItem("userId");
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    },
  );
}

// ---------------------------------------------------------------------------
// API methods (unchanged public interface)
// ---------------------------------------------------------------------------
export const GET = async ({ path, params }: ApiOptions) => {
  try {
    const url = serverUrl + "/api" + path;
    let result: any = null;
    if (params) {
      result = (
        await axios.get(url, {
          params,
          withCredentials: true,
        })
      )?.data;
    } else {
      result = (await axios.get(url, { withCredentials: true }))?.data;
    }
    return result?.metadata ? result?.metadata : result;
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      const errorResponse = err.response?.data || {
        errorType: "UNKNOWN_ERROR",
        error: "An unknown error occurred!",
      };
      return errorResponse;
    }
    return undefined;
  }
};

export const POST = async ({ path, payload, params }: ApiOptions) => {
  try {
    const url = serverUrl + "/api" + path;
    const { data } = await axios.post(url, payload, {
      params,
      withCredentials: true,
    });
    return data?.metadata ? data?.metadata : data;
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      const errorResponse = err.response?.data || {
        errorType: "UNKNOWN_ERROR",
        error: "An unknown error occurred!",
      };
      return errorResponse;
    }
    return undefined;
  }
};

export const PUT = async ({ path, payload }: ApiOptions) => {
  try {
    const url = serverUrl + "/api" + path;
    const { data } = await axios.put(url, payload, {
      withCredentials: true,
    });
    return data;
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      const errorResponse = err.response?.data || {
        errorType: "UNKNOWN_ERROR",
        error: "An unknown error occurred!",
      };
      return errorResponse;
    }
    return undefined;
  }
};

export const PATCH = async ({ path, payload }: ApiOptions) => {
  try {
    const url = serverUrl + "/api" + path;
    const { data } = await axios.patch(url, payload, {
      withCredentials: true,
    });
    return data;
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      const errorResponse = err.response?.data || {
        errorType: "UNKNOWN_ERROR",
        error: "An unknown error occurred!",
      };
      return errorResponse;
    }
    return undefined;
  }
};

export const DELETE = async ({ path, params }: ApiOptions) => {
  try {
    const url = serverUrl + "/api" + path;
    const { data } = await axios.delete(url, {
      params,
      withCredentials: true,
    });
    return data;
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      const errorResponse = err.response?.data || {
        errorType: "UNKNOWN_ERROR",
        error: "An unknown error occurred!",
      };
      return errorResponse;
    }
    return undefined;
  }
};

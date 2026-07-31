import axios, { AxiosError } from "axios";
export const serverUrl: string =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface ApiOptions {
  path: string;
  params?: Record<string, any>;
  payload?: Record<string, any>;
}

// Function to get JWT token from cookies
const getJwtFromCookies = (): string | null => {
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "jwt") {
      return value;
    }
  }
  return null;
};

// Add authorization header to requests if JWT token exists
const addAuthHeader = (config: any = {}) => {
  const token = getJwtFromCookies();
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
};

export const GET = async ({ path, params }: ApiOptions) => {
  try {
    const url = serverUrl + "/api" + path;
    let result: any = null;
    if (params) {
      result = (
        await axios.get(
          url,
          addAuthHeader({
            params: params,
            withCredentials: true,
          })
        )
      )?.data;
    } else {
      result = (await axios.get(url, addAuthHeader({ withCredentials: true })))
        ?.data;
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
    const { data } = await axios.post(
      url,
      payload,
      addAuthHeader({
        params: params,
        withCredentials: true,
      })
    );
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
    const { data } = await axios.put(
      url,
      payload,
      addAuthHeader({
        withCredentials: true,
      })
    );
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
    const { data } = await axios.patch(
      url,
      payload,
      addAuthHeader({
        withCredentials: true,
      })
    );
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
    const { data } = await axios.delete(
      url,
      addAuthHeader({
        params: params,
        withCredentials: true,
      })
    );
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

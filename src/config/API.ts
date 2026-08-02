import axios, { AxiosError } from "axios";
export const serverUrl: string =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface ApiOptions {
  path: string;
  params?: Record<string, any>;
  payload?: Record<string, any>;
}

if (typeof window !== "undefined") {
  axios.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (
        error.response?.status === 401 &&
        !window.location.pathname.startsWith("/login") &&
        !window.location.pathname.startsWith("/signup")
      ) {
        localStorage.removeItem("userId");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );
}

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

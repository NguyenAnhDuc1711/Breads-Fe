import { Route, USER_PATH } from "../../Breads-Shared/APIConfig";
import { IUser, UserResponse } from "../../Breads-Shared/Types";
import { api } from "./baseApi";

export interface GetUserInfoArgs {
  userId: string;
}

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUserInfo: builder.query<IUser, GetUserInfoArgs>({
      query: ({ userId }) => ({
        path: Route.USER + USER_PATH.PROFILE.replace(":userId", userId),
      }),
      transformResponse: (user: any) => new UserResponse(user),
      providesTags: ["User"],
    }),
  }),
});

export const { useGetUserInfoQuery, useLazyGetUserInfoQuery } = userApi;

import { Route, USER_PATH } from "../../Breads-Shared/APIConfig";
import { IUser, UserResponse } from "../../Breads-Shared/Types";
import { api } from "./baseApi";

export interface GetUserInfoArgs {
  userId: string;
}

// Only covers the "view another user's profile" case (userSelected) — the
// only call site (UserPageHydrate.tsx) always passes getCurrentUser: false.
// Login/getMe and the current user's own `userInfo` stay on the classic
// UserSlice thunks: they're tied to token/session/socket lifecycle and to
// the `logout.fulfilled.type` reset in store/index.ts, out of scope here.
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

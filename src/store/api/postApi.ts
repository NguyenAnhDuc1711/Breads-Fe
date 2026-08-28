import PageConstant from "../../Breads-Shared/Constants/PageConstants";
import { POST_PATH, Route } from "../../Breads-Shared/APIConfig";
import { IPost, PostResponse } from "../../Breads-Shared/Types";
import { api } from "./baseApi";

export interface GetUserPostsArgs {
  userId: string;
  displayPageData: string;
}

// getPosts (Home feed, paginated + SSR-seeded) and the create/edit/delete
// mutations stay on classic thunks — see RTK_QUERY_PERF_BASELINE.md for why
// only getPost/getUserPosts were migrated this pass.
export const postApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPost: builder.query<IPost, string>({
      query: (postId) => ({ path: Route.POST + "/" + postId }),
      transformResponse: (data: any) => new PostResponse(data),
      providesTags: (result, error, postId) => [{ type: "Post", id: postId }],
    }),
    getUserPosts: builder.query<IPost[], GetUserPostsArgs>({
      query: ({ userId, displayPageData }) => ({
        path: Route.POST + POST_PATH.GET_ALL,
        params: {
          userId,
          filter: { page: PageConstant.USER, value: displayPageData },
        },
      }),
      transformResponse: (data: any) =>
        Array.isArray(data) ? data.map((p: any) => new PostResponse(p)) : [],
      providesTags: ["Post"],
    }),
  }),
});

export const {
  useGetPostQuery,
  useLazyGetPostQuery,
  useGetUserPostsQuery,
  useLazyGetUserPostsQuery,
} = postApi;

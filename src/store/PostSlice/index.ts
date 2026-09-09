import { createEntityAdapter, createSlice, EntityState } from "@reduxjs/toolkit";
import PageConstant from "../../Breads-Shared/Constants/PageConstants";
import PostConstants from "../../Breads-Shared/Constants/PostConstants";
import {
  IPost,
  IPostDraft,
  ISurveyOption,
  IUserShortInfo,
  PostResponse,
} from "../../Breads-Shared/Types";
import {
  createPost,
  deletePost,
  editPost,
  getPostReplies,
  getPosts,
  selectSurveyOption,
  updatePostVisibility,
} from "./asyncThunk";

export type { IPost, IPostDraft, ISurveyOption, IUserShortInfo };

export const surveyTemplate = ({
  placeholder,
  value,
}: {
  placeholder: string;
  value: string;
}): ISurveyOption => {
  return {
    placeholder,
    value,
  };
};

export interface ILink {}

// --- Entity Adapter ---
// _id is optional in IPost (drafts don't have it), so we use selectId with non-null assertion.
// Only posts with _id should be added to the entity state.
const postsAdapter = createEntityAdapter<IPost, string>({
  selectId: (post) => post._id!,
});

// Extra state fields beyond what EntityState provides
export interface PostExtraState {
  postSelected: IPost | null;
  postInfo: IPostDraft;
  postAction: string;
  postReply: IPost | null;
  isLoading: boolean;
}

export type PostState = EntityState<IPost, string> & PostExtraState;

export const defaultPostInfo: IPostDraft = {
  content: "",
  media: [],
  survey: [],
  usersTag: [],
  files: [],
  links: [],
};

export const initialPostState: PostState = postsAdapter.getInitialState({
  postSelected: null,
  postInfo: defaultPostInfo,
  postAction: "",
  postReply: null,
  isLoading: true,
});

const postSlice = createSlice({
  name: "post",
  initialState: initialPostState,
  reducers: {
    selectPost: (state, action) => {
      state.postSelected = action.payload;
    },
    updatePostInfo: (state, action) => {
      state.postInfo = action.payload;
    },
    updatePostAction: (state, action) => {
      state.postAction = action.payload ?? "";
    },
    updateListPost: (state, action) => {
      const posts: IPost[] = Array.isArray(action.payload)
        ? action.payload.filter((p: IPost) => p._id)
        : [];
      postsAdapter.setAll(state, posts);
      // Danh sách đã được thay thế dứt điểm nên không còn "đang tải". Nếu không
      // gỡ ở đây, isLoading (khởi tạo true) thành một latch: feed rỗng mà không
      // có request nào đang chạy sẽ kẹt ở skeleton vĩnh viễn.
      state.isLoading = false;
    },
    updatePostListLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    selectPostReply: (state, action) => {
      state.postReply = action.payload;
    },
    updatePostLike: (state, action) => {
      const { postId, likesCount } = action.payload;
      const existingPost = state.entities[postId];
      if (existingPost) {
        postsAdapter.updateOne(state, {
          id: postId,
          changes: { likesCount },
        });
      } else {
        if (!!state.postSelected) {
          let postSelected: IPost = state.postSelected;
          const postReplieIds = postSelected.replies?.map(({ _id }) => _id);
          const postReplieIndex: any = postReplieIds?.findIndex(
            (_id) => _id === postId
          );
          if (postSelected._id === postId) {
            postSelected.likesCount = likesCount;
          } else if (postReplieIndex !== -1 && postSelected.replies) {
            postSelected.replies[postReplieIndex].likesCount = likesCount;
          }
        }
      }
    },
    toggleLikedByMe: (state, action) => {
      const { postId } = action.payload;
      const flip = (post: IPost) => {
        const wasLiked = !!post.likedByMe;
        post.likedByMe = !wasLiked;
        post.likesCount = Math.max(0, (post.likesCount ?? 0) + (wasLiked ? -1 : 1));
      };
      const existingPost = state.entities[postId];
      if (existingPost) {
        flip(existingPost);
      } else if (state.postSelected) {
        const postSelected: IPost = state.postSelected;
        if (postSelected._id === postId) {
          flip(postSelected);
        } else {
          const reply = postSelected.replies?.find(({ _id }) => _id === postId);
          if (reply) flip(reply);
        }
      }
    },
    removeOnePost: (state, action) => {
      postsAdapter.removeOne(state, action.payload);
    },
    reloadListPost: (state) => {
      postsAdapter.removeAll(state);
      state.isLoading = true;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getPostReplies.fulfilled, (state, action) => {
      const payload: any = action.payload;
      if (!payload || !state.postSelected || state.postSelected._id !== payload.postId) {
        return;
      }
      const newReplies = (payload.replies ?? []).map(
        (reply: Partial<IPost>) => new PostResponse(reply as any)
      );
      state.postSelected.replies = payload.isNewPage
        ? newReplies
        : [...(state.postSelected.replies ?? []), ...newReplies];
    });
    builder.addCase(getPosts.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getPosts.fulfilled, (state, action) => {
      state.isLoading = false;
      if (Array.isArray(action.payload?.posts)) {
        const newPosts: IPost[] = action.payload.posts
          .map((p: Partial<IPost>) => new PostResponse(p as any))
          .filter((p: IPost) => p._id);
        const isNewPage = action.payload.isNewPage;
        if (!isNewPage) {
          // Append — keep existing posts + add new (dedup by id)
          postsAdapter.addMany(state, newPosts);
        } else {
          // New page — replace all
          postsAdapter.setAll(state, newPosts);
        }
        state.postInfo = defaultPostInfo;
      }
    });
    builder.addCase(getPosts.rejected, (state) => {
      state.isLoading = false;
    });
    builder.addCase(createPost.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(createPost.fulfilled, (state, action) => {
      const rawNewPost = action.payload?.data;
      const newPost: IPost | undefined = rawNewPost
        ? new PostResponse(rawNewPost)
        : undefined;
      const currentPage: string = action.payload?.currentPage;
      if (!!newPost && newPost._id) {
        if (currentPage === PageConstant.USER) {
          // Prepend: insert at the beginning of ids
          postsAdapter.addOne(state, newPost);
          // Move to front of ids array to preserve feed order
          const idx = state.ids.indexOf(newPost._id!);
          if (idx > 0) {
            state.ids.splice(idx, 1);
            state.ids.unshift(newPost._id!);
          }
        }
        const { REPOST, REPLY } = PostConstants.ACTIONS;
        if (state.postSelected) {
          const postSelected: IPost = state.postSelected;
          if ([REPOST, REPLY].includes(state.postAction) && postSelected?._id) {
            const clonePostSelected = JSON.parse(JSON.stringify(postSelected));
            if (state.postAction === REPLY) {
              clonePostSelected.replies.push(newPost);
              clonePostSelected.repliesCount = (clonePostSelected.repliesCount ?? 0) + 1;
            } else {
              clonePostSelected.repostNum += 1;
            }
            // Update in entity if it exists
            if (state.entities[postSelected._id!]) {
              postsAdapter.updateOne(state, {
                id: postSelected._id!,
                changes: {
                  ...(state.postAction === REPLY
                    ? { replies: clonePostSelected.replies, repliesCount: clonePostSelected.repliesCount }
                    : { repostNum: clonePostSelected.repostNum }),
                },
              });
            }
            state.postSelected = clonePostSelected;
          }
        }
      }
      state.isLoading = false;
      state.postAction = "";
      state.postInfo = defaultPostInfo;
    });
    builder.addCase(editPost.fulfilled, (state, action) => {
      const postUpdatedData: IPost = action.payload;
      const postInfo: IPost = state.postInfo;
      if (postUpdatedData?._id && state.entities[postUpdatedData._id]) {
        postsAdapter.updateOne(state, {
          id: postUpdatedData._id,
          changes: postUpdatedData,
        });
      }
      if (typeof postInfo != null) {
        state.postSelected = postInfo;
        state.postAction = "";
      }
    });
    builder.addCase(deletePost.fulfilled, (state, action) => {
      const postId: string = action.payload?.postId;
      const currentPage: string = action.payload?.currentPage;
      if (
        state.postSelected?._id &&
        postId !== state.postSelected?._id &&
        currentPage === PageConstant.POST_DETAIL
      ) {
        // Deleting a reply within PostDetail
        if (state.postSelected.replies) {
          const hadReply = state.postSelected.replies.some(
            (post) => post._id === postId
          );
          const filteredReplies = state.postSelected.replies.filter(
            (post) => post._id !== postId
          );
          state.postSelected.replies = filteredReplies;
          // Also sync entity state for replies displayed via adapter
          postsAdapter.setAll(state, filteredReplies.filter((p) => p._id) as IPost[]);
          if (hadReply) {
            state.postSelected.repliesCount = Math.max(
              0,
              (state.postSelected.repliesCount ?? 1) - 1
            );
          }
        }
      } else {
        // Remove the post from entities
        postsAdapter.removeOne(state, postId);
        // Clean up parentPostInfo and quote references in remaining posts
        for (const id of state.ids) {
          const post = state.entities[id];
          if (!post) continue;
          if (post.parentPost === postId) {
            postsAdapter.updateOne(state, {
              id: id as string,
              changes: { parentPostInfo: undefined },
            });
          }
          if (post.quote?._id === postId) {
            postsAdapter.updateOne(state, {
              id: id as string,
              changes: { quote: undefined },
            });
          }
        }
      }
    });
    builder.addCase(selectSurveyOption.fulfilled, (state, action) => {
      const { postId, userId, isAdd, optionId }: any = action.payload;
      const tickedPost = state.entities[postId];
      if (!tickedPost) return;

      const survey = tickedPost.survey;
      const optionIndex = survey?.findIndex(
        (option) => option._id === optionId
      );
      if (survey && optionIndex !== undefined && optionIndex !== -1) {
        let selectedSurveyOption: any = survey[optionIndex].usersId;
        const currentUsersId = JSON.parse(JSON.stringify(selectedSurveyOption));
        if (isAdd) {
          selectedSurveyOption.push(userId);
        } else {
          survey[optionIndex].usersId = currentUsersId.filter(
            (id) => id !== userId
          );
        }
      }
      //Update share post with survey
      for (const id of state.ids) {
        const post = state.entities[id];
        if (post?.parentPost === postId && post?.parentPostInfo) {
          post.parentPostInfo.survey = tickedPost.survey;
        }
      }
    });
    builder.addCase(updatePostVisibility.fulfilled, (state, action) => {
      const postId = action.payload;
      const visibility = action.meta.arg?.visibility;
      if (state.entities[postId]) {
        postsAdapter.updateOne(state, {
          id: postId,
          changes: { visibility },
        });
      } else if (state.postSelected && state.postSelected._id === postId) {
        state.postSelected = { ...state.postSelected, visibility };
      }
    });
  },
});

// --- Selectors ---
// Global selectors (pass root state, not state.post)
import type { AppState } from "../index";

export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds,
  selectEntities: selectPostEntities,
  selectTotal: selectTotalPosts,
} = postsAdapter.getSelectors((state: AppState) => state.post);

export const {
  selectPost,
  updatePostInfo,
  updatePostAction,
  updateListPost,
  updatePostListLoading,
  selectPostReply,
  updatePostLike,
  toggleLikedByMe,
  removeOnePost,
  reloadListPost,
} = postSlice.actions;
export default postSlice.reducer;

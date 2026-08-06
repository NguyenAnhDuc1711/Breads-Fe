import { createSlice } from "@reduxjs/toolkit";
import PageConstant from "../../Breads-Shared/Constants/PageConstants";
import PostConstants from "../../Breads-Shared/Constants/PostConstants";
import { IPost, ISurveyOption, IUserShortInfo } from "../../Breads-Shared/Types";
import {
  createPost,
  deletePost,
  editPost,
  getPost,
  getPosts,
  getUserPosts,
  selectSurveyOption,
  updatePostStatus,
  updatePostVisibility,
} from "./asyncThunk";

export type { IPost, ISurveyOption, IUserShortInfo };

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

export interface PostState {
  listPost: IPost[];
  postSelected: IPost | null;
  postInfo: IPost;
  postAction: string;
  postReply: IPost | null;
  isLoading: boolean;
}

export const defaultPostInfo: IPost = {
  content: "",
  media: [],
  survey: [],
  usersTag: [],
  files: [],
  links: [],
};

export const initialPostState: PostState = {
  listPost: [],
  postSelected: null,
  postInfo: defaultPostInfo,
  postAction: "",
  postReply: null,
  isLoading: true,
};

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
      state.listPost = Array.isArray(action.payload) ? action.payload : [];
    },
    selectPostReply: (state, action) => {
      state.postReply = action.payload;
    },
    // Authoritative like count from the server broadcast (sent to every
    // viewer of the post). Never touches `likedByMe` — that's per-viewer
    // and only the acting client's own click can know it changed.
    updatePostLike: (state, action) => {
      const { postId, likesCount } = action.payload;
      const postIndex = state.listPost.findIndex((post) => post._id === postId);
      if (postIndex !== -1) {
        state.listPost[postIndex] = {
          ...state.listPost[postIndex],
          likesCount,
        };
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
    // Optimistic local flip for the user who just clicked Like — fires
    // immediately on click, before the server round-trip / broadcast.
    toggleLikedByMe: (state, action) => {
      const { postId } = action.payload;
      const flip = (post: IPost) => {
        const wasLiked = !!post.likedByMe;
        post.likedByMe = !wasLiked;
        post.likesCount = Math.max(0, (post.likesCount ?? 0) + (wasLiked ? -1 : 1));
      };
      const postIndex = state.listPost.findIndex((post) => post._id === postId);
      if (postIndex !== -1) {
        flip(state.listPost[postIndex]);
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
    reloadListPost: (state) => {
      state.listPost = [];
      state.isLoading = true;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getPost.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getPost.fulfilled, (state, action) => {
      const postSelected = action.payload;
      console.log("postSelected: ", postSelected);
      if (postSelected) {
        state.postSelected = postSelected;
      }
    });
    builder.addCase(getPosts.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getPosts.fulfilled, (state, action) => {
      state.isLoading = false;
      if (Array.isArray(action.payload?.posts)) {
        const newPosts: IPost[] = action.payload.posts;
        const isNewPage = action.payload.isNewPage;
        if (!isNewPage && Array.isArray(state.listPost)) {
          state.listPost.push(...newPosts);
        } else {
          state.listPost = newPosts;
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
      const newPost: IPost = action.payload?.data;
      const listPost: IPost[] = state.listPost;
      const currentPage: string = action.payload?.currentPage;
      if (!!newPost) {
        if (currentPage === PageConstant.USER) {
          state.listPost.unshift(newPost);
        }
        const { REPOST, REPLY } = PostConstants.ACTIONS;
        if (state.postSelected) {
          const postSelected: IPost = state.postSelected;
          if ([REPOST, REPLY].includes(state.postAction) && postSelected?._id) {
            const clonePostSelected = JSON.parse(JSON.stringify(postSelected));
            const postSelectedIndex = listPost.findIndex(
              ({ _id }) => _id === postSelected._id
            );
            if (state.postAction === REPLY) {
              clonePostSelected.replies.push(newPost);
            } else {
              clonePostSelected.repostNum += 1;
            }
            if (postSelectedIndex !== -1) {
              state.listPost[postSelectedIndex] = { ...clonePostSelected };
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
      const listPost: IPost[] = state.listPost;
      const postInfo: IPost = state.postInfo;
      let postPrevUpdateIndex: number = listPost.findIndex(
        (post) => post._id === postUpdatedData._id
      );
      listPost[postPrevUpdateIndex] = {
        ...listPost[postPrevUpdateIndex],
        ...postUpdatedData,
      };
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
        if (state.postSelected.replies) {
          state.listPost = state.postSelected.replies.filter(
            (post) => post._id !== postId
          );
          state.postSelected.replies = state.listPost;
        }
      } else {
        const listPost = JSON.parse(JSON.stringify(state.listPost));
        const newListPost = listPost.filter(({ _id }) => _id !== postId);
        for (let i = 0; i < newListPost.length; i++) {
          const post = newListPost[i];
          if (post.parentPost === postId) {
            delete newListPost[i].parentPostInfo;
          }
          if (post?.quote?._id === postId) {
            delete newListPost[i].quote;
          }
        }
        state.listPost = newListPost;
      }
    });
    builder.addCase(selectSurveyOption.fulfilled, (state, action) => {
      const { postId, userId, isAdd, optionId }: any = action.payload;
      const postTickedIndex = state.listPost.findIndex(
        ({ _id }) => _id === postId
      );
      const optionIndex = state.listPost[postTickedIndex].survey.findIndex(
        (option) => option._id === optionId
      );
      if (optionIndex !== -1) {
        let selectedSurveyOption: any =
          state.listPost[postTickedIndex].survey[optionIndex].usersId;
        const currentUsersId = JSON.parse(JSON.stringify(selectedSurveyOption));
        if (isAdd) {
          selectedSurveyOption.push(userId);
        } else {
          state.listPost[postTickedIndex].survey[optionIndex].usersId =
            currentUsersId.filter((id) => id !== userId);
        }
      }
      //Update share post with survey
      const listPost = JSON.parse(JSON.stringify(state.listPost));
      const postsShared = listPost.filter(
        ({ parentPost }) => parentPost === postId
      );
      if (postsShared?.length) {
        for (const post of postsShared) {
          const postIndex = listPost.findIndex(({ _id }) => _id === post._id);
          if (state.listPost[postIndex].parentPostInfo) {
            state.listPost[postIndex].parentPostInfo.survey =
              state.listPost[postTickedIndex].survey;
          }
        }
      }
    });
    builder.addCase(getUserPosts.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getUserPosts.fulfilled, (state, action) => {
      state.isLoading = false;
      const userPosts = action.payload;
      if (Array.isArray(userPosts)) {
        state.listPost = userPosts;
      }
    });
    builder.addCase(getUserPosts.rejected, (state) => {
      state.isLoading = false;
    });
    builder.addCase(updatePostStatus.fulfilled, (state, action) => {
      const postId = action.payload;
      let newListPost = JSON.parse(JSON.stringify(state.listPost));
      newListPost = newListPost.filter(({ _id }) => _id !== postId);
      state.listPost = newListPost;
    });
    // Unlike updatePostStatus (which removes the post from the moderation
    // list), a visibility change keeps the post in place — only its
    // `visibility` field changes, so task 013's badge stays in sync.
    builder.addCase(updatePostVisibility.fulfilled, (state, action) => {
      const postId = action.payload;
      const visibility = action.meta.arg?.visibility;
      const postIndex = state.listPost.findIndex(({ _id }) => _id === postId);
      if (postIndex !== -1) {
        state.listPost[postIndex] = {
          ...state.listPost[postIndex],
          visibility,
        };
      } else if (state.postSelected && state.postSelected._id === postId) {
        state.postSelected = { ...state.postSelected, visibility };
      }
    });
  },
});

export const {
  selectPost,
  updatePostInfo,
  updatePostAction,
  updateListPost,
  selectPostReply,
  updatePostLike,
  toggleLikedByMe,
  reloadListPost,
} = postSlice.actions;
export default postSlice.reducer;

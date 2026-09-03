import { createSlice } from "@reduxjs/toolkit";
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

export interface PostState {
  listPost: IPost[];
  postSelected: IPost | null;
  postInfo: IPostDraft;
  postAction: string;
  postReply: IPost | null;
  isLoading: boolean;
}

export const defaultPostInfo: IPostDraft = {
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
    // Bridge for RTK Query-backed list fetches (e.g. useGetUserPostsQuery in
    // UserHeader.tsx) to keep this shared flag in sync — ListPost's own
    // skeleton/empty branch still reads state.post.isLoading directly.
    updatePostListLoading: (state, action) => {
      state.isLoading = action.payload;
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
    builder.addCase(getPostReplies.fulfilled, (state, action) => {
      const payload: any = action.payload;
      if (!payload || !state.postSelected || state.postSelected._id !== payload.postId) {
        return;
      }
      const newReplies = (payload.replies ?? []).map(
        (reply: Partial<IPost>) => new PostResponse(reply as any)
      );
      // Runtime luôn có array (PostResponse default ở getPost.fulfilled) — `?? []` ở đây chỉ để
      // thoả TS (`IPost.replies` vẫn khai optional ở type-level), không phải guard thực sự cần.
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
        const newPosts: IPost[] = action.payload.posts.map(
          (p: Partial<IPost>) => new PostResponse(p as any)
        );
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
      const rawNewPost = action.payload?.data;
      // Create trả về post MỚI hoàn toàn (không phải patch/merge) — an toàn để wrap qua
      // PostResponse như getPost/getPosts (FR-3), khác `editPost.fulfilled` bên dưới.
      const newPost: IPost | undefined = rawNewPost
        ? new PostResponse(rawNewPost)
        : undefined;
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
              // `clonePostSelected.replies` luôn là array (mọi entry point vào `postSelected`/
              // `listPost` đã qua PostResponse, default `replies: []`) — không cần guard nữa.
              clonePostSelected.replies.push(newPost);
              clonePostSelected.repliesCount = (clonePostSelected.repliesCount ?? 0) + 1;
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
      // (T5 audit) CHỦ Ý không wrap qua PostResponse ở đây: payload được spread-merge vào
      // `listPost[idx]` hiện có (`{...old, ...postUpdatedData}`), không phải full-replace như
      // getPost/getPosts/createPost — nếu API edit trả về patch RỖNG cho field không đổi (chưa xác
      // nhận), PostResponse sẽ default `content`/`media` thiếu về `undefined`, GHI ĐÈ nhầm giá trị
      // cũ đang đúng khi merge. Cần xác nhận shape response thật của endpoint edit trước khi wrap.
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
          const hadReply = state.postSelected.replies.some(
            (post) => post._id === postId
          );
          state.listPost = state.postSelected.replies.filter(
            (post) => post._id !== postId
          );
          state.postSelected.replies = state.listPost;
          // Badge (`Actions`/`ViewActivity`) đọc `repliesCount` riêng, không còn suy ra từ
          // `replies.length` (trang hiện tải chỉ là 1 phần) — phải tự trừ khi xoá đúng 1 reply.
          if (hadReply) {
            state.postSelected.repliesCount = Math.max(
              0,
              (state.postSelected.repliesCount ?? 1) - 1
            );
          }
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
      const survey = state.listPost[postTickedIndex]?.survey;
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
    // A visibility change keeps the post in place — only its `visibility`
    // field changes, so task 013's badge stays in sync.
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
  updatePostListLoading,
  selectPostReply,
  updatePostLike,
  toggleLikedByMe,
  reloadListPost,
} = postSlice.actions;
export default postSlice.reducer;

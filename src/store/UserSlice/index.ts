import { createSlice } from "@reduxjs/toolkit";
import {
  addPostToCollection,
  followUser,
  getMe,
  getUserInfo,
  login,
  logout,
  removePostFromCollection,
  updateUser,
} from "./asyncThunk";

export interface IUser {
  _id: string;
  email: string;
  name: string;
  username: string;
  bio: string;
  avatar: string;
  followed: string[];
  following: string[];
  followersCount?: number;
  followingCount?: number;
  collection: string[];
  links: [];
  role: number;
  hasNewMsg: boolean;
  createdAt?: Date | string | number;
  status?: number;
}

export interface UserState {
  userInfo: IUser;
  userSelected: IUser;
  isLoading: boolean;
}

const defaultUser: IUser = {
  _id: "",
  email: "",
  name: "",
  username: "",
  bio: "",
  avatar: "",
  followed: [],
  following: [],
  collection: [],
  links: [],
  role: 1,
  hasNewMsg: false,
  createdAt: new Date(),
};

export const initialUserState: UserState = {
  userInfo: defaultUser,
  userSelected: defaultUser,
  isLoading: false,
};

const userSlice = createSlice({
  name: "user",
  initialState: initialUserState,
  reducers: {
    selectUser: (state, action) => {
      state.userSelected = action.payload;
    },
    updateUserInfo: (state, action) => {
      const { key, value } = action.payload;
      state.userInfo[key] = value;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      if (action.payload) {
        state.userInfo = action.payload;
        state.isLoading = false;
      }
    });
    builder.addCase(logout.fulfilled, (state) => {
      state.userInfo = defaultUser;
    });
    builder.addCase(getMe.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getMe.fulfilled, (state, action) => {
      if (action.payload) {
        state.userInfo = action.payload;
      }
      state.isLoading = false;
    });
    builder.addCase(getMe.rejected, (state) => {
      state.userInfo = defaultUser;
      state.isLoading = false;
    });
    builder.addCase(getUserInfo.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getUserInfo.fulfilled, (state, action) => {
      const { user, getCurrentUser }: any = action.payload;
      if (getCurrentUser) {
        state.userInfo = user;
      } else {
        state.userSelected = user;
      }
      state.isLoading = false;
    });
    builder.addCase(addPostToCollection.fulfilled, (state, action) => {
      const postAddId = action.payload;
      state.userInfo.collection = [...state.userInfo.collection, postAddId];
    });
    builder.addCase(removePostFromCollection.fulfilled, (state, action) => {
      const { postId: postRemoveId }: any = action.payload;
      state.userInfo.collection = state.userInfo.collection.filter(
        (postId) => postId !== postRemoveId
      );
    });
    builder.addCase(updateUser.fulfilled, (state, action) => {
      const newUserData = action.payload;
      if (newUserData?._id === state.userInfo?._id) {
        state.userInfo = newUserData;
      }
    });
    builder.addCase(followUser.fulfilled, (state, action) => {
      const userFlId = action.payload;
      const userInfo: IUser = JSON.parse(JSON.stringify(state.userInfo));
      let newFollowList: string[] = [];
      if (userInfo?.following?.includes(userFlId)) {
        newFollowList = userInfo.following.filter(
          (userId) => userId !== userFlId
        );
      } else {
        newFollowList = [...userInfo.following, userFlId];
      }
      if (state.userSelected?._id) {
        let newFlList: string[] = [];
        if (state.userSelected?.followed?.includes(userInfo?._id)) {
          newFlList = state.userSelected.followed.filter(
            (_id) => _id !== userInfo?._id
          );
        } else {
          if (state.userSelected?.followed) {
            newFlList = [...state.userSelected.followed, userInfo?._id];
          }
        }
        state.userSelected.followed = newFlList;
      }
      state.userInfo.following = newFollowList;
    });
  },
});

export const { selectUser, updateUserInfo } = userSlice.actions;
export default userSlice.reducer;

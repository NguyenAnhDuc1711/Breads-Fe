import { configureStore } from "@reduxjs/toolkit";
import MessageReducer, { MsgState } from "./MessageSlice";
import NotificationReducer, { NotificationState } from "./NotificationSlice";
import PostReducer, { PostState } from "./PostSlice";
import ReportReducer, { ReportState } from "./ReportSlice";
import UserReducer, { UserState } from "./UserSlice";
import UtilReducer, { UtilState } from "./UtilSlice";
import { logout } from "./UserSlice/asyncThunk";
import { api } from "./api/baseApi";
import { AnyAction, combineReducers } from "@reduxjs/toolkit";

export interface AppState {
  user: UserState;
  post: PostState;
  util: UtilState;
  message: MsgState;
  notification: NotificationState;
  report: ReportState;
  [api.reducerPath]: ReturnType<typeof api.reducer>;
}

const appReducer = combineReducers({
  user: UserReducer,
  post: PostReducer,
  util: UtilReducer,
  message: MessageReducer,
  notification: NotificationReducer,
  report: ReportReducer,
  [api.reducerPath]: api.reducer,
});

const rootReducer = (state: AppState | undefined, action: AnyAction) => {
  if (action.type === logout.fulfilled.type) {
    return appReducer(undefined, action);
  }

  return appReducer(state, action);
};

export const makeStore = (preloadedState?: Partial<AppState>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState: preloadedState as AppState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat(api.middleware),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

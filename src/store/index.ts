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

// Combine all reducers
const appReducer = combineReducers({
  user: UserReducer,
  post: PostReducer,
  util: UtilReducer,
  message: MessageReducer,
  notification: NotificationReducer,
  report: ReportReducer,
  [api.reducerPath]: api.reducer,
});

// Root reducer that will handle resetting all state on logout
const rootReducer = (state: AppState | undefined, action: AnyAction) => {
  // When logout action is fulfilled, reset the state of all slices
  if (action.type === logout.fulfilled.type) {
    return appReducer(undefined, action);
  }

  return appReducer(state, action);
};

// Factory instead of a module-level singleton so the root layout can seed
// user identity (resolved server-side from the jwt cookie, see
// app/layout.tsx) into the store at creation time, instead of the client
// having to wait for its own getMe() round trip to populate it.
// `preloadedState` is typed loosely because our custom rootReducer's own
// signature otherwise forces callers to supply every slice.
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

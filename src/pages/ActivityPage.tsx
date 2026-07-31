import { useEffect } from "react";
import PageConstant from "../Breads-Shared/Constants/PageConstants";
import Activity from "../components/Activity";
import ContainerLayout from "../components/MainBoxLayout";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { HeaderHeight } from "../Layout";
import { AppState } from "../store";
import { changeDisplayPageData } from "../store/UtilSlice";
import { getNotificattions } from "../store/NotificationSlice/asyncThunk";
import { changePage } from "../store/UtilSlice/asyncThunk";
import { addEvent } from "../util";

// `tab` is the single source of truth for which Activity tab is active — it
// comes from the matched route segment (app/(main)/activity/page.tsx or
// app/(main)/activity/[tab]/page.tsx), not from Redux state.util.displayPageData (AD-4).
const ActivityPage = ({ tab }: { tab: string }) => {
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const { currentPage } = useAppSelector((state: AppState) => state.util);

  useEffect(() => {
    dispatch(
      changePage({
        nextPage: PageConstant.ACTIVITY,
        currentPage: currentPage,
      })
    );
    dispatch(changeDisplayPageData(tab));
    if (userInfo?._id) {
      dispatch(
        getNotificattions({
          userId: userInfo?._id,
          page: 1,
          limit: 15,
        })
      );
      addEvent({
        event: "see_page",
        payload: {
          page: "activity",
        },
      });
    }
  }, [userInfo, tab]);

  return (
    // Old App.tsx applied this same marginTop to every non-auth/non-admin
    // route's wrapper div (Header is `position: fixed`); that spacing now
    // lives in each route's own page body (see app/(main)/layout.tsx note).
    <div style={{ marginTop: HeaderHeight + 12 + "px" }}>
      <ContainerLayout>
        <Activity currentPage={tab} />
      </ContainerLayout>
    </div>
  );
};

export default ActivityPage;

import { useEffect } from "react";
import PageConstant from "../Breads-Shared/Constants/PageConstants";
import Activity from "../components/Activity";
import ContainerLayout from "../components/MainBoxLayout";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { AppState } from "../store";
import { changeDisplayPageData } from "../store/UtilSlice";
import { changePage } from "../store/UtilSlice/asyncThunk";
import { addEvent } from "../util";

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
      addEvent({
        event: "see_page",
        payload: {
          page: "activity",
        },
      });
    }
  }, [userInfo, tab]);

  return (
    <ContainerLayout>
      <Activity currentPage={tab} />
    </ContainerLayout>
  );
};

export default ActivityPage;

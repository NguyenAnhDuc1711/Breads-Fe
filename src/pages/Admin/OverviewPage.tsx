"use client";

import LeftSideBarOverview from "../../components/Admin/Overview/LeftSideBar";
import RightSideContentOverview from "../../components/Admin/Overview/RightSideContent";
import "./OverviewPage.css";

const OverviewPage = () => {
  return (
    <div className="overview-page">
      <LeftSideBarOverview />
      <div className="overview-page__content">
        <RightSideContentOverview />
      </div>
    </div>
  );
};

export default OverviewPage;

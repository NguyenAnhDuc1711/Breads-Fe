import PageConstant from "../../../../Breads-Shared/Constants/PageConstants";
import "./index.css";

export const overviewTabs = [
  {
    name: "Reports snapshot",
    page: PageConstant.ADMIN.REPORT_SNAPSHOT,
  },
  {
    name: "Realtime overview",
    page: PageConstant.ADMIN.REALTIME_OVERVIEW,
  },
  {
    name: "Realtime pages",
    page: PageConstant.ADMIN.REALTIME_PAGES,
  },
];

const LeftSideBarOverview = () => {
  return (
    <div className="admin-overview-sidebar">
      {/* {overviewTabs.map(({ name }) => (
        <Text key={name}>{name}</Text>
      ))} */}
    </div>
  );
};

export default LeftSideBarOverview;

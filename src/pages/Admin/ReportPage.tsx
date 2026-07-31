"use client";

import { Flex } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { REPORT_PATH, Route } from "../../Breads-Shared/APIConfig";
import InfiniteScroll from "../../components/InfiniteScroll";

// @uiw/react-md-editor touches window/navigator at import time.
const ReportBox = dynamic(() => import("../../components/Admin/Report"), {
  ssr: false,
});
import { GET } from "../../config/API";
import { useAppSelector } from "../../hooks/redux";
import { AppState } from "../../store";
import { EmptyContentSvg } from "../../assests/icons";

const ReportPage = () => {
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const [reports, setReports] = useState<any>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [firstLoad, setFirstLoad] = useState(false);

  const handleGetReports = async ({ page }) => {
    try {
      const data: any = await GET({
        path: Route.REPORT + REPORT_PATH.GET,
        params: {
          userId: userInfo?._id,
          page,
          limit: 20,
          searchValue,
        },
      });
      if (data?.length) {
        setReports([...reports, ...data]);
      }
    } catch (err) {
      console.error("handleGetReports: ", err);
    } finally {
      setFirstLoad(true);
    }
  };
  return (
    <Flex flexDir={"column"} px={8} gap={4} alignItems={"center"}>
      <InfiniteScroll
        queryFc={(page) => {
          handleGetReports({ page });
        }}
        data={reports}
        cpnFc={(report) => (
          <ReportBox
            report={report}
            selectedReport={selectedReport}
            setSelectedReport={setSelectedReport}
            reports={reports}
            setReports={setReports}
          />
        )}
        deps={[searchValue]}
        preloadIndex={10}
      />
      {firstLoad && reports?.length === 0 && (
        <Flex justifyContent={"center"} padding={"16px"}>
          <EmptyContentSvg />
        </Flex>
      )}
    </Flex>
  );
};

export default ReportPage;

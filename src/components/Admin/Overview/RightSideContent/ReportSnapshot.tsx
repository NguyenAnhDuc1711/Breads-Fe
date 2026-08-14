"use client";

import { Text } from "../../../ui/primitives";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ANALYTICS_PATH, Route } from "../../../../Breads-Shared/APIConfig";
import { useAppSelector } from "../../../../hooks/redux";
import Socket from "../../../../socket";
import { AppState } from "../../../../store";
import DetailStatisticTable from "../AnalyticsGraph/DetailStatistic";
import { sortObjectByValue } from "../utils";
import "./ReportSnapshot.css";

// chart.js/react-chartjs-2 (Bar/Line/Doughnut) and chartjs-chart-geo (Map)
// touch canvas/window at module/mount time; react-date-range touches
// document for portal positioning. All four load client-only.
const BarGraph = dynamic(() => import("../AnalyticsGraph/BarGraph"), {
  ssr: false,
});
const DoughnutGraph = dynamic(() => import("../AnalyticsGraph/DonutGraph"), {
  ssr: false,
});
const LineGraph = dynamic(() => import("../AnalyticsGraph/LineGraph"), {
  ssr: false,
});
const MapGraph = dynamic(() => import("../AnalyticsGraph/MapGraph"), {
  ssr: false,
});
const DateRangeView = dynamic(() => import("../utils/DateRange"), {
  ssr: false,
});

const ReportSnapshot = () => {
  const dateRange = useAppSelector(
    (state: AppState) => state.admin.overview.dateRange
  );
  const [snapshotData, setSnapshotData] = useState<any>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    handleGetUserActive();
  }, [dateRange]);

  const handleGetUserActive = async () => {
    try {
      setIsLoading(true);
      const currentDate = new Date();
      const date = currentDate.getDate();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const currentDateString = `${year}-${month}-${date}`;
      const searchDateRange =
        dateRange?.start && dateRange?.end
          ? [dateRange?.start, dateRange?.end]
          : [currentDateString, currentDateString];
      const socket = Socket.getInstant();
      socket.emit(
        Route.ANALYTICS + ANALYTICS_PATH.GET_SNAPSHOT_REPORT,
        {
          dateRange: searchDateRange,
        },
        (data) => {
          setTimeout(() => {
            setSnapshotData({
              active: data.active,
              event: sortObjectByValue(data.event),
              locale: sortObjectByValue(data.locale),
              device: sortObjectByValue(data.device),
              os: sortObjectByValue(data.os),
            });
            setIsLoading(false);
          }, 1000);
        }
      );
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const containerBox = (cpns, fitBox = false) => {
    return (
      <div
        className={`report-snapshot__row${
          fitBox ? " report-snapshot__row--fit" : ""
        }`}
      >
        {cpns.map((cpn, index) => (
          <div className="report-snapshot__cell" key={`graph-${index}`}>
            {cpn}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div id="report-snapshot" className="report-snapshot">
      <div className="report-snapshot__header">
        <Text fontWeight="semibold" fontSize="lg">
          Report snapshot
        </Text>
        <DateRangeView />
      </div>
      {containerBox([
        <LineGraph
          key="active-line"
          labels={snapshotData?.active?.map(({ date }) => date)}
          data={snapshotData?.active?.map(({ data }) => data)}
          isLoading={isLoading}
        />,
        <DetailStatisticTable
          key="event-detail"
          data={snapshotData?.event}
          title="User events"
          keyHead="Event"
          valHead="Total"
          isLoading={isLoading}
        />,
      ])}
      {containerBox([
        <MapGraph key="locale-map" data={snapshotData?.locale} isLoading={isLoading} />,
        <BarGraph key="locale-bar" data={snapshotData?.locale} isLoading={isLoading} />,
      ])}
      {containerBox([
        <DoughnutGraph
          key="device-donut"
          labels={snapshotData?.device ? Object.keys(snapshotData?.device) : []}
          data={snapshotData?.device ? Object.values(snapshotData?.device) : []}
          isLoading={isLoading}
        />,
        <DetailStatisticTable
          key="os-detail"
          data={snapshotData?.os}
          title="User operating system"
          keyHead="OS"
          valHead="Total"
          isLoading={isLoading}
        />,
      ])}
    </div>
  );
};

export default ReportSnapshot;

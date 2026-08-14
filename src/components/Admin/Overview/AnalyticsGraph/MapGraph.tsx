import { Chart } from "chart.js";
import * as ChartGeo from "chartjs-chart-geo";
import {
  ChoroplethController,
  ColorScale,
  GeoFeature,
  ProjectionScale,
} from "chartjs-chart-geo";
import { useEffect } from "react";
import { useAppSelector } from "../../../../hooks/redux";
import { AppState } from "../../../../store";
import { getLocaleId, worldAtlasData } from "./map";
import { Skeleton } from "../../../ui/primitives";

Chart.register(ChoroplethController, GeoFeature, ColorScale, ProjectionScale);

const MapGraph = ({
  data,
  isLoading = false,
}: {
  data: any;
  isLoading: boolean;
}) => {
  const dateRange = useAppSelector(
    (state: AppState) => state.admin.overview.dateRange
  );

  const countriesInfo: any = ChartGeo.topojson.feature(
    worldAtlasData as any,
    (worldAtlasData as any).objects.countries as any
  ) as any;

  const countries = countriesInfo.features;

  const dataConfig = {
    labels: countries.map((d: any) => d.properties.name),
    datasets: [
      {
        label: "Countries",
        data: countries.map((d) => ({
          feature: d,
          value: data?.[getLocaleId(d.properties.name) ?? ""] ?? 0,
        })),
      },
    ],
  };

  const config: any = {
    type: "choropleth",
    data: dataConfig,
    options: {
      showOutline: true,
      showGraticule: true,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        projection: {
          axis: "x",
          projection: "equalEarth",
        },
      },
    },
  };

  useEffect(() => {
    if (!isLoading) {
      const canvasHtml: any = document.getElementById("map-graph");
      const chart = new Chart(canvasHtml?.getContext("2d"), config);
      return () => {
        chart.destroy();
      };
    }
  }, [dateRange, isLoading]);

  if (isLoading) {
    return <Skeleton height="180px" width={"100%"} />;
  }

  return <canvas id="map-graph"></canvas>;
};

export default MapGraph;

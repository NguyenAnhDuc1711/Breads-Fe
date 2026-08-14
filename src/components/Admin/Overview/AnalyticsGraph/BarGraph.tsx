import { BarElement, Chart as ChartJS } from "chart.js";
import { Bar } from "react-chartjs-2";
import { localeToCountry } from "./map";
import { Skeleton } from "../../../ui/primitives";
import "./BarGraph.css";

ChartJS.register(BarElement);

const BarGraph = ({
  data,
  isLoading = false,
}: {
  data: any;
  isLoading: boolean;
}) => {
  const labels = data ? Object.keys(data).map((id) => localeToCountry(id)) : [];
  const dataConfig = {
    labels: labels,
    datasets: [
      {
        label: "Countries",
        data: data ? Object.values(data) : [],
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(255, 159, 64, 0.2)",
          "rgba(255, 205, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(201, 203, 207, 0.2)",
        ],
        borderColor: [
          "rgb(255, 99, 132)",
          "rgb(255, 159, 64)",
          "rgb(255, 205, 86)",
          "rgb(75, 192, 192)",
          "rgb(54, 162, 235)",
          "rgb(153, 102, 255)",
          "rgb(153, 102, 255)",
        ],
        borderWidth: 1,
      },
    ],
  };
  const config = {
    type: "bar",
    data: dataConfig,
    options: {
      indexAxis: "y" as const,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  };

  if (isLoading) {
    return (
      <div className="bar-graph-skeleton">
        {/* Legend */}
        <div className="bar-graph-skeleton__legend">
          <Skeleton
            className="bar-graph-skeleton__legend-swatch"
            width="50px"
            height="20px"
          />
          <p className="bar-graph-skeleton__legend-label">Countries</p>
        </div>

        {/* Chart area with country and bar */}
        <div className="bar-graph-skeleton__rows">
          {[1, 2, 3, 4].map((item) => (
            <div className="bar-graph-skeleton__row" key={item}>
              <div className="bar-graph-skeleton__row-label">
                <Skeleton width="100%" height="20px" />
              </div>
              <div className="bar-graph-skeleton__row-bar">
                <Skeleton
                  className="bar-graph-skeleton__bar"
                  width="100%"
                  height="30px"
                  borderRadius="sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return <Bar data={config.data} options={config.options} />;
};

export default BarGraph;

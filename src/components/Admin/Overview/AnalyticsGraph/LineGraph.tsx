import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Skeleton } from "../../../ui/primitives";
import "./LineGraph.css";

// Register required modules with ChartJS
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const LineGraph = ({ labels, data, isLoading = false }) => {
  const configData = {
    labels,
    datasets: [
      {
        label: "User active",
        data,
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        // tension: 0.1, // Controls line smoothness
      },
    ],
  };

  const config = {
    type: "line",
    data: configData,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top" as const,
        },
        // title: {
        //   display: true,
        //   text: "",
        // },
      },
    },
  };

  if (isLoading) {
    return (
      <div className="line-graph-skeleton">
        <div className="line-graph-skeleton__row">
          <div className="line-graph-skeleton__y-axis">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item, index) => (
              <p className="line-graph-skeleton__y-label" key={index}>
                <Skeleton width="40px" height="10px" />
              </p>
            ))}
          </div>

          {/* Chart area */}
          <div className="line-graph-skeleton__chart-area">
            <Skeleton width="100%" height="100%" borderRadius="md" />
            <div className="line-graph-skeleton__dot" />
          </div>
        </div>

        {/* X-axis date */}
        <div className="line-graph-skeleton__x-axis">
          <p className="line-graph-skeleton__y-label">
            <Skeleton width="40px" height="10px" />
          </p>
        </div>
      </div>
    );
  }

  return <Line data={config.data} options={config.options} />;
};

export default LineGraph;

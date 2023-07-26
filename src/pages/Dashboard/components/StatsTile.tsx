import { UserStatistic } from "../../../api/generated";
import Tile, { TileSize } from "./Tile";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

function StatsTile({ stats, onClick }: { stats: UserStatistic[] | undefined; onClick?: () => void }) {
  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

  const dataStats = stats ? stats : [];
  const labels = dataStats.map(e => e.hour);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
        text: "",
      },
    },
    scales: {
      y: {
        min: 0,
      },
    },
  };

  const data = {
    labels,
    datasets: [
      {
        label: "",
        data: dataStats.map(e => e.usersOnline),
        borderColor: "#009e79",
        backgroundColor: "#009e79",
      },
    ],
  };

  return (
    <Tile size={TileSize.Large} onClick={onClick}>
      <div className="stats-tile">
        <div className="title">Online users (Last 24 hours)</div>
        <div className="chart">
          <Line  width={502} height={242} options={options} data={data} />
        </div>
      </div>
    </Tile>
  );
}

export default StatsTile;

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { format, parseISO } from 'date-fns';
import { Line } from 'react-chartjs-2';
import type { Dataset, LineChartData } from '~/interfaces/line-chart-data';
import type { IPrices } from '~/interfaces/tracking-schema';
import { dateFormat } from '~/utils/const';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const CHART_LABEL_COLORS = '#e6e6e6';
const CHART_GRID_LINES_COLORS = 'rgba(255, 255, 255, 0.1)';

type Props = {
  prices: IPrices[];
};

export const LineChart = ({ prices }: Props) => {
  const getDataSet = (prices: IPrices[]): LineChartData => {
    const dataset: Dataset = {
      label: `Precio `,
      data: prices.map((item) => item.price),
      backgroundColor: '#3100e0',
      borderColor: '#3100e0',
    };
    return {
      labels: prices.map((priceObj) =>
        format(parseISO(priceObj.date.toString()), dateFormat.euWithTime)
      ),
      datasets: [dataset],
    };
  };

  const config = {
    id: 'pricing-history',
    type: 'line',
    data: getDataSet(prices),
    options: {
      responsive: true,
      maintainAspectRatio: false,
      elements: {
        point: {
          radius: 0,
        },
      },
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            boxHeight: 9,
            font: { size: 15 },
            color: CHART_LABEL_COLORS,
          },
        },
        tooltip: {
          interaction: {
            intersect: false,
            mode: 'index',
          },
          titleColor: '#4a41bd',
          titleMarginBottom: 8,
          titleFont: { size: 16 },
          backgroundColor: 'rgba(236, 244, 249, 0.7)',
          padding: {
            x: 32,
            y: 24,
          },
          bodyColor: '#02337c',
          bodySpacing: 5,
          bodyFont: { size: 15 },
          usePointStyle: true,
          pointStyle: 'circle',
          boxHeight: 10,
          callbacks: {
            label: (context: any) => {
              return `${context.dataset.label}: ${context.dataset.data.at(
                context.dataIndex
              )}`;
            },
          },
        },
      },
      scales: {
        y: {
          min: 0,
          // max: highestChartNumber * 1.1,
          ticks: {
            maxTicksLimit: 10,
            padding: 10,
            color: CHART_LABEL_COLORS,
            callback: (value: any) => Math.round(value).toLocaleString('es-ES'),
          },
          grid: {
            drawTicks: false,
            drawOnChartArea: true,
            color: CHART_GRID_LINES_COLORS,
          },
        },
        x: {
          ticks: {
            maxTicksLimit: 8,
            beginAtZero: true,
            padding: 5,
            color: CHART_LABEL_COLORS,
            indexAxis: 'x',
            font: { size: 11 },
          },
          grid: {
            drawTicks: false,
            drawOnChartArea: true,
            color: CHART_GRID_LINES_COLORS,
          },
        },
      },
    },
  };

  return (
    <div className='h-[20rem] w-full'>
      <Line {...config} />
    </div>
  );
};

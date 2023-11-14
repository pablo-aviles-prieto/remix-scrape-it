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

const BRAND_COLOR = '#5024ee';
// const CHART_LABEL_COLORS = 'rgba(255, 255, 255, 0.5)';
// const CHART_GRID_LINES_COLORS = 'rgba(255, 255, 255, 0.1)';
// const CHART_BORDERS = 'rgb(100, 116, 139)';

type Props = {
  prices: IPrices[];
  itemName: string;
  currency: string;
  theme?: 'light' | 'dark';
  isModal?: boolean;
};

export const LineChart = ({
  prices,
  itemName,
  currency,
  theme = 'dark',
  isModal = false,
}: Props) => {
  const CHART_LABEL_COLORS =
    theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(22, 22, 22, 0.7)';
  const CHART_GRID_LINES_COLORS =
    theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(22, 22, 22, 0.1)';
  const CHART_BORDERS = 'rgb(100, 116, 139)';

  const breakLabel = (label: string, maxChars: number = 10) => {
    const ellipsis = label.length > maxChars ? '...' : '';
    return `${label.substring(0, maxChars)}${ellipsis}`;
  };

  const getDataSet = ({
    prices,
    itemName,
  }: {
    prices: IPrices[];
    itemName: string;
  }): LineChartData => {
    const dataset: Dataset = {
      label: breakLabel(itemName, 30),
      data: prices.map((item) => item.price),
      backgroundColor: BRAND_COLOR,
      borderColor: BRAND_COLOR,
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
    data: getDataSet({ prices, itemName }),
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
          display: false,
        },
        tooltip: {
          interaction: {
            intersect: false,
            mode: 'index',
          },
          titleColor: '#4a41bd',
          titleMarginBottom: 8,
          titleFont: { size: 16 },
          titleAlign: 'center' as unknown as 'center',
          backgroundColor: 'rgba(236, 244, 249, 0.9)',
          padding: {
            x: 32,
            y: 24,
          },
          bodyColor: '#28117a',
          bodySpacing: 5,
          bodyFont: { size: 14 },
          usePointStyle: true,
          pointStyle: 'circle',
          boxHeight: 10,
          callbacks: {
            label: (context: any) => {
              return `${context.dataset.label} ${context.dataset.data.at(
                context.dataIndex
              )}${currency}`;
            },
          },
        },
      },
      scales: {
        y: {
          min: 0,
          ticks: {
            maxTicksLimit: 5,
            padding: 10,
            color: CHART_LABEL_COLORS,
            callback: (value: any) => Math.round(value).toLocaleString('es-ES'),
          },
          grid: {
            drawTicks: false,
            drawOnChartArea: true,
            color: (context: any) => {
              if (context.tick.value === 0) {
                return CHART_BORDERS; // Color for the zero line
              }
              return 'rgba(0, 0, 0, 0)'; // Transparent for all other lines
            },
          },
        },
        x: {
          ticks: {
            maxTicksLimit: isModal ? 4 : 8,
            beginAtZero: true,
            padding: 10,
            color: CHART_LABEL_COLORS,
            indexAxis: 'x',
            font: { size: isModal ? 10 : 11 },
          },
          grid: {
            drawTicks: false,
            drawOnChartArea: true,
            color: (context: any) => {
              if (context.tick.value === 0) {
                return CHART_BORDERS;
              }
              return CHART_GRID_LINES_COLORS;
            },
          },
        },
      },
    },
  };

  return (
    <div className={`${isModal ? 'h-[13rem]' : 'h-[21rem]'} w-full`}>
      <Line {...config} />
    </div>
  );
};

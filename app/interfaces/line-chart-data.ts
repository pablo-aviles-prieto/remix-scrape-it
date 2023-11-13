export interface Dataset {
  stepped?: boolean;
  label: string;
  data: number[];
  rawData?: number[];
  fill?: boolean;
  backgroundColor: string;
  borderColor?: string;
}

export interface LineChartData {
  labels: string[];
  datasets: Dataset[];
}

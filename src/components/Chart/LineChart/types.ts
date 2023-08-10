export interface Dataset {
  label: string;
  data: number[];
  fill: boolean;
  backgroundColor: string;
  borderColor: string;
}

export interface LineChartProps {
  labels: string[];
  datasets: Dataset[];
}

export interface Dataset {
  label: string;
  data: number[];
  fill: boolean;
  backgroundColor: string;
  borderColor: string;
}

export interface LineChartProps {
  idTooltip?: string;
  labels: string[];
  datasets: Dataset[];
}

export interface MetricDetail {
  labels: string[];
  axisXLabel?: string;
  axisYLabel?: string;
  datasets: Dataset[];
}

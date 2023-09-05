export interface Dataset {
  label: string;
  data: number[];
  fill: boolean;
  backgroundColor: string;
  borderColor: string;
}

export interface LineChartProps {
  title?: string;
  description?: string;
  idTooltip?: string;
  labels: string[];
  datasets: Dataset[];
}

export interface MetricDetail {
  title?: string;
  description?: string;
  labels: string[];
  axisXLabel?: string;
  axisYLabel?: string;
  datasets: Dataset[];
}

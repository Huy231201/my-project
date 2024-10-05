import IntersectionLineChart from '@/components/Chart/IntersectionLineChart';
import { Dataset, MetricDetail } from '@/components/Chart/types';
import { useGetMetricDetailQuery } from '@/services/metric';
import { ScriptableContext } from 'chart.js';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { LabelBrowserMetric } from './config';
import { MetricChartColors } from '@/components/Chart/config';
import dayjs from 'dayjs';

interface Props {
  show: boolean;
  title: string;
  cadence: string;
  metricKey: string;
  idTooltip?: string;
  dateRange: Array<Date | null>;
  dataUpdate: number;
}

function CustomLineChart(props: Props) {
  const { show, title, metricKey, cadence, idTooltip, dateRange, dataUpdate } = props;
  const { ref, inView } = useInView({
    threshold: 0,
  });

  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
  const [metricDetail, setMetricDetail] = useState<MetricDetail>({
    labels: [],
    datasets: [],
  });

  // FromDate: '2023-06-05',
  //     ToDate: '2023-08-07',

  const { data, isFetching } = useGetMetricDetailQuery(
    {
      cadence: cadence,
      MetricName: metricKey,
      FromDate: dayjs(dateRange[0]).format('YYYY-MM-DD'),
      ToDate: dayjs(dateRange[1]).format('YYYY-MM-DD'),
    },
    {
      skip: show && (!inView || !isFirstLoad),
    },
  );

  useEffect(() => {
    if (show && isFirstLoad && inView && !isFetching && data) {
      const config = LabelBrowserMetric?.[metricKey] || {};

      const datasets = data?.datasets?.map((dataset: Dataset, index: number) => {
        const colorConfig = MetricChartColors[(Number(dataset.label) || index) % 10];
        return {
          label: config?.values?.[dataset.label] || dataset.label,
          data: dataset.data || [],
          fill: 'start',
          borderColor: colorConfig.borderColor,
          backgroundColor: (context: ScriptableContext<'line'>) => {
            const { ctx } = context.chart;
            const gradient = ctx.createLinearGradient(0, 0, 0, 350);
            gradient.addColorStop(0.7, colorConfig.gradientEnd);
            gradient.addColorStop(1, colorConfig.gradientStart);
            return gradient;
          },
          pointBackgroundColor: '#FF821C',
          pointBorderColor: '#FFF',
        };
      });
      setMetricDetail({
        title,
        description: config.description,
        labels: data?.labels,
        axisXLabel: window.T('Time'),
        axisYLabel: config.description,
        datasets,
      });
      setIsFirstLoad(false);
    }
  }, [inView, isFetching, data]);

  useEffect(() => {
    setIsFirstLoad(true);
  }, [dataUpdate]);

  return (
    <IntersectionLineChart
      key={dataUpdate}
      ref={ref}
      isLoading={isFirstLoad}
      title={title}
      idTooltip={idTooltip}
      metricDetail={metricDetail}
    />
  );
}

export default CustomLineChart;

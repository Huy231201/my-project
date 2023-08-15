import IntersectionLineChart from '@/components/Chart/IntersectionLineChart';
import { MetricDetail } from '@/components/Chart/types';
import { ScriptableContext } from 'chart.js';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { MetricChartColors } from '@/components/Chart/config';
import dayjs from 'dayjs';

interface Props {
  title: string;
  idTooltip?: string;
  dataUpdate: number;
  dateRange: Array<Date | null>;
  useApi: any;
}

interface ValueChartItem {
  key: string;
  value: number;
}

interface ChartItem {
  name: string;
  values: Array<ValueChartItem>;
}

function CustomLineChart(props: Props) {
  const { title, idTooltip, useApi, dateRange, dataUpdate } = props;
  const { ref, inView } = useInView({
    threshold: 0,
  });

  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
  const [metricDetail, setMetricDetail] = useState<MetricDetail>({
    labels: [],
    datasets: [],
  });

  const { data, isFetching } = useApi(
    {
      FromDate: dayjs(dateRange[0]).format('YYYY-MM-DD'),
      ToDate: dayjs(dateRange[1]).format('YYYY-MM-DD'),
    },
    {
      refetchOnMountOrArgChange: true,
      skip: !inView || !isFirstLoad,
    },
  );

  useEffect(() => {
    if (isFirstLoad && inView && !isFetching) {
      const parseDataset = (data?.charts || []).map((item: ChartItem, index: number) => {
        const colorConfig = MetricChartColors[Number(index) % 10];
        return {
          label: item.name,
          data: item.values.map((d: ValueChartItem) => d.value),
          borderColor: colorConfig.borderColor,
          backgroundColor: (context: ScriptableContext<'line'>) => {
            const { ctx } = context.chart;
            const gradient = ctx.createLinearGradient(0, 0, 0, 350);
            gradient.addColorStop(0.7, colorConfig.gradientEnd);
            gradient.addColorStop(1, colorConfig.gradientStart);
            return gradient;
          },
        };
      });

      setMetricDetail({
        labels: (data?.charts?.[0]?.values || []).map((item: ValueChartItem) => item.key),
        axisXLabel: window.T('Time'),
        axisYLabel: data.unit,
        datasets: parseDataset,
      });
      setIsFirstLoad(false);
    }
  }, [inView, isFetching]);

  useEffect(() => {
    setIsFirstLoad(true);
  }, [dataUpdate]);

  return (
    <IntersectionLineChart
      ref={ref}
      isLoading={isFirstLoad}
      title={title}
      idTooltip={idTooltip}
      metricDetail={metricDetail}
    />
  );
}

export default CustomLineChart;

import { useInView } from 'react-intersection-observer';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import { LineChart } from '@/components/Chart';
import { useGetMetricDetailQuery } from '@/services/overview';
import { ScriptableContext } from 'chart.js';
import { MetricConfigDumpData, MetricChartColors } from '../dumpData';

import { Dataset } from '@/components/Chart/LineChart/types';

interface Props {
  title: string;
  metricKey: string;
}
interface MetricDetail {
  labels: string[];
  axisXLabel?: string;
  axisYLabel?: string;
  datasets: Dataset[];
}

function IntersectionChart(props: Props) {
  const { title, metricKey } = props;
  const { ref, inView } = useInView({
    threshold: 0,
  });

  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
  const [metricDetail, setMetricDetail] = useState<MetricDetail>({
    labels: [],
    datasets: [],
  });

  const { data, isSuccess } = useGetMetricDetailQuery(
    {
      MetricName: metricKey,
      FromDate: '2023-06-05',
      ToDate: '2023-08-07',
    },
    {
      skip: !inView || !isFirstLoad,
    },
  );

  useEffect(() => {
    if (isFirstLoad && inView && isSuccess) {
      setIsFirstLoad(false);

      const config = MetricConfigDumpData?.[metricKey] || {};

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
        };
      });
      setMetricDetail({
        labels: data.labels,
        axisXLabel: window.T('Time'),
        axisYLabel: config.name,
        datasets,
      });
    }
  }, [inView, isSuccess]);

  return (
    <div ref={ref}>
      {isFirstLoad ? (
        <Box
          sx={{
            backgroundColor: 'white',
            borderRadius: 1,
            minHeight: 500,
            position: 'relative',
            p: 4,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h4" fontSize="18px">
              {title}
            </Typography>
          </Stack>
          <Box
            mt={2}
            sx={{
              position: 'relative',
            }}
          >
            <Skeleton variant="rounded" width="100%" height={380} />
            <Box
              sx={{
                backdropFilter: 'blur(1px)',
                backgroundColor: 'rgba(255,255,255,0.4)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            >
              <CircularProgress />
            </Box>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            backgroundColor: 'white',
            borderRadius: 1,
            p: 4,
            minHeight: 500,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h4" fontSize="18px">
              {title}
            </Typography>
          </Stack>
          <Typography variant="body1" mb={0.5}>
            {metricDetail?.axisYLabel}
          </Typography>
          <LineChart labels={metricDetail?.labels} datasets={metricDetail?.datasets} />
          <Typography textAlign="center" variant="body1" mt={0.5}>
            {metricDetail?.axisXLabel}
          </Typography>
        </Box>
      )}
    </div>
  );
}

export default IntersectionChart;

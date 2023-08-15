import { LineChart } from '@/components/Chart';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { forwardRef } from 'react';
import { MetricDetail } from '../types';

interface Props {
  isLoading: boolean;
  title: string;
  idTooltip?: string;
  metricDetail: MetricDetail;
}

export type Ref = HTMLDivElement;

const IntersectionChart = forwardRef<Ref, Props>((props, ref) => {
  const { isLoading, title, idTooltip, metricDetail } = props;
  return (
    <div ref={ref}>
      {isLoading ? (
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
          <LineChart idTooltip={idTooltip} labels={metricDetail?.labels} datasets={metricDetail?.datasets} />
          <Typography textAlign="center" variant="body1" mt={0.5}>
            {metricDetail?.axisXLabel}
          </Typography>
        </Box>
      )}
    </div>
  );
});

export default IntersectionChart;

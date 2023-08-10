import { useMemo, useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import SimpleCard, { SimpleCardProps } from '@/components/Card';
import HerondTable from '@/components/Table';
import {
  UserHeadCells,
  rowsUserHeadCells,
  RegionHeadCell,
  rowsRegionCell,
  ChanelHeadCell,
  rowsChanelCell,
} from './dumpData';
import { DateRangePicker } from '@/components/Fields';
import IntersectionChart from './IntersectionChart';
import { useGetMetricQuery } from '@/services/overview';

interface CardType extends SimpleCardProps {
  id: number;
}

interface MetricItem {
  title: string;
  key: string;
}

function OverviewContainer() {
  const { data: metrics, isSuccess: isGetMetricSuccess } = useGetMetricQuery({});

  const CardData = useMemo<CardType[]>(
    () => [
      {
        id: 1,
        label: 'Daily Active User',
        icon: 'user',
        content: '732,234.5',
      },
      {
        id: 2,
        label: 'Downloads',
        icon: 'download',
        content: '732,234.5',
      },
      {
        id: 3,
        label: 'Valid Users',
        icon: 'user',
        content: '732,234.5',
      },
      {
        id: 4,
        label: 'Click-through Rate',
        icon: 'percentage',
        content: '732,234.5',
      },
      {
        id: 5,
        label: 'Total Cost',
        subLabel: '(USDT)',
        icon: 'dollar',
        content: '732,234.5',
      },
      {
        id: 6,
        label: 'Total Withdraw',
        subLabel: '(USDT)',
        icon: 'receive',
        content: '732,234.5',
      },
      {
        id: 7,
        label: 'Affiliate Users',
        icon: 'sharing',
        content: '732,234.5',
      },
      {
        id: 8,
        label: 'Cost per Affiliate User',
        subLabel: '(USDT)',
        icon: 'dollar',
        content: '732,234.5',
      },
    ],
    [],
  );

  const [metricData, setMetricData] = useState<MetricItem[]>([]);

  useEffect(() => {
    if (isGetMetricSuccess && metrics?.length > 0) {
      const convertMetrics = metrics.map((item: string) => ({
        title: item.split('.').slice(1).join(' '),
        key: item,
      }));
      setMetricData(convertMetrics);
    }
  }, [isGetMetricSuccess]);

  return (
    <Container
      maxWidth={false}
      sx={{
        my: 2,
      }}
    >
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h3">{window.T('Overview')}</Typography>
        <Box>
          <DateRangePicker />
        </Box>
      </Stack>
      <Grid container spacing={2.5}>
        {CardData.map(item => (
          <Grid key={item.id} item xs={12} md={6} lg={3}>
            <SimpleCard label={item.label} subLabel={item?.subLabel} icon={item.icon} content={item.content} />
          </Grid>
        ))}
      </Grid>
      <Button variant="contained">{window.T('Show Modal Filter')}</Button>
      <Grid
        mt={1}
        container
        spacing={2.5}
        sx={{
          minHeight: 600,
        }}
      >
        {metricData.map(item => (
          <Grid item xs={12} md={6} xl={4}>
            <IntersectionChart title={item.title} metricKey={item.key} />
          </Grid>
        ))}
      </Grid>
      <Stack
        sx={{
          mt: 4.5,
          backgroundColor: 'white',
          p: 4,
          borderRadius: 1,
        }}
      >
        <Stack pt={1} pb={4} direction="row" justifyContent="space-between">
          <Typography variant="h5">{window.T('Affiliate User List')}</Typography>
          <Typography variant="h5">{window.T('255 items')}</Typography>
        </Stack>
        <HerondTable headCells={UserHeadCells} rows={rowsUserHeadCells()} />
      </Stack>
      <Stack
        sx={{
          mt: 4.5,
          backgroundColor: 'white',
          p: 4,
          borderRadius: 1,
        }}
      >
        <Stack pt={1} pb={4} direction="row" justifyContent="space-between">
          <Typography variant="h5">{window.T('Performance by Region')}</Typography>
          <Typography variant="h5">{window.T('255 items')}</Typography>
        </Stack>
        <HerondTable headCells={RegionHeadCell} rows={rowsRegionCell()} />
      </Stack>
      <Stack
        sx={{
          mt: 4.5,
          backgroundColor: 'white',
          p: 4,
          borderRadius: 1,
        }}
      >
        <Stack pt={1} pb={4} direction="row" justifyContent="space-between">
          <Typography variant="h5">{window.T('Performance by Channel')}</Typography>
          <Typography variant="h5">{window.T('255 items')}</Typography>
        </Stack>
        <HerondTable headCells={ChanelHeadCell} rows={rowsChanelCell()} />
      </Stack>
    </Container>
  );
}

export default OverviewContainer;

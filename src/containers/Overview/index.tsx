import { SimpleCard } from '@/components/Card';
import { SimpleCardProps } from '@/components/Card/types';
import IntersectionChart from './CustomLineChart';
import { DateRangePicker } from '@/components/Fields';
import {
  useGetOverviewQuery,
  useGetMetricClickQuery,
  useGetMetricDownloadQuery,
  useGetMetricValidUserQuery,
  useGetMetricAffiliateQuery,
} from '@/services/overview';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { numberWithCommas } from '@/utils/common';

interface CardDataProps extends SimpleCardProps {
  id: number;
  contentKey: string;
}

interface FilterProps {
  dateRange: Array<Date | null>;
  dataUpdate: number;
}

const CardDataDefault = [
  {
    id: 1,
    label: window.T('Daily Active User'),
    icon: 'user-group-orange',
    contentKey: 'dau',
  },
  {
    id: 2,
    label: window.T('Downloads'),
    icon: 'download',
    contentKey: 'downloads',
  },
  {
    id: 3,
    label: window.T('Valid Users'),
    icon: 'user',
    contentKey: 'valid',
  },
  {
    id: 4,
    label: window.T('Click-through Rate'),
    icon: 'percentage',
    contentKey: 'rate',
  },
  {
    id: 5,
    label: window.T('Total Cost'),
    subLabel: window.T('(USDT)'),
    icon: 'dollar',
    contentKey: 'totalCost',
  },
  {
    id: 6,
    label: window.T('Total Withdraw'),
    subLabel: window.T('(USDT)'),
    icon: 'receive',
    contentKey: 'totalWithdraw',
  },
  {
    id: 7,
    label: window.T('Affiliate Users'),
    icon: 'sharing',
    contentKey: 'user',
  },
  {
    id: 8,
    label: window.T('Cost per Affiliate User'),
    subLabel: window.T('(USDT)'),
    icon: 'dollar',
    contentKey: 'cost',
  },
] as CardDataProps[];

const MetricConfigDump = [
  {
    title: window.T('Click Overview'),
    useApi: useGetMetricClickQuery,
  },
  {
    title: window.T('Download Overview'),
    useApi: useGetMetricDownloadQuery,
  },
  {
    title: window.T('Valid User Overview'),
    useApi: useGetMetricValidUserQuery,
  },
  {
    title: window.T('Affiliate User Overview'),
    useApi: useGetMetricAffiliateQuery,
  },
];

function BrowserMetric() {
  const [cardData, setCardData] = useState<CardDataProps[]>(CardDataDefault);
  const [filter, setFilter] = useState<FilterProps>({
    dateRange: [dayjs().startOf('month').toDate(), new Date()],
    dataUpdate: new Date().getTime(),
  });

  const { data: overview, isFetching: isFetchingOverview } = useGetOverviewQuery(
    {
      startDate: dayjs(filter.dateRange[0]).format('YYYY-MM-DD'),
      endDate: dayjs(filter.dateRange[1]).format('YYYY-MM-DD'),
    },
    {
      skip: !filter.dateRange[0] || !filter.dateRange[1],
    },
  );

  useEffect(() => {
    if (!isFetchingOverview && overview) {
      const data = CardDataDefault.map(item => ({
        ...item,
        content: numberWithCommas(overview?.[item.contentKey] || 0),
      }));
      setCardData(data);
    }
  }, [isFetchingOverview, overview]);

  const onChangeDateRange = (dateRange: Array<Date | null>) => {
    if (dateRange[0] && dateRange[1]) {
      setFilter({
        dateRange,
        dataUpdate: new Date().getTime(),
      });
    }
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        py: 3,
      }}
    >
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h3">{window.T('Overview')}</Typography>
        <Box>
          <DateRangePicker value={filter.dateRange} onChange={onChangeDateRange} maxDate={new Date()} />
        </Box>
      </Stack>
      <Grid container spacing={2} mb={4}>
        {cardData.map(item => (
          <Grid key={item.id} item xs={12} md={6} lg={3}>
            <SimpleCard label={item.label} subLabel={item?.subLabel} icon={item.icon} content={item.content} />
          </Grid>
        ))}
      </Grid>
      <Grid
        container
        spacing={2}
        sx={{
          mt: -2.5,
        }}
      >
        {MetricConfigDump.map(item => (
          <Grid item xs={12} md={6}>
            <IntersectionChart
              title={item.title}
              useApi={item.useApi}
              dataUpdate={filter.dataUpdate}
              dateRange={filter.dateRange}
              idTooltip="line-chart-modal-overview"
            />
          </Grid>
        ))}
      </Grid>
      <Popper open>
        <Box id="line-chart-modal-overview" />
      </Popper>
    </Container>
  );
}

export default BrowserMetric;

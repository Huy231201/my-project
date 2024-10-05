import { SimpleCard } from '@/components/Card';
import { SvgName } from '@/components/Icons';
import { ChangeEvent, useState, useEffect } from 'react';
import Container from '@/components/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import FormGroup from '@mui/material/FormGroup';
import FilterListIcon from '@mui/icons-material/FilterList';
import { CheckboxField, DateRangeTwoPickerField } from '@/components/Fields';
import CustomLineChart from './CustomLineChart';
import { useGetMetricQuery } from '@/services/metric';
import { useGetOverviewCurrentQuery } from '@/services/overview';
import Modal, { DialogActions, DialogContent } from '@/components/Modal';
import { ConfirmButton } from '@/components/Buttons';
import { LocalStorage, LOCAL_KEYS } from '@/utils/storages';
import Skeleton from '@mui/material/Skeleton';
import Popper from '@mui/material/Popper';
import Button from '@mui/material/Button';
import { LabelBrowserMetric } from './CustomLineChart/config';
import { numberWithCommas } from '@/utils/common';
import dayjs from 'dayjs';

enum EnumMetricCadence {
  EXPRESS = 'express',
  SLOW = 'slow',
  TYPICAL = 'typical',
}

const CadenceDescription = {
  [EnumMetricCadence.EXPRESS]: window.T('Metrics type of day'),
  [EnumMetricCadence.TYPICAL]: window.T('Metrics type of week'),
  [EnumMetricCadence.SLOW]: window.T('Metrics type of month'),
};
interface MetricItem {
  title: string;
  key: string;
  show: boolean;
}

type MetricData = {
  [key in EnumMetricCadence]?: {
    cadence: string;
    cadenceDescription: string;
    checkedAll?: boolean;
    indeterminate?: boolean;
    metrics: MetricItem[];
  };
};

interface FilterProps {
  dateRange: Array<Date | null>;
  dataUpdate: number;
}

interface CardDataProps {
  key: string;
  label: string;
  subLabel?: string;
  icon: SvgName;
  tooltipContent?: string;
  content: string;
}

const CardDataDefault = [
  {
    key: 'Brave.Core.UsageDaily',
    label: window.T('Last Day Active User (Desktop)'),
    icon: 'user-group-orange',
    tooltipContent: 'Số lượng user sử dụng ngày gần nhất trên Desktop',
    content: '0',
  },
  {
    key: 'Herond.Browser.Download',
    label: window.T('Total Desktop Downloads (Desktop)'),
    icon: 'download',
    tooltipContent: 'Tổng số Download browser trên Desktop',
    content: '0',
  },
  {
    key: 'Herond.Accounts.CreatedUsers',
    label: window.T('Total Herond Accounts'),
    icon: 'user',
    tooltipContent: 'Tổng số lượng tài khoản Herond',
    content: '0',
  },
] as CardDataProps[];

function BrowserMetric() {
  const { data: overview, isFetching: isFetchingOverview } = useGetOverviewCurrentQuery({});
  const { data: metrics, isSuccess: isGetMetricSuccess } = useGetMetricQuery({});
  const [cardData, setCardData] = useState<CardDataProps[]>(CardDataDefault);
  const [metricData, setMetricData] = useState<MetricData>({});
  const [showFilterMetric, setShowFilterMetric] = useState<boolean>(false);
  const [formMetricData, setFormMetricData] = useState<MetricData>({});

  const [filter, setFilter] = useState<FilterProps>({
    dateRange: [new Date('2023-07-06'), new Date()],
    dataUpdate: new Date().getTime(),
  });

  useEffect(() => {
    if (!isFetchingOverview && overview) {
      const res = CardDataDefault.map(x => {
        const val = overview.find((y: any) => y.key === x.key);
        return {
          ...x,
          subLabel: val.key === 'Brave.Core.UsageDaily' ? dayjs(val.lastComputedDate).format('DD/MM/YYYY') : '',
          content: numberWithCommas(val?.value || 0),
        };
      });
      setCardData(res);
    }
  }, [isFetchingOverview, overview]);

  useEffect(() => {
    if (isGetMetricSuccess && Object.entries(metrics)?.length > 0) {
      const storagesMetricsData = LocalStorage.get(LOCAL_KEYS.METRICS_CONFIG, {});

      const newMetricsData: MetricData = {};

      Object.entries(metrics).forEach(data => {
        const [cadence, metricsName] = data as [EnumMetricCadence, string[]];
        const storageMetrics = storagesMetricsData?.[cadence]?.metrics || [];
        const newMetricsName = metricsName.map((item: string) => {
          const storageData = storageMetrics.find((stgMetric: MetricItem) => stgMetric?.key === item);
          const metricItem = {
            title: LabelBrowserMetric?.[item]?.title ?? '',
            key: item,
            show: storageData ? storageData.show : true,
          };
          return metricItem;
        });
        const total = metricsName.length;
        const numberSelected = newMetricsName.filter(item => item.show).length;
        newMetricsData[cadence] = {
          cadence,
          cadenceDescription: CadenceDescription?.[cadence] || '',
          checkedAll: numberSelected === total,
          indeterminate: numberSelected > 0 && numberSelected < total,
          metrics: newMetricsName,
        };
      });
      setMetricData(newMetricsData);
      setFormMetricData(newMetricsData);
      LocalStorage.set(LOCAL_KEYS.METRICS_CONFIG, newMetricsData);
    }
  }, [isGetMetricSuccess]);

  const onChangeDateRange = (dateRange: Array<Date | null>) => {
    setFilter({
      dateRange,
      dataUpdate: new Date().getTime(),
    });
  };

  const handleOpenFilterMetric = () => {
    setShowFilterMetric(true);
  };

  const handleCheckedMetric =
    (parentCadence: EnumMetricCadence) => (event: ChangeEvent<HTMLInputElement>, name: string) => {
      const { checked } = event.target;
      const metricsCadence = formMetricData[parentCadence]?.metrics || [];
      const newMetricData = metricsCadence.map(metric => {
        if (metric.key === name) {
          return {
            ...metric,
            show: checked,
          };
        }
        return metric;
      });
      const total = newMetricData.length;
      const numberSelected = newMetricData.filter((item: MetricItem) => item.show).length;
      setFormMetricData(prev => ({
        ...prev,
        [parentCadence]: {
          ...prev[parentCadence],
          checkedAll: numberSelected === total,
          indeterminate: numberSelected > 0 && numberSelected < total,
          metrics: newMetricData,
        },
      }));
    };

  const handleCheckedAll = (parentCadence: EnumMetricCadence) => (event: ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    const metricsCadence = formMetricData[parentCadence]?.metrics || [];
    const newMetricData = metricsCadence?.map((metric: MetricItem) => ({
      ...metric,
      show: checked,
    }));
    setFormMetricData((prev: MetricData) => ({
      ...prev,
      [parentCadence]: {
        ...prev[parentCadence],
        checkedAll: checked,
        indeterminate: false,
        metrics: newMetricData,
      },
    }));
  };

  const onSubmitShowMetric = () => {
    setMetricData(formMetricData);
    LocalStorage.set(LOCAL_KEYS.METRICS_CONFIG, formMetricData);
    setShowFilterMetric(false);
  };

  return (
    <Container>
      <Grid container spacing={2} mb={4}>
        {cardData.map(item => (
          <Grid key={item.key} item xs={12} md={6} lg={4}>
            <SimpleCard
              label={item.label}
              subLabel2={item?.subLabel}
              icon={item.icon}
              loading={isFetchingOverview}
              content={item.content}
              tooltipContent={item.tooltipContent}
            />
          </Grid>
        ))}
      </Grid>
      <Stack
        direction={{
          xs: 'column',
          sm: 'row',
        }}
        spacing={{
          xs: 2,
          sm: 0,
        }}
        justifyContent="space-between"
        mb={3}
      >
        <Typography variant="h3">{window.T('Browser Statistics')}</Typography>
        <Stack
          direction={{
            xs: 'column',
            sm: 'row',
          }}
          justifyContent="flex-start"
          spacing={1}
        >
          <DateRangeTwoPickerField dateRange={filter.dateRange} onChange={onChangeDateRange} maxDate={new Date()} />
          <Button
            type="button"
            sx={{
              backgroundColor: 'white',
              color: '#333840',
              fontWeight: 400,
              borderColor: '#A1A9B5',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              height: 40,
            }}
            startIcon={<FilterListIcon />}
            onClick={handleOpenFilterMetric}
          >
            {window.T('Filter Metric')}
          </Button>
        </Stack>
      </Stack>
      {isGetMetricSuccess ? (
        <Box>
          {Object.entries(metricData).map(
            ([key, item], index) =>
              (item.indeterminate || item.checkedAll) && (
                <Box my={2} mb={index + 1 === Object.entries(metricData)?.length ? 0 : 4} key={key}>
                  {/* <Typography
                    variant="body1"
                    sx={{
                      fontSize: 18,
                      fontWeight: 500,
                      textTransform: 'capitalize',
                      marginBottom: -1,
                    }}
                  >
                    {key}
                  </Typography> */}
                  <Grid container spacing={2}>
                    {item.metrics.map(
                      metric =>
                        metric.show && (
                          <Grid item xs={12} md={6} xl={4} key={metric.key}>
                            <CustomLineChart
                              show={metric.show}
                              title={metric.title}
                              metricKey={metric.key}
                              cadence={item.cadence}
                              idTooltip="line-chart-modal-browser"
                              dateRange={filter.dateRange}
                              dataUpdate={filter.dataUpdate}
                            />
                          </Grid>
                        ),
                    )}
                  </Grid>
                </Box>
              ),
          )}
        </Box>
      ) : (
        <Grid
          container
          spacing={2}
          sx={{
            mt: -2.5,
          }}
        >
          {new Array(12).fill(0).map((_, index) => (
            <Grid key={index} item xs={12} md={6} xl={4}>
              <Skeleton
                animation="wave"
                variant="rectangular"
                height={500}
                sx={{
                  p: {
                    xs: 2,
                    sm: 3,
                    md: 4,
                  },
                  borderRadius: 1,
                }}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Modal
        open={showFilterMetric}
        title={window.T('Config hidden/show metrics')}
        onClose={() => setShowFilterMetric(false)}
        sxWrapper={{
          '& .MuiDialog-paper': {
            width: '100%',
            margin: '16px',
            minWidth: {
              xs: 'auto',
              md: '600px',
            },
          },
        }}
      >
        <DialogContent
          sx={{
            backgroundColor: 'white',
            px: 4,
            py: 0,
            border: 'none',
          }}
          dividers
        >
          <FormGroup>
            <Box>
              {Object.entries(formMetricData).map(([key, parent], index) => (
                <Box mb={index !== Object.entries(formMetricData)?.length - 1 ? 3 : 0} key={key}>
                  <CheckboxField
                    name={key}
                    checked={parent.checkedAll}
                    indeterminate={parent.indeterminate}
                    onChange={handleCheckedAll(key as EnumMetricCadence)}
                    label={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography
                          variant="body1"
                          sx={{
                            fontSize: 16,
                            fontWeight: 500,
                            textTransform: 'capitalize',
                          }}
                        >
                          {key}
                        </Typography>
                        <Box>-</Box>
                        <Typography
                          variant="body1"
                          sx={{
                            fontSize: 14,
                            fontWeight: 400,
                            textTransform: 'capitalize',
                            color: '#727781',
                          }}
                        >
                          {parent.cadenceDescription}
                        </Typography>
                      </Stack>
                    }
                  />
                  <Box
                    sx={{
                      borderTop: '1px solid #DCE0E3',
                      '& .MuiTypography-root': {
                        fontSize: 13,
                      },
                    }}
                  >
                    <Grid container>
                      {parent.metrics.map(metric => (
                        <Grid item key={metric.key} xs={12} md={6}>
                          <CheckboxField
                            checked={metric.show}
                            label={metric.title}
                            name={metric.key}
                            onChange={handleCheckedMetric(parent.cadence as EnumMetricCadence)}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Box>
              ))}
            </Box>
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <ConfirmButton type="submit" label={window.T('Apply')} onClick={onSubmitShowMetric} />
        </DialogActions>
      </Modal>
      <Popper open>
        <Box id="line-chart-modal-browser" />
      </Popper>
    </Container>
  );
}

export default BrowserMetric;

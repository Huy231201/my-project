import { ChangeEvent, useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FormGroup from '@mui/material/FormGroup';
import FilterListIcon from '@mui/icons-material/FilterList';
import { CheckboxField, DateRangePicker } from '@/components/Fields';
import CustomLineChart from './CustomLineChart';
import { useGetMetricQuery } from '@/services/metric';
import Modal, { DialogActions, DialogContent } from '@/components/Modal';
import { ConfirmButton } from '@/components/Buttons';
import { LocalStorage, LOCAL_KEYS } from '@/utils/storages';
import Skeleton from '@mui/material/Skeleton';
import Popper from '@mui/material/Popper';
import dayjs from 'dayjs';

interface MetricItem {
  title: string;
  key: string;
  show: boolean;
}

interface FilterProps {
  dateRange: Array<Date | null>;
  dataUpdate: number;
}

function BrowserMetric() {
  const { data: metrics, isSuccess: isGetMetricSuccess } = useGetMetricQuery({});
  const [metricData, setMetricData] = useState<MetricItem[]>([]);
  const [showFilterMetric, setShowFilterMetric] = useState<boolean>(false);
  const [formMetricData, setFormMetricData] = useState<MetricItem[]>([]);

  const [filter, setFilter] = useState<FilterProps>({
    dateRange: [dayjs().weekday(-6).toDate(), dayjs().weekday(0).toDate()],
    dataUpdate: new Date().getTime(),
  });

  useEffect(() => {
    if (isGetMetricSuccess && metrics?.length > 0) {
      const metricsStorage = LocalStorage.get(LOCAL_KEYS.METRICS_CONFIG, {});
      const convertMetricsStorage: { [key: string]: MetricItem } = {}; // add index signature
      const convertMetrics = metrics.map((item: string) => {
        const metric = {
          title: item.split('.').slice(1).join(' '),
          key: item,
          show: metricsStorage?.[item] ? metricsStorage?.[item]?.show : true,
        };
        convertMetricsStorage[item] = metric;
        return metric;
      });
      setMetricData(convertMetrics);
      setFormMetricData(convertMetrics);
      LocalStorage.set(LOCAL_KEYS.METRICS_CONFIG, convertMetricsStorage);
    }
  }, [isGetMetricSuccess]);

  const handleOpenFilterMetric = () => {
    setShowFilterMetric(true);
  };

  const handleCheckedMetric = (event: ChangeEvent<HTMLInputElement>, name: string) => {
    const { checked } = event.target;
    const newMetricData = formMetricData.map(metric => {
      if (metric.key === name) {
        return {
          ...metric,
          show: checked,
        };
      }
      return metric;
    });
    setFormMetricData(newMetricData);
  };

  const onSubmitShowMetric = () => {
    setMetricData(formMetricData);
    const convertMetricsStorage: { [key: string]: MetricItem } = {}; // add index signature
    formMetricData.forEach(item => {
      convertMetricsStorage[item.key] = item;
    });
    LocalStorage.set(LOCAL_KEYS.METRICS_CONFIG, convertMetricsStorage);
    setShowFilterMetric(false);
  };

  const onChangeDateRange = (dateRange: Array<Date | null>) => {
    setFilter({
      dateRange,
      dataUpdate: new Date().getTime(),
    });
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        py: 3,
      }}
    >
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h3">{window.T('Browser Metric')}</Typography>
        <Box>
          <DateRangePicker value={filter.dateRange} onChange={onChangeDateRange} maxDate={new Date()} />
        </Box>
      </Stack>
      <Stack direction="row" justifyContent="flex-end">
        <Tooltip title="Filter list">
          <IconButton
            size="large"
            sx={{
              '& svg': {
                fontSize: 24,
              },
            }}
            onClick={handleOpenFilterMetric}
          >
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      </Stack>
      {isGetMetricSuccess ? (
        <Grid
          container
          spacing={2}
          sx={{
            mt: -2.5,
          }}
        >
          {metricData.map(
            item =>
              item.show && (
                <Grid item xs={12} md={6} xl={4}>
                  <CustomLineChart
                    show={item.show}
                    title={item.title}
                    metricKey={item.key}
                    idTooltip="line-chart-modal-browser"
                    dateRange={filter.dateRange}
                    dataUpdate={filter.dataUpdate}
                  />
                </Grid>
              ),
          )}
        </Grid>
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
                  p: 4,
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
          },
        }}
      >
        <DialogContent
          sx={{
            backgroundColor: '#F4F6F7',
            px: 4,
            py: 6,
          }}
          dividers
        >
          <FormGroup>
            <Grid container spacing={2}>
              {formMetricData.map(item => (
                <Grid key={item.key} item xs={12} md={6}>
                  <CheckboxField
                    checked={item.show}
                    label={item.title}
                    name={item.key}
                    onChange={handleCheckedMetric}
                  />
                </Grid>
              ))}
            </Grid>
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

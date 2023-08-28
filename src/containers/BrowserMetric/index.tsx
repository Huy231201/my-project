import { ChangeEvent, useState, useEffect } from 'react';
import Container from '@/components/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
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
import Button from '@mui/material/Button';
import useWindowResize from '@/hooks/useWindowResize';

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
  const { isMobileSm } = useWindowResize();
  const { data: metrics, isSuccess: isGetMetricSuccess } = useGetMetricQuery({});
  const [metricData, setMetricData] = useState<MetricItem[]>([]);
  const [showFilterMetric, setShowFilterMetric] = useState<boolean>(false);
  const [formMetricData, setFormMetricData] = useState<MetricItem[]>([]);

  const [filter, setFilter] = useState<FilterProps>({
    dateRange: [dayjs().startOf('month').toDate(), new Date()],
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
    <Container>
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
        <Typography variant="h3">{window.T('Browser Metric')}</Typography>
        <Stack direction="row" justifyContent="flex-start" spacing={1}>
          <DateRangePicker value={filter.dateRange} onChange={onChangeDateRange} maxDate={new Date()} />
          {isMobileSm ? (
            <Button
              type="button"
              sx={{
                backgroundColor: 'white',
                color: '#333840',
                fontWeight: 400,
                borderColor: '#A1A9B5',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                height: 40,
                minWidth: 40,
                '& .MuiButton-startIcon': {
                  margin: 0,
                  padding: 0,
                },
              }}
              startIcon={<FilterListIcon />}
              onClick={handleOpenFilterMetric}
            />
          ) : (
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
          )}
        </Stack>
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

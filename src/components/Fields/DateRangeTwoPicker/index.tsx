import { useState, useEffect } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import DatePickerField from '../DatePicker';
import { SxProps, Theme } from '@mui/material/styles';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

interface DateRangeTwoPickerProps {
  dateRange: Array<Date | null>;
  onChange: (dateRange: Array<Date | null>) => void;
  minDate?: Date;
  maxDate?: Date;
  sx?: SxProps<Theme>;
  dateFormat?: string;
}

interface dateRangeState {
  from: Date | null;
  to: Date | null;
  hasChange: boolean;
}

const DateRangeTwoPickerField = (props: DateRangeTwoPickerProps) => {
  const { dateRange, onChange, sx, ...rest } = props;
  const [currentDateRange, setCurrentDateRange] = useState<dateRangeState>({
    from: dateRange[0],
    to: dateRange[1],
    hasChange: false,
  });

  useEffect(() => {
    const { hasChange } = currentDateRange;
    if (hasChange) {
      onChange([currentDateRange.from, currentDateRange.to]);
      setCurrentDateRange(prev => ({
        ...prev,
        hasChange: false,
      }));
    }
  }, [currentDateRange.hasChange]);

  const handleChangeDate = (key: string) => (date: Date | null) => {
    if (key && date) {
      const newValue = {
        ...currentDateRange,
        [key]: date,
        hasChange: true,
      };
      if (newValue?.from && newValue?.to && dayjs(newValue.from).isAfter(dayjs(newValue.to, 'day'))) {
        toast.error(window.T('The start date must be before the end date'));
      } else {
        setCurrentDateRange(newValue);
      }
    }
  };

  return (
    <Stack
      direction="row"
      spacing={{
        xs: 0.5,
        sm: 1,
      }}
      sx={sx}
    >
      <DatePickerField
        sx={{
          width: {
            xs: '100%',
            sm: 'auto',
          },
        }}
        value={currentDateRange.from}
        onChange={handleChangeDate('from')}
        {...rest}
      />
      <Typography variant="body1">{window.T('to')}</Typography>
      <DatePickerField
        sx={{
          width: {
            xs: '100%',
            sm: 'auto',
          },
        }}
        value={currentDateRange.to}
        onChange={handleChangeDate('to')}
        {...rest}
      />
    </Stack>
  );
};

export default DateRangeTwoPickerField;

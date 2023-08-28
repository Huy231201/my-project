import { useState, useEffect } from 'react';

import DatePicker from 'react-datepicker';
import InputDatePicker from '../InputDatePicker';
import useWindowResize from '@/hooks/useWindowResize';
import Box from '@mui/material/Box';
import { SxProps, Theme } from '@mui/material/styles';

import 'react-datepicker/dist/react-datepicker.css';

interface Props {
  value: Array<Date | null>;
  onChange: (dateRange: Array<Date | null>) => void;
  minDate?: Date;
  maxDate?: Date;
  sx?: SxProps<Theme>;
  dateFormat?: string;
}

function DateRangePicker(props: Props) {
  const { sx, value, onChange, minDate, maxDate, dateFormat = 'dd/MM/yyyy' } = props;
  const { isMobile } = useWindowResize();

  const [dateRange, setDateRange] = useState<Array<Date | null>>(value);
  const [startDate, endDate] = dateRange || [null, null];

  useEffect(() => setDateRange(value), [value]);

  const handleChange = (data: Array<Date | null>) => {
    if (data[0] && data[1]) {
      onChange(data);
    } else {
      setDateRange(data);
    }
  };

  return (
    <Box sx={sx}>
      <DatePicker
        selectsRange
        selected={endDate}
        dateFormat={dateFormat}
        startDate={startDate}
        endDate={endDate}
        onChange={handleChange}
        monthsShown={isMobile ? 1 : 2}
        customInput={<InputDatePicker />}
        minDate={minDate}
        maxDate={maxDate}
        calendarStartDay={1}
      />
    </Box>
  );
}

export default DateRangePicker;

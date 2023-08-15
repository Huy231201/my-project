import { useState, useEffect } from 'react';

import DatePicker from 'react-datepicker';
import InputDatePicker from '../InputDatePicker';

import 'react-datepicker/dist/react-datepicker.css';

interface Props {
  value: Array<Date | null>;
  onChange: (dateRange: Array<Date | null>) => void;
  minDate?: Date;
  maxDate?: Date;
}

function DateRangePicker(props: Props) {
  const { value, onChange, minDate, maxDate } = props;

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
    <DatePicker
      selectsRange
      startDate={startDate}
      endDate={endDate}
      onChange={handleChange}
      monthsShown={2}
      customInput={<InputDatePicker />}
      minDate={minDate}
      maxDate={maxDate}
      calendarStartDay={1}
    />
  );
}

export default DateRangePicker;

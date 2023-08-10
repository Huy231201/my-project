import { useState } from 'react';
import DatePicker from 'react-datepicker';
import InputDatePicker from '../InputDatePicker';

import 'react-datepicker/dist/react-datepicker.css';

function DateRangePicker() {
  const [dateRange, setDateRange] = useState<Array<Date | null>>([null, null]);
  const [startDate, endDate] = dateRange;
  return (
    <DatePicker
      selectsRange
      startDate={startDate}
      endDate={endDate}
      onChange={setDateRange}
      isClearable
      monthsShown={2}
      customInput={<InputDatePicker />}
    />
  );
}

export default DateRangePicker;

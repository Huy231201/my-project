import DatePicker from 'react-datepicker';
import InputDatePicker from '../InputDatePicker';
import Box from '@mui/material/Box';
import { SxProps, Theme } from '@mui/material/styles';

import 'react-datepicker/dist/react-datepicker.css';

interface Props {
  value: Date | null;
  onChange: (dateRange: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  sx?: SxProps<Theme>;
  dateFormat?: string;
}

function DatePickerField(props: Props) {
  const { sx, value, onChange, minDate, maxDate, dateFormat = 'dd/MM/yyyy' } = props;

  return (
    <Box sx={sx}>
      <DatePicker
        selected={value}
        dateFormat={dateFormat}
        onChange={onChange}
        monthsShown={1}
        customInput={
          <InputDatePicker
            sx={{
              width: {
                xs: 120,
                md: 135,
              },
            }}
          />
        }
        minDate={minDate}
        maxDate={maxDate}
        calendarStartDay={1}
      />
    </Box>
  );
}

export default DatePickerField;

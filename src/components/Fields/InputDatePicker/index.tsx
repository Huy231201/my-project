import { forwardRef } from 'react';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';

import { styled } from '@mui/material/styles';
import HerondIcon from '@/components/Icons';

const MuiOutlinedInput = styled(OutlinedInput)({
  cursor: 'pointer',
  height: 40,
  backgroundColor: 'white',
  margin: '0px !important',
  padding: '12px',
  minWidth: 240,
  '& .MuiInputBase-input': {
    cursor: 'pointer',
    padding: '4px',
  },
});

interface Props {
  value?: string;
  onClick?: () => void;
}

export type Ref = HTMLButtonElement;

const InputDatePicker = forwardRef<Ref, Props>((props, ref) => {
  const { value, onClick } = props;
  return (
    <Box
      component="form"
      sx={{
        '& > :not(style)': { m: 1, width: '25ch' },
      }}
      noValidate
      autoComplete="off"
      ref={ref}
      onClick={onClick}
    >
      <MuiOutlinedInput
        label=""
        value={value}
        startAdornment={
          <InputAdornment position="start">
            <HerondIcon name="calendar" />
          </InputAdornment>
        }
        readOnly
      />
    </Box>
  );
});

export default InputDatePicker;

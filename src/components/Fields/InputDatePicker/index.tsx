import { forwardRef } from 'react';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';

import { styled, SxProps, Theme } from '@mui/material/styles';
import HerondIcon from '@/components/Icons';

const MuiOutlinedInput = styled(OutlinedInput)(({ theme }) => ({
  cursor: 'pointer',
  height: 40,
  backgroundColor: 'white',
  margin: '0px !important',
  padding: '12px',
  [theme.breakpoints.down('md')]: {
    padding: '8px',
  },
  '& .MuiInputBase-input': {
    cursor: 'pointer',
    padding: '0px',
  },
  '& fieldset': {
    borderColor: '#A1A9B5',
  },
}));

interface Props {
  sx?: SxProps<Theme>;
  value?: string;
  onClick?: () => void;
}

export type Ref = HTMLButtonElement;

const InputDatePicker = forwardRef<Ref, Props>((props, ref) => {
  const { sx, value, onClick } = props;
  return (
    <Box component="form" sx={sx} noValidate autoComplete="off" ref={ref} onClick={onClick}>
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

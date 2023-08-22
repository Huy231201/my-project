import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import { styled, SxProps, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

const MuiInputBase = styled(InputBase)({
  height: 40,
  maxWidth: 400,
  backgroundColor: 'white',
  borderRadius: 8,
  margin: '0px !important',
  padding: '12px',
  minWidth: 240,
  border: '1px solid #A1A9B5',
  '& .MuiInputBase-input': {
    padding: '4px',
  },
  '& svg': {
    width: 24,
    height: 24,
    cursor: 'pointer',
  },
  '&:hover': {
    borderColor: '#79a6ee',
    boxShadow: '0 0 0 2px rgba(63, 128, 230, 0.2)',
  },
});

interface Props {
  defaultValue?: string;
  label?: string | undefined;
  placeholder?: string;
  msgError?: string;
  ariaLabel?: string;
  sx?: SxProps<Theme>;
  validate?: (value?: string) => boolean;
  onSubmit: (value: string) => void;
}

function InputField(props: Props) {
  const { sx, label, defaultValue, msgError, placeholder, ariaLabel, validate = null, onSubmit } = props;

  const [value, setValue] = useState(defaultValue);
  const [isError, setIsError] = useState(false);

  const handleSubmit = () => {
    const valueTrim = (value || '').trim();
    if (valueTrim) {
      if (validate) {
        const isValid = validate(valueTrim);
        setIsError(!isValid);
        if (isValid) {
          onSubmit(valueTrim);
        }
      } else {
        setIsError(false);
        onSubmit(valueTrim);
      }
    }
  };

  return (
    <Box>
      {label && (
        <Typography variant="subtitle1" sx={{ mr: 1 }}>
          {label}
        </Typography>
      )}
      <MuiInputBase
        sx={sx}
        placeholder={placeholder}
        inputProps={{ 'aria-label': ariaLabel }}
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={handleSubmit}
      />
      {isError && msgError && (
        <Typography variant="body2" sx={{ mt: 0.5, ml: 0.5, color: '#e74c3c' }}>
          {msgError}
        </Typography>
      )}
    </Box>
  );
}

export default InputField;

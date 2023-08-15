import InputBase from '@mui/material/InputBase';
import InputAdornment from '@mui/material/InputAdornment';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled, SxProps, Theme } from '@mui/material/styles';
import HerondIcon from '@/components/Icons';

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
  label?: string | undefined;
  placeholder: string;
  ariaLabel?: string;
  sx?: SxProps<Theme>;
}

function SearchInputField(props: Props) {
  const { sx, label, placeholder, ariaLabel } = props;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {label && (
        <Typography variant="subtitle1" sx={{ mr: 1 }}>
          {label}
        </Typography>
      )}
      <MuiInputBase
        sx={sx}
        placeholder={placeholder}
        inputProps={{ 'aria-label': ariaLabel }}
        endAdornment={
          <InputAdornment position="end">
            <HerondIcon name="search" />
          </InputAdornment>
        }
      />
    </Box>
  );
}

export default SearchInputField;

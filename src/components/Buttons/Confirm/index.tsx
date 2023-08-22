import { memo } from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import { withStyles } from '@mui/styles';
import { alpha, SxProps, Theme } from '@mui/material/styles';

type Props = {
  label?: string;
  type: 'button' | 'submit' | 'reset';
  loading?: boolean;
  disabled?: boolean;
  backgroundColor?: string;
  sx?: SxProps<Theme>;
  onClick?: () => void;
};
interface PropStyles {
  backgroundColor?: string;
}

const MuiButton = withStyles(() => ({
  root: {
    backgroundColor: '#298CFD',
    color: 'white',
    fontWeight: 700,
    border: 'none',
    minWidth: 64,
    height: 40,
    whiteSpace: 'nowrap',
    '&:hover': {
      backgroundColor: (props: PropStyles) =>
        props.backgroundColor ? alpha(props.backgroundColor, 0.6) : alpha('#298CFD', 0.6),
    },
    '& .MuiLoadingButton-loadingIndicator': {
      left: 0,
      marginRight: 16,
      position: 'relative',
    },
  },
}))(LoadingButton);

function ConfirmButton(props: Props) {
  const { type = 'button', label = 'Approve', sx, loading = false, disabled, backgroundColor, onClick } = props;
  return (
    <MuiButton
      type={type}
      loading={loading}
      disabled={disabled}
      variant="contained"
      loadingPosition="start"
      sx={sx}
      backgroundColor={backgroundColor}
      onClick={onClick}
    >
      {label}
    </MuiButton>
  );
}

export default memo(ConfirmButton);

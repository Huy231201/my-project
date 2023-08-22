import { memo } from 'react';
import { withStyles } from '@mui/styles';
import { alpha, SxProps, Theme } from '@mui/material/styles';
import LoadingButton from '@mui/lab/LoadingButton';

const MuiButton = withStyles(() => ({
  root: {
    backgroundColor: 'white',
    color: '#202226',
    border: '1px solid #A1A9B5',
    minWidth: 64,
    height: 40,
    '&:hover': {
      borderColor: alpha('#A1A9B5', 0.6),
      backgroundColor: alpha('#FFF', 0.6),
    },
    fontWeight: 700,
    '&:disabled': {
      borderColor: 'rgb(238 238 238)',
    },
    '& .MuiLoadingButton-loadingIndicator': {
      marginRight: 16,
      position: 'relative',
    },
  },
}))(LoadingButton);

type Props = {
  label?: string;
  loading?: boolean;
  disabled?: boolean;
  type: 'button' | 'submit' | 'reset';
  sx?: SxProps<Theme>;
  onClick?: () => void;
};

function CancelButton(props: Props) {
  const { type = 'button', label = 'Reject', loading, disabled, sx = {}, onClick } = props;
  return (
    <MuiButton type={type} loadingPosition="start" sx={sx} loading={loading} disabled={disabled} onClick={onClick}>
      {label}
    </MuiButton>
  );
}

CancelButton.defaultProps = {
  label: 'Reject',
  sx: {},
};

export default memo(CancelButton);

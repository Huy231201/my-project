import { memo } from 'react';
import Button from '@mui/material/Button';
import { withStyles } from '@mui/styles';
import { alpha, SxProps, Theme } from '@mui/material/styles';

const MuiButton = withStyles(() => ({
  root: {
    backgroundColor: 'white',
    color: '#575F6D',
    border: '1px solid #D6D9DF',
    minWidth: 64,
    height: 40,
    '&:hover': {
      borderColor: alpha('#D6D9DF', 0.6),
      backgroundColor: alpha('#FFF', 0.6),
    },
    fontWeight: 700,
  },
}))(Button);

type Props = {
  label?: string;
  type: 'button' | 'submit' | 'reset';
  sx?: SxProps<Theme>;
  onClick?: () => void;
};

function CancelButton(props: Props) {
  const { type = 'button', label = 'Reject', sx = {}, onClick } = props;
  return (
    <MuiButton type={type} variant="outlined" sx={sx} onClick={onClick}>
      {label}
    </MuiButton>
  );
}

CancelButton.defaultProps = {
  label: 'Reject',
  sx: {},
};

export default memo(CancelButton);

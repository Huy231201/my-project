import { memo } from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import { withStyles } from '@mui/styles';
import { alpha, SxProps, Theme } from '@mui/material/styles';

type Props = {
  label?: string;
  backgroundColor?: string;
  sx?: SxProps<Theme>;
  onClick?: () => void;
};
interface PropStyles {
  backgroundColor?: string;
}

const MuiButton = withStyles(theme => ({
  root: {
    backgroundColor: (props: PropStyles) => props.backgroundColor || theme.palette.primary.dark,
    color: 'white',
    fontWeight: 700,
    border: 'none',
    minWidth: 64,
    height: 40,
    whiteSpace: 'nowrap',
    '&:hover': {
      backgroundColor: (props: PropStyles) =>
        props.backgroundColor ? alpha(props.backgroundColor, 0.6) : alpha(theme.palette.primary.dark, 0.6),
    },
    '& .MuiLoadingButton-loadingIndicator': {
      marginRight: 8,
      left: 0,
    },
  },
}))(LoadingButton);

function ConfirmButton(props: Props) {
  const { label = 'Approve', sx, backgroundColor, onClick } = props;
  return (
    <MuiButton variant="contained" loadingPosition="start" sx={sx} backgroundColor={backgroundColor} onClick={onClick}>
      {label}
    </MuiButton>
  );
}

export default memo(ConfirmButton);

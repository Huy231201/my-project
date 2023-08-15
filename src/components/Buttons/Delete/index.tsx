import { memo } from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import { withStyles } from '@mui/styles';
import { alpha, SxProps, Theme } from '@mui/material/styles';

const MuiButton = withStyles(() => ({
  root: {
    outline: 0,
    backgroundColor: (props: { bgColor?: string }) => props.bgColor || '#E15241',
    color: 'white',
    fontWeight: 700,
    border: 'none',
    minWidth: 64,
    height: 40,
    '&:hover': {
      backgroundColor: (props: { bgColor?: string }) => alpha(props.bgColor || '#E15241', 0.6),
    },
    '& .MuiLoadingButton-loadingIndicator': {
      marginRight: 8,
      left: 0,
    },
  },
}))(LoadingButton);

type Props = {
  label: string;
  type: 'button' | 'submit' | 'reset';
  bgColor?: string;
  sx?: SxProps<Theme>;
  onClick?: () => void;
};

function DeleteButton(props: Props) {
  const { type = 'button', label = 'Delete', sx = {}, bgColor, onClick } = props;
  return (
    <MuiButton type={type} variant="contained" loadingPosition="start" sx={sx} bgColor={bgColor} onClick={onClick}>
      {label}
    </MuiButton>
  );
}

export default memo(DeleteButton);

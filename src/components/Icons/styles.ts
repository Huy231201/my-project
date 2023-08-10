import IconButton from '@mui/material/IconButton';
import { withStyles } from '@mui/styles';

export const CloseWrapper = withStyles(theme => ({
  root: {
    backgroundColor: theme.palette.primary.darkest,
    borderRadius: '100%',
  },
}))(IconButton);

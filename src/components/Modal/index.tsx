import MuiDialog from '@mui/material/Dialog';
import MuiDialogContent from '@mui/material/DialogContent';
import MuiDialogActions from '@mui/material/DialogActions';
import DialogTitle from './ModalHeader';
import Transition from '@/components/Transition';
import { withStyles } from '@mui/styles';
import { SxProps, Theme } from '@mui/material/styles';

interface Props {
  title: string;
  onClose: () => void;
  open: boolean;
  children: React.ReactNode;
  sxWrapper?: SxProps<Theme>;
}

export const DialogContent = withStyles(() => ({
  root: {
    padding: '12px 16px',
    maxHeight: 'calc(100vh - 200px)',
    overflowY: 'auto',
  },
}))(MuiDialogContent);

export const DialogActions = withStyles(theme => ({
  root: {
    margin: 0,
    padding: '12px',
    [theme.breakpoints.down('md')]: {
      padding: '8px',
    },
  },
}))(MuiDialogActions);

export default function Modal({ title, onClose, open, children, sxWrapper }: Props) {
  return (
    <MuiDialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      sx={{
        '& .MuiDialog-paper': {
          overflow: 'unset',
          maxWidth: 380,
        },
        ...sxWrapper,
      }}
    >
      <DialogTitle onClose={onClose}>{title}</DialogTitle>
      {children}
    </MuiDialog>
  );
}

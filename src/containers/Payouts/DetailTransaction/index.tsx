import HerondIcon from '@/components/Icons';
import Modal, { DialogContent } from '@/components/Modal';
import WithdrawRequestDetail from '@/containers/WithdrawRequests/detail';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface Props {
  open: boolean;
  transactionId: string | null;
  onClose: () => void;
  refreshData: () => void;
}

function DetailTransaction(props: Props) {
  const { open, transactionId, onClose, refreshData } = props;

  const handleBack = () => {
    refreshData();
    onClose();
  };

  return (
    <Modal
      hiddenCloseIcon
      open={open}
      title={
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          sx={{
            '& svg': {
              width: '20px',
              height: '20px',
            },
          }}
        >
          <IconButton color="inherit" onClick={onClose}>
            <HerondIcon name="arrow-left" />
          </IconButton>

          <Typography
            variant="h3"
            sx={{
              fontSize: 20,
            }}
          >
            {window.T('Withdraw Requests Details')}
          </Typography>
        </Stack>
      }
      onClose={onClose}
      sxWrapper={{
        '& .MuiDialog-paper': {
          margin: '16px',
          maxWidth: '100% !important',
          width: '100%',
          backgroundColor: '#EEF1F5',
        },
      }}
    >
      <DialogContent
        sx={{
          px: 4,
          py: 6,
        }}
        dividers
      >
        {transactionId && <WithdrawRequestDetail isModal transactionId={transactionId} onBack={handleBack} />}
      </DialogContent>
    </Modal>
  );
}

export default DetailTransaction;

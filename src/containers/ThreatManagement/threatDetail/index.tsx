import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Modal from '@/components/Modal';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import { useGetThreatDetailQuery } from '@/services/threat-management';

interface ModalProps {
  open: boolean;
  platformType: string;
  threatEntryType: string;
  threatType: string;
  fullHash: string | Array<string | number>;
  onClose: () => void;
}

function ThreatDetail({ open, platformType, threatEntryType, threatType, fullHash, onClose }: ModalProps) {
  const { data, isFetching } = useGetThreatDetailQuery(
    {
      platformType,
      threatEntryType,
      threatType,
      fullHash,
    },
    { skip: !fullHash },
  );

  return (
    <Modal
      open={open}
      title={
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h4">{window.T('Threat Detail')}</Typography>
        </Stack>
      }
      onClose={onClose}
      sxWrapper={{
        '& .MuiDialog-paper': {
          width: '!00%',
          margin: '16px',
          px: 2,
          py: 1,
        },
      }}
    >
      {isFetching ? (
        <CircularProgress sx={{ alignSelf: 'center', m: '10px' }} />
      ) : (
        <DialogContent
          sx={{
            border: 'none',
            paddingTop: 0,
          }}
        >
          <Stack mt={1} spacing={1} direction="row" alignItems="start">
            <Typography variant="body1" fontWeight={700}>{`${window.T('Platform type')}:`}</Typography>
            <Typography variant="body1">{`${window.T('All Platforms')}`}</Typography>
          </Stack>
          <Stack mt={1} spacing={1} direction="row" alignItems="start">
            <Typography variant="body1" fontWeight={700}>{`${window.T('Threat entry type')}:`}</Typography>
            <Typography variant="body1">{`${window.T('A UR')}`}L</Typography>
          </Stack>
          <Stack mt={1} spacing={1} direction="row" alignItems="start">
            <Typography variant="body1" fontWeight={700}>{`${window.T('Threat type')}:`}</Typography>
            <Typography variant="body1">{`${window.T('Scam web3')}`}</Typography>
          </Stack>
          <Stack mt={1} spacing={1} direction="row" alignItems="start">
            <Typography variant="body1" fontWeight={700}>{`${window.T('Data')}:`}</Typography>
            <Typography variant="body1" sx={{ wordBreak: 'break-all', textWrap: 'pretty' }}>{`${window.T(
              data,
            )}`}</Typography>
          </Stack>
        </DialogContent>
      )}
    </Modal>
  );
}
export default ThreatDetail;

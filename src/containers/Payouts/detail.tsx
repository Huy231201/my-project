import { CancelButton, ConfirmButton } from '@/components/Buttons';
import { CardHeader } from '@/components/Card';
import HerondIcon from '@/components/Icons';
import StatusLabel, { StatusEnum } from '@/components/StatusLabel';
import HerondTable from '@/components/Table';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegionHeadCell, rowsRegionCell } from './dumpData';
import Modal, { DialogActions, DialogContent } from '@/components/Modal';
import BulkAction from '@/components/BulkAction';
import Button from '@mui/material/Button';
import ModalTxDetail from './TxDetail';

const MuiListItemText = styled(ListItemText)({
  display: 'flex',
  alignItems: 'center',
  margin: 4,
  flex: 'initial',
  minWidth: '150px',
  '& .MuiListItemText-primary': {
    fontSize: 16,
    fontWeight: 500,
  },
  '& .MuiListItemText-secondary': {
    paddingLeft: 4,
    fontSize: 16,
    fontWeight: 400,
    color: '#202226',
    '& a': {
      color: '#202226',
      '&:hover': {
        textDecoration: 'none',
      },
    },
  },
});

const ButtonAction = styled(Button)({
  border: 'none',
  fontSize: '14px',
  fontWeight: 400,
  color: '#32373D',
  minWidth: 'fit-content !important',
  minHeight: 'fit-content !important',
  '&:hover, &:active': {
    background: 'transparent',
  },
});

function PayoutsDetailContainer() {
  const navigate = useNavigate();
  const [showModalReject, setShowModalReject] = useState<boolean>(false);
  const [showModalTxDetail, setShowModalTxDetail] = useState<boolean>(false);

  const withDrawalData = useMemo(
    () =>
      rowsRegionCell().map((item: any) => ({
        ...item,
        checkbox: !['approved', 'rejected'].includes(item.status.toLowerCase()),
        email: (
          <Link
            component="a"
            href={`mailto:${item?.email}`}
            sx={{
              color: '#0066F4',
            }}
          >
            {item.email}
          </Link>
        ),
        status: <StatusLabel status={item.status} />,
        action: (
          <Stack direction="row" alignItems="center" spacing={1}>
            <ButtonAction variant="text" onClick={() => setShowModalTxDetail(true)}>
              <HerondIcon name="eye" />
            </ButtonAction>
            <Box
              sx={{
                borderLeft: '1px solid #32373D',
                width: '1px',
                height: '12px',
              }}
            />
            <ButtonAction variant="text" onClick={() => {}}>
              <HerondIcon name="trash" />
            </ButtonAction>
          </Stack>
        ),
      })),
    [],
  );

  const BulkActionOptions = useMemo(
    () => [
      {
        label: window.T('Remove from list'),
        onClick: () => setShowModalReject(true),
      },
      {
        label: window.T('Remove from list & reject'),
        onClick: () => setShowModalReject(true),
      },
    ],
    [],
  );

  return (
    <Container
      maxWidth={false}
      sx={{
        py: 3,
        position: 'relative',
      }}
    >
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
        <IconButton color="inherit" onClick={() => navigate('/payouts')}>
          <HerondIcon name="arrow-left" />
        </IconButton>

        <Typography
          variant="h3"
          sx={{
            fontSize: 20,
          }}
        >
          {window.T('Payouts Details')}
        </Typography>
      </Stack>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              backgroundColor: '#fff',
              borderRadius: 1,
              height: '100%',
              p: {
                xs: 2,
                sm: 3,
                md: 4,
              },
            }}
          >
            <Stack direction="row" justifyContent="space-between">
              <CardHeader label={window.T('Payout Information')} icon="receive" />
              <Stack direction="row" spacing={2}>
                <CancelButton
                  type="button"
                  label={window.T('Export CSV')}
                  sx={{
                    minWidth: '120px !important',
                  }}
                  onClick={() => {}}
                />
                <ConfirmButton
                  type="button"
                  sx={{
                    minWidth: '80px !important',
                  }}
                  label={window.T('Edit')}
                  onClick={() => {}}
                />
              </Stack>
            </Stack>
            <Grid mt={2} container>
              <Grid item xs={12}>
                <MuiListItemText primary={`${window.T('Name')}:`} secondary={1} />
              </Grid>
              <Grid item xs={12}>
                <MuiListItemText primary={`${window.T('Payout Od')}:`} secondary={2} />
              </Grid>
              <Grid item xs={12}>
                <MuiListItemText primary={`${window.T('Total Amount')}:`} secondary={3} />
              </Grid>
              <Grid item xs={12}>
                <MuiListItemText primary={`${window.T('Create At')}:`} secondary={4} />
              </Grid>
            </Grid>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              backgroundColor: '#fff',
              borderRadius: 1,
              height: '100%',
              p: {
                xs: 2,
                sm: 3,
                md: 4,
              },
            }}
          >
            <Stack direction="row" justifyContent="space-between">
              <Stack
                direction="row"
                spacing={2}
                sx={{
                  '& .status-label': {
                    fontSize: 18,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  },
                }}
              >
                <CardHeader label={window.T('Payout Status')} icon="receive" />
                <StatusLabel status={StatusEnum.PENDING} />
              </Stack>
              <Stack direction="row" spacing={2}>
                <CancelButton
                  type="button"
                  label={window.T('Reject')}
                  sx={{
                    minWidth: '120px !important',
                  }}
                  onClick={() => {}}
                />
                <ConfirmButton
                  type="button"
                  sx={{
                    minWidth: '120px !important',
                  }}
                  label={window.T('Approve')}
                  onClick={() => {}}
                />
              </Stack>
            </Stack>
            <Grid mt={2} container>
              <Grid item xs={12}>
                <Stack direction="row" spacing={2}>
                  <MuiListItemText primary={`${window.T('Rejected By')}:`} secondary={2} />
                  <Typography variant="body1">&#8427;</Typography>
                  <MuiListItemText primary={`${window.T('Approved By')}:`} secondary={2} />
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack direction="row" spacing={2}>
                  <MuiListItemText primary={`${window.T('Rejected At')}:`} secondary={3} />
                  <Typography variant="body1">&#8427;</Typography>
                  <MuiListItemText primary={`${window.T('Approved At')}:`} secondary={3} />
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
      <Box
        mt={4}
        sx={{
          background: '#fff',
          p: {
            xs: 2,
            sm: 3,
            md: 4,
          },
        }}
      >
        <Stack direction="row" justifyContent="space-between" mt={1} mb={3}>
          <Stack spacing={2} direction="row" alignItems="center">
            <Typography variant="h3" sx={{ fontSize: 20 }}>
              {window.T('Withdraw Requests')}
            </Typography>
            <BulkAction options={BulkActionOptions} />
          </Stack>

          <Typography variant="body1" sx={{ fontSize: 16 }}>
            1400 items
          </Typography>
        </Stack>
        <HerondTable checkbox pageIndex={1} totalPages={1} headCells={RegionHeadCell} rows={withDrawalData} />
      </Box>
      <Modal
        open={showModalReject}
        title={window.T('Do you want to reject this request?')}
        onClose={() => setShowModalReject(false)}
        sxWrapper={{
          '& .MuiDialog-paper': {
            margin: '16px',
            maxWidth: 480,
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
          <Typography variant="body1" sx={{ mb: 2 }}>
            {window.T(
              'There are {{value}} users in this request. Do you want to reject this request? This action can’t be undone',
              { value: 2 },
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <CancelButton
            type="submit"
            label={window.T('Cancel')}
            onClick={() => setShowModalReject(false)}
            sx={{
              border: 'none !important',
            }}
          />
          <CancelButton type="submit" label={window.T('Reject')} onClick={() => setShowModalReject(false)} />
        </DialogActions>
      </Modal>
      <ModalTxDetail open={showModalTxDetail} onClose={() => setShowModalTxDetail(false)} />
    </Container>
  );
}

export default PayoutsDetailContainer;

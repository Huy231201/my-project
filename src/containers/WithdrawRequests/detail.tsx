import { CancelButton } from '@/components/Buttons';
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
import { WithdrawRequestHeadTable, rowsRegionCell } from './config';
import Modal, { DialogActions, DialogContent } from '@/components/Modal';

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

function WithdrawRequestsContainer() {
  const navigate = useNavigate();
  const [showModalReject, setShowModalReject] = useState<boolean>(false);

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
      })),
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
        <IconButton color="inherit" onClick={() => navigate('/withdrawal-requests')}>
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
                <CardHeader label={window.T('Withdraw Transactions Details')} icon="receive" />
                <StatusLabel status={StatusEnum.PENDING} />
              </Stack>
              <CancelButton
                type="button"
                label={window.T('Reject')}
                sx={{
                  minWidth: '120px !important',
                }}
                onClick={() => setShowModalReject(true)}
              />
            </Stack>
            <Grid mt={2} container>
              <Grid item xs={12}>
                <MuiListItemText primary={`${window.T('Transaction Id')}:`} secondary={1} />
              </Grid>
              <Grid item xs={12}>
                <MuiListItemText primary={`${window.T('Amount')}:`} secondary={2} />
              </Grid>
              <Grid item xs={12}>
                <MuiListItemText primary={`${window.T('Deadline')}:`} secondary={3} />
              </Grid>
              <Grid item xs={12}>
                <MuiListItemText primary={`${window.T('Create At')}:`} secondary={4} />
              </Grid>
              <Grid item xs={12}>
                <MuiListItemText primary={`${window.T('Create By')}:`} secondary={4} />
              </Grid>
              <Grid item xs={12}>
                <MuiListItemText primary={`${window.T('Withdraw wallet address')}:`} secondary={4} />
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
            <CardHeader label={window.T('Payout details')} icon="receive" />
            <Grid mt={2} container>
              <Grid item xs={12}>
                <Stack direction="row" spacing={2}>
                  <MuiListItemText primary={`${window.T('Payout Id')}:`} secondary={1} />
                  <Typography variant="body1">&#8427;</Typography>
                  <Typography variant="body1">{window.T('Does not appear in any payout')}</Typography>
                </Stack>
              </Grid>
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
          <Typography variant="h3" sx={{ fontSize: 20 }}>
            {window.T('Earning Details')}
          </Typography>
          <Typography variant="body1" sx={{ fontSize: 16 }}>
            1400 items
          </Typography>
        </Stack>
        <HerondTable pageIndex={1} totalPages={1} headCells={WithdrawRequestHeadTable} rows={withDrawalData} />
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
    </Container>
  );
}

export default WithdrawRequestsContainer;

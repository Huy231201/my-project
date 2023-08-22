import { CancelButton } from '@/components/Buttons';
import { CardHeader } from '@/components/Card';
import HerondIcon from '@/components/Icons';
import StatusLabel, { StatusEnum } from '@/components/StatusLabel';
import HerondTable from '@/components/Table';
import Box from '@mui/material/Box';
import Container from '@/components/Container';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EarningDetailHeader } from './config';
import Modal, { DialogActions, DialogContent } from '@/components/Modal';
import { useGetWithdrawDetailQuery, useGetWithdrawEarnQuery, useRejectPaymentsMutation } from '@/services/withdraw';
import {
  useGetPayoutDetailQuery,
  useRemovePayoutTransactionMutation,
  useRejectPayoutTransactionMutation,
} from '@/services/payout';
import { truncateStr } from '@/utils/common';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
interface EarnItem {
  id: string;
  earnedAt: string;
  amount: number;
  status: StatusEnum;
}

enum ModalType {
  PaymentReject = 'payment-reject',
  PayoutTransactionRemove = 'payout-transaction-remove',
  PayoutTransactionReject = 'payout-transaction-reject',
}

const MuiListItemText = styled(ListItemText)({
  display: 'flex',
  flexFlow: 'wrap',
  alignItems: 'center',
  margin: 4,
  flex: 'initial',
  minWidth: '150px',
  '& .MuiListItemText-primary': {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
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
  const params = useParams();

  const [showModalReject, setShowModalReject] = useState<ModalType | null>(null);
  const [pageIndex, setPageIndex] = useState(1);

  const { data: detail, isFetching: isFetchingDetail } = useGetWithdrawDetailQuery(
    {
      transactionId: params?.id,
    },
    {
      skip: !params?.id,
    },
  );

  const { transactionId, amount, deadLine, createdAt, address, status, createdBy, payoutId } = detail || {};

  const { data: earnData, isFetching: isFetchingEarn } = useGetWithdrawEarnQuery(
    {
      transactionId: params?.id,
      pageIndex: pageIndex,
      pageSize: 10,
    },
    {
      skip: !params?.id,
    },
  );

  const { data: payoutDetail } = useGetPayoutDetailQuery(
    {
      id: payoutId,
    },
    {
      skip: !payoutId,
    },
  );

  const [rejectPayment, { isLoading: isRejectPayment }] = useRejectPaymentsMutation();
  const [removePayoutTransaction, { isLoading: isRemovingPayoutTransaction }] = useRemovePayoutTransactionMutation();
  const [rejectPayoutTransaction, { isLoading: isRejectPayoutTransaction }] = useRejectPayoutTransactionMutation();

  const handleChangePage = (page: number) => {
    setPageIndex(page);
  };

  const onCloseModal = () => {
    setShowModalReject(null);
  };

  const onShowModalType = (type: ModalType) => () => {
    setShowModalReject(type);
  };

  const handleRejectPayment = async () => {
    const api = {
      [ModalType.PaymentReject]: rejectPayment,
      [ModalType.PayoutTransactionRemove]: removePayoutTransaction,
      [ModalType.PayoutTransactionReject]: rejectPayoutTransaction,
    } as {
      [key in ModalType]: any;
    };
    if (showModalReject && api?.[showModalReject]) {
      try {
        const res = await api[showModalReject]({
          transactionIds: [params?.id],
        }).unwrap();
        onCloseModal();
        toast.success(window.T(res?.message || 'Reject payment successfully'));
      } catch (error) {
        // toast.error(window.T('Reject payment failed'));
      }
    }
  };

  const EarnDataTable = useMemo(
    () =>
      (earnData?.items || []).map((item: EarnItem) => ({
        id: item?.id,
        earnedAt: item?.earnedAt ? dayjs(item.earnedAt).format('MM/DD/YYYY HH:mm') : '',
        amount: item?.amount,
        status: <StatusLabel status={item.status} />,
      })),
    [earnData?.pageIndex],
  );

  return (
    <Container loading={isFetchingDetail || isFetchingEarn}>
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
            <Grid container>
              <Grid item xs={8}>
                <Stack direction="row" justifyContent="space-between">
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    mr={2}
                    sx={{
                      '& .status-label': {
                        fontSize: 18,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                      },
                    }}
                  >
                    <CardHeader label={window.T('Withdraw Transactions Details')} icon="receive" />
                    <StatusLabel status={status} />
                  </Stack>
                </Stack>
                <Stack spacing={1} mt={1}>
                  <MuiListItemText primary={`${window.T('Transaction Id')}:`} secondary={truncateStr(transactionId)} />
                  <MuiListItemText primary={`${window.T('Amount')}:`} secondary={amount || 0} />
                  <MuiListItemText
                    primary={`${window.T('Deadline')}:`}
                    secondary={deadLine ? dayjs(deadLine).format('MM/DD/YYYY HH:mm:ss') : ''}
                  />
                  <MuiListItemText
                    primary={`${window.T('Create At')}:`}
                    secondary={createdAt ? dayjs(createdAt).format('MM/DD/YYYY HH:mm:ss') : ''}
                  />
                  <MuiListItemText primary={`${window.T('Create By')}:`} secondary={createdBy} />
                  <MuiListItemText primary={`${window.T('Withdraw wallet address')}:`} secondary={address || ''} />
                </Stack>
              </Grid>
              <Grid item xs={4}>
                {status?.toLowerCase() === 'pending' &&
                  (payoutId ? (
                    <Stack spacing={2}>
                      <CancelButton
                        type="button"
                        label={window.T('Remove From Payout')}
                        sx={{
                          minWidth: '120px !important',
                          height: 'auto !important',
                        }}
                        onClick={onShowModalType(ModalType.PayoutTransactionRemove)}
                      />
                      <CancelButton
                        type="button"
                        label={window.T('Remove From Payout & Reject ')}
                        sx={{
                          minWidth: '120px !important',
                          height: 'auto !important',
                        }}
                        onClick={onShowModalType(ModalType.PayoutTransactionReject)}
                      />
                    </Stack>
                  ) : (
                    <CancelButton
                      type="button"
                      label={window.T('Reject')}
                      sx={{
                        minWidth: '120px !important',
                        height: 'auto !important',
                      }}
                      onClick={onShowModalType(ModalType.PaymentReject)}
                    />
                  ))}
              </Grid>
            </Grid>
          </Box>
        </Grid>
        {payoutId && (
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
                  <MuiListItemText primary={`${window.T('Payout Id')}:`} secondary={payoutId} />
                </Grid>
                {payoutDetail?.action.toLowerCase() === 'complete' && (
                  <>
                    <Grid item xs={12}>
                      <MuiListItemText primary={`${window.T('Approved By')}:`} secondary={payoutDetail?.actor} />
                    </Grid>
                    <Grid item xs={12}>
                      <MuiListItemText
                        primary={`${window.T('Approved At')}:`}
                        secondary={
                          payoutDetail?.actionAt ? dayjs(payoutDetail.actionAt).format('MM/DD/YYYY HH:mm:ss') : ''
                        }
                      />
                    </Grid>
                  </>
                )}
                {payoutDetail?.action?.toLowerCase() === 'failed' && (
                  <>
                    <Grid item xs={12}>
                      <MuiListItemText primary={`${window.T('Rejected By')}:`} secondary={payoutDetail?.actor} />
                    </Grid>
                    <Grid item xs={12}>
                      <MuiListItemText
                        primary={`${window.T('Rejected At')}:`}
                        secondary={
                          payoutDetail?.actionAt ? dayjs(payoutDetail.actionAt).format('MM/DD/YYYY HH:mm:ss') : ''
                        }
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          </Grid>
        )}
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
            {`${earnData?.totalCount || 0} items`}
          </Typography>
        </Stack>
        <HerondTable
          pageIndex={pageIndex}
          totalPages={earnData?.totalPages || 1}
          headCells={EarningDetailHeader}
          rows={EarnDataTable}
          onChangePage={handleChangePage}
        />
      </Box>
      <Modal
        open={!!showModalReject}
        title={window.T('Do you want to reject this request?')}
        onClose={onCloseModal}
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
            {window.T('Do you want to reject this request? This action can’t be undone')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <CancelButton
            type="submit"
            label={window.T('Cancel')}
            sx={{
              border: 'none !important',
            }}
            onClick={onCloseModal}
          />
          <CancelButton
            type="submit"
            label={window.T('Reject')}
            onClick={handleRejectPayment}
            loading={isRejectPayment || isRemovingPayoutTransaction || isRejectPayoutTransaction}
          />
        </DialogActions>
      </Modal>
    </Container>
  );
}

export default WithdrawRequestsContainer;

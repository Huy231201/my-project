import { CancelButton, ConfirmButton } from '@/components/Buttons';
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
import { formatDate } from '@/utils/date';

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

const MessageContentModal = {
  [ModalType.PaymentReject]: {
    title: window.T('Reject Payment'),
    content: window.T('Are you sure you want to reject this payment?'),
    btnConfirmName: window.T('Reject'),
  },
  [ModalType.PayoutTransactionRemove]: {
    title: window.T('Remove Payout Transaction'),
    content: window.T('Are you sure you want to remove this payout transaction?'),
    btnConfirmName: window.T('Remove From Payout'),
  },
  [ModalType.PayoutTransactionReject]: {
    title: window.T('Reject Payout Transaction'),
    content: window.T('Are you sure you want to reject this payout transaction?'),
    btnConfirmName: window.T('Reject From Payout & Reject'),
  },
};

const MuiListItemText = styled(ListItemText)({
  display: 'flex',
  flexFlow: 'wrap',
  alignItems: 'flex-start',
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

interface Props {
  isModal?: boolean;
  transactionId?: string;
  onBack?: () => void;
}

function WithdrawRequestsContainer(props: Props) {
  const { isModal, transactionId: propsTransactionId, onBack } = props;
  const navigate = useNavigate();
  const params = useParams();
  const transactionId = propsTransactionId || params?.id || null;

  const [showModalConfirm, setShowModalConfirm] = useState<ModalType | null>(null);
  const [pageIndex, setPageIndex] = useState(1);

  const {
    data: detail,
    isFetching: isFetchingDetail,
    refetch: refetchWithdrawDetail,
  } = useGetWithdrawDetailQuery(
    {
      transactionId: transactionId,
    },
    {
      skip: !transactionId,
    },
  );

  const { amount, deadLine, createdAt, address, status, createdBy, payoutId } = detail || {};

  const { data: earnData, isFetching: isFetchingEarn } = useGetWithdrawEarnQuery(
    {
      transactionId: transactionId,
      pageIndex: pageIndex,
      pageSize: 10,
    },
    {
      skip: !transactionId,
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
    setShowModalConfirm(null);
  };

  const onShowModalType = (type: ModalType) => () => {
    setShowModalConfirm(type);
  };

  const handleRejectPayment = async () => {
    const api = {
      [ModalType.PaymentReject]: rejectPayment,
      [ModalType.PayoutTransactionRemove]: removePayoutTransaction,
      [ModalType.PayoutTransactionReject]: rejectPayoutTransaction,
    } as {
      [key in ModalType]: any;
    };
    if (showModalConfirm && api?.[showModalConfirm]) {
      try {
        const res = await api[showModalConfirm]({
          payoutId: payoutId,
          transactionIds: [transactionId],
        }).unwrap();
        refetchWithdrawDetail();
        onCloseModal();
        if (onBack) {
          onBack();
        }
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
    <Container
      loading={isFetchingDetail || isFetchingEarn}
      sx={{
        ...(isModal && {
          marginTop: -6,
          padding: '8px !important',
        }),
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.5}
        sx={{
          display: isModal ? 'none' : 'flex',
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
              <Grid item xs={12} md={9}>
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
                <Stack mt={1}>
                  <MuiListItemText primary={`${window.T('Transaction Id')}:`} secondary={truncateStr(transactionId)} />
                  <MuiListItemText primary={`${window.T('Amount')}:`} secondary={amount || 0} />
                  <MuiListItemText primary={`${window.T('Deadline')}:`} secondary={formatDate(deadLine)} />
                  <MuiListItemText primary={`${window.T('Create At')}:`} secondary={formatDate(createdAt)} />
                  <MuiListItemText primary={`${window.T('Create By')}:`} secondary={createdBy} />
                  <MuiListItemText primary={`${window.T('Withdraw wallet address')}:`} secondary={address || ''} />
                </Stack>
              </Grid>
              <Grid item xs={12} md={3}>
                <Stack
                  spacing={2}
                  mt={{
                    xs: 2,
                    md: 0,
                  }}
                  direction={{
                    xs: 'row',
                    md: 'column',
                  }}
                >
                  {status?.toLowerCase() === 'pending' &&
                    (payoutId ? (
                      <>
                        <CancelButton
                          type="button"
                          label={window.T('Remove From Payout')}
                          sx={{
                            minWidth: '120px !important',
                            height: 'auto !important',
                            width: '100%',
                          }}
                          onClick={onShowModalType(ModalType.PayoutTransactionRemove)}
                        />
                        <CancelButton
                          type="button"
                          label={window.T('Remove From Payout & Reject ')}
                          sx={{
                            minWidth: '120px !important',
                            height: 'auto !important',
                            width: '100%',
                          }}
                          onClick={onShowModalType(ModalType.PayoutTransactionReject)}
                        />
                      </>
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
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          {payoutId && (
            <Box
              sx={{
                backgroundColor: '#fff',
                borderRadius: 1,
                height: '100%',
                p: {
                  xs: 2,
                  sm: 3,
                  xl: 4,
                },
              }}
            >
              <CardHeader label={window.T('Payout details')} icon="receive" />
              <Stack mt={1}>
                <MuiListItemText primary={`${window.T('Payout Id')}:`} secondary={payoutId} />
                {payoutDetail?.action.toLowerCase() === 'complete' && (
                  <>
                    <MuiListItemText primary={`${window.T('Approved By')}:`} secondary={payoutDetail?.actor} />
                    <MuiListItemText
                      primary={`${window.T('Approved At')}:`}
                      secondary={formatDate(payoutDetail?.actionAt)}
                    />
                  </>
                )}
                {payoutDetail?.action?.toLowerCase() === 'failed' && (
                  <>
                    <MuiListItemText primary={`${window.T('Rejected By')}:`} secondary={payoutDetail?.actor} />
                    <MuiListItemText
                      primary={`${window.T('Rejected At')}:`}
                      secondary={formatDate(payoutDetail?.actionAt)}
                    />
                  </>
                )}
              </Stack>
            </Box>
          )}
        </Grid>
      </Grid>
      <Box
        mt={4}
        sx={{
          background: '#fff',
          p: {
            xs: 2,
            sm: 3,
            xl: 4,
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
        open={!!showModalConfirm}
        title={showModalConfirm ? MessageContentModal?.[showModalConfirm]?.title : ''}
        onClose={onCloseModal}
        sxWrapper={{
          '& .MuiDialog-paper': {
            margin: '16px',
            maxWidth: 480,
            width: '100%',
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
          <Typography variant="body1">
            {showModalConfirm ? MessageContentModal?.[showModalConfirm]?.content : ''}
          </Typography>
          <Typography variant="body1">{window.T('This action can’t be undone')}</Typography>
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
          <ConfirmButton
            type="submit"
            label={showModalConfirm ? MessageContentModal?.[showModalConfirm]?.btnConfirmName : ''}
            onClick={handleRejectPayment}
            loading={isRejectPayment || isRemovingPayoutTransaction || isRejectPayoutTransaction}
          />
        </DialogActions>
      </Modal>
    </Container>
  );
}

export default WithdrawRequestsContainer;

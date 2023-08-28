import { CancelButton, ConfirmButton } from '@/components/Buttons';
import { CardHeader } from '@/components/Card';
import HerondIcon from '@/components/Icons';
import StatusLabel, { StatusEnum } from '@/components/StatusLabel';
import HerondTable from '@/components/Table';
import Box from '@mui/material/Box';
import Container from '@/components/Container';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useMemo, useState, useEffect, MouseEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PayoutTransactionHeadTable } from './config';
import Modal, { DialogActions, DialogContent } from '@/components/Modal';
import BulkAction from '@/components/BulkAction';
import Button from '@mui/material/Button';
import ModalDetailTransaction from './DetailTransaction';
import ModalAddTransaction from './AddTransaction';
import {
  useGetPayoutDetailQuery,
  useGetPayoutTransactionsQuery,
  useUpdatePayoutMutation,
  useRejectPayoutMutation,
  useApprovePayoutMutation,
  useRejectPayoutTransactionMutation,
  useRemovePayoutTransactionMutation,
} from '@/services/payout';
import { formatDate } from '@/utils/date';
import { RowProp } from '@/components/Table/utils';
import { truncateStr } from '@/utils/common';
import toast from 'react-hot-toast';
import { InputField } from '@/components/Fields';
import AxiosCustom from '@/services/axios';
import dayjs from 'dayjs';

const MuiListItemText = styled(ListItemText)({
  display: 'flex',
  flexFlow: 'nowrap row',
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

enum ModalType {
  PayoutReject = 'payment-reject',
  PayoutApprove = 'payment-approved',
  PayoutTransactionRemove = 'payout-transaction-remove',
  PayoutTransactionReject = 'payout-transaction-reject',
}

const MessageContentModal = {
  [ModalType.PayoutReject]: {
    title: window.T('Reject Payout'),
    content: window.T('Are you sure you want to reject this payout?'),
    btnConfirmName: window.T('Reject'),
  },
  [ModalType.PayoutApprove]: {
    title: window.T('Approve Payout'),
    content: window.T('Are you sure you want to approve this payout?'),
    btnConfirmName: window.T('Approve'),
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

interface FilterProps {
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

interface TransactionItem {
  id: string;
  transactionId: string;
  amount: number;
  status: number;
  createdDate: string;
}

function PayoutsDetailContainer() {
  const navigate = useNavigate();
  const params = useParams();
  const payoutId = params?.id;

  const [isExportingCSV, setIsExportingCSV] = useState<boolean>(false);
  const [showModalConfirm, setShowModalConfirm] = useState<ModalType | null>(null);
  const [showModalAddTransaction, setShowModalAddTransaction] = useState<boolean>(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [payoutName, setPayoutName] = useState<string>('');

  const [selected, setSelected] = useState<Array<string | number>>([]);

  const [filter, setFilter] = useState<FilterProps>({
    sortBy: 'createdDate',
    sortDirection: 'asc',
    page: 1,
    pageSize: 10,
  });

  const {
    data: payoutDetail,
    isFetching: isFetchingDetail,
    refetch: refetchDetail,
  } = useGetPayoutDetailQuery(
    {
      id: payoutId,
    },
    {
      skip: !payoutId,
    },
  );

  const isCompletedPayout = [StatusEnum.COMPLETED, StatusEnum.REJECTED, StatusEnum.APPROVED].includes(
    payoutDetail?.status,
  );

  const {
    data: payoutTransactions,
    isFetching: isFetchingPayoutTransactions,
    refetch: refetchPayoutTransaction,
  } = useGetPayoutTransactionsQuery(
    {
      id: payoutId,
      SortBy: filter.sortBy,
      sortDirection: filter.sortDirection === 'asc' ? 0 : 1,
      pageIndex: filter.page,
      pageSize: filter.pageSize,
    },
    {
      skip: !payoutId,
    },
  );

  const [updatePayout, { isLoading: isUpdatingPayout }] = useUpdatePayoutMutation();

  const [approvedPayout, { isLoading: isApprovingPayout }] = useApprovePayoutMutation();
  const [rejectedPayout, { isLoading: isRejectingPayout }] = useRejectPayoutMutation();

  const [rejectedPayoutTransaction, { isLoading: isRejectingPayoutTransaction }] = useRejectPayoutTransactionMutation();
  const [removedPayoutTransaction, { isLoading: isRemovingPayoutTransaction }] = useRemovePayoutTransactionMutation();

  const handleShowRemovePayoutTransactionModal = (id: string) => (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setSelected([id]);
    setShowModalConfirm(ModalType.PayoutTransactionRemove);
  };

  const handleShowModalTransactionDetail = (transactionId: string) => (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setSelectedTransactionId(transactionId);
  };

  const payoutTransactionRows = useMemo(
    () =>
      (payoutTransactions?.items || []).map((item: any) => ({
        id: item?.id,
        tx_id: truncateStr(item?.transactionId),
        wallet_address: item?.address,
        createdDate: formatDate(item?.createdDate),
        deadline: formatDate(item?.deadline),
        amount: item?.amount || 0,
        checkbox: (item?.status || '').toLowerCase() === 'pending',
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
          <Stack spacing={0} direction="row">
            <ButtonAction variant="text" onClick={handleShowModalTransactionDetail(item?.transactionId)}>
              <HerondIcon name="eye" />
            </ButtonAction>
            {!isCompletedPayout && (
              <ButtonAction variant="text" onClick={handleShowRemovePayoutTransactionModal(item?.id)}>
                <HerondIcon name="trash" />
              </ButtonAction>
            )}
          </Stack>
        ),
      })),
    [payoutTransactions?.pageIndex, payoutTransactions?.items, isFetchingPayoutTransactions, isCompletedPayout],
  );

  useEffect(() => {
    if (payoutDetail?.name) {
      setPayoutName(payoutDetail?.name);
    }
  }, [payoutDetail?.name]);

  const handleChangePayoutName = (value: string) => {
    setPayoutName(value);
  };

  const onSubmitChangePayName = async () => {
    if (!isEditMode) {
      setIsEditMode(true);
    } else {
      try {
        const res = await updatePayout({
          id: payoutId,
          payload: {
            payoutName: payoutName,
          },
        }).unwrap();
        if (res?.success) {
          setIsEditMode(false);
          refetchDetail();
          toast.success(res?.message || window.T('Update payout name successfully!'));
        }
      } catch (error) {
        // setIsEditMode(false);
      }
    }
  };

  const handleRefreshPayoutAndTransaction = () => {
    refetchDetail();
    refetchPayoutTransaction();
  };

  const handleRefreshPayTransaction = () => {
    refetchPayoutTransaction();
    setSelected([]);
  };

  const onCloseModal = () => {
    setShowModalConfirm(null);
  };

  const handleConfirmReject = async () => {
    const configApi = {
      [ModalType.PayoutApprove]: {
        api: approvedPayout,
        refetch: handleRefreshPayoutAndTransaction,
        payload: {
          id: payoutId,
        },
      },
      [ModalType.PayoutReject]: {
        api: rejectedPayout,
        refetch: handleRefreshPayoutAndTransaction,
        payload: {
          id: payoutId,
        },
      },
      [ModalType.PayoutTransactionReject]: {
        api: rejectedPayoutTransaction,
        refetch: handleRefreshPayTransaction,
        payload: {
          payoutId: payoutId,
          transactionIds: (payoutTransactions?.items || [])
            .filter((item: TransactionItem) => selected.includes(item.id))
            .map((item: TransactionItem) => item.transactionId),
        },
        resetSelected: true,
      },
      [ModalType.PayoutTransactionRemove]: {
        api: removedPayoutTransaction,
        refetch: handleRefreshPayTransaction,
        payload: {
          payoutId: payoutId,
          transactionIds: (payoutTransactions?.items || [])
            .filter((item: TransactionItem) => selected.includes(item.id))
            .map((item: TransactionItem) => item.transactionId),
        },
        resetSelected: true,
      },
    } as {
      [key in ModalType]: {
        api: any;
        refetch: any;
        payload: any;
        resetSelected?: boolean;
      };
    };
    if (showModalConfirm && configApi?.[showModalConfirm]) {
      try {
        const { api, refetch, payload, resetSelected } = configApi[showModalConfirm];
        const res = await api(payload).unwrap();
        refetch();
        onCloseModal();
        if (resetSelected) {
          setSelected([]);
        }
        toast.success(window.T(res?.message || 'Reject payment successfully'));
      } catch (error) {
        // toast.error(window.T('Reject payment failed'));
      }
    }
  };

  const handleUpdateFilter = (name: string) => (value: string | number | StatusEnum) => {
    setFilter(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSortTable = (sortData: { sortDirection: 'asc' | 'desc'; sortBy: keyof RowProp }) => {
    setFilter((prev: FilterProps) => ({
      ...prev,
      sortDirection: sortData.sortDirection,
      sortBy: sortData.sortBy as string,
    }));
  };

  const handleExportCSV = async () => {
    try {
      setIsExportingCSV(true);
      const res = await AxiosCustom.get(`/payout/${payoutId}/export`);
      if (res?.data) {
        const fileName = `payout-${dayjs().format('YYYY-MM-DD')}.csv`;
        const url = window.URL.createObjectURL(new Blob([res?.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
      }
      setIsExportingCSV(false);
    } catch (error) {
      setIsExportingCSV(false);
    }
  };

  const BulkActionOptions = useMemo(
    () => [
      {
        label: window.T('Remove from list'),
        onClick: () => setShowModalConfirm(ModalType.PayoutTransactionRemove),
      },
      {
        label: window.T('Remove from list & reject'),
        onClick: () => setShowModalConfirm(ModalType.PayoutTransactionReject),
      },
    ],
    [],
  );

  return (
    <Container loading={isFetchingDetail}>
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
                xl: 4,
              },
            }}
          >
            <Grid container>
              <Grid item xs={12} lg={8}>
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
                    <CardHeader label={window.T('Payout Information')} icon="receive" />
                  </Stack>
                </Stack>
                <Stack mt={1}>
                  <MuiListItemText
                    primary={`${window.T('Name')}:`}
                    secondary={
                      isEditMode ? (
                        <InputField
                          placeholder={window.T('Name')}
                          defaultValue={payoutName}
                          onSubmit={handleChangePayoutName}
                        />
                      ) : (
                        payoutName
                      )
                    }
                  />
                  <MuiListItemText primary={`${window.T('Payout Id')}:`} secondary={payoutDetail?.payoutId} />
                  <MuiListItemText primary={`${window.T('Total Amount')}:`} secondary={payoutDetail?.totalAmount} />
                  <MuiListItemText
                    primary={`${window.T('Create At')}:`}
                    secondary={formatDate(payoutDetail?.createdAt)}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} lg={4}>
                <Stack
                  spacing={1}
                  mt={{
                    xs: 2,
                    lg: 0,
                  }}
                  direction="row"
                >
                  <CancelButton
                    type="button"
                    label={window.T('Export CSV')}
                    sx={{
                      minWidth: '80px !important',
                      height: 'auto !important',
                      px: 4,
                      width: '100%',
                      whiteSpace: 'nowrap',
                    }}
                    loading={isExportingCSV}
                    onClick={handleExportCSV}
                  />
                  <ConfirmButton
                    type="button"
                    label={isEditMode ? window.T('Save') : window.T('Edit')}
                    sx={{
                      height: 'auto !important',
                      width: '100%',
                    }}
                    disabled={isCompletedPayout}
                    loading={isUpdatingPayout}
                    onClick={onSubmitChangePayName}
                  />
                </Stack>
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
                xl: 4,
              },
            }}
          >
            <Grid
              container
              sx={{
                height: '100%',
              }}
            >
              <Grid item xs={12} lg={8}>
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
                    <CardHeader label={window.T('Payout Status')} icon="receive" />
                    <StatusLabel status={payoutDetail?.status} />
                  </Stack>
                </Stack>
                {payoutDetail?.action?.toLowerCase() === 'approved' && (
                  <Stack mt={1}>
                    <MuiListItemText primary={`${window.T('Approved By')}:`} secondary={payoutDetail?.actor} />
                    <MuiListItemText
                      primary={`${window.T('Approved At')}:`}
                      secondary={formatDate(payoutDetail?.actionAt)}
                    />
                  </Stack>
                )}
                {payoutDetail?.action?.toLowerCase() === 'rejected' && (
                  <Stack mt={1}>
                    <MuiListItemText primary={`${window.T('Rejected By')}:`} secondary={payoutDetail?.actor} />
                    <MuiListItemText
                      primary={`${window.T('Rejected At')}:`}
                      secondary={formatDate(payoutDetail?.actionAt)}
                    />
                  </Stack>
                )}
              </Grid>
              <Grid
                item
                xs={12}
                lg={4}
                sx={{
                  alignSelf: {
                    xs: 'flex-end',
                    lg: 'flex-start',
                  },
                }}
              >
                {payoutDetail?.status?.toLowerCase() === 'pending' && (
                  <Stack
                    spacing={1}
                    mt={{
                      xs: 2,
                      lg: 0,
                    }}
                    direction="row"
                    justifyContent="flex-end"
                    alignItems="flex-end"
                  >
                    <CancelButton
                      type="button"
                      label={window.T('Reject')}
                      sx={{
                        px: 4,
                        height: 'auto !important',
                        width: '100%',
                      }}
                      onClick={() => setShowModalConfirm(ModalType.PayoutReject)}
                    />
                    {payoutTransactionRows?.length > 0 && (
                      <ConfirmButton
                        type="button"
                        label={window.T('Approve')}
                        sx={{
                          px: 4,
                          height: 'auto !important',
                          width: '100%',
                        }}
                        onClick={() => setShowModalConfirm(ModalType.PayoutApprove)}
                      />
                    )}
                  </Stack>
                )}
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
        <Stack
          direction={{
            sx: 'column',
            sm: 'row',
          }}
          justifyContent="space-between"
          mt={1}
          mb={3}
        >
          <Stack spacing={2} direction="row" alignItems="center">
            <Typography variant="h3" sx={{ fontSize: 20 }}>
              {window.T('Withdraw Requests')}
            </Typography>
            <CancelButton
              type="button"
              label={window.T('Add Transaction')}
              sx={{
                whiteSpace: 'nowrap',
              }}
              disabled={isCompletedPayout}
              onClick={() => setShowModalAddTransaction(true)}
            />
            {!isCompletedPayout && selected?.length > 0 && (
              <BulkAction
                sx={{
                  display: {
                    xs: 'none',
                    sm: 'flex',
                  },
                }}
                options={BulkActionOptions}
              />
            )}
          </Stack>

          <Stack
            mt={{
              xs: 2,
              sm: 0,
            }}
            direction="row"
            spacing={2}
          >
            {!isCompletedPayout && selected?.length > 0 && (
              <BulkAction
                sx={{
                  display: {
                    xs: 'flex',
                    sm: 'none',
                  },
                }}
                options={BulkActionOptions}
              />
            )}
            <Typography variant="body1" sx={{ fontSize: 16 }}>
              {`${payoutTransactions?.totalCount || 0} items`}
            </Typography>
          </Stack>
        </Stack>
        <HerondTable
          checkbox
          sortDirection={filter.sortDirection}
          sortBy={filter.sortBy}
          loading={isFetchingPayoutTransactions}
          pageIndex={payoutTransactions?.pageIndex || 1}
          totalPages={payoutTransactions?.totalPages || 1}
          headCells={PayoutTransactionHeadTable}
          rows={payoutTransactionRows}
          selected={selected}
          onSelectRow={setSelected}
          onChangePage={handleUpdateFilter('page')}
          onSortChange={handleSortTable}
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
            onClick={handleConfirmReject}
            loading={
              isApprovingPayout || isRejectingPayout || isRejectingPayoutTransaction || isRemovingPayoutTransaction
            }
          />
        </DialogActions>
      </Modal>
      <ModalDetailTransaction
        open={!!selectedTransactionId}
        transactionId={selectedTransactionId}
        refreshData={handleRefreshPayTransaction}
        onClose={() => setSelectedTransactionId(null)}
      />

      <ModalAddTransaction
        open={!!showModalAddTransaction}
        payoutId={payoutId}
        refreshData={handleRefreshPayTransaction}
        onClose={() => setShowModalAddTransaction(false)}
      />
    </Container>
  );
}

export default PayoutsDetailContainer;

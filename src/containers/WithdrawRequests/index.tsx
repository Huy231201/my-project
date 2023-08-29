import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import HerondTable from '@/components/Table';
import StatusLabel, { StatusEnum } from '@/components/StatusLabel';
import { WithdrawRequestHeadTable, StatusOptions } from './config';
import { useMemo, useState, MouseEvent } from 'react';
import { SelectField, SearchInputField, DateRangeTwoPickerField } from '@/components/Fields';
import Button from '@mui/material/Button';
import BulkAction from '@/components/BulkAction';
import dayjs from 'dayjs';
import { validateEmail, truncateStr } from '@/utils/common';
import Link from '@mui/material/Link';
import { useNavigate } from 'react-router-dom';
import Modal, { DialogActions, DialogContent } from '@/components/Modal';
import { CancelButton, ConfirmButton } from '@/components/Buttons';
import { styled } from '@mui/material/styles';
import HerondIcon from '@/components/Icons';
import { useGetWithdrawQuery, useRejectPaymentsMutation } from '@/services/withdraw';
import Container from '@/components/Container';
import { RowProp } from '@/components/Table/utils';
import toast from 'react-hot-toast';
import { formatDate } from '@/utils/date';

interface FilterProps {
  searchEmail: string;
  dateRange: Array<Date | null>;
  status: StatusEnum | string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

interface TableItem {
  id: string;
  email: string;
  amount: number;
  status: StatusEnum;
  payoutId: string;
  createdDate: string;
  deadline: string;
  transactionId: string;
  address: string;
}

const ButtonAction = styled(Button)({
  border: 'none',
  fontSize: '14px',
  fontWeight: 400,
  color: '#32373D',
  margin: 'auto',
  minWidth: '0px !important',
  minHeight: '0px !important',
  '&:hover, &:active': {
    background: 'transparent',
  },
});

function WithdrawRequestsContainer() {
  const navigate = useNavigate();
  const [showModalReject, setShowModalReject] = useState<boolean>(false);
  const [selected, setSelected] = useState<Array<string | number>>([]);
  const [filter, setFilter] = useState<FilterProps>({
    searchEmail: '',
    dateRange: [dayjs().startOf('month').toDate(), new Date()],
    status: 'all',
    sortBy: 'createdDate',
    sortDirection: 'asc',
    page: 1,
    pageSize: 10,
  });

  const {
    data,
    isFetching,
    refetch: refetchWithdrawList,
  } = useGetWithdrawQuery({
    startDate: dayjs(filter.dateRange[0]).format('YYYY-MM-DD'),
    endDate: dayjs(filter.dateRange[1]).format('YYYY-MM-DD'),
    Email: filter.searchEmail,
    status: filter.status === 'all' ? undefined : filter.status,
    SortBy: filter.sortBy,
    sortDirection: filter.sortDirection === 'asc' ? 0 : 1,
    pageIndex: filter.page,
    pageSize: filter.pageSize,
  });

  const [rejectPayment, { isLoading: isRejecting }] = useRejectPaymentsMutation();

  const handleChangeDateRange = (dateRange: Array<Date | null>) => {
    if (dateRange[0] && dateRange[1]) {
      setFilter(prev => ({
        ...prev,
        dateRange,
      }));
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

  const handleOpenDrawerDetail = (transactionId: string) => (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    navigate(`/withdrawal-requests/${transactionId}`);
  };

  const handleRejectPayment = async () => {
    const transactionIds = data?.items
      .filter((item: TableItem) => selected.includes(item.id))
      .map((item: TableItem) => item.transactionId);
    try {
      const res = await rejectPayment({
        transactionIds,
      }).unwrap();
      setSelected([]);
      setShowModalReject(false);
      toast.success(window.T(res?.message || 'Reject payment successfully'));
      refetchWithdrawList();
    } catch (error) {
      toast.error(window.T('Reject payment failed'));
    }
  };

  const withDrawalData = useMemo(
    () =>
      (data?.items || []).map((item: TableItem) => ({
        id: item?.id,
        tx_id: truncateStr(item?.transactionId),
        wallet_address: item?.address,
        createdDate: formatDate(item?.createdDate),
        deadline: formatDate(item?.deadline),
        amount: item?.amount || 0,
        checkbox: (item?.status || '').toLowerCase() === 'pending' && !item.payoutId,
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
          <ButtonAction variant="text" onClick={handleOpenDrawerDetail(item.transactionId)}>
            <HerondIcon name="eye" />
          </ButtonAction>
        ),
      })),
    [data?.pageIndex, data?.items, isFetching],
  );

  const BulkActionOptions = useMemo(
    () => [
      {
        label: window.T('Rejected'),
        onClick: () => setShowModalReject(true),
      },
    ],
    [],
  );

  return (
    <Container>
      <Box
        sx={{
          background: '#fff',
          borderRadius: 1.5,
          p: {
            xs: 2,
            sm: 3,
            md: 4,
          },
        }}
      >
        <Box>
          <Typography
            variant="h3"
            sx={{
              fontSize: 20,
            }}
          >
            {window.T('Withdraw Requests')}
          </Typography>
        </Box>
        <Stack
          mt={2}
          mb={1}
          direction={{
            xs: 'column',
            md: 'row',
          }}
          justifyContent="space-between"
        >
          <Stack
            direction="row"
            sx={{
              display: {
                xs: 'none',
                md: 'flex',
              },
            }}
          >
            {selected.length > 0 && <BulkAction options={BulkActionOptions} />}
          </Stack>
          <Stack
            direction={{
              xs: 'column',
              md: 'row',
            }}
            justifyContent="center"
            spacing={1.5}
          >
            <Typography
              variant="body1"
              sx={{
                display: {
                  xs: 'none',
                  md: 'flex',
                },
              }}
            >{`${data?.totalCount || 0} items`}</Typography>
            <DateRangeTwoPickerField
              dateRange={filter.dateRange}
              onChange={handleChangeDateRange}
              maxDate={new Date()}
            />

            <Stack
              direction={{
                xs: 'column',
                sm: 'row',
              }}
              mt={2}
              spacing={1.5}
            >
              <SearchInputField
                sx={{
                  width: '100%',
                }}
                placeholder={window.T('Enter user email')}
                validate={validateEmail}
                msgError={window.T('Email is invalid')}
                onSubmit={handleUpdateFilter('searchEmail')}
              />
              <SelectField value={filter.status} options={StatusOptions} onChange={handleUpdateFilter('status')} />
            </Stack>

            <Box></Box>
          </Stack>
        </Stack>
        <Box
          sx={{
            background: '#fff',
            py: 2,
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            sx={{
              display: {
                xs: 'flex',
                md: 'none',
              },
              mb: 1,
            }}
          >
            {selected.length > 0 && <BulkAction options={BulkActionOptions} />}
            <Typography variant="body1">{`${data?.totalCount || 0} items`}</Typography>
          </Stack>
          <HerondTable
            checkbox
            sortDirection={filter.sortDirection}
            sortBy={filter.sortBy}
            loading={isFetching}
            pageIndex={data?.pageIndex || 1}
            totalPages={data?.totalPages || 1}
            headCells={WithdrawRequestHeadTable}
            rows={withDrawalData}
            selected={selected}
            onSelectRow={setSelected}
            onChangePage={handleUpdateFilter('page')}
            onSortChange={handleSortTable}
          />
        </Box>
      </Box>
      <Modal
        open={showModalReject}
        title={window.T('Do you want to reject this request?')}
        onClose={() => setShowModalReject(false)}
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
          <Typography variant="body1" sx={{ mb: 2 }}>
            {window.T(
              'There are {{value}} users in this request. Do you want to reject this request? This action can’t be undone',
              { value: selected?.length },
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
          <ConfirmButton type="submit" label={window.T('Reject')} loading={isRejecting} onClick={handleRejectPayment} />
        </DialogActions>
      </Modal>
    </Container>
  );
}

export default WithdrawRequestsContainer;

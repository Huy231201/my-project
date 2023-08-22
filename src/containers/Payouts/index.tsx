import { CancelButton, ConfirmButton } from '@/components/Buttons';
import Container from '@/components/Container';
import { DateRangePicker, InputField, SearchInputField, SelectField } from '@/components/Fields';
import HerondIcon from '@/components/Icons';
import Modal, { DialogActions, DialogContent } from '@/components/Modal';
import StatusLabel, { StatusEnum } from '@/components/StatusLabel';
import HerondTable from '@/components/Table';
import { useGetPayoutListQuery, usePreviewPayoutQuery, useCreatePayoutMutation } from '@/services/payout';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import dayjs from 'dayjs';
import { MouseEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PayoutsHeadTable, StatusOptions } from './config';
import { RowProp } from '@/components/Table/utils';
import { formatDate } from '@/utils/date';
import toast from 'react-hot-toast';

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

interface FilterProps {
  name: string;
  dateRange: Array<Date | null>;
  status: StatusEnum | string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

interface TableItem {
  id: string;
  name: string;
  status: StatusEnum;
  createdAt: string;
  amount: number;
  payoutId: string;
  createdBy: string;
}

const DEFAULT_NEW_PAYOUT_VALUE = window.T('Payout for {{month}} Request', {
  month: dayjs().format('MMMM'),
});

function WithdrawRequestsContainer() {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newPayoutValue, setNewPayoutValue] = useState<string>(DEFAULT_NEW_PAYOUT_VALUE);

  const [filter, setFilter] = useState<FilterProps>({
    name: '',
    dateRange: [dayjs().startOf('month').toDate(), new Date()],
    status: 'all',
    sortBy: 'createdAt',
    sortDirection: 'asc',
    page: 1,
    pageSize: 10,
  });

  const {
    data,
    isFetching,
    refetch: refetchPayoutList,
  } = useGetPayoutListQuery({
    startDate: dayjs(filter.dateRange[0]).format('YYYY-MM-DD'),
    endDate: dayjs(filter.dateRange[1]).format('YYYY-MM-DD'),
    name: filter.name,
    status: filter.status === 'all' ? undefined : filter.status,
    SortBy: filter.sortBy,
    sortDirection: filter.sortDirection === 'asc' ? 0 : 1,
    pageIndex: filter.page,
    pageSize: filter.pageSize,
  });

  const { data: payoutPreview, isFetching: isFetchingPreview, refetch: refetchPreview } = usePreviewPayoutQuery({});
  const [createPayout, { isLoading: isCreatingPayout }] = useCreatePayoutMutation({});

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

  const handleSelectRow = (rowId: Array<string | number>) => {
    const row = data?.items?.find((item: TableItem) => item.id === rowId[0]);
    if (row) {
      navigate(`/payouts/${row.payoutId}`);
    }
  };

  const handleOpenDrawerDetail = (payoutId: string) => (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    navigate(`/payouts/${payoutId}`);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setNewPayoutValue(DEFAULT_NEW_PAYOUT_VALUE);
  };

  const handleCreatePayout = async () => {
    if (payoutPreview?.totalAmount > 0 && payoutPreview?.totalAmount > 0 && newPayoutValue) {
      try {
        const res = await createPayout({
          name: newPayoutValue,
        }).unwrap();
        if (res.success) {
          handleCloseCreateModal();
          toast.success(res.message || window.T('Create payout successfully'));
          refetchPayoutList();
          refetchPreview();
        }
      } catch (error) {
        // console.log(error);
      }
    }
  };

  const withDrawalData = useMemo(
    () =>
      (data?.items || []).map((item: TableItem) => ({
        ...item,
        createdAt: formatDate(item?.createdAt),
        status: <StatusLabel status={item.status} />,
        action: (
          <ButtonAction variant="text" onClick={handleOpenDrawerDetail(item.payoutId)}>
            <HerondIcon name="eye" />
          </ButtonAction>
        ),
      })),
    [data?.pageIndex, data?.items?.length],
  );

  return (
    <Container loading={isFetching || isFetchingPreview}>
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
            {window.T('Payouts')}
          </Typography>
        </Box>
        <Stack
          mt={4}
          mb={1}
          direction={{
            xs: 'column',
            md: 'row',
          }}
          justifyContent="space-between"
        >
          <Stack direction="row">
            <Button
              variant="outlined"
              sx={{
                borderColor: '#298CFD',
                color: '#298CFD',
                minWidth: 80,
              }}
              onClick={() => setShowCreateModal(true)}
            >
              {window.T('Create new payout')}
            </Button>
          </Stack>
          <Stack
            direction={{
              xs: 'column',
              md: 'row',
            }}
            justifyContent="center"
            spacing={1.5}
          >
            <Typography variant="body1">{`${data?.totalCount || 0} items`}</Typography>
            <Box>
              <DateRangePicker value={filter.dateRange} onChange={handleChangeDateRange} maxDate={new Date()} />
            </Box>
            <Box>
              <SearchInputField placeholder={window.T('Name')} onSubmit={handleUpdateFilter('name')} />
            </Box>
            <Box>
              <SelectField value={filter.status} options={StatusOptions} onChange={handleUpdateFilter('status')} />
            </Box>
          </Stack>
        </Stack>
        <Box
          sx={{
            background: '#fff',
            py: 2,
          }}
        >
          <HerondTable
            enableSelect
            loading={isFetching}
            sortDirection={filter.sortDirection}
            sortBy={filter.sortBy}
            pageIndex={data?.pageIndex || 1}
            totalPages={data?.totalPages || 1}
            headCells={PayoutsHeadTable}
            rows={withDrawalData}
            onSelectRow={handleSelectRow}
            onChangePage={handleUpdateFilter('page')}
            onSortChange={handleSortTable}
          />
        </Box>
      </Box>
      <Modal
        open={showCreateModal}
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <HerondIcon name="receive" />
            <Typography variant="h4">{window.T('Create new payout')}</Typography>
          </Stack>
        }
        onClose={handleCloseCreateModal}
        sxWrapper={{
          '& .MuiDialog-paper': {
            margin: '16px',
            px: 2,
            py: 1,
          },
        }}
      >
        <DialogContent
          sx={{
            px: 4,
            py: 6,
            border: 'none',
          }}
          dividers
        >
          <Stack mb={2}>
            {payoutPreview?.totalRequest > 0 && payoutPreview?.totalRequest > 0 ? (
              <InputField
                placeholder={window.T('Enter username')}
                defaultValue={newPayoutValue}
                onSubmit={setNewPayoutValue}
              />
            ) : (
              <Typography
                variant="body1"
                sx={{
                  fontSize: 18,
                  fontStyle: 'italic',
                  marginBottom: 2,
                }}
              >
                {window.T('No transaction available')}
              </Typography>
            )}
          </Stack>
          <Stack mt={1} spacing={1} direction="row" alignItems="center">
            <Typography variant="body1" fontWeight={700}>{`${window.T('Total Amount')}:`}</Typography>
            <Typography variant="body1">{`USDT ${payoutPreview?.totalAmount}`}</Typography>
          </Stack>
          <Stack mt={1} spacing={1} direction="row" alignItems="center">
            <Typography variant="body1" fontWeight={700}>{`${window.T('Withdraw request')}:`}</Typography>
            <Typography variant="body1">{`${payoutPreview?.totalRequest} transactions`}</Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <CancelButton
            type="submit"
            label={window.T('Cancel')}
            onClick={handleCloseCreateModal}
            sx={{
              minWidth: '120px !important',
            }}
          />
          <ConfirmButton
            type="submit"
            disabled={!newPayoutValue || (payoutPreview?.totalRequest === 0 && payoutPreview?.totalAmount === 0)}
            label={window.T('Create')}
            loading={isCreatingPayout}
            onClick={handleCreatePayout}
            sx={{
              minWidth: '120px !important',
            }}
          />
        </DialogActions>
      </Modal>
    </Container>
  );
}

export default WithdrawRequestsContainer;

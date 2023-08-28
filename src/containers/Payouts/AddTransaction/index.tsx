import HerondIcon from '@/components/Icons';
import Modal, { DialogContent, DialogActions } from '@/components/Modal';
import { ConfirmButton, CancelButton } from '@/components/Buttons';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import HerondTable from '@/components/Table';
import { useState, useMemo, useEffect } from 'react';
import { useGetWithdrawAvailableQuery } from '@/services/withdraw';
import { PayoutTransactionHeadTable } from '../config';
import StatusLabel, { StatusEnum } from '@/components/StatusLabel';
import { RowProp } from '@/components/Table/utils';
import { truncateStr } from '@/utils/common';
import { formatDate } from '@/utils/date';
import Link from '@mui/material/Link';
import { useAddPayoutTransactionsMutation } from '@/services/payout';
import toast from 'react-hot-toast';

const HeaderWithoutAction = PayoutTransactionHeadTable.filter(item => item.id !== 'action');

interface Props {
  open: boolean;
  payoutId: string | undefined;
  onClose: () => void;
  refreshData: () => void;
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

interface FilterProps {
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

function AddTransactionModal(props: Props) {
  const { open, payoutId, onClose, refreshData } = props;
  const [selected, setSelected] = useState<Array<string | number>>([]);
  const [filter, setFilter] = useState<FilterProps>({
    sortBy: 'createdDate',
    sortDirection: 'asc',
    page: 1,
    pageSize: 10,
  });

  const { data, isFetching } = useGetWithdrawAvailableQuery(
    {
      SortBy: filter.sortBy,
      sortDirection: filter.sortDirection === 'asc' ? 0 : 1,
      pageIndex: filter.page,
      pageSize: filter.pageSize,
      open,
    },
    {
      skip: !open,
    },
  );

  useEffect(() => {
    if (!open) {
      setSelected([]);
      setFilter({
        sortBy: 'createdDate',
        sortDirection: 'asc',
        page: 1,
        pageSize: 10,
      });
    }
  }, [open]);

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
      })),
    [data?.pageIndex, data?.items, isFetching],
  );

  const [addPayoutTransactions, { isLoading: isAddingPayoutTransaction }] = useAddPayoutTransactionsMutation();

  const handleAddPayoutTransactions = async () => {
    if (selected?.length > 0) {
      const payload = {
        payoutId: payoutId,
        transactionIds:
          data?.items
            ?.filter((item: TableItem) => selected.includes(item.id))
            .map((item: TableItem) => item.transactionId) || [],
      };
      const res = await addPayoutTransactions(payload).unwrap();
      if (res?.success) {
        refreshData();
        toast.success(res?.message || window.T('Add transaction success'));
        onClose();
      }
    }
  };

  return (
    <Modal
      open={open}
      hiddenCloseIcon
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
            {window.T('Add Transactions')}
          </Typography>
        </Stack>
      }
      onClose={onClose}
      sxWrapper={{
        '& .MuiDialog-paper': {
          margin: '16px',
          maxWidth: '1200px',
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
        <HerondTable
          checkbox
          sortDirection={filter.sortDirection}
          sortBy={filter.sortBy}
          loading={isFetching}
          pageIndex={data?.pageIndex || 1}
          totalPages={data?.totalPages || 1}
          headCells={HeaderWithoutAction}
          rows={withDrawalData}
          selected={selected}
          onSelectRow={setSelected}
          onChangePage={handleUpdateFilter('page')}
          onSortChange={handleSortTable}
        />
      </DialogContent>
      <DialogActions>
        <CancelButton
          type="submit"
          label={window.T('Cancel')}
          sx={{
            border: 'none !important',
          }}
          onClick={onClose}
        />
        <ConfirmButton
          type="submit"
          label={window.T('Add')}
          disabled={selected?.length === 0}
          onClick={handleAddPayoutTransactions}
          loading={isAddingPayoutTransaction}
        />
      </DialogActions>
    </Modal>
  );
}

export default AddTransactionModal;

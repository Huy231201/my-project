import { HeaderCellProps } from '@/components/Table/utils';

// ---------------------------
export const StatusOptions = [
  {
    value: 'all',
    label: window.T('All'),
  },
  {
    value: '0',
    label: window.T('Pending'),
  },
  {
    value: '1',
    label: window.T('Approved'),
  },
  {
    value: '2',
    label: window.T('Rejected'),
  },
];

// ---------------------------

export const PayoutsHeadTable: readonly HeaderCellProps[] = [
  {
    id: 'payoutId',
    order: 1,
    label: window.T('Payout Id'),
  },
  {
    id: 'name',
    order: 2,
    label: window.T('Name'),
  },
  {
    id: 'createdAt',
    order: 3,
    numeric: true,
    sortable: true,
    label: window.T('Created At'),
  },
  {
    id: 'status',
    order: 4,
    numeric: true,
    label: window.T('Status'),
  },
  {
    id: 'amount',
    order: 5,
    numeric: true,
    label: window.T('Amount (USDT)'),
  },
  {
    id: 'action',
    order: 6,
    numeric: true,
    label: window.T('Action'),
  },
];

export const PayoutTransactionHeadTable: readonly HeaderCellProps[] = [
  {
    id: 'tx_id',
    order: 1,
    label: window.T('TxId'),
    numeric: true,
  },
  {
    id: 'email',
    order: 2,
    label: window.T('Email'),
  },
  {
    id: 'wallet_address',
    order: 3,
    label: window.T('Wallet Address'),
  },
  {
    id: 'createdDate',
    order: 4,
    numeric: true,
    sortable: true,
    label: window.T('Created At'),
    width: 180,
  },
  {
    id: 'deadline',
    order: 5,
    numeric: true,
    sortable: true,
    label: window.T('Deadline'),
    width: 180,
  },
  {
    id: 'amount',
    order: 5,
    numeric: true,
    sortable: true,
    label: window.T('Amount (USDT)'),
    width: 150,
  },
  {
    id: 'status',
    order: 5,
    numeric: true,
    label: window.T('Status'),
    width: 80,
  },
  {
    id: 'action',
    order: 5,
    numeric: true,
    label: window.T('Action'),
    align: 'center',
    width: 80,
  },
];

// ----------------------------

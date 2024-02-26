/* eslint-disable quotes */
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

export const WithdrawRequestHeadTable: readonly HeaderCellProps[] = [
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

export const EarningDetailHeader: readonly HeaderCellProps[] = [
  {
    id: 'id',
    order: 1,
    label: window.T('No.'),
    numeric: true,
    width: 80,
  },
  {
    id: 'earnedAt',
    order: 2,
    label: window.T('Earn At'),
  },
  {
    id: 'amount',
    order: 3,
    label: window.T('Amount'),
  },
  {
    id: 'status',
    order: 4,
    label: window.T('Status'),
    width: 180,
  },
];
// ----------------------------

/* eslint-disable quotes */

function randomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface UserHeadCell {
  id: string;
  order: number;
  label: string;
  numeric?: boolean;
  width?: number;
}
// ---------------------------
export const StatusOptions = [
  {
    value: 'Pending',
    label: 'Pending',
  },
  {
    value: 'Approved',
    label: 'Approved',
  },
  {
    value: 'Requested',
    label: 'Requested',
  },
  {
    value: 'Success',
    label: 'Success',
  },
  {
    value: 'Rejected',
    label: 'Rejected',
  },
];

// ---------------------------

export const rowsRegionCell = () =>
  new Array(10).fill(null).map((_, index) => ({
    id: index,
    tx_id: 'asdf-kjks8-423',
    email: 'blockbase@gmail.com.hrd',
    wallet_address: '0xb5ba48...4F2ACc',
    created_at: '07/07/2023  09:34:12',
    deadline: '07/07/2023  09:34:12',
    amount: '14,327',
    status: ['Pending', 'Approved', 'Requested', 'Rejected'][randomInteger(0, 3)],
    actions: '',
  }));

export const RegionHeadCell: readonly UserHeadCell[] = [
  {
    id: 'tx_id',
    order: 1,
    label: window.T('TxId'),
    numeric: true,
    width: 120,
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
    id: 'created_at',
    order: 4,
    numeric: true,
    label: window.T('Created At'),
  },
  {
    id: 'deadline',
    order: 5,
    numeric: true,
    label: window.T('Deadline'),
  },
  {
    id: 'amount',
    order: 5,
    numeric: true,
    label: window.T('Amount (USDT)'),
  },
  {
    id: 'status',
    order: 5,
    numeric: true,
    label: window.T('Status'),
  },
  {
    id: 'action',
    order: 5,
    numeric: true,
    label: window.T('Action'),
  },
];

// ----------------------------

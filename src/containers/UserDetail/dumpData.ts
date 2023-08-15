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

export const rowsUserHeadCells = () =>
  new Array(10).fill(null).map((_, index) => ({
    id: index,
    order: index + 1,
    wallet_creation_date: '23/06/3023 09:34:12',
    wallet_address: '0xb5ba48...4F2ACc',
    status: 'Valid',
  }));

export const UserHeadCells: readonly UserHeadCell[] = [
  {
    id: 'order',
    order: 1,
    label: window.T('No.'),
    numeric: true,
    width: 120,
  },
  {
    id: 'wallet_creation_date',
    order: 2,
    label: window.T('Wallet Creation Date'),
    width: 360,
  },
  {
    id: 'wallet_address',
    order: 3,
    label: window.T('Wallet Address'),
  },
  {
    id: 'status',
    order: 4,
    numeric: true,
    label: window.T('Status'),
  },
];

// ---------------------------

export const rowsRegionCell = () =>
  new Array(10).fill(null).map((_, index) => ({
    id: index,
    order: index + 1,
    creation_time: 'North America',
    transaction_id: '#12343478',
    amount: '12,325.4 USDT',
    status: ['Approved', 'Requested', 'Rejected'][randomInteger(0, 2)],
  }));

export const RegionHeadCell: readonly UserHeadCell[] = [
  {
    id: 'order',
    order: 1,
    label: window.T('No.'),
    numeric: true,
    width: 120,
  },
  {
    id: 'creation_time',
    order: 2,
    label: window.T('Region'),
    width: 360,
  },
  {
    id: 'transaction_id',
    order: 3,
    label: window.T('Transaction ID'),
  },
  {
    id: 'amount',
    order: 4,
    numeric: true,
    label: window.T('Amount'),
  },
  {
    id: 'status',
    order: 5,
    numeric: true,
    label: window.T('Status'),
  },
];

// ----------------------------

export const rowsChanelCell = () =>
  new Array(10).fill(null).map((_, index) => ({
    id: index,
    order: index + 1,
    creation_time: '23/06/3023 09:34:12',
    link: 'https://herond.org/affiliate/clickme',
    clicks: '63,235',
    downloads: '63,235',
    valid_users: '33,342',
  }));

export const ChanelHeadCell: readonly UserHeadCell[] = [
  {
    id: 'order',
    order: 1,
    label: window.T('No.'),
    numeric: true,
    width: 120,
  },
  {
    id: 'creation_time',
    order: 2,
    label: window.T('Creation Time'),
    width: 360,
  },
  {
    id: 'link',
    order: 3,
    label: window.T('Link'),
  },
  {
    id: 'clicks',
    order: 4,
    numeric: true,
    label: window.T('Clicks'),
  },
  {
    id: 'downloads',
    order: 5,
    numeric: true,
    label: window.T('Downloads'),
  },
  {
    id: 'valid_users',
    order: 7,
    numeric: true,
    label: window.T('Valid Users'),
  },
];

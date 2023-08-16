/* eslint-disable quotes */

interface UserHeadCell {
  id: string;
  order: number;
  label: string;
  numeric?: boolean;
  width?: number;
}

export const UserHeadCells: readonly UserHeadCell[] = [
  {
    id: 'order',
    order: 1,
    label: window.T('No.'),
    numeric: true,
    width: 120,
  },
  {
    id: 'createdDateTime',
    order: 2,
    label: window.T('Wallet Creation Date'),
    width: 360,
  },
  {
    id: 'address',
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

export const RegionHeadCell: readonly UserHeadCell[] = [
  {
    id: 'order',
    order: 1,
    label: window.T('No.'),
    numeric: true,
    width: 120,
  },
  {
    id: 'createdDateTime',
    order: 2,
    label: window.T('Region'),
    width: 360,
  },
  {
    id: 'transactionId',
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

export const ChanelHeadCell: readonly UserHeadCell[] = [
  {
    id: 'order',
    order: 1,
    label: window.T('No.'),
    numeric: true,
    width: 120,
  },
  {
    id: 'createdDateTime',
    order: 2,
    label: window.T('Creation Time'),
    width: 360,
  },
  {
    id: 'referralCode',
    order: 3,
    label: window.T('Link'),
  },
  {
    id: 'clickCount',
    order: 4,
    numeric: true,
    label: window.T('Clicks'),
  },
  {
    id: 'downloadCount',
    order: 5,
    numeric: true,
    label: window.T('Downloads'),
  },
  {
    id: 'validUser',
    order: 7,
    numeric: true,
    label: window.T('Valid Users'),
  },
];

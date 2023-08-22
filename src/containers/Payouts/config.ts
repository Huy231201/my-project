/* eslint-disable quotes */
interface UserHeadCell {
  id: string;
  order: number;
  label: string;
  numeric?: boolean;
  width?: number;
  sortable?: boolean;
}
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

export const PayoutsHeadTable: readonly UserHeadCell[] = [
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

// ----------------------------

/* eslint-disable quotes */
import { HeaderCellProps } from '@/components/Table/utils';

export const RecruitedHeadTable: readonly HeaderCellProps[] = [
  {
    id: 'order',
    order: 1,
    label: window.T('No.'),
    numeric: true,
  },
  {
    id: 'userEmail',
    order: 2,
    label: window.T('User Email'),
    width: 200,
  },
  {
    id: 'createdDateTime',
    order: 2,
    label: window.T('Wallet Creation Date'),
    width: 200,
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

export const WithdrawalHistoryHeadTable: readonly HeaderCellProps[] = [
  {
    id: 'order',
    order: 1,
    label: window.T('No.'),
    numeric: true,
  },
  {
    id: 'createdDateTime',
    order: 2,
    label: window.T('Creation Time'),
    width: 200,
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

export const LinkListHeadTable: readonly HeaderCellProps[] = [
  {
    id: 'order',
    order: 1,
    label: window.T('No.'),
    numeric: true,
  },
  {
    id: 'createdDateTime',
    order: 2,
    label: window.T('Creation Time'),
    width: 200,
  },
  {
    id: 'referralCode',
    order: 3,
    label: window.T('Referral Code'),
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

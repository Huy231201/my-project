import { HeaderCellProps } from '@/components/Table/utils';

// ---------------------------

export const ChainManagementHeadTable: readonly HeaderCellProps[] = [
  {
    id: 'name',
    order: 1,
    // sortable: true,
    label: window.T('Name'),
  },
  {
    id: 'shortName',
    order: 2,
    // sortable: true,
    label: window.T('Short Name'),
  },
  {
    id: 'chain',
    order: 3,
    label: window.T('Chain'),
  },
  {
    id: 'chainId',
    order: 4,
    numeric: true,
    label: window.T('Chain Id'),
  },
  {
    id: 'networkId',
    order: 5,
    numeric: true,
    label: window.T('Network Id'),
  },
  {
    id: 'slip44',
    order: 6,
    numeric: true,
    label: window.T('Slip44'),
  },
  {
    id: 'action',
    order: 7,
    label: window.T('Action'),
  },
];

// ----------------------------

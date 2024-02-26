import { HeaderCellProps } from '@/components/Table/utils';

export const TokenManagementHeadTable: readonly HeaderCellProps[] = [
  {
    id: 'address',
    order: 1,
    // sortable: true,
    label: window.T('Address'),
  },
  {
    id: 'name',
    order: 2,
    // sortable: true,
    label: window.T('Name'),
  },
  {
    id: 'erc20',
    order: 3,
    numeric: true,
    label: window.T('ecr20'),
  },
  {
    id: 'symbol',
    order: 4,
    label: window.T('Symbol'),
  },
  {
    id: 'decimals',
    order: 5,
    numeric: true,
    label: window.T('Decimals'),
  },
  {
    id: 'coingeckoId',
    order: 6,
    numeric: true,
    label: window.T('CoingeckoId'),
  },
  {
    id: 'chainId',
    order: 7,
    numeric: true,
    label: window.T('ChainId'),
  },
  {
    id: 'action',
    order: 8,
    label: window.T('Action'),
  },
];

// ----------------------------

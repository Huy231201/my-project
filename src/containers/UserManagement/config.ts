import { HeaderCellProps } from '@/components/Table/utils';

export const UserManagementHeadTable: readonly HeaderCellProps[] = [
  {
    id: 'email',
    order: 1,
    label: window.T('Email'),
  },
  {
    id: 'roles',
    order: 2,
    label: window.T('Role'),
  },
  {
    id: 'action',
    order: 3,
    label: window.T('Action'),
  },
];

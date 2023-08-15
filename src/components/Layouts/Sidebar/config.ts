import { SvgName } from '@/components/Icons';
import { routePath } from '@/routes/routePath';

interface SidebarConfigItem {
  label: string;
  nameIcon: SvgName;
  nameHoverIcon: SvgName;
  href: string;
  routes?: string[];
  divider?: boolean;
}

export const SidebarConfig = [
  {
    label: window.T('Browser Metric'),
    nameIcon: 'dashboard',
    nameHoverIcon: 'dashboard-white',
    href: routePath.BROWSER_METRIC,
    routes: [routePath.BROWSER_METRIC, routePath.HOME],
  },
  {
    label: window.T('Overview'),
    nameIcon: 'dashboard',
    nameHoverIcon: 'dashboard-white',
    href: routePath.OVERVIEW,
    divider: true,
  },
  {
    label: window.T('User Detail'),
    nameIcon: 'user-group',
    nameHoverIcon: 'user-group-white',
    href: routePath.USER_DETAIL,
  },
  {
    label: window.T('Withdrawal Manage'),
    nameIcon: 'wallet',
    nameHoverIcon: 'wallet-white',
    href: routePath.WITHDRAWAL_MANAGER,
  },
  {
    label: window.T('Payouts'),
    nameIcon: 'user-group',
    nameHoverIcon: 'user-group-white',
    href: routePath.PAYOUTS,
  },
] as SidebarConfigItem[];

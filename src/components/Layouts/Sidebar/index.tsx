import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DRAWER_SIDEBAR_WIDTH, APP_BAR_HEIGHT } from '../constants';
import SidebarItem from './SidebarItem';
import { SvgName } from '@/components/Icons';
import { getAccessToken } from '@/utils/common';
import { routePath } from '@/routes/routePath';

interface SidebarConfigItem {
  label: string;
  nameIcon: SvgName;
  nameHoverIcon: SvgName;
  href: string;
  routes: string[];
}

function MuiSideBar() {
  const isLogin = !!getAccessToken();
  const navigate = useNavigate();
  const location = useLocation();

  const SidebarConfig = useMemo<SidebarConfigItem[]>(
    () => [
      {
        label: window.T('Overview'),
        nameIcon: 'dashboard',
        nameHoverIcon: 'dashboard-white',
        href: routePath.OVERVIEW,
        routes: [routePath.OVERVIEW, routePath.HOME],
      },
      {
        label: window.T('User Detail'),
        nameIcon: 'user-group',
        nameHoverIcon: 'user-group-white',
        href: routePath.USER_DETAIL,
        routes: [routePath.USER_DETAIL],
      },
      {
        label: window.T('Withdrawal Manage'),
        nameIcon: 'wallet',
        nameHoverIcon: 'wallet-white',
        href: routePath.WITHDRAWAL_MANAGER,
        routes: [routePath.WITHDRAWAL_MANAGER],
      },
    ],
    [],
  );

  if (!isLogin) return null;
  return (
    <Drawer
      open
      sx={{
        width: DRAWER_SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          height: `calc(100% - ${APP_BAR_HEIGHT}px)`,
          position: 'relative',
        },
      }}
      variant="persistent"
      anchor="left"
    >
      <List
        sx={{
          py: 2,
        }}
      >
        {SidebarConfig.map(item => (
          <SidebarItem
            key={item.label}
            active={item.routes.includes(location.pathname)}
            label={item.label}
            nameIcon={item.nameIcon}
            nameHoverIcon={item.nameHoverIcon}
            onClick={() => navigate(item.href)}
          />
        ))}
      </List>
    </Drawer>
  );
}

export default MuiSideBar;

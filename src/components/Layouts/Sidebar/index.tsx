import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Box from '@mui/material/Box';
import { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DRAWER_SIDEBAR_WIDTH, DRAWER_SIDEBAR_WIDTH_CLOSE, APP_BAR_HEIGHT } from '../constants';
import SidebarItem from './SidebarItem';
import { Theme, CSSObject, styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import Divider from '@mui/material/Divider';
import { SvgName } from '@/components/Icons';
import { Role, routePath } from '@/routes/routePath';
import { toggleOpenDrawer, selectOpenDrawer } from '@/stores/appSlice';
import { useAppDispatch, useTypedSelector } from '@/hooks/useStore';
import { getRole } from '@/utils/common';

const openedMixin = (theme: Theme): CSSObject => ({
  width: DRAWER_SIDEBAR_WIDTH,
  top: APP_BAR_HEIGHT,
  height: `calc(100vh - ${APP_BAR_HEIGHT}px)`,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
  border: 'none',
});

const closedMixin = (theme: Theme): CSSObject => ({
  top: APP_BAR_HEIGHT,
  height: `calc(100vh - ${APP_BAR_HEIGHT}px)`,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: DRAWER_SIDEBAR_WIDTH_CLOSE,
  border: 'none',
  [theme.breakpoints.up('sm')]: {
    width: DRAWER_SIDEBAR_WIDTH_CLOSE,
  },
});

interface SidebarConfigItem {
  permission: string;
  label: string;
  nameIcon: SvgName;
  nameHoverIcon: SvgName;
  href: string;
  routes?: string[];
  divider?: boolean;
}

const MuiDrawer = styled(Drawer, { shouldForwardProp: prop => prop !== 'open' })(({ theme, open }) => ({
  width: DRAWER_SIDEBAR_WIDTH,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  '& .MuiPaper-root': {
    display: 'flex',
    justifyContent: 'space-between',
  },
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme),
  }),
}));

function MuiSideBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();
  const openDrawer = useTypedSelector(selectOpenDrawer);
  const roles = getRole();
  const SidebarConfig = useMemo<Array<SidebarConfigItem>>(
    () => [
      {
        permission: Role.METRICADMIN,
        label: window.T('Browser Metric'),
        nameIcon: 'browser-metric',
        nameHoverIcon: 'browser-metric',
        href: routePath.BROWSER_METRIC,
        routes: [routePath.BROWSER_METRIC, routePath.HOME],
      },
      {
        permission: Role.AFFILIATEADMIN,
        label: window.T('Affiliate Overview'),
        nameIcon: 'dashboard',
        nameHoverIcon: 'dashboard',
        href: routePath.OVERVIEW,
        divider: true,
      },
      {
        permission: Role.AFFILIATEADMIN,
        label: window.T('User Detail'),
        nameIcon: 'user-group',
        nameHoverIcon: 'user-group',
        href: routePath.USER_DETAIL,
      },
      {
        permission: Role.AFFILIATEADMIN,
        label: window.T('Withdrawal Requests'),
        nameIcon: 'wallet',
        nameHoverIcon: 'wallet',
        href: routePath.WITHDRAWAL_REQUESTS,
      },
      {
        permission: Role.AFFILIATEADMIN,
        label: window.T('Payouts'),
        nameIcon: 'payouts',
        nameHoverIcon: 'payouts',
        href: routePath.PAYOUTS,
      },
      {
        permission: Role.ADBLOCKADMIN,
        label: window.T('Adblock'),
        nameIcon: 'adblock',
        nameHoverIcon: 'adblock',
        href: routePath.ADBLOCK,
      },
      {
        permission: Role.ADMIN,
        label: window.T('User Management'),
        nameIcon: 'userManagement',
        nameHoverIcon: 'userManagement',
        href: routePath.USER_MANAGEMENT,
      },
      {
        permission: Role.WALLETADMIN,
        label: window.T('Token Management'),
        nameIcon: 'tokenManagement',
        nameHoverIcon: 'tokenManagement',
        href: routePath.TOKEN_MANAGEMENT,
      },
      {
        permission: Role.WALLETADMIN,
        label: window.T('Chain Management'),
        nameIcon: 'chainManagement',
        nameHoverIcon: 'chainManagement',
        href: routePath.CHAIN_MANAGEMENT,
      },
      {
        permission: Role.ADBLOCKADMIN,
        label: window.T('Threat Management'),
        nameIcon: 'web',
        nameHoverIcon: 'web',
        href: routePath.THREAT_MANAGEMENT,
      },
    ],
    [],
  );

  return (
    <MuiDrawer open={openDrawer} variant="permanent">
      <List>
        {SidebarConfig.map(
          (item, index) =>
            (!item.permission || roles.includes(item.permission)) &&
            (item.divider ? (
              <div key={index}>
                <Divider
                  sx={{
                    my: 2,
                  }}
                />
                <SidebarItem
                  key={item.label}
                  openDrawer={openDrawer}
                  active={
                    (item.routes || [item.href]).includes(pathname) ||
                    (item.href.length > 1 && pathname.startsWith(item.href))
                  }
                  label={item.label}
                  nameIcon={item.nameIcon}
                  nameHoverIcon={item.nameHoverIcon}
                  onClick={() => navigate(item.href)}
                />
              </div>
            ) : (
              <SidebarItem
                key={item.label}
                openDrawer={openDrawer}
                active={
                  (item.routes || [item.href]).includes(pathname) ||
                  (item.href.length > 1 && pathname.startsWith(item.href))
                }
                label={item.label}
                nameIcon={item.nameIcon}
                nameHoverIcon={item.nameHoverIcon}
                onClick={() => navigate(item.href)}
              />
            )),
        )}
      </List>
      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          right: 0,
          left: 0,
          height: 40,
          backgroundColor: '#fff',
          '& button': {
            width: '100%',
          },
          '& svg': {
            fontSize: 20,
          },
        }}
      >
        <Divider />
        <IconButton onClick={() => dispatch(toggleOpenDrawer())}>
          {openDrawer ? <KeyboardDoubleArrowLeftIcon /> : <KeyboardDoubleArrowRightIcon />}
        </IconButton>
      </Box>
    </MuiDrawer>
  );
}

export default MuiSideBar;

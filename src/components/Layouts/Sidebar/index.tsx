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
import { routePath } from '@/routes/routePath';
import { toggleOpenDrawer, selectOpenDrawer } from '@/stores/appSlice';
import { useAppDispatch, useTypedSelector } from '@/hooks/useStore';

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

  const SidebarConfig = useMemo<Array<SidebarConfigItem>>(
    () => [
      {
        label: window.T('Browser Metric'),
        nameIcon: 'browser-metric',
        nameHoverIcon: 'browser-metric-white',
        href: routePath.BROWSER_METRIC,
        routes: [routePath.BROWSER_METRIC, routePath.HOME],
      },
      {
        label: window.T('Affiliate Overview'),
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
        label: window.T('Withdrawal Requests'),
        nameIcon: 'wallet',
        nameHoverIcon: 'wallet-white',
        href: routePath.WITHDRAWAL_REQUESTS,
      },
      {
        label: window.T('Payouts'),
        nameIcon: 'payouts',
        nameHoverIcon: 'payouts-white',
        href: routePath.PAYOUTS,
      },
    ],
    [],
  );

  return (
    <MuiDrawer open={openDrawer} variant="permanent">
      <List>
        {SidebarConfig.map((item, index) =>
          item.divider ? (
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
          ),
        )}
      </List>
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          left: 0,
          height: 40,
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

import AppBar from '@/components/Layouts/AppBar';
import { APP_BAR_HEIGHT, DRAWER_SIDEBAR_WIDTH, DRAWER_SIDEBAR_WIDTH_CLOSE } from '@/components/Layouts/constants';
import { useTypedSelector } from '@/hooks/useStore';
import { selectOpenDrawer } from '@/stores/appSlice';
import MuiContainer from '@mui/material/Container';
import { styled } from '@mui/material/styles';
import { FC, ReactNode } from 'react';
import MuiSideBar from './Sidebar';

const Main = styled('main', { shouldForwardProp: prop => prop !== 'open' })<{
  open?: boolean;
}>(() => ({
  flexGrow: 1,
  display: 'flex',
  marginTop: APP_BAR_HEIGHT,
  backgroundColor: '#EEF1F5',
}));

const MainLayout: FC<{ children: ReactNode }> = ({ children }) => {
  const openDrawer = useTypedSelector(selectOpenDrawer);

  return (
    <div>
      <AppBar />
      <Main>
        <MuiSideBar />
        <MuiContainer
          maxWidth={false}
          sx={theme => ({
            padding: '0px !important',
            minHeight: `calc(100vh - ${APP_BAR_HEIGHT}px)`,
            width: {
              xs: `calc(100vw - ${DRAWER_SIDEBAR_WIDTH_CLOSE}px)`,
              md: `calc(100vw - ${openDrawer ? DRAWER_SIDEBAR_WIDTH : DRAWER_SIDEBAR_WIDTH_CLOSE}px)`,
            },
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            position: 'absolute',
            right: '0px',
            backgroundColor: '#EEF1F5',
          })}
        >
          {children}
        </MuiContainer>
      </Main>
    </div>
  );
};

export default MainLayout;

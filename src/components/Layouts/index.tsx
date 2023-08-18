import { ReactNode, FC } from 'react';
import MuiContainer from '@mui/material/Container';
import { styled } from '@mui/material/styles';
import AppBar from '@/components/Layouts/AppBar';
import MuiSideBar from './Sidebar';
import { APP_BAR_HEIGHT, DRAWER_SIDEBAR_WIDTH_CLOSE } from '@/components/Layouts/constants';

const Main = styled('main', { shouldForwardProp: prop => prop !== 'open' })<{
  open?: boolean;
}>(() => ({
  flexGrow: 1,
  display: 'flex',
  marginTop: APP_BAR_HEIGHT,
  backgroundColor: '#EEF1F5',
}));

const MainLayout: FC<{ children: ReactNode }> = ({ children }) => (
  <div>
    <AppBar />
    <Main>
      <MuiSideBar />
      <MuiContainer
        maxWidth={false}
        sx={{
          padding: '0px !important',
          minHeight: `calc(100vh - ${APP_BAR_HEIGHT}px)`,
          maxWidth: `calc(100vw - ${DRAWER_SIDEBAR_WIDTH_CLOSE}px)`,
          position: 'relative',
        }}
      >
        {children}
      </MuiContainer>
    </Main>
  </div>
);

export default MainLayout;

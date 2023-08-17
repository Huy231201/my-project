import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CardMedia from '@mui/material/CardMedia';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import LogoPng from '@/assets/images/logo.png';
import HerondIcon from '@/components/Icons';
import { ConfirmButton } from '@/components/Buttons';
import { getAccessToken } from '@/utils/common';
import { LocalStorage, SessionStorage } from '@/utils/storages';
import { APP_BAR_HEIGHT } from '../constants';

function ResponsiveAppBar() {
  const navigate = useNavigate();
  const isLogin = !!getAccessToken();

  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const [anchorElLanguage, setAnchorElLanguage] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorElLanguage);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElLanguage(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorElLanguage(null);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogin = async () => {
    window.open(`${import.meta.env.VITE_API_URL}/auth/login`, '_self');
  };

  const handleNavigateDashboard = () => {
    navigate('/');
    handleCloseUserMenu();
  };

  const handleLogout = () => {
    LocalStorage.clearAll();
    SessionStorage.clearAll();
    handleCloseUserMenu();
    navigate('/login');
  };

  const settings = [
    {
      label: 'Dashboard',
      onClick: handleNavigateDashboard,
    },
    {
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: 'white',
        borderBottom: '1px solid #DCE0E3',
        height: APP_BAR_HEIGHT,
        position: 'fixed',
        zIndex: 1,
        top: 0,
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          height: '100%',
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            height: '100%',
          }}
        >
          <Box
            onClick={() => navigate('/')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            <CardMedia
              image={LogoPng}
              component="img"
              height={44}
              sx={{
                objectFit: 'contain',
              }}
            />
            <Typography
              variant="body1"
              noWrap
              sx={{
                mt: '6px',
                fontSize: '2.4rem',
                fontWeight: 400,
                color: '#7A818C',
                textDecoration: 'none',
                overflow: 'visible',
                pl: 1,
              }}
            >
              Portal
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5,
            }}
          >
            <Button
              id="basic-button"
              sx={{
                border: 'none',
                mr: 1,
              }}
              aria-controls={anchorElLanguage ? 'menu-language' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              endIcon={<HerondIcon name="arrow-down" />}
              onClick={handleClick}
            >
              EN
            </Button>
            <Menu
              id="menu-language"
              anchorEl={anchorElLanguage}
              open={Boolean(anchorElLanguage)}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'basic-button',
              }}
            >
              <MenuItem onClick={handleClose}>VI</MenuItem>
              <MenuItem onClick={handleClose}>EN</MenuItem>
            </Menu>
            {isLogin ? (
              <>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt="H" />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="user-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  {settings.map(setting => (
                    <MenuItem key={setting.label} onClick={setting.onClick}>
                      <Typography textAlign="center">{setting.label}</Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </>
            ) : (
              <ConfirmButton type="button" label={window.T('Login')} sx={{ mr: 1 }} onClick={handleLogin} />
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;

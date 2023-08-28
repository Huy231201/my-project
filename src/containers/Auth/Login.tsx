import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import queryString from 'query-string';
import { LocalStorage } from '@/utils/storages';
import AxiosCustom, { CustomAxiosRequestConfig } from '@/services/axios';
import { getAccessToken, setCredential } from '@/utils/common';
import Modal, { DialogActions, DialogContent } from '@/components/Modal';
import HerondIcon from '@/components/Icons';
import Stack from '@mui/material/Stack';
import { CancelButton } from '@/components/Buttons';

function LoginContainer() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = queryString.parse(search) || {};
  const [isLoading, setIsLoading] = useState(false);
  const [errorContent, setErrorContent] = useState<string | null>(null);

  const handleCloseModal = () => {
    setErrorContent(null);
  };

  useEffect(() => {
    const isLogin = !!getAccessToken();
    if (params?.accessToken && !isLogin) {
      setIsLoading(true);
      AxiosCustom.get('/auth/token', {
        headers: {
          Authorization: `Bearer ${params?.accessToken}`,
        },
        showToast: false,
      } as CustomAxiosRequestConfig)
        .then(res => {
          setCredential(res?.data);
          setIsLoading(false);
          navigate('/');
        })
        .catch(error => {
          LocalStorage.clearAll();
          const message = error?.detail || window.T('Something went wrong. Please try again later.');
          setIsLoading(false);
          setErrorContent(message);
        });
    }
  }, []);

  return (
    <Paper
      sx={{
        height: '100%',
        margin: 'auto',
        boxShadow: 'none',
        textAlign: 'center',
        py: 12,
        borderRadius: 0,
        backgroundColor: 'transparent',
      }}
    >
      <Typography variant="h3">{window.T('Please login first')}</Typography>

      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(1px)',
            backgroundColor: 'rgba(0,0,0,0.01)',
          }}
        >
          <CircularProgress />
        </Box>
      )}
      <Modal
        hiddenCloseIcon
        open={!!errorContent}
        title={
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#dc2625',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '& svg': {
                  width: '16px',
                  height: '16px',
                },
              }}
            >
              <HerondIcon name="close-white" />
            </Box>
            <Typography variant="h4" color="#dc2625">
              {window.T('Login Failed!!!')}
            </Typography>
          </Stack>
        }
        onClose={handleCloseModal}
        sxWrapper={{
          '& .MuiDialog-paper': {
            margin: '16px',
            p: 2,
            maxWidth: {
              xs: '100%',
              md: '380px',
            },
            width: '100%',
          },
        }}
      >
        <DialogContent
          sx={{
            border: 'none',
          }}
          dividers
        >
          <Typography variant="body1">{errorContent}</Typography>
        </DialogContent>
        <DialogActions>
          <CancelButton
            type="submit"
            label={window.T('Close')}
            onClick={handleCloseModal}
            sx={{
              border: 'none !important',
            }}
          />
        </DialogActions>
      </Modal>
    </Paper>
  );
}
export default LoginContainer;

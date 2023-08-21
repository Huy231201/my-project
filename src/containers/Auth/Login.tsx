import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import queryString from 'query-string';
import { LocalStorage } from '@/utils/storages';
import AxiosCustom from '@/services/axios';
import { getAccessToken, setCredential } from '@/utils/common';

function LoginContainer() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = queryString.parse(search) || {};
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const isLogin = !!getAccessToken();
    if (params?.accessToken && !isLogin) {
      setIsLoading(true);
      AxiosCustom.get('/auth/token', {
        headers: {
          Authorization: `Bearer ${params?.accessToken}`,
        },
      })
        .then(res => {
          setCredential(res?.data);
          setIsLoading(false);
          navigate('/');
        })
        .catch(() => {
          LocalStorage.clearAll();
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

      <div>aaa {import.meta.env.VITE_API_URL}</div>

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
    </Paper>
  );
}
export default LoginContainer;

import React, { useState, useEffect } from 'react';
import MuiContainer from '@mui/material/Container';
import { SxProps, Theme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

type Props = {
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  sx?: SxProps<Theme>;
  loading?: boolean;
};

const Container = (props: Props) => {
  const { children, maxWidth = false, sx, loading = false } = props;
  const [containerLoading, setContainerLoading] = useState<boolean>(loading);

  useEffect(() => {
    if (containerLoading !== loading) {
      setContainerLoading(loading);
    }
    setTimeout(() => {
      setContainerLoading(false);
    }, 5000);
  }, [loading]);

  return (
    <MuiContainer
      maxWidth={maxWidth}
      sx={{
        py: 3,
        position: 'relative',
        ...sx,
      }}
    >
      {containerLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 9999,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(1px)',
            backgroundColor: 'rgba(255,255,255,0.4)',
          }}
        >
          <CircularProgress />
        </Box>
      )}
      {children}
    </MuiContainer>
  );
};
export default Container;

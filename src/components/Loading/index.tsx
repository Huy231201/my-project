import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

interface Props {
  loading: boolean;
}

export default function CircularIndeterminate(props: Props) {
  const { loading } = props;
  if (loading) {
    return (
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
    );
  }
  return <></>;
}

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { SearchInputField, DateRangePicker } from '@/components/Fields';
import Grid from '@mui/material/Grid';
import { SimpleCard, CardHeader } from '@/components/Card';
import { SimpleCardProps } from '@/components/Card/types';
import { useMemo } from 'react';
import ListItemText from '@mui/material/ListItemText';
import { styled } from '@mui/material/styles';
import Link from '@mui/material/Link';
import HerondTable from '@/components/Table';
import StatusLabel from '@/components/StatusLabel';
// import NotFound from '@/components/NotFound';
import {
  rowsUserHeadCells,
  UserHeadCells,
  rowsRegionCell,
  RegionHeadCell,
  rowsChanelCell,
  ChanelHeadCell,
} from './dumpData';

const MuiListItemText = styled(ListItemText)({
  display: 'flex',
  alignItems: 'center',
  '& .MuiListItemText-primary': {
    fontSize: 16,
    fontWeight: 500,
  },
  '& .MuiListItemText-secondary': {
    paddingLeft: 4,
    fontSize: 16,
    fontWeight: 400,
    color: '#202226',
    '& a': {
      color: '#202226',
      '&:hover': {
        textDecoration: 'none',
      },
    },
  },
});

interface CardType extends SimpleCardProps {
  id: number;
}

function UserDetailContainer() {
  const CardData = useMemo<CardType[]>(
    () => [
      {
        id: 1,
        label: 'Recruited User',
        icon: 'user-group-orange',
        content: '42,324',
      },
      {
        id: 2,
        label: 'Valid User',
        icon: 'user',
        content: '23,126',
      },
      {
        id: 3,
        label: 'Earned Money',
        subLabel: '(USDT)',
        icon: 'dollar',
        content: '2,312.6',
      },
      {
        id: 4,
        label: 'Balance',
        subLabel: '(USDT)',
        icon: 'receive',
        content: '342.7',
      },
    ],
    [],
  );

  const withDrawalData = useMemo(
    () =>
      rowsRegionCell().map((item: any) => ({
        ...item,
        status: <StatusLabel status={item.status} />,
      })),
    [],
  );

  return (
    <Container
      maxWidth={false}
      sx={{
        height: '100%',
        py: 3,
      }}
    >
      <Typography variant="h3">{window.T('Affiliate user details')}</Typography>
      <Box
        mt={2}
        mb={4}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <SearchInputField placeholder={window.T('Enter user email')} />
        <Box>
          <DateRangePicker />
        </Box>
      </Box>
      <Box
        my={2}
        sx={{
          backgroundColor: '#fff',
          borderRadius: 1,
          p: 4,
        }}
      >
        <CardHeader label={window.T('User information')} icon="user" />
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <MuiListItemText
              primary={`${window.T('Email')}:`}
              secondary={
                <Link component="a" href="mailto:blockbase@gmail.com.hrd">
                  blockbase@gmail.com.hrd
                </Link>
              }
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <MuiListItemText primary={`${window.T('Join Date')}:`} secondary="14:32:23 25/05/2023" />
          </Grid>
          <Grid item xs={12} md={6}>
            <MuiListItemText primary={`${window.T('Wallet Address')}:`} secondary="0xb5ba48...4F2ACc" />
          </Grid>
          <Grid item xs={12} md={6}>
            <MuiListItemText primary={`${window.T('Wallet Creation Date')}:`} secondary="10:23:24 13/05/2023" />
          </Grid>
        </Grid>
      </Box>
      <Box my={4}>
        <Grid
          container
          spacing={2}
          sx={{
            mt: '-16px !important',
          }}
        >
          {CardData.map(item => (
            <Grid key={item.id} item xs={12} md={6} lg={3}>
              <SimpleCard label={item.label} subLabel={item?.subLabel} icon={item.icon} content={item.content} />
            </Grid>
          ))}
        </Grid>
      </Box>
      <Box
        mt={4}
        sx={{
          backgroundColor: '#fff',
          borderRadius: 1,
          p: 4,
        }}
      >
        <Stack pb={3} direction="row" justifyContent="space-between">
          <Typography variant="h4">{window.T('Recruited User History')}</Typography>
          <Typography variant="body1">255 items</Typography>
        </Stack>
        <HerondTable headCells={UserHeadCells} rows={rowsUserHeadCells()} />
      </Box>
      <Box
        mt={2}
        sx={{
          backgroundColor: '#fff',
          borderRadius: 1,
          p: 4,
        }}
      >
        <Stack pb={3} direction="row" justifyContent="space-between">
          <Typography variant="h4">{window.T('Withdrawal History')}</Typography>
          <Typography variant="body1">134 items</Typography>
        </Stack>
        <HerondTable headCells={RegionHeadCell} rows={withDrawalData} />
      </Box>
      <Box
        mt={4}
        mb={2}
        sx={{
          backgroundColor: '#fff',
          borderRadius: 1,
          p: 4,
        }}
      >
        <Stack pb={3} direction="row" justifyContent="space-between">
          <Typography variant="h4">{window.T('Link List')}</Typography>
          <Typography variant="body1">143 items</Typography>
        </Stack>
        <HerondTable headCells={ChanelHeadCell} rows={rowsChanelCell()} />
      </Box>
      {/* <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <NotFound label={window.T('No matching results found')} />
      </Box> */}
    </Container>
  );
}

export default UserDetailContainer;

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { SearchInputField, DateRangePicker } from '@/components/Fields';
import Grid from '@mui/material/Grid';
import { SimpleCard, CardHeader } from '@/components/Card';
import { SimpleCardProps } from '@/components/Card/types';
import { useMemo, useState, useEffect } from 'react';
import ListItemText from '@mui/material/ListItemText';
import { styled } from '@mui/material/styles';
import Link from '@mui/material/Link';
import dayjs from 'dayjs';
import {
  useGetUserFromEmailQuery,
  useGetUserInfoQuery,
  useGetUserOverviewQuery,
  useGetUserBalanceQuery,
  useGetUserRecruitedQuery,
  useGetUserWithdrawHistoryQuery,
  useGetUserCodeQuery,
} from '@/services/user-detail';
import { validateEmail } from '@/utils/common';
import NotFound from '@/components/NotFound';
import Loading from '@/components/Loading';
import UserInfoContent from './UserInfoContent';
import UserTable from './UserTable';

import { UserHeadCells, RegionHeadCell, ChanelHeadCell } from './config';

const PAGE_SIZE = 10;

const MuiListItemText = styled(ListItemText)({
  display: 'flex',
  alignItems: 'center',
  margin: 4,
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

interface FilterProps {
  searchEmail: string;
  dateRange: Array<Date | null>;
}

function UserDetailContainer() {
  const [filter, setFilter] = useState<FilterProps>({
    searchEmail: '',
    dateRange: [dayjs().startOf('month').toDate(), new Date()],
  });
  const [userId, setUserId] = useState<string>('');
  const [pageIndex, setPageIndex] = useState({
    recruited: 1,
    withdrawal: 1,
    link: 1,
  });
  const { data: dataGetUserFromEmail, isFetching: isFetchingGetUserFromEmail } = useGetUserFromEmailQuery(
    {
      email: filter.searchEmail,
    },
    {
      skip: !filter.searchEmail,
    },
  );
  const { data: userInfo, isFetching: isFetchUserInfo } = useGetUserInfoQuery(
    {
      id: userId,
    },
    {
      skip: !userId,
    },
  );

  const { data: overviewData } = useGetUserOverviewQuery(
    {
      id: userId,
    },
    {
      skip: !userId,
    },
  );

  const { data: balanceData } = useGetUserBalanceQuery(
    {
      id: userId,
    },
    {
      skip: !userId,
    },
  );

  useEffect(() => {
    if (!isFetchingGetUserFromEmail && dataGetUserFromEmail) {
      const url = dataGetUserFromEmail?.[0]?.href || '';
      const newUserId = url.split('/')[url.split('/').length - 2];
      if (newUserId) {
        setUserId(newUserId);
      }
    }
  }, [isFetchingGetUserFromEmail, dataGetUserFromEmail]);

  const CardData = useMemo<CardType[]>(
    () => [
      {
        id: 1,
        label: window.T('Recruited User'),
        icon: 'user-group-orange',
        content: overviewData?.totalRecruited || 0,
      },
      {
        id: 2,
        label: window.T('Valid User'),
        icon: 'user',
        content: overviewData?.toTalValid || 0,
      },
      {
        id: 3,
        label: window.T('Earned Money'),
        subLabel: window.T('(USDT)'),
        icon: 'dollar',
        content: overviewData?.totalEarned || 0,
      },
      {
        id: 4,
        label: window.T('Balance'),
        subLabel: window.T('(USDT)'),
        icon: 'receive',
        content: balanceData?.data,
      },
    ],
    [overviewData, balanceData],
  );

  const onChangeDateRange = (dateRange: Array<Date | null>) => {
    if (dateRange[0] && dateRange[1]) {
      setFilter(prev => ({
        ...prev,
        dateRange,
      }));
    }
  };

  const handleSearchUserEmail = (searchText: string) => {
    if (searchText) {
      setFilter(prev => ({
        ...prev,
        searchEmail: searchText,
      }));
    }
  };

  const handleChangePage = (type: string) => (page: number) => {
    setPageIndex(prev => ({
      ...prev,
      [type]: page,
    }));
  };

  const renderContent = () => {
    if (isFetchingGetUserFromEmail) {
      return <Loading loading={isFetchingGetUserFromEmail} />;
    }

    if (dataGetUserFromEmail === undefined) {
      return null;
    }

    if (dataGetUserFromEmail?.success === false) {
      return (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <NotFound label={window.T('No matching results found')} />
        </Box>
      );
    }

    return (
      <Box>
        <Box
          my={2}
          sx={{
            backgroundColor: '#fff',
            borderRadius: 1,
            p: 4,
          }}
        >
          <CardHeader label={window.T('User information')} icon="user" />
          <Grid mt={2} container>
            <Grid item xs={12} md={6}>
              <MuiListItemText
                primary={`${window.T('Email')}:`}
                secondary={
                  <Link component="a" href={`mailto:${userInfo?.email}`}>
                    <UserInfoContent loading={isFetchUserInfo} content={userInfo?.email} />
                  </Link>
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MuiListItemText
                primary={`${window.T('Wallet Address')}:`}
                secondary={<UserInfoContent loading={isFetchUserInfo} content={userInfo?.walletAddress} />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MuiListItemText
                primary={`${window.T('Join Date')}:`}
                secondary={
                  <UserInfoContent
                    loading={isFetchUserInfo}
                    content={userInfo?.joinDate ? dayjs(userInfo?.joinDate).format('HH:mm:ss DD/MM/YYYY') : ''}
                  />
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MuiListItemText
                primary={`${window.T('Wallet Creation Date')}:`}
                content={userInfo?.joinDate ? dayjs(userInfo?.walletCreationTime).format('HH:mm:ss DD/MM/YYYY') : ''}
              />
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
        <UserTable
          headCells={UserHeadCells}
          title={window.T('Recruited User History') || ''}
          useApi={useGetUserRecruitedQuery}
          params={{
            id: userId,
            startDate: dayjs(filter.dateRange[0]).format('YYYY-MM-DD'),
            endDate: dayjs(filter.dateRange[1]).format('YYYY-MM-DD'),
            pageIndex: pageIndex.recruited,
            pageSize: PAGE_SIZE,
          }}
          skip={!userId}
          onChangePage={handleChangePage('recruited')}
        />
        <UserTable
          headCells={RegionHeadCell}
          title={window.T('Withdrawal History')}
          useApi={useGetUserWithdrawHistoryQuery}
          params={{
            id: userId,
            startDate: dayjs(filter.dateRange[0]).format('YYYY-MM-DD'),
            endDate: dayjs(filter.dateRange[1]).format('YYYY-MM-DD'),
            pageIndex: pageIndex.withdrawal,
            pageSize: PAGE_SIZE,
          }}
          skip={!userId}
          onChangePage={handleChangePage('withdrawal')}
        />
        <UserTable
          headCells={ChanelHeadCell}
          title={window.T('Link List')}
          useApi={useGetUserCodeQuery}
          params={{
            id: userId,
            startDate: dayjs(filter.dateRange[0]).format('YYYY-MM-DD'),
            endDate: dayjs(filter.dateRange[1]).format('YYYY-MM-DD'),
            pageIndex: pageIndex.link,
            pageSize: PAGE_SIZE,
          }}
          skip={!userId}
          onChangePage={handleChangePage('link')}
        />
      </Box>
    );
  };

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
        <SearchInputField
          placeholder={window.T('Enter user email')}
          sx={{
            minWidth: {
              xs: '100%',
              md: 400,
            },
          }}
          validate={validateEmail}
          msgError={window.T('Email is invalid')}
          onSubmit={handleSearchUserEmail}
        />
        {dataGetUserFromEmail?.length > 0 && (
          <Box>
            <DateRangePicker value={filter.dateRange} onChange={onChangeDateRange} maxDate={new Date()} />
          </Box>
        )}
      </Box>
      {renderContent()}
    </Container>
  );
}

export default UserDetailContainer;

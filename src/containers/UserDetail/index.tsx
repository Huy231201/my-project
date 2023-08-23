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
import Container from '@/components/Container';

import { RecruitedHeadTable, WithdrawalHistoryHeadTable, LinkListHeadTable } from './config';

const PAGE_SIZE = 10;

const MuiListItemText = styled(ListItemText)({
  display: 'flex',
  flexFlow: 'wrap',
  alignItems: 'start',
  margin: 4,
  '& .MuiListItemText-primary': {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  '& .MuiListItemText-secondary': {
    paddingLeft: 4,
    fontSize: 16,
    fontWeight: 400,
    color: '#202226',
    lineBreak: 'anywhere',
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

  const { data: overviewData, isFetching: isFetchingOverview } = useGetUserOverviewQuery(
    {
      id: userId,
    },
    {
      skip: !userId,
    },
  );

  const { data: balanceData, isFetching: isFetchingBalance } = useGetUserBalanceQuery(
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
        loading: isFetchingOverview,
        content: overviewData?.totalRecruited || 0,
      },
      {
        id: 2,
        label: window.T('Valid User'),
        icon: 'user',
        loading: isFetchingOverview,
        content: overviewData?.toTalValid || 0,
      },
      {
        id: 3,
        label: window.T('Earned Money'),
        subLabel: window.T('(USDT)'),
        icon: 'dollar',
        loading: isFetchingOverview,
        content: overviewData?.totalEarned || 0,
      },
      {
        id: 4,
        label: window.T('Balance'),
        subLabel: window.T('(USDT)'),
        icon: 'receive',
        loading: isFetchingBalance,
        content: balanceData || 0,
      },
    ],
    [overviewData, balanceData, isFetchingOverview, isFetchingBalance],
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
            p: {
              xs: 2,
              sm: 3,
              md: 4,
            },
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
                    content={userInfo?.joinDate ? dayjs(userInfo?.joinDate).format('HH:mm:ss MM/DD/YYYY') : ''}
                  />
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MuiListItemText
                primary={`${window.T('Wallet Creation Date')}:`}
                secondary={
                  <UserInfoContent
                    loading={isFetchUserInfo}
                    content={
                      userInfo?.walletCreationTime
                        ? dayjs(userInfo?.walletCreationTime).format('HH:mm:ss MM/DD/YYYY')
                        : ''
                    }
                  />
                }
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
                <SimpleCard
                  label={item.label}
                  subLabel={item?.subLabel}
                  icon={item.icon}
                  loading={item.loading}
                  content={item.content}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
        {dataGetUserFromEmail?.length > 0 && (
          <Box
            sx={{
              mt: 6,
              mb: -2,
            }}
          >
            <DateRangePicker value={filter.dateRange} onChange={onChangeDateRange} maxDate={new Date()} />
          </Box>
        )}
        <UserTable
          headCells={RecruitedHeadTable}
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
          headCells={WithdrawalHistoryHeadTable}
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
          headCells={LinkListHeadTable}
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
      sx={{
        height: '100%',
        py: 3,
      }}
    >
      <Typography variant="h3">{window.T('Affiliate user details')}</Typography>
      <Box
        mt={2}
        mb={2}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          flexDirection: {
            xs: 'column',
            md: 'row',
          },
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
      </Box>
      {renderContent()}
    </Container>
  );
}

export default UserDetailContainer;

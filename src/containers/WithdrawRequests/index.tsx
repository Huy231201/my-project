import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import HerondTable from '@/components/Table';
import StatusLabel, { StatusEnum } from '@/components/StatusLabel';
import { WithdrawRequestHeadTable, rowsRegionCell, StatusOptions } from './config';
import { useMemo, useState, MouseEvent } from 'react';
import { SelectField, SearchInputField, DateRangePicker } from '@/components/Fields';
import Button from '@mui/material/Button';
import BulkAction from '@/components/BulkAction';
import dayjs from 'dayjs';
import { validateEmail } from '@/utils/common';
import Link from '@mui/material/Link';
import { useNavigate } from 'react-router-dom';
import Modal, { DialogActions, DialogContent } from '@/components/Modal';
import { CancelButton } from '@/components/Buttons';
import { styled } from '@mui/material/styles';
import HerondIcon from '@/components/Icons';
import { useGetWithdrawQuery } from '@/services/withdraw';

interface FilterProps {
  searchEmail: string;
  dateRange: Array<Date | null>;
  status: StatusEnum | string;
  sortBy: string;
  sortDirection: 0 | 1;
  page: number;
  pageSize: number;
}

const ButtonAction = styled(Button)({
  border: 'none',
  fontSize: '14px',
  fontWeight: 400,
  color: '#32373D',
  margin: 'auto',
  minWidth: '0px !important',
  minHeight: '0px !important',
  '&:hover, &:active': {
    background: 'transparent',
  },
});

function WithdrawRequestsContainer() {
  const navigate = useNavigate();
  const [showModalReject, setShowModalReject] = useState<boolean>(false);
  const [selected, setSelected] = useState<Array<string | number>>([]);
  const [filter, setFilter] = useState<FilterProps>({
    searchEmail: '',
    dateRange: [dayjs().startOf('month').toDate(), new Date()],
    status: '',
    sortBy: '',
    sortDirection: 1,
    page: 1,
    pageSize: 10,
  });

  // const { data, isFetching } = useGetWithdrawQuery({
  //   startDate: dayjs(filter.dateRange[0]).format('YYYY-MM-DD'),
  //   endDate: dayjs(filter.dateRange[1]).format('YYYY-MM-DD'),
  //   Email: filter.searchEmail,
  //   status: filter.status,
  //   SortBy: filter.sortBy,
  //   sortDirection: filter.sortDirection,
  //   pageIndex: filter.page,
  //   pageSize: filter.pageSize,
  // });

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

  const handleOpenDrawerDetail = (id: string) => (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    navigate(`/withdrawal-requests/${id}`);
  };

  const withDrawalData = useMemo(
    () =>
      rowsRegionCell().map((item: any) => ({
        ...item,
        checkbox: !['approved', 'rejected'].includes(item.status.toLowerCase()),
        email: (
          <Link
            component="a"
            href={`mailto:${item?.email}`}
            sx={{
              color: '#0066F4',
            }}
          >
            {item.email}
          </Link>
        ),
        status: <StatusLabel status={item.status} />,
        action: (
          <ButtonAction variant="text" onClick={handleOpenDrawerDetail(item.id)}>
            <HerondIcon name="eye" />
          </ButtonAction>
        ),
      })),
    [],
  );

  const BulkActionOptions = useMemo(
    () => [
      {
        label: window.T('Rejected'),
        onClick: () => setShowModalReject(true),
      },
    ],
    [],
  );

  return (
    <Container
      maxWidth={false}
      sx={{
        py: 3,
        position: 'relative',
      }}
    >
      <Box
        sx={{
          background: '#fff',
          borderRadius: 1.5,
          p: {
            xs: 2,
            sm: 3,
            md: 4,
          },
        }}
      >
        <Box>
          <Typography
            variant="h3"
            sx={{
              fontSize: 20,
            }}
          >
            {window.T('Withdraw Requests')}
          </Typography>
        </Box>
        <Stack
          mt={4}
          mb={1}
          direction={{
            xs: 'column',
            md: 'row',
          }}
          justifyContent="space-between"
        >
          <Stack direction="row">{selected.length > 0 && <BulkAction options={BulkActionOptions} />}</Stack>
          <Stack
            direction={{
              xs: 'column',
              md: 'row',
            }}
            justifyContent="center"
            spacing={1.5}
          >
            <Typography variant="body1">43 items</Typography>
            <Box>
              <DateRangePicker value={filter.dateRange} onChange={onChangeDateRange} maxDate={new Date()} />
            </Box>
            <Box>
              <SearchInputField
                placeholder={window.T('Enter user email')}
                validate={validateEmail}
                msgError={window.T('Email is invalid')}
                onSubmit={handleSearchUserEmail}
              />
            </Box>
            <Box>
              <SelectField value={StatusOptions[0].value} options={StatusOptions} />
            </Box>
          </Stack>
        </Stack>
        <Box
          sx={{
            background: '#fff',
            py: 2,
          }}
        >
          <HerondTable
            checkbox
            pageIndex={1}
            totalPages={2}
            headCells={WithdrawRequestHeadTable}
            rows={withDrawalData}
            selected={selected}
            onSelectRow={setSelected}
            onChangePage={() => {}}
          />
        </Box>
      </Box>
      <Modal
        open={showModalReject}
        title={window.T('Do you want to reject this request?')}
        onClose={() => setShowModalReject(false)}
        sxWrapper={{
          '& .MuiDialog-paper': {
            margin: '16px',
            maxWidth: 480,
          },
        }}
      >
        <DialogContent
          sx={{
            px: 4,
            py: 6,
          }}
          dividers
        >
          <Typography variant="body1" sx={{ mb: 2 }}>
            {window.T(
              'There are {{value}} users in this request. Do you want to reject this request? This action can’t be undone',
              { value: 2 },
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <CancelButton
            type="submit"
            label={window.T('Cancel')}
            onClick={() => setShowModalReject(false)}
            sx={{
              border: 'none !important',
            }}
          />
          <CancelButton type="submit" label={window.T('Reject')} onClick={() => setShowModalReject(false)} />
        </DialogActions>
      </Modal>
    </Container>
  );
}

export default WithdrawRequestsContainer;

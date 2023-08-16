import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import HerondTable from '@/components/Table';
import StatusLabel, { StatusEnum } from '@/components/StatusLabel';
import { RegionHeadCell, rowsRegionCell, StatusOptions } from './dumpData';
import { useMemo, useState, MouseEvent } from 'react';
import { SelectField, SearchInputField, DateRangePicker, InputField } from '@/components/Fields';
import Button from '@mui/material/Button';
import dayjs from 'dayjs';
import { validateEmail } from '@/utils/common';
import Link from '@mui/material/Link';
import { useNavigate } from 'react-router-dom';
import Modal, { DialogActions, DialogContent } from '@/components/Modal';
import { CancelButton, ConfirmButton } from '@/components/Buttons';
import HerondIcon from '@/components/Icons';
import { styled } from '@mui/material/styles';

const ButtonAction = styled(Button)({
  border: 'none',
  fontSize: '14px',
  fontWeight: 400,
  color: '#32373D',
  padding: '0px !important',
  minWidth: 'fit-content !important',
  minHeight: 'fit-content !important',
  '&:hover, &:active': {
    background: 'transparent',
  },
});

interface FilterProps {
  searchEmail: string;
  dateRange: Array<Date | null>;
  status: StatusEnum | string;
}

function WithdrawRequestsContainer() {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [filter, setFilter] = useState<FilterProps>({
    searchEmail: '',
    dateRange: [dayjs().startOf('month').toDate(), new Date()],
    status: '',
  });

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
    navigate(`/payouts/${id}`);
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
            {window.T('Detail')}
          </ButtonAction>
        ),
      })),
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
          p: 4,
          borderRadius: 1.5,
        }}
      >
        <Box>
          <Typography
            variant="h3"
            sx={{
              fontSize: 20,
            }}
          >
            {window.T('Payouts')}
          </Typography>
        </Box>
        <Stack mt={4} mb={1} direction="row" justifyContent="space-between">
          <Stack direction="row">
            <Button
              variant="outlined"
              sx={{
                borderColor: '#298CFD',
                color: '#298CFD',
                minWidth: 80,
              }}
              onClick={() => setShowCreateModal(true)}
            >
              {window.T('Create new payout')}
            </Button>
          </Stack>
          <Stack direction="row" justifyContent="center" spacing={1.5}>
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
          <HerondTable pageIndex={1} totalPages={1} headCells={RegionHeadCell} rows={withDrawalData} />
        </Box>
      </Box>
      <Modal
        open={showCreateModal}
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <HerondIcon name="receive" />
            <Typography variant="h4">{window.T('Create new payout')}</Typography>
          </Stack>
        }
        onClose={() => setShowCreateModal(false)}
        sxWrapper={{
          '& .MuiDialog-paper': {
            margin: '16px',
            px: 2,
            py: 1,
          },
        }}
      >
        <DialogContent
          sx={{
            px: 4,
            py: 6,
            border: 'none',
          }}
          dividers
        >
          <Stack mb={2}>
            <InputField placeholder={window.T('Enter username')} onSubmit={() => {}} />
          </Stack>
          <Stack mt={1} spacing={1} direction="row" alignItems="center">
            <Typography variant="body1" fontWeight={700}>{`${window.T('Total Amount')}:`}</Typography>
            <Typography variant="body1">USDT 6000</Typography>
          </Stack>
          <Stack mt={1} spacing={1} direction="row" alignItems="center">
            <Typography variant="body1" fontWeight={700}>{`${window.T('Withdraw request')}:`}</Typography>
            <Typography variant="body1">255 transactions</Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <CancelButton
            type="submit"
            label={window.T('Cancel')}
            onClick={() => setShowCreateModal(false)}
            sx={{
              minWidth: '120px !important',
            }}
          />
          <ConfirmButton
            type="submit"
            label={window.T('Create')}
            onClick={() => setShowCreateModal(false)}
            sx={{
              minWidth: '120px !important',
            }}
          />
        </DialogActions>
      </Modal>
    </Container>
  );
}

export default WithdrawRequestsContainer;

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import HerondTable from '@/components/Table';
import StatusLabel from '@/components/StatusLabel';
import { RegionHeadCell, rowsRegionCell, StatusOptions } from './dumpData';
import { useMemo, useState } from 'react';
import { SelectField, SearchInputField, DateRangePicker } from '@/components/Fields';
import Button from '@mui/material/Button';
import BulkAction from './BulkAction';

function WithDrawalManagerContainer() {
  const [selected, setSelected] = useState<Array<string | number>>([]);

  const withDrawalData = useMemo(
    () =>
      rowsRegionCell().map((item: any) => ({
        ...item,
        checkbox: !['approved', 'rejected'].includes(item.status.toLowerCase()),
        status: <StatusLabel status={item.status} />,
        action: (
          <Button
            variant="text"
            sx={{
              border: 'none',
              fontSize: '14px',
              fontWeight: 400,
              '&:hover, &:active': {
                background: 'transparent',
              },
            }}
          >
            {window.T('Detail')}
          </Button>
        ),
      })),
    [],
  );

  return (
    <Container
      maxWidth={false}
      sx={{
        py: 3,
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
          <Typography variant="h3">{window.T('Withdraw Requests')}</Typography>
        </Box>
        <Stack mt={4} mb={1} direction="row" justifyContent="space-between">
          <Stack direction="row" spacing={1.5}>
            <BulkAction />
            <Button
              variant="outlined"
              sx={{
                borderColor: '#298CFD',
                color: '#298CFD',
                minWidth: 80,
              }}
            >
              {window.T('Apply')}
            </Button>
          </Stack>
          <Stack direction="row" justifyContent="center" spacing={1.5}>
            <Typography variant="body1">43 items</Typography>
            <Box>
              <DateRangePicker />
            </Box>
            <Box>
              <SearchInputField placeholder={window.T('Enter user email')} />
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
            headCells={RegionHeadCell}
            rows={withDrawalData}
            selected={selected}
            onSelectRow={setSelected}
          />
        </Box>
      </Box>
    </Container>
  );
}

export default WithDrawalManagerContainer;

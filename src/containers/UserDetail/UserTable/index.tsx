import HerondTable from '@/components/Table';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { renderTotal } from '@/utils/common';
import { HeaderCellProps, RowProp } from '@/components/Table/utils';
import { useState, useEffect } from 'react';
import StatusLabel, { StatusEnum } from '@/components/StatusLabel';
interface Params {
  id: string;
  pageIndex: number;
  pageSize: number;
  startDate: string;
  endDate: string;
}

interface RowData extends RowProp {
  status?: StatusEnum;
}

interface Props {
  headCells: readonly HeaderCellProps[];
  title: string;
  useApi: (
    arg1: Params,
    arg2: {
      skip: boolean;
    },
  ) => any;
  params: Params;
  skip: boolean;
  onChangePage: (arg1: number) => void;
}

const UserTable = (props: Props) => {
  const { headCells, title, useApi, params, skip, onChangePage } = props;
  const { data = [], isFetching } = useApi(params, {
    skip,
  });

  const [rows, setRows] = useState<RowProp[]>([]);
  useEffect(() => {
    if (data) {
      const list = Array.isArray(data) ? data : data?.items;
      const newData = (list || []).map((item: RowData, index: number) => ({
        ...item,
        order: index + 1,
        ...(item.status && {
          status: <StatusLabel status={item.status} />,
        }),
      }));
      setRows(newData);
    }
  }, [data]);

  return (
    <Box
      mt={4}
      sx={{
        backgroundColor: '#fff',
        borderRadius: 1,
        p: 4,
      }}
    >
      <Stack pb={3} direction="row" justifyContent="space-between">
        <Typography variant="h4">{title}</Typography>
        <Typography variant="body1">{renderTotal(0, 'item')}</Typography>
      </Stack>
      <HerondTable
        loading={isFetching}
        headCells={headCells}
        rows={rows}
        pageIndex={data?.pageIndex || 1}
        totalPages={data?.totalPages || 1}
        onChangePage={onChangePage}
      />
    </Box>
  );
};

export default UserTable;

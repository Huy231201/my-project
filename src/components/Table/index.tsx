import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import React, { useState, useMemo } from 'react';
import EnhancedTableBody from './EnhancedTableBody';
import EnhancedTableHead from './EnhancedTableHead';
import Pagination from '@/components/Pagination';
import { stableSort, getComparator, Order, HeaderCellProps, RowProp } from './utils';

interface Props {
  headCells: readonly HeaderCellProps[];
  rows: readonly RowProp[];
}

export default function EnhancedTable(props: Props) {
  const { rows, headCells } = props;
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof RowProp>('id');

  const orderHeadCells = useMemo(
    () => stableSort(headCells, getComparator('asc', 'order')),
    [order, orderBy, headCells],
  );

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof RowProp) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <TableContainer>
        <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size="small">
          <EnhancedTableHead
            headCells={orderHeadCells}
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
          />
          <EnhancedTableBody rows={rows} orderHeadCells={orderHeadCells} page={0} order={order} orderBy={orderBy} />
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Pagination />
      </Box>
    </Box>
  );
}

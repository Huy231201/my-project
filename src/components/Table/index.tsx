import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import React, { useState, useMemo } from 'react';
import EnhancedTableBody from './EnhancedTableBody';
import EnhancedTableHead from './EnhancedTableHead';
import Pagination from '@/components/Pagination';
import { stableSort, getComparator, Order, HeaderCellProps, RowProp } from './utils';

type KeyRow = string | number;

interface Props {
  headCells: readonly HeaderCellProps[];
  rows: readonly RowProp[];
  checkbox?: boolean;
  selected?: Array<KeyRow>;
  onSelectRow?: (data: Array<KeyRow>) => void;
}

export default function EnhancedTable(props: Props) {
  const { rows, headCells, checkbox = false, selected = [], onSelectRow } = props;
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

  const handleSelectRow = (event: React.MouseEvent<unknown>, name: KeyRow) => {
    if (onSelectRow) {
      const selectedIndex = selected.indexOf(name);
      let newSelected: Array<KeyRow> = [];

      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, name);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selected.slice(1));
      } else if (selectedIndex === selected.length - 1) {
        newSelected = newSelected.concat(selected.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
      }
      onSelectRow(newSelected);
    }
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectRow) {
      const { checked } = event.target;
      if (checked) {
        const newSelected = rows.map((n: RowProp) => n.id);
        onSelectRow(newSelected);
        return;
      }
      onSelectRow([]);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <TableContainer>
        <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size="small">
          <EnhancedTableHead
            checkbox={checkbox}
            indeterminate={!!selected.length && selected.length < rows.length}
            isSelectAll={selected.length === rows.length}
            headCells={orderHeadCells}
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
            onSelectAllClick={handleSelectAll}
          />
          <EnhancedTableBody
            checkbox={checkbox}
            selected={selected}
            rows={rows}
            orderHeadCells={orderHeadCells}
            page={0}
            order={order}
            orderBy={orderBy}
            onSelectRow={handleSelectRow}
          />
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
        <Pagination />
      </Box>
    </Box>
  );
}

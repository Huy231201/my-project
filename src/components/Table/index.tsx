import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import React, { useMemo } from 'react';
import EnhancedTableBody from './EnhancedTableBody';
import EnhancedTableHead from './EnhancedTableHead';
import Pagination from '@/components/Pagination';
import { stableSort, getComparator, Order, HeaderCellProps, RowProp } from './utils';

type KeyRow = string | number;

interface Props {
  loading?: boolean;
  headCells: readonly HeaderCellProps[];
  rows: readonly RowProp[];
  checkbox?: boolean;
  enableSelect?: boolean;
  sortDirection?: Order;
  sortBy?: keyof RowProp;
  selected?: Array<KeyRow>;
  pageIndex: number;
  totalPages: number;
  onSelectRow?: (data: Array<KeyRow>) => void;
  onChangePage?: (pageIndex: number) => void;
  onSortChange?: (data: { sortDirection: Order; sortBy: keyof RowProp }) => void;
}

export default function EnhancedTable(props: Props) {
  const {
    loading,
    rows,
    headCells,
    checkbox = false,
    enableSelect = false,
    sortDirection = 'asc',
    sortBy = 'id',
    selected = [],
    pageIndex,
    totalPages,
    onSelectRow,
    onChangePage,
    onSortChange,
  } = props;

  const orderHeadCells = useMemo(
    () => stableSort(headCells, getComparator('asc', 'order')),
    [sortDirection, sortBy, headCells],
  );

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof RowProp) => {
    if (onSortChange) {
      const isAsc = sortBy === property && sortDirection === 'asc';
      onSortChange({ sortDirection: isAsc ? 'desc' : 'asc', sortBy: property });
    }
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
        const newSelected = rows.map((n: RowProp) => n.checkbox && n.id).filter(Boolean) as Array<KeyRow>;
        onSelectRow(newSelected);
      } else {
        onSelectRow([]);
      }
    }
  };

  const isSelectAll = selected?.length > 0 && selected.length === rows.filter(row => row.checkbox).length;
  return (
    <Box sx={{ width: '100%' }}>
      <TableContainer>
        <Table
          sx={{
            minWidth: {
              xs: 0,
              md: 750,
            },
          }}
          aria-labelledby="tableTitle"
          size="small"
        >
          <EnhancedTableHead
            checkbox={checkbox}
            indeterminate={!!selected.length && !isSelectAll}
            isSelectAll={isSelectAll}
            headCells={orderHeadCells}
            sortDirection={sortDirection}
            sortBy={sortBy}
            onRequestSort={handleRequestSort}
            onSelectAllClick={handleSelectAll}
          />
          <EnhancedTableBody
            loading={loading}
            checkbox={checkbox}
            enableSelect={enableSelect}
            selected={selected}
            rows={rows}
            orderHeadCells={orderHeadCells}
            onSelectRow={handleSelectRow}
          />
        </Table>
      </TableContainer>
      {totalPages && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          <Pagination pageIndex={pageIndex} totalPages={totalPages} onChangePage={onChangePage} />
        </Box>
      )}
    </Box>
  );
}

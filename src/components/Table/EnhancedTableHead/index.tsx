import Box from '@mui/material/Box';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import * as React from 'react';
import { withStyles } from '@mui/styles';
import HerondIcon from '@/components/Icons';
import { HeaderCellProps, RowProp } from '../utils';
import { CheckboxField } from '@/components/Fields';

interface EnhancedTableProps {
  checkbox: boolean;
  indeterminate: boolean;
  isSelectAll: boolean;
  headCells: HeaderCellProps[];
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof RowProp) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  sortDirection: 'asc' | 'desc';
  sortBy: string | number | symbol;
}

const MuiTableSortLabel = withStyles({
  root: {
    fontSize: 14,
    color: '#202226',
    fontWeight: 500,
    textTransform: 'capitalize',
    flexDirection: 'row',
  },
})(TableSortLabel);

function IconSortCustom() {
  return (
    <Box
      sx={{
        ml: 1,
        '& svg': {
          width: 12,
          height: 12,
        },
      }}
    >
      <HerondIcon name="up-down" />
    </Box>
  );
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { checkbox, indeterminate, isSelectAll, headCells, sortDirection, sortBy, onRequestSort, onSelectAllClick } =
    props;
  const createSortHandler = (property: keyof RowProp) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow
        sx={{
          backgroundColor: '#E8EAED',
          borderBottom: '1px solid #DCE0E3',
        }}
      >
        {checkbox && (
          <TableCell padding="checkbox">
            <CheckboxField
              color="primary"
              indeterminate={indeterminate}
              checked={isSelectAll}
              onChange={onSelectAllClick}
            />
          </TableCell>
        )}
        {headCells.map((headCell: HeaderCellProps) => (
          <TableCell
            key={headCell.id}
            align={headCell?.align || 'left'}
            padding="normal"
            sortDirection={sortBy === headCell.id ? sortDirection : false}
            sx={{
              padding: 1.5,
              fontSize: 14,
              minWidth: headCell?.width || 120,
              width: headCell?.width || 120,
            }}
          >
            {headCell.sortable ? (
              <MuiTableSortLabel
                active={sortBy === headCell.id}
                direction={sortBy === headCell.id ? sortDirection : 'asc'}
                onClick={createSortHandler(headCell.id)}
                IconComponent={IconSortCustom}
              >
                {headCell.label}

                {sortBy === headCell.id ? (
                  <Box
                    component="span"
                    sx={{
                      display: 'none',
                    }}
                  >
                    {sortDirection === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </MuiTableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

export default EnhancedTableHead;

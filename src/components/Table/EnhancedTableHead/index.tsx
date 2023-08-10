import Box from '@mui/material/Box';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import * as React from 'react';
import { withStyles } from '@mui/styles';
import HerondIcon from '@/components/Icons';
import { HeaderCellProps, RowProp } from '../utils';

interface EnhancedTableProps {
  headCells: HeaderCellProps[];
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof RowProp) => void;
  order: 'asc' | 'desc';
  orderBy: string | number | symbol;
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
  const { headCells, order, orderBy, onRequestSort } = props;
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
        {headCells.map((headCell: HeaderCellProps) => (
          <TableCell
            key={headCell.id}
            align="left"
            padding="normal"
            width={headCell?.width}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{
              padding: 1.5,
            }}
          >
            <MuiTableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
              IconComponent={IconSortCustom}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box
                  component="span"
                  sx={{
                    display: 'none',
                  }}
                >
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </MuiTableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

export default EnhancedTableHead;

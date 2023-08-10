import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { useMemo } from 'react';
import { withStyles } from '@mui/styles';
import { stableSort, getComparator, Order, HeaderCellProps, RowProp } from '../utils';

const MuiTableCell = withStyles({
  root: {
    fontSize: 14,
    color: '#202226',
  },
})(TableCell);

interface Props {
  page?: number;
  rows: readonly RowProp[];
  order: Order;
  orderBy: keyof RowProp;
  orderHeadCells: readonly HeaderCellProps[];
}

function EnhancedTableBody(props: Props) {
  const { orderHeadCells, rows, order, orderBy } = props;

  const visibleRows = useMemo(() => stableSort(rows, getComparator(order, orderBy)), [order, orderBy, rows]);

  return (
    <TableBody>
      {visibleRows.map((row, index) => (
        <TableRow
          hover
          role="checkbox"
          tabIndex={-1}
          key={index}
          sx={{ cursor: 'pointer', borderBottom: '1px solid #DCE0E3' }}
        >
          {orderHeadCells.map(headCell => (
            <MuiTableCell key={headCell.id} component="th">
              {row[headCell.id]}
            </MuiTableCell>
          ))}
        </TableRow>
      ))}
      {visibleRows?.length < 1 && (
        <TableRow
          style={{
            height: '330px',
          }}
        >
          <TableCell colSpan={6} />
        </TableRow>
      )}
    </TableBody>
  );
}

export default EnhancedTableBody;

import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { useMemo } from 'react';
import { withStyles } from '@mui/styles';
import { stableSort, getComparator, Order, HeaderCellProps, RowProp } from '../utils';
import { CheckboxField } from '@/components/Fields';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import HerondIcon from '@/components/Icons';
import Skeleton from '@mui/material/Skeleton';

const MuiTableCell = withStyles({
  root: {
    fontSize: 14,
    color: '#202226',
  },
})(TableCell);

interface Props {
  loading?: boolean;
  checkbox: boolean;
  selected: Array<string | number>;
  page?: number;
  rows: readonly RowProp[];
  order: Order;
  orderBy: keyof RowProp;
  orderHeadCells: readonly HeaderCellProps[];
  onSelectRow?: (event: React.MouseEvent<unknown>, name: string | number) => void;
}

function EnhancedTableBody(props: Props) {
  const { loading, orderHeadCells, rows, order, orderBy, checkbox, selected, onSelectRow } = props;

  const visibleRows = useMemo(() => stableSort(rows, getComparator(order, orderBy)), [order, orderBy, rows]);

  const handleSelectRow = (id: string | number, enableCheckbox?: boolean) => (event: React.MouseEvent<unknown>) => {
    if (enableCheckbox && onSelectRow) {
      onSelectRow(event, id);
    }
  };

  if (loading) {
    return (
      <TableBody>
        {new Array(6).fill(0).map((_, idx) => (
          <TableRow hover role="checkbox" tabIndex={-1} sx={{ cursor: 'pointer' }} key={idx}>
            {new Array(orderHeadCells.length).fill('0').map((column, index) => (
              <MuiTableCell align="left" key={index}>
                <Skeleton animation="wave" />
              </MuiTableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    );
  }

  return (
    <TableBody>
      {visibleRows.map((row, index) => (
        <TableRow
          hover
          role="checkbox"
          tabIndex={-1}
          key={index}
          sx={{ cursor: 'pointer', borderBottom: '1px solid #DCE0E3' }}
          onClick={handleSelectRow(row.id, row?.checkbox)}
        >
          {checkbox &&
            (row?.checkbox ? (
              <MuiTableCell padding="checkbox">
                <CheckboxField color="primary" checked={!!selected.includes(row.id)} />
              </MuiTableCell>
            ) : (
              <MuiTableCell padding="checkbox" />
            ))}
          {orderHeadCells.map(headCell => (
            <MuiTableCell key={headCell.id} component="th" align={headCell.align || 'left'}>
              {row[headCell.id]}
            </MuiTableCell>
          ))}
        </TableRow>
      ))}
      {visibleRows?.length < 1 && (
        <TableRow
          sx={{
            height: '160px',
            '& .MuiTableCell-root': {
              fontSize: 16,
              textAlign: 'center',
            },
          }}
        >
          <TableCell colSpan={6}>
            <Box
              sx={{
                '& svg': {
                  fontSize: 40,
                },
              }}
            >
              <HerondIcon name="search" />
              <Typography variant="body1">{window.T('No results')}</Typography>
            </Box>
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
}

export default EnhancedTableBody;

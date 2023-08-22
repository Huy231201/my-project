import { CheckboxField } from '@/components/Fields';
import HerondIcon from '@/components/Icons';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { withStyles } from '@mui/styles';
import { HeaderCellProps, RowProp } from '../utils';

const MuiTableCell = withStyles({
  root: {
    fontSize: 14,
    color: '#202226',
  },
})(TableCell);

interface Props {
  loading?: boolean;
  checkbox: boolean;
  enableSelect?: boolean;
  selected: Array<string | number>;
  rows: readonly RowProp[];
  orderHeadCells: readonly HeaderCellProps[];
  onSelectRow?: (event: React.MouseEvent<unknown>, name: string | number) => void;
}

function EnhancedTableBody(props: Props) {
  const { loading, orderHeadCells, rows, checkbox, enableSelect, selected, onSelectRow } = props;

  const handleSelectRow = (id: string | number, enableCheckbox?: boolean) => (event: React.MouseEvent<unknown>) => {
    if ((enableCheckbox || enableSelect) && onSelectRow) {
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
      {rows.map((row, index) => (
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
            <MuiTableCell
              key={headCell.id}
              component="th"
              align={headCell.align || 'left'}
              sx={{
                minWidth: headCell?.width || 120,
                width: headCell?.width || 120,
              }}
            >
              {row[headCell.id]}
            </MuiTableCell>
          ))}
        </TableRow>
      ))}
      {rows?.length < 1 && (
        <TableRow
          sx={{
            height: '160px',
            '& .MuiTableCell-root': {
              fontSize: 16,
              textAlign: 'center',
            },
          }}
        >
          <TableCell colSpan={20}>
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

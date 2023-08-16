import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

interface Props {
  pageIndex: number;
  totalPages: number;
  onChangePage: (value: number) => void;
}

export default function BasicPagination(props: Props) {
  const { pageIndex, totalPages, onChangePage } = props;

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    onChangePage(value);
  };

  return (
    <Stack spacing={2}>
      <Pagination
        sx={{
          '& .MuiPaginationItem-root': {
            fontSize: '1.4rem',
            '&.Mui-selected': {
              color: '#fff',
              backgroundColor: '#7A818C',
              borderRadius: '4px',
              fontWeight: 'bold',
            },
            '&:hover': {
              borderRadius: '4px',
              '& span': {
                borderRadius: '4px',
              },
            },
          },
        }}
        page={pageIndex}
        count={totalPages}
        onChange={handleChange}
      />
    </Stack>
  );
}

import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

export default function BasicPagination() {
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
        count={10}
      />
    </Stack>
  );
}

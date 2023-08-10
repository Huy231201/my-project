import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { SearchInputField } from '@/components/Fields';

function UserDetailContainer() {
  return (
    <Container
      maxWidth={false}
      sx={{
        my: 2,
      }}
    >
      <Box>
        <Typography variant="h3">{window.T('Affiliate user details')}</Typography>
        <Box my={2}>
          <SearchInputField placeholder={window.T('Enter user email')} />
        </Box>
      </Box>
    </Container>
  );
}

export default UserDetailContainer;

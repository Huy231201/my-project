import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

function WithDrawalManagerContainer() {
  return (
    <Container
      maxWidth={false}
      sx={{
        py: 3,
      }}
    >
      <Box>
        <Typography variant="h3">{window.T('Affiliate user details')}</Typography>
      </Box>
    </Container>
  );
}

export default WithDrawalManagerContainer;

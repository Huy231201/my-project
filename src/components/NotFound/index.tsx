import Stack from '@mui/material/Stack';
import NotFoundImage from '@/assets/images/not_found.png';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';

interface Props {
  label: string;
}

const NotFound = (props: Props) => {
  const { label } = props;
  return (
    <Stack alignItems="center">
      <CardMedia
        image={NotFoundImage}
        component="img"
        height={160}
        sx={{
          objectFit: 'contain',
        }}
      />
      <Typography variant="body1" sx={{ textAlign: 'center', fontSize: 22, fontWeight: 500, mt: 2 }}>
        {label}
      </Typography>
    </Stack>
  );
};

export default NotFound;

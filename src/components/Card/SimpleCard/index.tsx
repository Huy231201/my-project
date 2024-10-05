import Box from '@mui/material/Box';
import CardHeader from '../CardHeader';
import { SimpleCardProps } from '../types';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';

function SimpleCard(props: SimpleCardProps) {
  const { loading, label, subLabel, subLabel2, icon, content, tooltipContent } = props;

  return (
    <Box
      sx={{
        background: 'white',
        borderRadius: '8px',
        height: '100%',
        margin: 'auto',
        maxWidth: '100%',
        p: {
          xs: 2,
          sm: 3,
          md: 4,
        },
      }}
    >
      <CardHeader label={label} subLabel={subLabel} icon={icon} tooltipContent={tooltipContent} />
      <Box my={2}>
        {loading ? (
          <Skeleton variant="text" width={180} height={62} />
        ) : (
          <Typography
            variant="h1"
            component="p"
            sx={{
              fontSize: 44,
            }}
          >
            {content || 0}
            <Typography>{subLabel2}</Typography>
          </Typography>
        )}
      </Box>
    </Box>
  );
}

SimpleCard.defaultProps = {
  subLabel: '',
};

export default SimpleCard;

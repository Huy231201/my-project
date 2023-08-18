import Box from '@mui/material/Box';
import CardHeader from '../CardHeader';
import { SimpleCardProps } from '../types';
import FakeDumpContent from './FakeDumpContent';

function SimpleCard(props: SimpleCardProps) {
  const { label, subLabel, icon, content, tooltipContent } = props;

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
        <FakeDumpContent content={content} />
      </Box>
    </Box>
  );
}

SimpleCard.defaultProps = {
  subLabel: '',
};

export default SimpleCard;

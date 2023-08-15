import Box from '@mui/material/Box';
import CardHeader from '../CardHeader';
import { SimpleCardProps } from '../types';
import FakeDumpContent from './FakeDumpContent';

function SimpleCard(props: SimpleCardProps) {
  const { label, subLabel, icon, content } = props;

  return (
    <Box
      sx={{
        background: 'white',
        borderRadius: '8px',
        p: 4,
        height: '100%',
        margin: 'auto',
        maxWidth: {
          xs: '100%',
        },
      }}
    >
      <CardHeader label={label} subLabel={subLabel} icon={icon} />
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

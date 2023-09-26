import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import HerondIcon, { SvgName } from '@/components/Icons';

interface Props {
  label: string;
  subLabel?: string;
  icon: SvgName;
  tooltipContent?: string;
}

const CardHeader = ({ label, subLabel, icon, tooltipContent }: Props) => (
  <Stack direction="row" alignItems="center" spacing={1}>
    <Box
      sx={{
        borderRadius: '50%',
        backgroundColor: '#FFF3E9',
        width: 40,
        height: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        '& svg': {
          width: 22,
          height: 22,
        },
      }}
    >
      <HerondIcon name={icon} />
    </Box>
    <Box>
      <Typography
        component="span"
        variant="body1"
        sx={{
          color: '#32373D',
          fontSize: 16,
          fontWeight: 500,
          display: 'inline',
        }}
      >
        {label}
        {subLabel && (
          <Typography variant="caption" sx={{ color: '#5B636E', display: 'inline', ml: 0.5 }}>
            {subLabel}
          </Typography>
        )}
        <Tooltip title={tooltipContent}>
          <Box
            sx={{
              flexShrink: 0,
              width: 16,
              height: 16,
              display: 'inline',
              top: 2,
              left: 4,
              position: 'relative',
            }}
          >
            <HerondIcon name="information" />
          </Box>
        </Tooltip>
      </Typography>
    </Box>
  </Stack>
);

export default CardHeader;

import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import HerondIcon, { SvgName } from '@/components/Icons';

export interface SimpleCardProps {
  label: string;
  subLabel?: string;
  icon: SvgName;
  content: string;
}

function SimpleCard(props: SimpleCardProps) {
  const { label, subLabel, icon, content } = props;
  return (
    <Box
      sx={{
        background: 'white',
        borderRadius: '8px',
        p: 2.5,
        pt: 5,
        height: '100%',
        margin: 'auto',
        maxWidth: {
          xs: 380,
          xl: '100%',
        },
      }}
    >
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
            variant="body1"
            sx={{
              color: '#32373D',
              fontSize: 16,
              fontWeight: 500,
              display: 'inline',
            }}
          >
            {label}
          </Typography>
          {subLabel && (
            <Typography variant="caption" sx={{ color: '#5B636E', display: 'inline', ml: 0.5 }}>
              {subLabel}
            </Typography>
          )}
        </Box>
        <Tooltip title="More information">
          <Box
            sx={{
              flexShrink: 0,
              width: 16,
              height: 16,
            }}
          >
            <HerondIcon name="information" />
          </Box>
        </Tooltip>
      </Stack>
      <Box my={2}>
        <Typography
          variant="h1"
          component="p"
          sx={{
            fontSize: 44,
          }}
        >
          {content}
        </Typography>
      </Box>
    </Box>
  );
}

SimpleCard.defaultProps = {
  subLabel: '',
};

export default SimpleCard;

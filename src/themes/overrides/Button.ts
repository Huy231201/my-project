// ==============================|| OVERRIDES - BUTTON ||============================== //
import { CustomTheme as Theme } from '../types';

export default function Button(theme: Theme) {
  const disabledStyle = {
    '&.Mui-disabled': {
      backgroundColor: theme.palette.grey[200],
    },
  };

  return {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          ...theme.variables.fields,
          fontWeight: 600,
          textTransform: 'capitalize',
        },
        contained: {
          ...disabledStyle,
        },
        outlined: {
          ...disabledStyle,
        },
        startIcon: {
          maxWidth: 24,
          maxHeight: 24,
          '& img': {
            width: '100%',
            height: '100%',
          },
        },
        endIcon: {
          maxWidth: 24,
          maxHeight: 24,
          '& img': {
            width: '100%',
            height: '100%',
          },
        },
      },
    },
  };
}

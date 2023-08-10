// ==============================|| OVERRIDES - BADGE ||============================== //
import { CustomTheme as Theme } from '../types';

export default function Select(theme: Theme) {
  return {
    MuiSelect: {
      styleOverrides: {
        select: {
          ...theme.variables.fields,
          cursor: 'pointer',
          border: 'none',
          marginRight: 20,
          '& em, li': {
            fontStyle: 'normal',
            fontSize: 14,
            fontWeight: 500,
          },
          '&:focus-visible': {
            boxShadow: 'none',
            outline: 0,
          },
          '& fieldset': {
            '&:focus-visible': {
              boxShadow: 'none',
              outline: 0,
            },
          },
        },
        icon: {
          height: '100%',
          position: 'absolute',
          top: 0,
          bottom: 0,
        },
      },
    },
  };
}

// material-ui

import { CssBaseline, StyledEngineProvider } from '@mui/material';
import { ThemeProvider, createTheme as createMuiTheme, ThemeOptions } from '@mui/material/styles';
import { ReactNode } from 'react';
import { CustomTheme as Theme } from './types';

import { createPalette } from './createPalette';
import { createShadows } from './createShadows';
import { createTypography } from './createTypography';
import componentsOverride from './overrides';

interface CustomThemeOptions extends ThemeOptions {
  variables?: {
    fields?: {
      padding?: string;
      lineHeight?: number;
      minHeight?: number;
      boxSizing?: string;
      display?: string;
      alignItems?: string;
      fontWeight?: number;
      fontSize?: string;
      color?: string;
      borderRadius?: number;
      border?: string;
    };
  };
}

const createCustomTheme = () => {
  const palette = createPalette() as any;
  const shadows = createShadows() as any;
  const typography = createTypography() as any;

  return createMuiTheme({
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1440,
      },
    },
    palette,
    shadows,
    shape: {
      borderRadius: 8,
    },
    typography,
    variables: {
      fields: {
        padding: '8px 12px',
        lineHeight: 1.572,
        minHeight: 32,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        fontWeight: 500,
        fontSize: '1.4rem',
        color: palette.neutral[700],
        borderRadius: 8,
        border: '1px solid #D6D9DF',
      },
    },
  } as CustomThemeOptions);
};

function ThemeCustomization({ children }: { children: ReactNode }) {
  const themes = createCustomTheme() as Theme;
  themes.components = componentsOverride(themes);
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={themes}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default ThemeCustomization;

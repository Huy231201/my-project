import { alpha } from '@mui/material/styles';
import { PaletteColor } from '@mui/material/styles/createPalette';

interface CustomPlatte extends PaletteColor {
  lightest: string;
  veryLight: string;
  darkest: string;
  black: string;
}

const withAlphas = (color: Omit<CustomPlatte, 'contrastText'>) => ({
  ...color,
  alpha4: alpha(color.main, 0.04),
  alpha8: alpha(color.main, 0.08),
  alpha12: alpha(color.main, 0.12),
  alpha30: alpha(color.main, 0.3),
  alpha50: alpha(color.main, 0.5),
});

export const neutral = {
  0: '#ffffff',
  50: '#f2f3f5',
  100: '#d6d9df',
  200: '#c2c7d0',
  300: '#DCE0E3',
  400: '#959ead',
  500: '#7a8699',
  600: '#7A818C',
  700: '#575f6d',
  800: '#434a54',
  900: '#333840',
};

export const primary = withAlphas({
  lightest: '#e8f0fc',
  veryLight: '#a0c0f3',
  light: '#79a6ee',
  main: '#3f80e6',
  dark: '#298CFD',
  darkest: '#11479e',
  black: '#0f3e89',
});

export const error = withAlphas({
  lightest: '#fceeec',
  veryLight: '#f3b8b1',
  light: '#ee9b91',
  main: '#e66f61',
  dark: '#e15241',
  darkest: '#9e392e',
  black: '#893228',
});

export const success = withAlphas({
  lightest: '#eef8eb',
  veryLight: '#b9e2ad',
  light: '#9cd68c',
  main: '#72c45a',
  dark: '#419C26',
  darkest: '#3b8127',
  black: '#347022',
});

export const warning = withAlphas({
  lightest: '#fff9e9',
  veryLight: '#ffe6a6',
  light: '#ffdc81',
  main: '#ffcd4a',
  dark: '#EAAE11',
  darkest: '#b3891a',
  black: '#9c7717',
});

export const info = withAlphas({
  lightest: '#ecf6ff',
  veryLight: '#b3dbff',
  light: '#93cbff',
  main: '#65b5ff',
  dark: '#126ABC',
  darkest: '#3074b3',
  black: '#2a659c',
});

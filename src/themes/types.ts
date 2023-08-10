import { Theme } from '@mui/material/styles';

export interface CustomTheme extends Theme {
  variables: {
    fields: {
      [key: string]: string;
    };
  };
}

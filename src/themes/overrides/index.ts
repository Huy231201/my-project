// third-party
import merge from 'lodash.merge';
import { CustomTheme as Theme } from '../types';

// project import
import Badge from './Badge';
import Button from './Button';
import CardContent from './CardContent';
import Checkbox from './Checkbox';
import Chip from './Chip';
import IconButton from './IconButton';
import InputLabel from './InputLabel';
import LinearProgress from './LinearProgress';
import Link from './Link';
import ListItemIcon from './ListItemIcon';
import OutlinedInput from './OutlinedInput';
import MuiInputBase from './MuiInputBase';
import Tab from './Tab';
import TableCell from './TableCell';
import Tabs from './Tabs';
import Typography from './Typography';
import Tooltip from './Tooltip';
import Grid from './Grid';
import Select from './Select';

// ==============================|| OVERRIDES - MAIN ||============================== //
export default function ComponentsOverrides(theme: Theme) {
  return merge(
    Button(theme),
    Badge(theme),
    CardContent(),
    Checkbox(),
    Chip(theme),
    IconButton(theme),
    InputLabel(theme),
    LinearProgress(),
    Link(),
    ListItemIcon(),
    OutlinedInput(theme),
    MuiInputBase(),
    Tab(theme),
    TableCell(theme),
    Tabs(),
    Typography(),
    Tooltip(),
    Grid(),
    Select(theme),
  );
}

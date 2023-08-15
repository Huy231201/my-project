import { useState } from 'react';
import ListItem from '@mui/material/ListItem';
import { styled, useTheme, CSSObject, Theme } from '@mui/material/styles';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HerondIcon, { SvgName } from '@/components/Icons';

interface Props {
  active: boolean;
  openDrawer: boolean;
  label: string;
  nameIcon: SvgName;
  nameHoverIcon: SvgName;
  onClick: () => void;
}

const MuiListItem = styled(ListItem)(() => ({
  margin: '12px auto',
  borderRadius: 8,
  '&:hover': {
    backgroundColor: '#FF821C',
    '& .MuiListItemText-primary': {
      color: 'white !important',
      fontWeight: 'bold',
    },
  },
}));

const openedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
});

function SidebarItem(props: Props) {
  const { active, openDrawer, label, nameIcon, nameHoverIcon, onClick } = props;
  const theme = useTheme();
  const [isHover, setIsHover] = useState(false);

  return (
    <MuiListItem
      disablePadding
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      sx={{
        height: 48,
        margin: '8px',
        width: 'calc(100% - 16px)',
        backgroundColor: active ? '#FF821C' : 'transparent',
        '& .MuiListItemText-primary': {
          color: active ? 'white' : '#7A818C',
          fontWeight: active ? 'bold' : 'normal',
        },
        ...(openDrawer && {
          ...openedMixin(theme),
        }),
        ...(!openDrawer && {
          ...closedMixin(theme),
        }),
      }}
      onClick={onClick}
    >
      <ListItemButton
        sx={{
          padding: 1.5,
        }}
      >
        <ListItemIcon
          sx={{
            '& svg': {
              width: 24,
              height: 24,
            },
          }}
        >
          <HerondIcon name={isHover || active ? nameHoverIcon : nameIcon} />
        </ListItemIcon>
        <ListItemText
          sx={{
            my: 0,
            ml: 1.5,
            fontSize: 16,
            color: '#7A818C',
            opacity: openDrawer ? 1 : 0,
            transition: theme.transitions.create('opacity', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
          primary={label}
        />
      </ListItemButton>
    </MuiListItem>
  );
}

export default SidebarItem;

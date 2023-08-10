import { useState } from 'react';
import ListItem from '@mui/material/ListItem';
import { styled } from '@mui/material/styles';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HerondIcon, { SvgName } from '@/components/Icons';

interface Props {
  active: boolean;
  label: string;
  nameIcon: SvgName;
  nameHoverIcon: SvgName;
  onClick: () => void;
}

const MuiListItem = styled(ListItem)(() => ({
  maxWidth: 200,
  width: 200,
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

function SidebarItem(props: Props) {
  const { active, label, nameIcon, nameHoverIcon, onClick } = props;

  const [isHover, setIsHover] = useState(false);

  return (
    <MuiListItem
      disablePadding
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      sx={{
        backgroundColor: active ? '#FF821C' : 'transparent',
        '& .MuiListItemText-primary': {
          color: active ? 'white' : '#7A818C',
          fontWeight: active ? 'bold' : 'normal',
        },
      }}
      onClick={onClick}
    >
      <ListItemButton>
        <ListItemIcon>
          <HerondIcon name={isHover || active ? nameHoverIcon : nameIcon} />
        </ListItemIcon>
        <ListItemText
          sx={{
            ml: 1.5,
            fontSize: 16,
            color: '#7A818C',
          }}
          primary={label}
        />
      </ListItemButton>
    </MuiListItem>
  );
}

export default SidebarItem;

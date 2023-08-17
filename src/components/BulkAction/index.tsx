import Box from '@mui/material/Box';
import { useState, MouseEvent } from 'react';
import Button from '@mui/material/Button';
import HerondIcon from '@/components/Icons';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

interface Option {
  label: string;
  onClick: () => void;
}
interface Props {
  options: Array<Option>;
}

const BulkAction = (props: Props) => {
  const { options } = props;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClickItem = (action: () => void) => () => {
    if (action) {
      action();
    }
    handleClose();
  };

  return (
    <Box>
      <Button
        variant="outlined"
        sx={{
          borderColor: '#A1A9B5',
          color: '#202226',
          minWidth: 140,
          fontWeight: 500,
          px: 2,
          ...(open && {
            '& svg': {
              transition: 'width 0.2s, height 0.2s, transform 0.2s',
              '-webkit-transform': 'rotateX(180deg)',
              transform: 'rotateX(180deg)',
            },
          }),
        }}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        endIcon={<HerondIcon name="arrow-down" />}
      >
        {window.T('Bulk actions')}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        sx={{
          '& .MuiMenu-paper': {
            minWidth: 140,
            boxShadow: '-1px 6px 14px 0px rgba(0, 0, 0, 0.06)',
          },
        }}
      >
        {options.map((item: Option, key: number) => (
          <MenuItem key={key} onClick={handleClickItem(item.onClick)}>
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default BulkAction;

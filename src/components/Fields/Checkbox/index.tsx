import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { ReactElement } from 'react';

interface Props {
  color?: 'primary' | 'secondary' | 'default';
  label?: string | ReactElement;
  indeterminate?: boolean;
  checked?: boolean;
  name?: string | undefined;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>, name: string) => void;
}

function CheckboxField(props: Props) {
  const { color, label, indeterminate, checked, name, onChange } = props;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(event, name || '');
    }
  };

  return (
    <FormControlLabel
      control={
        <Checkbox
          color={color}
          sx={{ '& .MuiSvgIcon-root': { fontSize: 24 } }}
          indeterminate={indeterminate}
          checked={checked}
          onChange={handleChange}
        />
      }
      label={label}
    />
  );
}

export default CheckboxField;

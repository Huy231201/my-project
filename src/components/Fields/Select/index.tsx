import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { styled } from '@mui/material/styles';

const MuiSelect = styled(Select)({
  cursor: 'pointer',
  borderColor: '#A1A9B5',
  color: '#202226',
  height: 40,
  '& .MuiSelect-select': {
    color: '#202226',
  },
  '& fieldset': {
    borderColor: '#A1A9B5',
  },
});

interface Option {
  value: string;
  label: string;
}

interface Props {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: Array<Option>;
}

const SelectField = (props: Props) => {
  const { value, onChange, options } = props;

  const handleChangeData = (event: SelectChangeEvent<unknown>) => {
    const newValue = event.target.value as string;
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <MuiSelect
      value={value}
      onChange={handleChangeData}
      displayEmpty
      inputProps={{ 'aria-label': 'select' }}
      labelId="select-field-label"
    >
      {options.map((option: Option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </MuiSelect>
  );
};

export default SelectField;

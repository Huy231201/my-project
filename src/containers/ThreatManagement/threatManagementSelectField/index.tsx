import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { SxProps } from '@mui/material';
import { SelectField } from '@/components/Fields';

interface Props {
  label: string;
  sx: SxProps;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}
function ThreatManagementSelectField({ label, sx, value, options, onChange }: Props) {
  return (
    <Box display="flex" alignItems="center" sx={sx}>
      <FormControl fullWidth>
        <InputLabel id="select-field-label">{window.T(label)}</InputLabel>
        <SelectField value={value} options={options} onChange={onChange} />
      </FormControl>
    </Box>
  );
}
export default ThreatManagementSelectField;

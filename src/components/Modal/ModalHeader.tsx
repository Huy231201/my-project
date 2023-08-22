import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import HerondIcon from '@/components/Icons';

interface Props {
  hiddenCloseIcon?: boolean;
  children: React.ReactNode;
  onClose: () => void;
}

const DialogTitle = (props: Props) => {
  const { hiddenCloseIcon, children, onClose } = props;
  return (
    <Stack
      sx={{
        p: {
          xs: 1,
          md: 1.5,
        },
      }}
      justifyContent="space-between"
      alignItems="center"
      flexDirection="row"
    >
      <Typography
        variant="h4"
        sx={{
          fontSize: '18px',
        }}
      >
        {children}
      </Typography>
      {!hiddenCloseIcon && (
        <HerondIcon sx={{ backgroundColor: 'transparent !important' }} name="close" type="button" onClick={onClose} />
      )}
    </Stack>
  );
};
export default DialogTitle;

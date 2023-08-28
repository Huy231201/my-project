import useMediaQuery from '@mui/material/useMediaQuery';
import { Theme } from '@mui/material/styles';

const useWindowResize = () => {
  const isMobile = useMediaQuery((theme: Theme) => theme?.breakpoints?.down('md'));
  const isMobileSm = useMediaQuery((theme: Theme) => theme?.breakpoints?.down('sm'));

  return {
    isMobile,
    isMobileSm,
  };
};

export default useWindowResize;

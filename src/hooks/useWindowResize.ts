import useMediaQuery from '@mui/material/useMediaQuery';
import { Theme } from '@mui/material/styles';

const useWindowResize = () => {
  const isMobile = useMediaQuery((theme: Theme) => theme?.breakpoints?.down('md'));

  return {
    isMobile,
  };
};

export default useWindowResize;

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { numberWithCommas } from '@/utils/common';

const MIN_NUMBER = 1000;
const MAX_NUMBER = 100000;

function FakeDumpContent(props: { content: string | undefined }) {
  const { content } = props;

  const [numberDynamics, setNumberDynamics] = useState<number | string>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const myInterval = setInterval(() => {
      const random = Math.floor(MIN_NUMBER + Math.random() * (MAX_NUMBER - MIN_NUMBER));
      setNumberDynamics(numberWithCommas(random));
    }, 50);

    setTimeout(() => {
      clearInterval(myInterval);
      setIsLoading(false);
    }, 1500);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setNumberDynamics(content || 0);
    }
  }, [isLoading, content]);

  return (
    <Box my={2}>
      <Typography
        variant="h1"
        component="p"
        sx={{
          fontSize: 44,
        }}
      >
        {numberDynamics}
      </Typography>
    </Box>
  );
}
export default FakeDumpContent;

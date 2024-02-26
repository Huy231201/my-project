import Container from '@/components/Container';

import Box from '@mui/material/Box';

import Typography from '@mui/material/Typography';

import ChainForm, { ChainProps } from './ChainForm';
import { useAddChainDataMutation } from '@/services/chain-management ';
import toast from 'react-hot-toast';

function NewChain() {
  const [addChainData, { isLoading: isAddChainLoading }] = useAddChainDataMutation({});
  const handleAddChainData = async (data: ChainProps) => {
    try {
      await addChainData(data).unwrap();
      toast.success(window.T('Add Chain successs!'));
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  return (
    <Container sx={{ maxWidth: 800 }} loading={isAddChainLoading}>
      <Box
        sx={{
          background: '#fff',
          borderRadius: 1.5,
          p: {
            xs: 2,
            sm: 3,
            md: 4,
          },
        }}
      >
        <Box>
          <Typography
            variant="h3"
            sx={{
              fontSize: 20,
            }}
          >
            {window.T('Add New Chain')}
          </Typography>
        </Box>

        <Box
          sx={{
            background: '#fff',
            py: 2,
          }}
        >
          <ChainForm handleSubmitForm={handleAddChainData} />
        </Box>
      </Box>
    </Container>
  );
}

export default NewChain;

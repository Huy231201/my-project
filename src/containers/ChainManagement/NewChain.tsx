import Container from '@/components/Container';

import Box from '@mui/material/Box';

import Typography from '@mui/material/Typography';

import ChainForm, { ChainProps } from './ChainForm';
import { useAddChainDataMutation } from '@/services/chain-management ';
import toast from 'react-hot-toast';
import { IconButton } from '@mui/material';
import HerondIcon from '@/components/Icons';
import { useNavigate } from 'react-router-dom';

function NewChain() {
  const navigate = useNavigate();
  const [addChainData, { isLoading: isAddChainLoading }] = useAddChainDataMutation({});
  const handleAddChainData = async (data: ChainProps) => {
    try {
      await addChainData(data).unwrap();
      toast.success(window.T('Add Chain successs!'));
      navigate('/chain-management');
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  return (
    <Container sx={{ maxWidth: 800 }} loading={isAddChainLoading}>
      <Box
        display="flex"
        onClick={() => navigate('/chain-management')}
        sx={{
          mb: '16px',
          '& svg': {
            width: '20px',
            height: '20px',
          },
        }}
      >
        <IconButton color="inherit">
          <HerondIcon name="arrow-left" />
        </IconButton>
        <Typography
          variant="h3"
          sx={{
            ml: '4px',
            fontSize: 20,
            cursor: 'pointer',
          }}
        >
          {window.T('Chain Management')}
        </Typography>
      </Box>
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

import Container from '@/components/Container';

import Box from '@mui/material/Box';

import Typography from '@mui/material/Typography';

import ChainForm, { ChainProps } from './ChainForm';
import { useGetChainDetailsQuery, useUpdateChainMutation } from '@/services/chain-management ';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

function ChainDetails() {
  const navigate = useNavigate();
  const { chainId } = useParams();

  const { data, isFetching } = useGetChainDetailsQuery({ chainId });
  const [updateChain, { isLoading: isUpdateChainLoading }] = useUpdateChainMutation({});
  const handleUpdateChain = async (chainData: ChainProps) => {
    try {
      await updateChain(chainData).unwrap();
      toast.success(window.T('Update Chain Success!!!'));
      navigate('/chain-management');
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const chainData = { ...data, rpc: data?.rpc?.join('\n'), faucets: data?.faucets?.join('\n') };
  return (
    <Container sx={{ maxWidth: 800 }} loading={isFetching || isUpdateChainLoading}>
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
            {window.T('Chain Details')}
          </Typography>
        </Box>

        <Box
          sx={{
            background: '#fff',
            py: 2,
          }}
        >
          {data && !isFetching && <ChainForm handleSubmitForm={handleUpdateChain} chainData={chainData} />}
        </Box>
      </Box>
    </Container>
  );
}

export default ChainDetails;

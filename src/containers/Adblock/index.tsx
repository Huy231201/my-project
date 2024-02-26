import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { ChangeEvent, useState } from 'react';
import Button from '@mui/material/Button';
import { ConfirmButton } from '@/components/Buttons';
import { styled } from '@mui/material/styles';
import Container from '@/components/Container';
import { TextareaAutosize } from '@mui/material';
import { useGetAdblockListQuery, useUpdateAdblockListMutation } from '@/services/adblock';

const AreaInput = styled(TextareaAutosize)({
  width: '100%',
  fontSize: '1.5rem',
  fontWeight: 400,
  color: '#32373D',
  margin: 'auto',
  borderRadius: '8px',
  border: '1px solid #a1a9b5',
  '&:hover, &:focus': {
    borderColor: '#79a6ee',
  },
  outline: 'none',
  resize: 'none',
  minHeight: '500px',
  padding: '10px',
});

function WithdrawRequestsContainer() {
  const { data, isFetching, refetch: refetchUserList } = useGetAdblockListQuery({});
  const [inputData, setInputData] = useState<string>('');

  const [updateAdblockList, { isLoading: isLoadingAdblockList }] = useUpdateAdblockListMutation({});

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target) {
      setInputData(e.target?.value);
    }
  };

  const handleSubmit = async () => {
    if (inputData) {
      const dataAdblock = inputData.split('\n').filter(x => x);
      try {
        await updateAdblockList(JSON.stringify(dataAdblock)).unwrap();
        refetchUserList();
        setInputData('');
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <Container loading={isFetching || isLoadingAdblockList}>
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
            {window.T('Adblock')}
          </Typography>
        </Box>
        <Stack
          mt={2}
          mb={1}
          direction={{
            xs: 'column',
            md: 'row',
          }}
          justifyContent="space-between"
        >
          <Stack
            direction="row"
            sx={{
              display: {
                xs: 'none',
                md: 'flex',
              },
            }}
          ></Stack>
        </Stack>
        <Box
          sx={{
            background: '#fff',
            py: 2,
          }}
        >
          <AreaInput
            name="adblock-area"
            id="adblock-area"
            placeholder="Input adblock"
            onChange={e => handleChange(e)}
            defaultValue={data || ''}
          />
        </Box>
        <Stack direction="row" spacing={3}>
          <ConfirmButton
            type="submit"
            label={window.T('Save')}
            onClick={handleSubmit}
            loading={isLoadingAdblockList}
            disabled={!inputData}
            sx={{
              minWidth: '120px !important',
            }}
          />
        </Stack>
      </Box>
    </Container>
  );
}

export default WithdrawRequestsContainer;

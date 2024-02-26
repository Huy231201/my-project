import { CancelButton, ConfirmButton } from '@/components/Buttons';
import Container from '@/components/Container';
import HerondIcon from '@/components/Icons';
import Modal, { DialogActions, DialogContent } from '@/components/Modal';
import HerondTable from '@/components/Table';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import { ChainManagementHeadTable } from './config';

import { SearchInputField } from '@/components/Fields';
import { useDeleteChainMutation, useGetChainListQuery } from '@/services/chain-management ';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ButtonAction = styled(Button)({
  border: 'none',
  fontSize: '14px',
  fontWeight: 400,
  color: '#32373D',
  minWidth: 'fit-content !important',
  minHeight: 'fit-content !important',
  '&:hover, &:active': {
    background: 'transparent',
  },
});

function TokenManagement() {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  const [chainId, setChainId] = useState(0);
  const [filter, setFilter] = useState({ query: '', pageIndex: 1, pageSize: 10 });
  const { data, isFetching, refetch: refetchChainList } = useGetChainListQuery({ ...filter });

  const [deleteChain, { isLoading: isDeleteChainLoading }] = useDeleteChainMutation({});

  const handleUpdateFilter = (name: string) => (value: string | number) => {
    setFilter(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleShowDeleteTokenModal = (chainIdDelete: number) => {
    if (chainIdDelete) {
      setChainId(chainIdDelete);
      setShowDeleteModal(true);
    }
  };
  const handleDeleteToken = async () => {
    try {
      if (chainId) {
        await deleteChain({ chainId }).unwrap();
        refetchChainList();
        toast.success('Delete Chain successfully');
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const withDrawalData = useMemo(
    () =>
      (data?.items || []).map((item: any) => ({
        ...item,
        action: (
          <Stack direction="row" spacing={1}>
            <ButtonAction variant="text" onClick={() => navigate(`/chain-management/${item.chainId}`)}>
              <HerondIcon name="pencil" />
            </ButtonAction>
            <ButtonAction variant="text" onClick={() => handleShowDeleteTokenModal(item.chainId)}>
              <HerondIcon name="trash" />
            </ButtonAction>
          </Stack>
        ),
      })),
    [data?.length, data],
  );

  return (
    <Container loading={isFetching || isDeleteChainLoading}>
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
            {window.T('Chain Management')}
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
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            spacing={1.5}
            mb={2}
          >
            <Button
              variant="outlined"
              sx={{
                borderColor: '#298CFD',
                color: '#298CFD',
                minWidth: 80,
              }}
              onClick={() => navigate('/chain-management/new')}
            >
              {window.T('Add new chain')}
            </Button>
          </Stack>
          <Stack
            direction={{
              xs: 'column',
              md: 'row',
            }}
            justifyContent="center"
            spacing={1.5}
          >
            <SearchInputField
              sx={{
                width: '100%',
              }}
              placeholder={window.T('Name')}
              onSubmit={handleUpdateFilter('query')}
            />
          </Stack>
        </Stack>
        <Box
          sx={{
            background: '#fff',
            py: 2,
          }}
        >
          <Typography
            variant="body1"
            sx={{
              display: {
                xs: 'none',
                md: 'flex',
              },
            }}
          >{`${data?.totalCount || 0} items`}</Typography>
          <HerondTable
            loading={isFetching}
            pageIndex={data?.pageIndex || 1}
            totalPages={data?.totalPages || 1}
            headCells={ChainManagementHeadTable}
            rows={withDrawalData}
            onChangePage={handleUpdateFilter('pageIndex')}
          />
        </Box>
      </Box>

      <Modal
        open={showDeleteModal}
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <HerondIcon name="receive" />
            <Typography variant="h4">{window.T('Delete Chain')}</Typography>
          </Stack>
        }
        onClose={() => setShowDeleteModal(false)}
        sxWrapper={{
          '& .MuiDialog-paper': {
            width: '100%',
            margin: '16px',
            px: 2,
            py: 1,
          },
        }}
      >
        <DialogContent
          sx={{
            px: 4,
            py: 6,
            border: 'none',
          }}
          dividers
        >
          <Stack mt={1} spacing={1} direction="row" alignItems="center">
            <Typography variant="body1" color="error">
              {window.T('Do you want to delete this chain?')}
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <CancelButton
            type="submit"
            label={window.T('Cancel')}
            onClick={() => setShowDeleteModal(false)}
            sx={{
              minWidth: '120px !important',
            }}
          />
          <ConfirmButton
            type="submit"
            label={window.T('Delete')}
            loading={isDeleteChainLoading}
            onClick={handleDeleteToken}
            sx={{
              minWidth: '120px !important',
            }}
          />
        </DialogActions>
      </Modal>
    </Container>
  );
}

export default TokenManagement;

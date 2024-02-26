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
import { TokenManagementHeadTable } from './config';

import { transformFormData } from '@/utils/common';
import {
  useCreateTokenMutation,
  useDeleteTokenMutation,
  useGetTokenDetailsMutation,
  useGetTokenListQuery,
  useUpdateTokenMutation,
} from '@/services/token-management';
import TokenForm, { inputDataProps } from './TokenForm';
import { SearchInputField } from '@/components/Fields';
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

function ChainManagement() {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showDetailsTokenModal, setshowDetailsTokenModal] = useState<boolean>(false);
  const [newToken, setNewToken] = useState<inputDataProps>({
    address: '',
    name: '',
    erc20: false,
    symbol: '',
    decimals: '',
    coingeckoId: '',
    chainId: '',
  });

  const [file, setFile] = useState<File | null>(null);

  const [tokenInfor, setTokenInfo] = useState<inputDataProps>({
    address: '',
    name: '',
    erc20: false,
    symbol: '',
    decimals: '',
    coingeckoId: '',
    chainId: '',
  });
  const [fileDetails, setFileDetails] = useState<File | null>(null);
  const [filter, setFilter] = useState({ query: '', pageIndex: 1, pageSize: 10 });
  const { data, isFetching, refetch: refetchTokenList } = useGetTokenListQuery({ ...filter });

  const [getTokenDetails, { isLoading: isGetTokenDetailLoading }] = useGetTokenDetailsMutation({});
  const [updateToken, { isLoading: isUpdateTokenLoading }] = useUpdateTokenMutation({});
  const [deleteToken, { isLoading: isDeleteTokenLoading }] = useDeleteTokenMutation({});
  const [createToken, { isLoading: isCreateTokenLoading }] = useCreateTokenMutation({});

  const handleUpdateFilter = (name: string) => (value: string | number) => {
    setFilter(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenDrawerDetail = async (token: any) => {
    if (token) {
      try {
        const res = await getTokenDetails({ chainId: token.chainId, address: token.address }).unwrap();
        if (res) {
          setTokenInfo({ ...res });
        }
      } catch (error) {
        console.log(error);
      }
    }

    setshowDetailsTokenModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setFile(null);
  };

  const handleCloseDetailsModal = () => {
    setshowDetailsTokenModal(false);
    setFileDetails(null);
  };

  const handleShowDeleteTokenModal = (token: inputDataProps) => {
    if (token) {
      setTokenInfo({ ...token });
      setShowDeleteModal(true);
    }
  };

  const handleCreateNewToken = async () => {
    if (
      !file ||
      !newToken.address ||
      !newToken.chainId ||
      !newToken.coingeckoId ||
      !newToken.decimals ||
      !newToken.name ||
      !newToken.symbol
    ) {
      return;
    }

    try {
      const newTokenData = transformFormData({ ...newToken, logo: file });

      await createToken(newTokenData).unwrap();
      setFile(null);
      setNewToken({ address: '', name: '', erc20: false, symbol: '', decimals: '', coingeckoId: '', chainId: '' });
      refetchTokenList();
      setShowCreateModal(false);
      toast.success(window.T('Create new token successfully'));
    } catch (e) {
      console.log(e);
    }
  };

  const handleUpdateToken = async () => {
    if (
      !tokenInfor.address ||
      !tokenInfor.chainId ||
      !tokenInfor.coingeckoId ||
      !tokenInfor.decimals ||
      !tokenInfor.name ||
      !tokenInfor.symbol
    ) {
      return;
    }

    try {
      const updateTokenInfo = transformFormData({ ...tokenInfor, logo: fileDetails || null });

      await updateToken(updateTokenInfo).unwrap();
      setFile(null);
      setFileDetails(null);
      refetchTokenList();
      setshowDetailsTokenModal(false);
      toast.success(window.T('Update token successfully'));
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteToken = async () => {
    if (tokenInfor) {
      try {
        await deleteToken({ chainId: tokenInfor.chainId, address: tokenInfor.address }).unwrap();
        setTokenInfo({ address: '', name: '', erc20: false, symbol: '', decimals: '', coingeckoId: '', chainId: '' });
        refetchTokenList();
        setShowDeleteModal(false);
        toast.success(window.T('Delete token successfully'));
      } catch (error) {
        console.log(error);
      }
    }
  };

  const withDrawalData = useMemo(
    () =>
      (data?.items || []).map((item: any) => ({
        ...item,
        erc20: item.erc20.toString(),
        action: (
          <Stack direction="row" spacing={1}>
            <ButtonAction variant="text" onClick={() => handleOpenDrawerDetail(item)}>
              <HerondIcon name="pencil" />
            </ButtonAction>
            <ButtonAction variant="text" onClick={() => handleShowDeleteTokenModal(item)}>
              <HerondIcon name="trash" />
            </ButtonAction>
          </Stack>
        ),
      })),
    [data?.length, data],
  );

  return (
    <Container loading={isFetching || isCreateTokenLoading || isGetTokenDetailLoading}>
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
            {window.T('Token Management')}
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
            mb={1}
          >
            <Button
              variant="outlined"
              sx={{
                borderColor: '#298CFD',
                color: '#298CFD',
                minWidth: 80,
              }}
              onClick={() => setShowCreateModal(true)}
            >
              {window.T('Add new token')}
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
            headCells={TokenManagementHeadTable}
            rows={withDrawalData}
            onChangePage={handleUpdateFilter('pageIndex')}
          />
        </Box>
      </Box>
      <Modal
        open={showCreateModal}
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h4">{window.T('Add new token')}</Typography>
          </Stack>
        }
        onClose={handleCloseCreateModal}
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
          <Stack mt={1} spacing={1} direction="row" alignItems="center" padding={0}>
            <TokenForm tokenInfo={newToken} setTokenInfo={setNewToken} file={file} setFile={setFile} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <CancelButton
            type="submit"
            label={window.T('Cancel')}
            onClick={handleCloseCreateModal}
            sx={{
              minWidth: '120px !important',
            }}
          />
          <ConfirmButton
            type="submit"
            disabled={!file || Object.values(newToken).includes('')}
            label={window.T('Create')}
            loading={isCreateTokenLoading}
            onClick={handleCreateNewToken}
            sx={{
              minWidth: '120px !important',
            }}
          />
        </DialogActions>
      </Modal>
      <Modal
        open={showDeleteModal}
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <HerondIcon name="receive" />
            <Typography variant="h4">{window.T('Delete Token')}</Typography>
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
              {window.T('Do you want to delete this token?')}
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
            loading={isDeleteTokenLoading}
            onClick={handleDeleteToken}
            sx={{
              minWidth: '120px !important',
            }}
          />
        </DialogActions>
      </Modal>
      <Modal
        open={showDetailsTokenModal}
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <HerondIcon name="receive" />
            <Typography variant="h4">{window.T('Token details')}</Typography>
          </Stack>
        }
        onClose={handleCloseDetailsModal}
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
          <Stack mt={1} spacing={1} direction="column">
            <TokenForm
              tokenInfo={tokenInfor}
              setTokenInfo={setTokenInfo}
              file={fileDetails}
              setFile={setFileDetails}
              detail
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <CancelButton
            type="submit"
            label={window.T('Close')}
            onClick={handleCloseDetailsModal}
            sx={{
              minWidth: '120px !important',
            }}
          />
          <ConfirmButton
            type="submit"
            label={window.T('Update')}
            loading={isUpdateTokenLoading}
            onClick={handleUpdateToken}
            sx={{
              minWidth: '120px !important',
            }}
          />
        </DialogActions>
      </Modal>
    </Container>
  );
}

export default ChainManagement;

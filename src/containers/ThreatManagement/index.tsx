import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import HerondTable from '@/components/Table';
import { StatusEnum } from '@/components/StatusLabel';
import SearchInputField from '@/components/Fields/SearchInputField';
import HerondIcon from '@/components/Icons';
import Container from '@/components/Container';
import ThreatDetail from './threatDetail';
import ThreatManagementSelectField from './threatManagementSelectField';
import ThreatManagementModal from './threatManagementModal';
import { BlacklistDomainsHeadTable, PlatformTypeOptions, ThreatEntryTypeOptions, ThreatTypeOptions } from './config';
import {
  useGetThreatListQuery,
  useCreateThreatMutation,
  useUpdateThreatMutation,
  useDeleteThreatMutation,
} from '@/services/threat-management';

interface ThreatItem {
  prefixHash: string;
  fullHash: string;
  data: string;
}

interface ThreatItem {
  items: ThreatItem[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

interface FilterProps {
  search: string;
  platformType: string;
  threatEntryType: string;
  threatType: string;
  page: number;
  pageSize: number;
}

interface FormInput {
  platformType: string;
  threatEntryType: string;
  threatType: string;
  data: string;
}

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

const DEFAULT_FILTER_VALUE = {
  search: '',
  platformType: '7',
  threatEntryType: '1',
  threatType: '129',
  page: 1,
  pageSize: 10,
};

function ThreatManagementContainer() {
  const [modalType, setModalType] = useState<'add' | 'detail' | 'edit' | 'delete' | null>(null);
  const [filter, setFilter] = useState<FilterProps>(DEFAULT_FILTER_VALUE);
  const [editData, setEditData] = useState<string>('');
  const [detailFullHash, setDetailFullHash] = useState<string | Array<string | number>>('');
  const [deleteFullHash, setDeleteFullHash] = useState<string>('');

  const {
    data: threatListData,
    isFetching,
    refetch: refetchThreatList,
  } = useGetThreatListQuery({
    search: filter.search,
    platformType: filter.platformType,
    threatEntryType: filter.threatEntryType,
    threatType: filter.threatType,
    pageIndex: filter.page,
    pageSize: filter.pageSize,
  });

  const [createThreat, { isLoading: isCreatingThreat, isSuccess: isAddSuccess }] = useCreateThreatMutation({});
  const [updateThreat, { isLoading: isUpdatingThreat, isSuccess: isUpdateSuccess }] = useUpdateThreatMutation({});
  const [deleteThreat, { isLoading: isDeletingThreat, isSuccess: isDeleteSuccess }] = useDeleteThreatMutation({});

  const handleCloseModal = () => {
    setModalType(null);
  };

  const handleAddNewThreat = async (newThreatValue: FormInput | undefined) => {
    if (newThreatValue) {
      const { platformType, threatEntryType, threatType, data } = newThreatValue;
      try {
        await createThreat({
          newData: {
            platformType: Number(platformType),
            threatEntryType: Number(threatEntryType),
            threatType: Number(threatType),
            data,
          },
        });
      } catch (error) {
        toast.error(window.T('Add threat failed'));
      }
    }
  };

  const handleEditThreat = async (newThreatValue: FormInput | undefined) => {
    if (newThreatValue) {
      const { platformType, threatEntryType, threatType, data } = newThreatValue;
      try {
        await updateThreat({
          oldData: {
            platformType: Number(platformType),
            threatEntryType: Number(threatEntryType),
            threatType: Number(threatType),
            data: editData,
          },
          newData: {
            platformType: Number(platformType),
            threatEntryType: Number(threatEntryType),
            threatType: Number(threatType),
            data,
          },
        });
      } catch (error) {
        toast.error(window.T('Edit threat failed'));
      }
    }
  };

  const handleDeleteThreat = async () => {
    try {
      await deleteThreat({
        platformType: filter.platformType,
        threatEntryType: filter.threatEntryType,
        threatType: filter.threatType,
        fullHash: deleteFullHash,
      });
    } catch (error) {
      toast.error(window.T('Delete threat failed'));
    }

    setDeleteFullHash('');
  };

  const handleDetailClick = (fullHashValue: string) => {
    setDetailFullHash(fullHashValue);
    setModalType('detail');
  };
  const handleRowSelect = (fullHash: Array<string | number>) => {
    setDetailFullHash(fullHash);
    setModalType('detail');
  };
  const handleEditClick = (data: string) => {
    if (filter.threatEntryType === '1') {
      setEditData(`https://${data}`);
    } else {
      setEditData(data);
    }
    setModalType('edit');
  };
  const handleDeleteClick = (fullHashValue: string) => {
    setDeleteFullHash(fullHashValue);
    setModalType('delete');
  };

  const blacklistDomainsData = useMemo(
    () =>
      (threatListData?.items || []).map((item: ThreatItem, index: number) => ({
        id: item.fullHash,
        order: (filter.page - 1) * 10 + index + 1,
        data: item.data,
        action: (
          <Stack spacing={0} direction="row">
            <ButtonAction variant="text" onClick={() => handleDetailClick(item.fullHash)}>
              <HerondIcon name="eye" />
            </ButtonAction>
            <ButtonAction variant="text" onClick={() => handleEditClick(item.data)}>
              <HerondIcon name="pencil" />
            </ButtonAction>
            <ButtonAction variant="text" onClick={() => handleDeleteClick(item.fullHash)}>
              <HerondIcon name="trash" sx={{ width: '30px', height: '30px' }} />
            </ButtonAction>
          </Stack>
        ),
      })),
    [threatListData],
  );

  const handleUpdateFilter = (name: string) => (value: string | number | StatusEnum) => {
    setFilter(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePlatformTypeChange = (value: string) => {
    handleUpdateFilter('platformType')(value);
  };
  const handleThreatEntryTypeChange = (value: string) => {
    handleUpdateFilter('threatEntryType')(value);
  };
  const handleThreatTypeChange = (value: string) => {
    handleUpdateFilter('threatType')(value);
  };

  useEffect(() => {
    if (isAddSuccess) {
      toast.success(window.T('Create threat successfully'));
    }
    handleCloseModal();
    refetchThreatList();
  }, [isAddSuccess]);

  useEffect(() => {
    if (isUpdateSuccess) {
      toast.success(window.T('Edit threat successfully'));
    }
    handleCloseModal();
    refetchThreatList();
  }, [isUpdateSuccess]);

  useEffect(() => {
    if (isDeleteSuccess) {
      toast.success(window.T('Delete threat successfully'));
    }
    handleCloseModal();
    refetchThreatList();
  }, [isDeleteSuccess]);

  return (
    <Container>
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
            noWrap
            variant="h3"
            sx={{
              fontSize: 20,
            }}
          >
            {window.T('Threat Management')}
          </Typography>
        </Box>
        <Stack
          mt={2}
          mb={1}
          direction={{
            xs: 'column',
            lg: 'row',
          }}
          justifyContent="space-between"
          alignItems={{ xs: 'start', lg: 'center' }}
          spacing={1.5}
        >
          <Button
            variant="outlined"
            sx={{
              borderColor: '#298CFD',
              color: '#298CFD',
              width: { xs: '100%', sm: 170 },
            }}
            onClick={() => setModalType('add')}
          >
            {window.T('Create new threat')}
          </Button>
          <Stack direction={{ xs: 'column', lg: 'row' }} width={{ xs: '100%', sm: 'auto' }} spacing={1.5}>
            <Typography
              variant="body1"
              textAlign="center"
              sx={{
                display: {
                  xs: 'none',
                  lg: 'flex',
                },
                mr: '12px',
              }}
            >{`${threatListData?.totalCount || 0} items`}</Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
              <ThreatManagementSelectField
                label="Platform Type"
                value={filter.platformType}
                options={PlatformTypeOptions}
                onChange={handlePlatformTypeChange}
                sx={{ width: { sx: '100%', md: '170px' } }}
              />
              <ThreatManagementSelectField
                label="Threat Entry Type"
                value={filter.threatEntryType}
                options={ThreatEntryTypeOptions}
                onChange={handleThreatEntryTypeChange}
                sx={{ width: { sx: '100%', md: '170px' } }}
              />
              <ThreatManagementSelectField
                label="Threat Type"
                value={filter.threatType}
                options={ThreatTypeOptions}
                onChange={handleThreatTypeChange}
                sx={{ width: { sx: '100%', md: '170px' } }}
              />
            </Stack>

            <Stack direction={{ xm: 'column', md: 'row' }} justifyContent="start" alignItems="center">
              <SearchInputField
                sx={{
                  width: '100%',
                }}
                placeholder={window.T('Enter search data')}
                onSubmit={handleUpdateFilter('search')}
              />
            </Stack>
          </Stack>
        </Stack>
        <Box
          sx={{
            background: '#fff',
            py: 2,
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            sx={{
              display: {
                xs: 'flex',
                lg: 'none',
              },
              mb: 1,
            }}
          >
            <Typography variant="body1">{`${threatListData?.totalCount || 0} items`}</Typography>
          </Stack>
          <HerondTable
            loading={isFetching}
            pageIndex={threatListData?.pageIndex || 1}
            totalPages={threatListData?.totalPages || 1}
            headCells={BlacklistDomainsHeadTable}
            rows={blacklistDomainsData}
            onChangePage={handleUpdateFilter('page')}
            enableSelect
            onSelectRow={handleRowSelect}
          />
          <ThreatManagementModal
            type="add"
            title="Create New Threat"
            submitButtonText="Add"
            open={modalType === 'add'}
            isLoading={isCreatingThreat}
            onClose={handleCloseModal}
            onCancel={handleCloseModal}
            onConfirm={handleAddNewThreat}
          />
          <ThreatManagementModal
            type="edit"
            title="Edit Threat"
            submitButtonText="Confirm"
            open={modalType === 'edit'}
            editData={editData}
            isLoading={isUpdatingThreat}
            onClose={handleCloseModal}
            onCancel={handleCloseModal}
            onConfirm={handleEditThreat}
          />
          <ThreatManagementModal
            type="delete"
            title="Delete Threat"
            submitButtonText="Delete"
            open={modalType === 'delete'}
            isLoading={isDeletingThreat}
            onClose={handleCloseModal}
            onCancel={handleCloseModal}
            onConfirm={handleDeleteThreat}
          />
          <ThreatDetail
            open={modalType === 'detail'}
            platformType={filter.platformType}
            threatEntryType={filter.threatEntryType}
            threatType={filter.threatType}
            fullHash={detailFullHash}
            onClose={handleCloseModal}
          />
        </Box>
      </Box>
    </Container>
  );
}
export default ThreatManagementContainer;

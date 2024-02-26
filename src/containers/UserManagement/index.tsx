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
import { MouseEvent, useEffect, useMemo, useState } from 'react';
import { UserManagementHeadTable } from './config';

import toast from 'react-hot-toast';
import { Checkbox, FormControlLabel, FormGroup, TextField } from '@mui/material';
import {
  useAddUserManagementMutation,
  useAssignRoleMutation,
  useDeleteUserMutation,
  useGetListRoleQuery,
  useGetUserListQuery,
  useRevokeRoleMutation,
} from '@/services/user-management';
import { validateEmail } from '@/utils/common';

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

interface UserProps {
  userId: string;
  email: string;
  roles: string[];
}

interface RoleProps {
  id: number;
  name: string;
}

function UserManagementContainer() {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState<boolean>(false);
  const [userInfor, setUserInfo] = useState<UserProps>({
    userId: '',
    email: '',
    roles: [],
  });
  const [inputEmail, setInputEmail] = useState<string>('');

  const { data, isFetching, refetch: refetchUserList } = useGetUserListQuery({});
  const { data: listRole, isFetching: isFetchingGetRole } = useGetListRoleQuery({});

  useEffect(() => {
    const updateUser: UserProps = data?.find((d: UserProps) => d.userId === userInfor.userId);
    if (updateUser) {
      setUserInfo({ ...updateUser });
    }
  }, [data]);

  const [addUserManagement, { isLoading: isAddUserManagement, error: errorAddUser }] = useAddUserManagementMutation({});
  const [assignRole, { isLoading: isAssignRole }] = useAssignRoleMutation({});
  const [revokeRole, { isLoading: isRevokeRole }] = useRevokeRoleMutation({});
  const [deleteUser, { isLoading: isDeleteUser }] = useDeleteUserMutation({});

  const handleAddUserManagement = async () => {
    if (inputEmail) {
      try {
        const res = await addUserManagement({
          email: inputEmail,
        }).unwrap();

        if (res) {
          refetchUserList();
          setShowCreateModal(false);
          setInputEmail('');
          toast.success(window.T('Add user successfully'));
        }
      } catch (error) {
        toast.error('Email not exits!');
        console.log(error);
      }
    }
  };

  const handleOpenDrawerDetail = (user: UserProps) => (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setUserInfo({ ...user });
    setShowEditRoleModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setInputEmail('');
  };

  const handleDeleteUser = async () => {
    if (userInfor) {
      try {
        const res = await deleteUser({ id: userInfor.userId }).unwrap();

        if (res) {
          refetchUserList();
          setShowDeleteModal(false);
          toast.success(window.T('Delete user successfully'));
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleShowDeleteUserModal = (user: UserProps) => {
    if (user) {
      setUserInfo({ ...user });
      setShowDeleteModal(true);
    }
  };

  const withDrawalData = useMemo(
    () =>
      (data || []).map((item: any) => ({
        ...item,
        roles: item.roles.map((r: string) => <span key={r}>{r}</span>),
        action: (
          <Stack direction="row" spacing={1}>
            <ButtonAction variant="text" onClick={handleOpenDrawerDetail(item)}>
              <HerondIcon name="pencil" />
            </ButtonAction>
            <ButtonAction variant="text" onClick={() => handleShowDeleteUserModal(item)}>
              <HerondIcon name="trash" sx={{ width: 14 }} />
            </ButtonAction>
          </Stack>
        ),
      })),
    [data?.length, data],
  );

  const handleChangeRole = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const ele = e.target;
    if (ele && !ele.checked) {
      try {
        const res = await revokeRole({ userId: userInfor.userId, roleId: ele.value }).unwrap();

        if (res) {
          refetchUserList();
          toast.success(window.T('Change role successfully'));
        }
      } catch (error) {
        console.log(error);
      }
    } else if (ele && ele.checked) {
      try {
        const res = await assignRole({ userId: userInfor.userId, roleId: ele.value }).unwrap();

        if (res) {
          refetchUserList();
          toast.success(window.T('Change role successfully'));
        }
      } catch (error) {
        console.log(error);
      }
    }
  };
  return (
    <Container loading={isFetching || isDeleteUser || isFetchingGetRole || isAssignRole || isRevokeRole}>
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
            {window.T('User Management')}
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
              {window.T('Add new user')}
            </Button>
          </Stack>
          <Stack
            direction={{
              xs: 'column',
              md: 'row',
            }}
            justifyContent="center"
            spacing={1.5}
          ></Stack>
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
                xs: 'flex',
                md: 'none',
              },
              mb: 1,
            }}
          >{`${data?.totalCount || 0} items`}</Typography>
          <HerondTable
            loading={isFetching}
            pageIndex={data?.pageIndex || 1}
            totalPages={data?.totalPages || 1}
            headCells={UserManagementHeadTable}
            rows={withDrawalData}
          />
        </Box>
      </Box>
      <Modal
        open={showCreateModal}
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h4">{window.T('Add new user')}</Typography>
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
          <Stack mt={1} spacing={1} direction="row" alignItems="center">
            <TextField
              sx={{
                width: '100%',
              }}
              placeholder={window.T('Email')}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setInputEmail(event.target.value);
              }}
            />
            {/* errorAddUser && <Typography color="error">{errorAddUser}</Typography> */}
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
            disabled={!inputEmail || !validateEmail(inputEmail)}
            label={window.T('Add')}
            loading={isAddUserManagement}
            onClick={handleAddUserManagement}
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
            <Typography variant="h4">{window.T('Add new user')}</Typography>
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
            <Typography variant="h5" color="error">
              {window.T('Are you sure to delete user?')}
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
            loading={isDeleteUser}
            onClick={handleDeleteUser}
            sx={{
              minWidth: '120px !important',
            }}
          />
        </DialogActions>
      </Modal>
      <Modal
        open={showEditRoleModal}
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <HerondIcon name="receive" />
            <Typography variant="h4">{window.T('User Details')}</Typography>
          </Stack>
        }
        onClose={() => setShowEditRoleModal(false)}
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
            <p>User Id: {userInfor?.userId}</p>
            <p>Email: {userInfor?.email}</p>
            <FormGroup>
              {listRole?.map((per: RoleProps) => (
                <FormControlLabel
                  key={per.id}
                  control={
                    <Checkbox
                      value={per.id}
                      sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }}
                      checked={userInfor.roles?.includes(per.name) || false}
                      onChange={e => handleChangeRole(e)}
                    />
                  }
                  label={per.name}
                ></FormControlLabel>
              ))}
            </FormGroup>
          </Stack>
        </DialogContent>
        <DialogActions>
          <CancelButton
            type="submit"
            label={window.T('Close')}
            onClick={() => setShowEditRoleModal(false)}
            sx={{
              minWidth: '120px !important',
            }}
          />
        </DialogActions>
      </Modal>
    </Container>
  );
}

export default UserManagementContainer;

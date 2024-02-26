import { api } from './api';

export const Api = api.injectEndpoints({
  endpoints: builder => ({
    getUserList: builder.query({
      query: () => ({
        url: '/UserManagement',
      }),
    }),
    addUserManagement: builder.mutation({
      query: data => ({
        url: '/UserManagement',
        method: 'POST',
        data,
      }),
    }),
    deleteUser: builder.mutation({
      query: ({ id }) => ({
        url: `/UserManagement/${id}`,
        method: 'DELETE',
      }),
    }),
    getListRole: builder.query({
      query: () => ({
        url: '/rolemanagement',
      }),
    }),
    assignRole: builder.mutation({
      query: ({ userId, roleId }) => ({
        url: `/UserManagement/${userId}/roles/assign/${roleId}`,
        method: 'PUT',
      }),
    }),
    revokeRole: builder.mutation({
      query: ({ userId, roleId }) => ({
        url: `/UserManagement/${userId}/roles/revoke/${roleId}`,
        method: 'PUT',
      }),
    }),
  }),
});

export const {
  useGetUserListQuery,
  useAddUserManagementMutation,
  useDeleteUserMutation,
  useGetListRoleQuery,
  useAssignRoleMutation,
  useRevokeRoleMutation,
} = Api;

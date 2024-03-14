import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Button, IconButton, Tooltip } from '@mui/material';
import {
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query';
import {
  MaterialReactTable,
  useMaterialReactTable,
  // createRow,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
} from 'material-react-table';
import { useMemo, useState } from 'react';
import { useAppSelector } from "../hooks/store";
import { useUserActions } from '../hooks/useUserActions';
import type { User, UserWithId } from '../store/users/slice';

export function ListOfUsers () {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const columns = useMemo<MRT_ColumnDef<UserWithId>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Id',
        enableEditing: false,
        size: 80,
      },
      {
        accessorKey: 'name',
        header: 'Name',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.name,
          helperText: validationErrors?.name,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              name: undefined,
            }),
          //optionally add validation checking for onBlur or onChange
        },
      },
      {
        accessorKey: 'email',
        header: 'Email',
        muiEditTextFieldProps: {
          type: 'email',
          required: true,
          error: !!validationErrors?.email,
          helperText: validationErrors?.email,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              email: undefined,
            }),
        },
      },
      {
        accessorKey: 'github',
        header: 'GitHub',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.github,
          helperText: validationErrors?.github,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              github: undefined,
            }),
          //optionally add validation checking for onBlur or onChange
        },
      },
    ],
    [validationErrors],
  );

  //call READ hook
  const {
    data: fetchedUsers = [],
    isError: isLoadingUsersError,
    isFetching: isFetchingUsers,
    isLoading: isLoadingUsers,
  } = useGetUsers();

  //call CREATE hook
  const { mutateAsync: createUser, isPending: isCreatingUser } =
    useCreateUser();

  //call UPDATE hook
  const { mutateAsync: updateUser, isPending: isUpdatingUser } =
    useUpdateUser();

  //call DELETE hook
  const { mutateAsync: deleteUser, isPending: isDeletingUser } =
    useDeleteUser();

  //CREATE action
  const handleCreateUser: MRT_TableOptions<UserWithId>['onCreatingRowSave'] = async ({
    values,
    table,
  }) => {
    const newValidationErrors = validateUser(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await createUser(values);
    table.setCreatingRow(null); //exit creating mode
  };

  //UPDATE action
  const handleSaveUser: MRT_TableOptions<UserWithId>['onEditingRowSave'] = async ({
    values,
    table,
  }) => {
    const newValidationErrors = validateUser(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await updateUser(values);
    table.setEditingRow(null); //exit editing mode
  };

  //DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<UserWithId>) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(row.original.id);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: fetchedUsers,
    createDisplayMode: 'row', // ('modal', and 'custom' are also available)
    editDisplayMode: 'row', // ('modal', 'cell', 'table', and 'custom' are also available)
    enableEditing: true,
    getRowId: (row) => row.id,
    muiToolbarAlertBannerProps: isLoadingUsersError
      ? {
        color: 'error',
        children: 'Error loading data',
      }
      : undefined,
    muiTableContainerProps: {
      sx: {
        minHeight: '500px',
      },
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateUser,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveUser,
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        <Tooltip title="Edit">
          <IconButton onClick={() => table.setEditingRow(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="contained"
        onClick={() => {
          table.setCreatingRow(true); //simplest way to open the create row modal with no default values
          //or you can pass in a row object to set default values with the `createRow` helper function
          // table.setCreatingRow(
          //   createRow(table, {
          //     //optionally pass in default values for the new row, useful for nested data or other complex scenarios
          //   }),
          // );
        }}
      >
        Create New User
      </Button>
    ),
    state: {
      isLoading: isLoadingUsers,
      isSaving: isCreatingUser || isUpdatingUser || isDeletingUser,
      showAlertBanner: isLoadingUsersError,
      showProgressBars: isFetchingUsers,
    },
  });

  return <MaterialReactTable table={table} />;
};

//CREATE hook (post new user to api)
function useCreateUser () {
  const { addUser } = useUserActions();
  //const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: UserWithId) => {
      //send api update request here
      addUser({ ...user });
      return Promise.resolve();
    },
    //client side optimistic update
    onMutate: (newUserInfo: UserWithId) => {
      // queryClient.setQueryData(
      //   ['users'],
      //   (prevUsers: any) =>
      //     [
      //       ...prevUsers,
      //       {
      //         ...newUserInfo,
      //         id: (Math.random() + 1).toString(36).substring(7),
      //       },
      //     ] as UserWithId[],
      // );
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
  });
}

//READ hook (get users from api)
function useGetUsers () {
  const users = useAppSelector((state) => state.users);
  return useQuery<UserWithId[]>({
    queryKey: ['users'],
    queryFn: async () => {
      //send api request here
      await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
      return Promise.resolve(users);
    },
    refetchOnWindowFocus: false,
  });
}

//UPDATE hook (put user in api)
function useUpdateUser () {
  const { editUser } = useUserActions();
  //const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: UserWithId) => {
      editUser({ ...user });
      return Promise.resolve();
    },
    //client side optimistic update
    onMutate: (newUserInfo: UserWithId) => {
      // queryClient.setQueryData(['users'], (prevUsers: any) =>
      //   prevUsers?.map((prevUser: UserWithId) =>
      //     prevUser.id === newUserInfo.id ? newUserInfo : prevUser,
      //   ),
      // );
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
  });
}

//DELETE hook (delete user in api)
function useDeleteUser () {
  const { removeUser } = useUserActions();
  //const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      removeUser(userId);
      return Promise.resolve();
    },
    //client side optimistic update
    onMutate: (userId: string) => {
      // queryClient.setQueryData(['users'], (prevUsers: any) =>
      //   prevUsers?.filter((user: UserWithId) => user.id !== userId),
      // );
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
  });
}

const validateRequired = (value: string) => !!value.length;
const validateEmail = (email: string) =>
  !!email.length &&
  email
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );

function validateUser (user: UserWithId) {
  return {
    name: !validateRequired(user.name)
      ? 'Name is Required'
      : '',
    email: !validateEmail(user.email) ? 'Incorrect Email Format' : '',
    github: !validateRequired(user.github) ? 'GitHub is Required' : '',
  };
}
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export type UserId = string;

export interface User {
  name: string;
  email: string;
  github: string;
}

export interface UserWithId extends User {
  id: UserId
}

const initialState: UserWithId[] = [
  {
    id: "1",
    name: "Yazmand Rodriguez",
    email: "yazmanito@gmail.com",
    github: "yazmanito",
  },
  {
    id: "2",
    name: "John Doe",
    email: "leo@gmail.com",
    github: "leo",
  },
  {
    id: "3",
    name: "Haakon Dahlberg",
    email: "haakon@gmail.com",
    github: "midudev",
  }
]

export const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    deleteUserById: (state, action: PayloadAction<UserId>) => {
      const id = action.payload;
      return state.filter((user) => user.id !== id);
    }
  }

})

export default usersSlice.reducer;

// Instead of Export the name of the action we export the action itself
export const { deleteUserById } = usersSlice.actions;
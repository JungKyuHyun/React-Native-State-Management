import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface User {
  id: number;
  username: string;
  displayName: string;
}

interface AuthState {
  user: User | null;
}

const initialState: AuthState = {
  user: null,
};

// @see https://redux-toolkit.js.org/api/createSlice#parameters
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authorize(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    logout(state) {
      state.user = null;
    },
  },
});

export default authSlice.reducer;
export const {authorize, logout} = authSlice.actions;

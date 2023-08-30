import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { AppStore } from '.';

interface GlobalState {
  openDrawer: boolean;
}

// Define the initial state for the slice
const initialState: GlobalState = {
  openDrawer: false,
};

// Create the slice
const appSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    toggleOpenDrawer: state => ({
      ...state,
      openDrawer: !state.openDrawer,
    }),
  },
});

// Extract the reducer function from the slice
export default appSlice.reducer;

// Extract action creators from the slice
export const { toggleOpenDrawer } = appSlice.actions;

export const selectOpenDrawer = (state: AppStore) => state.app.openDrawer;

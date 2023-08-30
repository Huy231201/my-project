import { configureStore, PreloadedState } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query/react';
// eslint-disable-next-line import/no-cycle
import appReducer from './appSlice';

import { api } from '@/services/api';

export type RootState = {
  [api.reducerPath]: ReturnType<typeof api.reducer>;
  app: ReturnType<typeof appReducer>;
};

export const setupStore = (preloadedState?: PreloadedState<RootState>) =>
  configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      app: appReducer,
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(api.middleware),
    preloadedState,
  });

export const store = setupStore();

export type AppStore = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

setupListeners(store.dispatch);

export default store;

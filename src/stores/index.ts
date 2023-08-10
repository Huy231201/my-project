import { configureStore, PreloadedState } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query/react';

import { api } from '@/services/api';

export type RootState = {
  [api.reducerPath]: ReturnType<typeof api.reducer>;
};

export const setupStore = (preloadedState?: PreloadedState<RootState>) =>
  configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(api.middleware),
    preloadedState,
  });

export const store = setupStore();

export type AppStore = ReturnType<typeof setupStore>;

setupListeners(store.dispatch);

export default store;

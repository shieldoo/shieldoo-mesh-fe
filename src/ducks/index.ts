import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import { useDispatch as useReduxDispatch } from 'react-redux';

import { authSlice } from './auth';
import { api } from '../api/graphApi';

export const store = configureStore({
  reducer: {
    [authSlice.name]: authSlice.reducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(api.middleware),
});

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk = ThunkAction<void, AppState, unknown, Action>;

export const useDispatch = () => useReduxDispatch<AppDispatch>();

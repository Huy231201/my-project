import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, AppStore } from '@/stores';

export const useTypedSelector: TypedUseSelectorHook<AppStore> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();

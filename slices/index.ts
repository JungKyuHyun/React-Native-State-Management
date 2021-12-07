import {combineReducers} from 'redux';
import auth from './auth';

const rootReducer = combineReducers({
  auth,
});

export type RootState = ReturnType<typeof rootReducer>;

declare module 'react-redux' {
  interface DefaultRootState extends RootState {}
}

export default rootReducer;

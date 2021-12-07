import {useMemo} from 'react';
import {useDispatch} from 'react-redux';
import {bindActionCreators} from 'redux';
import {authorize, logout} from '../slices/auth';

export default function useAuthActions() {
  const dispatch = useDispatch();
  return useMemo(
    () => bindActionCreators({authorize, logout}, dispatch),
    [dispatch],
  );
}

import React from 'react';
import {Button, View} from 'react-native';
import useAuthActions from '../hooks/useAuthActions';

function AuthButtons() {
  // 커스텀 훅으로 랩핑전 사용한 기존 방식
  // const dispatch = useDispatch();
  // const onPressLogin = () => {
  //   dispatch(
  //     authorize({
  //       id: 1,
  //       username: 'JungKyuHyun',
  //       displayName: 'Jacob',
  //     }),
  //   );
  // };
  // const onPressLogout = () => {
  //   dispatch(logout());
  // };

  const {authorize, logout} = useAuthActions();
  const onPressLogin = () => {
    authorize({
      id: 1,
      username: 'JungKyuHyun',
      displayName: 'Jacob',
    });
  };

  return (
    <View>
      <Button title="로그인" onPress={onPressLogin} />
      <Button title="로그아웃" onPress={logout} />
    </View>
  );
}

export default AuthButtons;

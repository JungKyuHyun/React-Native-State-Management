import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import useUser from '../hooks/useUser';

function AuthStatus() {
  // 커스텀 훅으로 랩핑전 사용한 기존 방식
  // const user = useSelector(state => state.auth.user);

  // hoos/useUser.ts
  const user = useUser();

  return (
    <View style={styles.status}>
      <Text style={styles.text}>
        {user != null ? user.displayName : '로그인하세요'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  status: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  text: {fontSize: 20},
});

export default AuthStatus;

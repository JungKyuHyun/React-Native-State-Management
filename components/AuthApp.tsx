import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import AuthButtons from './AuthButtons';
import AuthStatus from './AuthStatus';

function AuthApp() {
  return (
    <SafeAreaView style={styles.block}>
      <AuthStatus />
      <AuthButtons />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  block: {
    flex: 1,
  },
});

export default AuthApp;

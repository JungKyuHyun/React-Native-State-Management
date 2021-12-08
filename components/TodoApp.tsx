import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import TodoInput from './TodoInput';
import Todos from './Todos';

function TodoApp() {
  return (
    <SafeAreaView style={styles.block}>
      <Todos />
      <TodoInput />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  block: {
    flex: 1,
  },
});
export default TodoApp;

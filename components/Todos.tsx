import React from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import useTodos from '../hooks/useTodos';
import useTodosActions from '../hooks/useTodosActions';
import BlackButton from './BlackButton';

interface TodoItemProps {
  id: string;
  text: string;
  done: boolean;
}

function TodoItem({id, text, done}: TodoItemProps) {
  const {toggle, remove} = useTodosActions();

  const onToggle = () => {
    toggle(id);
  };
  const onRemove = () => {
    remove(id);
  };

  return (
    <View style={styles.todo}>
      <Pressable style={styles.toggle} onPress={onToggle}>
        <Text style={[done && styles.doneText]}>{text}</Text>
      </Pressable>
      <BlackButton title="삭제" onPress={onRemove} />
    </View>
  );
}

function Todos() {
  const todos = useTodos();

  return (
    <FlatList
      style={styles.todos}
      data={todos}
      renderItem={({item}) => <TodoItem {...item} />}
      keyExtractor={({id}) => id}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListFooterComponent={() => <View style={styles.separator} />}
    />
  );
}

const styles = StyleSheet.create({
  todos: {
    flex: 1,
  },
  todo: {
    flexDirection: 'row',
    paddingLeft: 8,
  },
  doneText: {
    textDecorationLine: 'line-through',
  },
  toggle: {
    justifyContent: 'center',
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#000',
  },
});

export default Todos;

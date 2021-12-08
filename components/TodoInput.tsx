import React, {useState} from 'react';
import {StyleSheet, TextInput, View} from 'react-native';
import useTodosActions from '../hooks/useTodosActions';
import BlackButton from './BlackButton';

function TodoInput() {
  const [text, setText] = useState('');
  const {add} = useTodosActions();

  const onPress = () => {
    add(text);
    setText('');
  };

  return (
    <View style={styles.inputWrapper}>
      <TextInput
        style={styles.input}
        placeholder="할일을 입력하세요"
        value={text}
        onChangeText={setText}
      />
      <BlackButton title="등록" onPress={onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    borderColor: '#000',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
  input: {
    flex: 1,
    paddingLeft: 20,
    height: 40,
  },
});
export default TodoInput;

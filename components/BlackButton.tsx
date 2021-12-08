import React from 'react';
import {ButtonProps, Pressable, StyleSheet, Text} from 'react-native';

function BlackButton({title, onPress}: Pick<ButtonProps, 'title' | 'onPress'>) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{color: '#fff'}}
      style={styles.button}>
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
  },
});

export default BlackButton;

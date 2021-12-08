/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import {configureStore} from '@reduxjs/toolkit';
import React from 'react';
import {Provider} from 'react-redux';
import PostsApp from './components/PostsApp';
import rootReducer from './slices';

const store = configureStore({reducer: rootReducer});

function App() {
  return (
    <Provider store={store}>
      <PostsApp />
    </Provider>
  );
}

export default App;

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
import {RecoilRoot} from 'recoil';
import AuthApp from './components/AuthApp';
import rootReducer from './slices';

const store = configureStore({reducer: rootReducer});

function App() {
  return (
    <RecoilRoot>
      <AuthApp />
    </RecoilRoot>
  );
}

export default App;

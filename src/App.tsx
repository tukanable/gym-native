import React from 'react';
import { ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Provider, Client, fetchExchange } from 'urql';
// import { offlineExchange } from '@urql/exchange-graphcache';
// import { makeAsyncStorage } from '@urql/storage-rn';
// import schema from './generated/graphql.schema.json';
import { localFetch } from './localServer';
import { useNavigationState } from './hooks/useNavigationState';

import { HomeScreen } from './screens/HomeScreen';
import { ProgramScreen } from './screens/ProgramScreen';
import { DayScreen } from './screens/DayScreen';
import { TrainingScreen } from './screens/TrainingScreen';
import { RootStackParamList } from './screens/types';

// const storage = makeAsyncStorage({
//   dataKey: 'graphcache-data',
//   metadataKey: 'graphcache-metadata',
//   maxAge: 9999999,
// });
//
// const cache = offlineExchange({
//   schema,
//   storage,
//   isOfflineError(error, _result) {
//     console.log(error);
//     return !!error?.networkError;
//   },
// });

const client = new Client({
  url: 'http://localhost:4000/',
  fetch: localFetch,
  exchanges: [
    // cache,
    fetchExchange,
  ],
});

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  const [initialState, handleStateChange, isReady] = useNavigationState('NAVIGATION_STATE_V1');

  if (!isReady) {
    return <ActivityIndicator />;
  }

  return (
    <Provider value={client}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer initialState={initialState} onStateChange={handleStateChange}>
          <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Program" component={ProgramScreen} />
            <Stack.Screen name="Day" component={DayScreen} />
            <Stack.Screen name="Training" component={TrainingScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </Provider>
  );
}

export default App;

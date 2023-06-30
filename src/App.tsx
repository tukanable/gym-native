import React from 'react';
import { Button, SafeAreaView, ScrollView, StatusBar, Text, useColorScheme, View } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { gql } from 'urql';
import { Provider, Client, fetchExchange } from 'urql';
import { offlineExchange } from '@urql/exchange-graphcache';
import { makeAsyncStorage } from '@urql/storage-rn';
import schema from './generated/graphql.schema.json';
import { useAppQuery, useProgramQuery, useDayQuery } from './App.generated';

const storage = makeAsyncStorage({
  dataKey: 'graphcache-data',
  metadataKey: 'graphcache-metadata',
  maxAge: 9999999,
});

const cache = offlineExchange({
  schema,
  storage,
  isOfflineError(error, _result) {
    console.log(error);
    return !!error?.networkError;
  },
});

const client = new Client({
  url: 'http://localhost:4000/',
  exchanges: [cache, fetchExchange],
});

setTimeout(() => {
  AsyncStorage.getItem('graphcache-data').then((value) => console.log('data', value));
  AsyncStorage.getItem('graphcache-metadata').then((value) => console.log('metadata', value));
}, 3000);

gql`
  query App {
    viewer {
      programs {
        id
        name
      }
    }
  }

  query Program($id: Int!) {
    program(id: $id) {
      id
      name

      days {
        id
        name
      }
    }
  }

  query Day($id: Int!) {
    day(id: $id) {
      id
      name

      steps {
        id

        exercise {
          id
          name
        }
      }
    }
  }
`;

type RootStackParamList = {
  Home: undefined;
  Program: { id: number };
  Day: { id: number };
};

function HomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [res] = useAppQuery();

  if (res.fetching) {
    return <Text>Fetching...</Text>;
  }

  if (res.error) {
    return <Text>{res.error.toString()}</Text>;
  }

  if (!res.data) {
    return <Text>Data not found</Text>;
  }

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={backgroundStyle}>
        <View>
          {res.data.viewer.programs.map((p) => (
            <Button key={p.name} title={p.name} onPress={() => navigation.navigate('Program', { id: p.id })} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProgramScreen({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'Program'>) {
  const [res] = useProgramQuery({
    variables: { id: route.params.id },
  });

  if (res.fetching) {
    return <Text>Fetching...</Text>;
  }

  if (res.error) {
    return <Text>{res.error.toString()}</Text>;
  }

  if (!res.data) {
    return <Text>Data not found</Text>;
  }

  if (!res.data.program) {
    return <Text>Program not found</Text>;
  }

  return (
    <SafeAreaView>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View>
          {res.data.program.days.map((d) => (
            <Button key={d.name} title={d.name} onPress={() => navigation.navigate('Day', { id: d.id })} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DayScreen({ route }: NativeStackScreenProps<RootStackParamList, 'Day'>) {
  const [res] = useDayQuery({
    variables: { id: route.params.id },
  });

  if (res.fetching) {
    return <Text>Fetching...</Text>;
  }

  if (res.error) {
    return <Text>{res.error.toString()}</Text>;
  }

  if (!res.data) {
    return <Text>Data not found</Text>;
  }

  if (!res.data.day) {
    return <Text>Day not found</Text>;
  }

  const { day } = res.data;

  return (
    <SafeAreaView>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View>
          <Text>{day.name}</Text>
          {day.steps.map((s) => (
            <Text key={s.id}>{s.exercise.name}</Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  return (
    <Provider value={client}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Program" component={ProgramScreen} />
          <Stack.Screen name="Day" component={DayScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

export default App;

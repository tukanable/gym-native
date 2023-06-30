import React from 'react';
import { FlatList, Button, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { parseISO, format } from 'date-fns';

import { gql, UseQueryState } from 'urql';
import { Provider, Client, fetchExchange } from 'urql';
// import { offlineExchange } from '@urql/exchange-graphcache';
// import { makeAsyncStorage } from '@urql/storage-rn';
// import schema from './generated/graphql.schema.json';
import { useAppQuery, useProgramQuery, useDayQuery } from './App.generated';

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
  exchanges: [
    // cache,
    fetchExchange,
  ],
});

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

        sets {
          id
          moment
          weight
          count
        }
      }
    }
  }
`;

type RootStackParamList = {
  Home: undefined;
  Program: { id: number };
  Day: { id: number };
  Training: { dayId: number };
};

function getLoadHookView<Data>(res: UseQueryState<Data>): [NonNullable<Data>, null] | [null, JSX.Element] {
  if (res.fetching) {
    return [null, <Text>Fetching...</Text>];
  }

  if (res.error) {
    return [null, <Text>{res.error.toString()}</Text>];
  }

  if (!res.data) {
    return [null, <Text>Data not found</Text>];
  }

  return [res.data, null];
}

function HomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>): JSX.Element {
  const [res] = useAppQuery();
  const [data, loadView] = getLoadHookView(res);

  if (loadView) {
    return loadView;
  }

  return (
    <SafeAreaView>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View>
          {data.viewer.programs.map((p) => (
            <Button key={p.name} title={p.name} onPress={() => navigation.navigate('Program', { id: p.id })} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProgramScreen({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'Program'>) {
  const variables = { id: route.params.id };
  const [res] = useProgramQuery({ variables });
  const [data, loadView] = getLoadHookView(res);

  if (loadView) {
    return loadView;
  }

  const { program } = data;

  if (!program) {
    return <Text>Program not found</Text>;
  }

  return (
    <SafeAreaView>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View>
          {program.days.map((d) => (
            <Button key={d.name} title={d.name} onPress={() => navigation.navigate('Day', { id: d.id })} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const groupByMomentDate = <T extends { moment: string }>(rows: ReadonlyArray<T>) => {
  const res: { [key: string]: T[] } = {};

  for (let row of rows) {
    const date = format(parseISO(row.moment), 'dd/LL');

    if (!res[date]) {
      res[date] = [];
    }

    res[date].push(row);
  }

  return res;
};

function DayScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'Day'>) {
  const variables = { id: route.params.id };
  const [res] = useDayQuery({ variables });
  const [data, loadView] = getLoadHookView(res);

  if (loadView) {
    return loadView;
  }

  const { day } = data;

  if (!day) {
    return <Text>Day not found</Text>;
  }

  return (
    <SafeAreaView>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View>
          <Text>{day.name}</Text>
          {day.steps.map((s) => {
            const setColumns = groupByMomentDate(s.sets);

            return (
              <View key={s.id}>
                <Text>{s.exercise.name}</Text>
                <FlatList
                  horizontal
                  extraData={s.sets}
                  data={Object.keys(setColumns)}
                  keyExtractor={(x) => x}
                  renderItem={({ item }) => (
                    <View style={{ borderRightWidth: 1, padding: 10 }}>
                      <Text>{item}</Text>
                      {setColumns[item].map((set) => (
                        <View key={set.id}>
                          <Text>{`${set.count} (${set.weight})`}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                />
              </View>
            );
          })}
          <Button title="Start training" onPress={() => navigation.navigate('Training', { dayId: day.id })} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function TrainingScreen({ route }: NativeStackScreenProps<RootStackParamList, 'Training'>) {
  const variables = { id: route.params.dayId };
  const [res] = useDayQuery({ variables });
  const [data, loadView] = getLoadHookView(res);

  if (loadView) {
    return loadView;
  }

  const { day } = data;

  if (!day) {
    return <Text>Day not found</Text>;
  }

  const currentStep = day.steps[0];

  if (!currentStep) {
    return <Text>Nothing to show</Text>;
  }

  return (
    <SafeAreaView>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View>
          <Text>Traning {currentStep.exercise.name}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  return (
    <Provider value={client}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
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

import React from 'react';
import { FlatList, Text, Button, SafeAreaView, ScrollView, View } from 'react-native';
import { gql } from 'urql';
import { getLoadHookView } from './utils';
import { DayScreenProps } from './types';
import { useDayScreenQuery } from './DayScreen.generated';
import { groupByMomentDate } from '../utils';

export function DayScreen({ route, navigation }: DayScreenProps) {
  const variables = { id: route.params.id };
  const [res] = useDayScreenQuery({ variables });
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

gql`
  query DayScreen($id: Int!) {
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

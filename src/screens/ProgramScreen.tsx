import React from 'react';
import { Text, Button, SafeAreaView, ScrollView, View } from 'react-native';
import { gql } from 'urql';
import { getLoadHookView } from './utils';
import { ProgramScreenProps } from './types';
import { useProgramScreenQuery } from './ProgramScreen.generated';

export function ProgramScreen({ navigation, route }: ProgramScreenProps) {
  const variables = { id: route.params.id };
  const [res] = useProgramScreenQuery({ variables });
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

gql`
  query ProgramScreen($id: Int!) {
    program(id: $id) {
      id
      name

      days {
        id
        name
      }
    }
  }
`;

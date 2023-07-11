import React from 'react';
import { Button, SafeAreaView, ScrollView, View } from 'react-native';
import { gql } from 'urql';
import { getLoadHookView } from './utils';
import { HomeScreenProps } from './types';
import { useHomeScreenQuery } from './HomeScreen.generated';

export function HomeScreen({ navigation }: HomeScreenProps): JSX.Element {
  const [res] = useHomeScreenQuery();
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

gql`
  query HomeScreen {
    viewer {
      programs {
        id
        name
      }
    }
  }
`;

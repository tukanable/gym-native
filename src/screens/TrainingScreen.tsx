import React from 'react';
import { Text, SafeAreaView, ScrollView, View } from 'react-native';
import { gql } from 'urql';
import { getLoadHookView } from './utils';
import { TrainingScreenProps } from './types';
import { useTrainingScreenQuery } from './TrainingScreen.generated';

export function TrainingScreen({ route }: TrainingScreenProps) {
  const variables = { id: route.params.dayId };
  const [res] = useTrainingScreenQuery({ variables });
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

gql`
  query TrainingScreen($id: Int!) {
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

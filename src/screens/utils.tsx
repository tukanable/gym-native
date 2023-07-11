import React from 'react';
import { Text } from 'react-native';
import { UseQueryState } from 'urql';

export function getLoadHookView<Data>(res: UseQueryState<Data>): [NonNullable<Data>, null] | [null, JSX.Element] {
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

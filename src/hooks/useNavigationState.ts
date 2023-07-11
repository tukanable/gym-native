import { useEffect, useState, useCallback } from 'react';
import { Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InitialState, NavigationState } from '@react-navigation/native';

export const useNavigationState = (
  storageKey: string,
): [InitialState | undefined, (state: NavigationState | undefined) => void, boolean] => {
  const [isReady, setIsReady] = useState(__DEV__ ? false : true);
  const [initialState, setInitialState] = useState<InitialState | undefined>();

  useEffect(() => {
    const restoreState = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();

        if (Platform.OS !== 'web' && initialUrl == null) {
          // Only restore state if there's no deep link and we're not on web
          const savedStateString = await AsyncStorage.getItem(storageKey);
          const state = savedStateString ? JSON.parse(savedStateString) : undefined;

          if (state !== undefined) {
            setInitialState(state);
          }
        }
      } finally {
        setIsReady(true);
      }
    };

    if (!isReady) {
      restoreState();
    }
  }, [isReady, storageKey]);

  const handleStateChange = useCallback(
    (state: NavigationState | undefined) => AsyncStorage.setItem(storageKey, JSON.stringify(state)),
    [storageKey],
  );

  // save state only in the dev mode
  if (__DEV__) {
    return [initialState, handleStateChange, isReady];
  }

  return [undefined, handleStateChange, isReady];
};

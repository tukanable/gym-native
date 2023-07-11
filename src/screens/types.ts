import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  Program: { id: number };
  Day: { id: number };
  Training: { dayId: number };
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type ProgramScreenProps = NativeStackScreenProps<RootStackParamList, 'Program'>;
export type DayScreenProps = NativeStackScreenProps<RootStackParamList, 'Day'>;
export type TrainingScreenProps = NativeStackScreenProps<RootStackParamList, 'Training'>;

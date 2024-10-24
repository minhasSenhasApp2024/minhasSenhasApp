import { NavigatorScreenParams } from '@react-navigation/native';
import { TabParamList } from './TabParamList';

export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    // Home: undefined;
    // Profile: undefined;
    '(tabs)': NavigatorScreenParams<TabParamList>;
};



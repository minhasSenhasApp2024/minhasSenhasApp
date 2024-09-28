import { View, Text } from 'react-native';
import { useLocalSearchParams, Redirect } from 'expo-router';
import MasterPasswordScreen from '@/components/MasterPasswordScreen';

export default function MasterPasswordModal() {
    const { action } = useLocalSearchParams<{ action: 'set' | 'verify' }>();

    if (action !== 'set' && action !== 'verify') {
        // Redirect to home page or show an error screen
        return <Redirect href="/" />;
    }

    return (
        <View style={{ flex: 1 }}>
            <MasterPasswordScreen />
        </View>
    );
}
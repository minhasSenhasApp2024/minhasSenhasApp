import React, { useState } from 'react';
import { TextInput, Button, StyleSheet, Alert } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { verifyMasterPassword, setMasterPassword } from '@/services/passwordService';
// import { RootStackParamList } from '@/types/RootStackParamList'; // Make sure this path is correct
import { useLocalSearchParams } from 'expo-router';
import { useRouter } from 'expo-router';

export default function MasterPasswordScreen() {
    const { action } = useLocalSearchParams<{ action: 'set' | 'verify' }>();
    const [masterPassword, setMasterPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    // const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const textColor = useThemeColor({}, 'text');
    const router = useRouter();
    

    const handleSubmit = async () => {
        try {
            if (action === 'verify') {
                const isValid = await verifyMasterPassword(masterPassword);
                if (isValid) {
                    // Use router.back() to close the modal and return to the previous screen
                    router.back();
                    // Then update the master password in the HomePage
                    router.push({
                        pathname: '/',
                        params: { masterPassword: masterPassword }
                    });
                } else {
                    setError("Senha mestra incorreta.");
                }
            } else if (action === 'set') {
                await setMasterPassword(masterPassword);
                router.back();
                router.push({
                    pathname: '/',
                    params: { masterPassword: masterPassword }
                });
            }
        } catch (e: any) {
            setError("Erro ao processar a senha mestra.");
            Alert.alert("Erro", "Erro ao processar a senha mestra.");
        }
    };
    return (
        <ThemedView style={styles.container}>
            <ThemedText style={styles.label}>
                {action === 'verify' ? 'Digite sua senha mestra' : 'Crie sua senha mestra'}
            </ThemedText>
            <TextInput
                placeholder="Senha Mestra"
                value={masterPassword}
                onChangeText={setMasterPassword}
                secureTextEntry={true}
                style={[styles.input, { color: textColor }]}
                placeholderTextColor="#888"
            />
            <Button title="Confirmar" onPress={handleSubmit} />
            {error && <ThemedText style={styles.error}>{error}</ThemedText>}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    label: {
        marginBottom: 4,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 8,
    },
    error: {
        color: 'red',
        marginTop: 8,
    },
});
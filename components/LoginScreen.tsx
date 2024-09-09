import React, {useCallback, useState} from 'react';
import {View, TextInput, Button, StyleSheet, Modal} from 'react-native';
import { login } from '@/services/authService';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import {useFocusEffect} from "@react-navigation/native";

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const handleLogin = async () => {
        try {
            await login(email, password);
            setError(null);
            setSuccess(true);
            setShowSuccessMessage(true);
            setTimeout(() => {
                setShowSuccessMessage(false);
                navigation.navigate('index');
            }, 2000);
        } catch (e) {
            // @ts-ignore
            setError(e.message);
        }
    };

    const handleNavigateToHome = () => {
        navigation.navigate('Firestore');
    }


    useFocusEffect(
        useCallback(() => {
            return () => {
                setEmail('');
                setPassword('');
                setSuccess(false);
            };
        }, [])
    );

    const textColor = useThemeColor({}, 'text');

    return (
        <ThemedView style={styles.container}>
            <ThemedText style={styles.label}>E-mail</ThemedText>
                <TextInput
                    placeholder="E-mail"
                    value={email}
                    onChangeText={setEmail}
                    style={[styles.input, { color: textColor }]}
                    placeholderTextColor="#888"
                />
            <ThemedText style={styles.label}>Senha</ThemedText>
                <TextInput
                    placeholder="Senha"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={[styles.input, { color: textColor }]}
                    placeholderTextColor="#888"
                />
            <Button title="Login" onPress={handleLogin} />
            {error && <ThemedText style={styles.error}>{error}</ThemedText>}
            {success && <ThemedText style={styles.success}>Login bem-sucedido!</ThemedText>}


            <Modal
                animationType="slide"
                transparent={true}
                visible={showSuccessMessage}
                onRequestClose={() => {
                    setShowSuccessMessage(false);
                }}
            >
                <ThemedView style={styles.container}>
                    <ThemedText style={styles.success}>Login bem-sucedido!</ThemedText>
                </ThemedView>
            </Modal>

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
    success: {
        color: 'yellowgreen',
        marginBottom: 22,
        fontSize: 25,
        textAlign: 'center',
    },
});

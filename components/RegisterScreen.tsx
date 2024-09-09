import React, { useState, useCallback } from 'react';
import {TextInput, Button, StyleSheet, Modal} from 'react-native';
import { register } from '@/services/authService';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import {useFocusEffect} from "@react-navigation/native";
//import { RootStackParamList } from '@/types/RootStackParamList';

export default function RegisterScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const handleRegister = async () => {
        try {
            await register(email, password);
            setError(null);
            setSuccess(true);
            setModalVisible(true);
        } catch (e) {
            // @ts-ignore
            setError(e.message);
        }
    };

    const handleNavigateToLogin = () => {
        setModalVisible(false);
        navigation.navigate('Login');
    };

    useFocusEffect(
        useCallback(() => {
            return () => {
                setEmail('');
                setPassword('');
                setSuccess(false);
                setModalVisible(false)
            };
        }, [])
    );

    const textColor = useThemeColor({}, 'text');

    return (
        <ThemedView style={styles.container}>
            <ThemedText style={styles.label}>Email</ThemedText>
                    <TextInput
                        placeholder="E-mail"
                        value={email}
                        onChangeText={setEmail}
                        style={[styles.input, { color: textColor }]}
                        placeholderTextColor="#888"
                    />
                    <ThemedText style={styles.label}>Password</ThemedText>
                    <TextInput
                        placeholder="Senha"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        style={[styles.input, { color: textColor }]}
                        placeholderTextColor="#888"
                    />
                    <Button title="Cadastrar-se" onPress={handleRegister} />
                    {error && <ThemedText style={styles.error}>{error}</ThemedText>}
                    {success && <ThemedText style={styles.success}>Cadastro bem-sucedido!</ThemedText>}

                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => {
                            setModalVisible(!modalVisible);
                        }}
                    >
                        <ThemedView style={styles.container}>
                            <ThemedText style={styles.success}>Cadastro bem-sucedido!</ThemedText>
                            <Button title="Ir para o Login" onPress={handleNavigateToLogin} />
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
        color: 'yellow',
        marginBottom: 22,
        fontSize: 25,
        textAlign: 'center',
    },
});

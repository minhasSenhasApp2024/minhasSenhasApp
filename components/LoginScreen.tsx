import React, {useCallback, useState, useEffect} from 'react';
import {View, TextInput, Button, StyleSheet, Modal} from 'react-native';
import { login, logout, onAuthStateChanged } from '@/services/authService';
import { auth } from '@/firebaseConfig';
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
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user); // Set user information if logged in
            } else {
                setUser(null); // Clear user information if logged out
            }
        });

        return () => unsubscribe(); // Cleanup subscription on unmount
    }, []);

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

    const handleNavigateToRegister = () => {
        navigation.navigate('Register' as never);
    };

    const handleLogout = async () => {
        await logout(); // Call logout function
        setUser(null); // Clear user information
    };    

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
            {user ? (
                <View style={styles.loggedInContainer}>
                    <ThemedText style={styles.welcomeText}>Bem-vindo, {user.email}!</ThemedText>
                    <Button title="Logout" onPress={handleLogout} />
                </View>
            ) : (
                <>
                    <View style={styles.contentContainer}>
                        <View style={styles.formContainer}>
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
                        </View>
                    </View>
                    <View style={styles.registerContainer}>
                        <ThemedText style={styles.registerText}>Ainda não tem uma conta?</ThemedText>
                        <Button title="Criar uma conta" onPress={handleNavigateToRegister} />
                    </View>
                </>
            )}

            <Modal
                animationType="fade"
                transparent={true}
                visible={showSuccessMessage}
                onRequestClose={() => {
                    setShowSuccessMessage(false);
                }}
            >
                <View style={styles.modalContainer}>
                    <ThemedText style={styles.success}>Login bem-sucedido!</ThemedText>
                </View>
            </Modal>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 16,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    formContainer: {
        width: '100%',
    },
    loggedInContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 24,
        marginBottom: 20,
    },
    registerContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    registerText: {
        marginBottom: 8,
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
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.9)', 
    },
    success: {
        color: 'yellowgreen',
        fontSize: 24,
        textAlign: 'center',
    },
});
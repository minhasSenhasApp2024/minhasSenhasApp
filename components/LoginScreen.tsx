import React, {useCallback, useState, useEffect} from 'react';
import {View, TextInput, Button, StyleSheet, Modal, TouchableOpacity} from 'react-native';
import { login, logout, onAuthStateChanged } from '@/services/authService';
import { auth } from '@/firebaseConfig';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import CryptoJS from 'crypto-js';
import { deriveKey } from '@/utils/cryptoUtils';
import { fetchUserPasswords } from '@/services/passwordService';
import { RootStackParamList } from '@/types/RootStackParamList';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [masterPassword, setMasterPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
    const [user, setUser] = useState<any>(null);
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const router = useRouter();
    
    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

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
                router.push('/masterpassword?action=verify');
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
                            <View style={styles.passwordInputContainer}>
                                <TextInput
                                    placeholder="Senha"
                                    value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!isPasswordVisible}
                                style={[styles.input, styles.passwordInput, { color: textColor }]}
                                placeholderTextColor="#888"
                                />
                                <TouchableOpacity onPress={togglePasswordVisibility}>
                                    <ThemedText style={styles.showHideButton}>
                                    {isPasswordVisible ? 'Ocultar' : 'Mostrar'}
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>
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
        color: 'green',
        marginTop: 22,
        fontSize: 16,
        textAlign: 'center',
    },
    passwordInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    passwordInput: {
        flex: 1,
        marginRight: 10,
    },
    showHideButton: {
        color: 'blue',
        marginLeft: 8,
    },
    loggedInContainer: {
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 18,
        marginBottom: 12,
    },
    registerContainer: {
        alignItems: 'center',
        marginTop: 16,
    },
    registerText: {
        marginBottom: 8,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    formContainer: {
        width: '100%',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.9)', 
    },

});
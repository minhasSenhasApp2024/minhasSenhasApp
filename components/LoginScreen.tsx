import React, {useCallback, useState, useEffect} from 'react';
import {View, TextInput, Button, StyleSheet, Modal} from 'react-native';
import { login, logout } from '@/services/authService';
import { auth } from '@/firebaseConfig';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import {useFocusEffect} from "@react-navigation/native";
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { TouchableOpacity, Text, Image } from 'react-native';

import { useAuth } from '@/context/AuthContext';


export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    // const [success, setSuccess] = useState<boolean>(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { isLoggedIn, setIsLoggedIn, userEmail, setUserEmail } = useAuth();

    // const [user, setUser] = useState<any>(null);

    // useEffect(() => {
    //     const unsubscribe = auth.onAuthStateChanged((user) => {
    //         if (user) {
    //             setUser(user); // Set user information if logged in
    //         } else {
    //             setUser(null); // Clear user information if logged out
    //         }
    //     });

    //     return () => unsubscribe(); // Cleanup subscription on unmount
    // }, []);

    const handleLogin = async () => {
        try {
            await login(email, password, setIsLoggedIn, setUserEmail);
            setError(null);
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
        navigation.navigate('Register');
    };

    const handleLogout = async () => {
        await logout(setIsLoggedIn, setUserEmail);
    };

    useFocusEffect(
        useCallback(() => {
            return () => {
                setEmail('');
                setPassword('');
                // setSuccess(false);
            };
        }, [])
    );

    const textColor = useThemeColor({}, 'text');

    return (
        <View style={styles.container}>
            <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
                <Defs>
                    <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor="#88BBF6" stopOpacity="1" />
                        <Stop offset="1" stopColor="#E9F0FF" stopOpacity="1" />
                    </LinearGradient>
                </Defs>
                <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
            </Svg>

            {isLoggedIn ? (
                <View style={styles.loggedInContainer}>
                    <ThemedText style={styles.welcomeText}>Bem-vindo, {userEmail}!</ThemedText>
                    <TouchableOpacity style={styles.buttonLogout} onPress={handleLogout}>
                        <Text style={styles.buttonTextLogout}>Logout</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.contentContainer}>
                    <View style={styles.imageContainer}>
                        <Image
                            source={require('../assets/images/logo.png')}
                            style={styles.image}
                        />
                    </View>
                    <View style={styles.formContainer}>
                        <ThemedText style={styles.label}>E-mail</ThemedText>
                        <TextInput
                            placeholder="Insira seu e-mail..."
                            value={email}
                            onChangeText={setEmail}
                            style={[styles.input, { color: textColor }]}
                            placeholderTextColor="#256ed0"
                        />
                        <ThemedText style={styles.label}>Senha</ThemedText>
                        <TextInput
                            placeholder="Insira sua senha..."
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            style={[styles.input, { color: textColor }]}
                            placeholderTextColor="#256ed0"
                        />
                        <View style={styles.loginContainer}>
                            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                                <Text style={styles.buttonText}>Entrar</Text>
                            </TouchableOpacity>
                            {error && <ThemedText style={styles.error}>{error}</ThemedText>}
                        </View>
                    </View>
                    <View style={styles.registerContainer}>
                        <ThemedText style={styles.registerText}>Ainda não tem uma conta?</ThemedText>
                        <Text style={styles.linkText} onPress={handleNavigateToRegister}>
                            Cadastre-se aqui!
                        </Text>
                    </View>
                </View>
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
                    <ThemedText style={styles.successLogin}>Login bem-sucedido!</ThemedText>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        padding: 73,
        width: '100%',
    },
    formContainer: {
        width: '100%',
    },
    loggedInContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: 210,
        height: 210,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    welcomeText: {
        fontSize: 24,
        marginBottom: 460,
        color: '#004aad',
        marginTop: 50,
    },
    registerContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    loginContainer: {
        alignItems: 'center',
    },
    registerText: {
        marginBottom: 8,
        borderColor: 'white',
        color: '#004aad',
    },
    input: {
        height: 40,
        borderColor: '#E9F0FF',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 8,
        borderRadius: 4,
        backgroundColor: '#E9F0FF',
    },
    error: {
        color: 'red',
        marginTop: 8,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#afd4ff',
    },
    successLogin: {
        color: '#004aad',
        fontSize: 24,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#004aad',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        width: 100,
        height: 38,
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
    },

    label: {
        marginBottom: 4,
        color: '#004aad', 
    },
    linkText: {
        color: '#004aad', 
        textDecorationLine: 'underline',
        marginTop: 8,
        fontSize: 16,
    },

    buttonLogout: {
        backgroundColor: '#004aad',
        padding: 10,
        borderRadius: 5,
        width: 100,
        height: 38,
        justifyContent: 'center',
        marginBottom: 20,
    },
    buttonTextLogout: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
    },
});

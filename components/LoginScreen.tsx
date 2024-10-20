import React, {useCallback, useState, useEffect} from 'react';
import { auth } from '@/firebaseConfig';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import {useFocusEffect} from "@react-navigation/native";
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { useBiometricAuth } from '@/services/useBiometricAuth';
import { View, TextInput, Button, TouchableOpacity, Text, StyleSheet, Alert, Image, Modal } from 'react-native';
import { login } from '@/services/authService';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';


export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { setIsLoggedIn, setUserEmail, isBiometricSupported, authenticate, setBiometricEnabled, isBiometricEnrolled, checkBiometricSupport, biometricLogin } = useAuth();


        useEffect(() => {
            checkBiometricSupport();
        }, []);
    
        const handleLogin = async () => {
            try {
                await login(email, password, setIsLoggedIn, setUserEmail);
                setError(null);
                setShowSuccessMessage(true);
        
                if (isBiometricSupported && isBiometricEnrolled) {
                    const result = await authenticate();
                    if (result.success) {
                        await setBiometricEnabled(true);
                        Alert.alert('Biometric authentication enabled');
                    }
                }
        
                setTimeout(() => {
                    setShowSuccessMessage(false);
                    navigation.navigate('(tabs)');
                }, 2000);
        
            } catch (e: any) {
                setError(e.message);
                Alert.alert('Login failed', e.message);
            }
        };

        const handleBiometricLogin = async () => {
            try {
                const success = await biometricLogin();
                if (success) {
                    setShowSuccessMessage(true);
                    setTimeout(() => {
                        setShowSuccessMessage(false);
                        navigation.navigate('(tabs)');
                    }, 2000);
                } else {
                    Alert.alert('Biometric login failed', 'Please try again or use email and password');
                }
            } catch (e: any) {
                setError(e.message);
                Alert.alert('Biometric login failed', e.message);
            }
        };

    const handleNavigateToRegister = () => {
        navigation.navigate('Register');
    };

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
                            style={[styles.input, { color: '#004aad' }]}
                            placeholderTextColor="#256ed0"
                        />
                        <ThemedText style={styles.label}>Senha</ThemedText>
                        <TextInput
                            placeholder="Insira sua senha..."
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            style={[styles.input, { color: '#004aad' }]}
                            placeholderTextColor="#256ed0"
                        />
                        <View style={styles.loginContainer}>
                            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                                <Text style={styles.buttonText}>Entrar</Text>
                            </TouchableOpacity>
                            {error && <ThemedText style={styles.error}>{error}</ThemedText>}
                        </View>
                        <View style={styles.loginContainer}>
                        {isBiometricSupported && isBiometricEnrolled && (
                            <TouchableOpacity style={styles.button} onPress={handleBiometricLogin}>
                                <Text style={styles.buttonText}>Entrar com Biometria</Text>
                            </TouchableOpacity>
                        )}                        
                        </View>
                    </View>
                    <View style={styles.registerContainer}>
                        <ThemedText style={styles.registerText}>Ainda não tem uma conta?</ThemedText>
                        <Text style={styles.linkText} onPress={handleNavigateToRegister}>
                            Cadastre-se aqui!
                        </Text>
                    </View>
                </View>

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

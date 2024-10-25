import React, {useCallback, useState, useEffect} from 'react';
import { auth } from '@/firebaseConfig';
import { useNavigation, NavigatorScreenParams } from '@react-navigation/native';
import {useFocusEffect} from "@react-navigation/native";
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { View, TextInput, Button, TouchableOpacity, Text, StyleSheet, Alert, Image, Modal } from 'react-native';
import { login } from '@/services/authService';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/context/AuthContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/types/RootStackParamList';
import { TabParamList } from '@/types/TabParamList';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;


export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);

    const navigation = useNavigation<LoginScreenNavigationProp>();
    
    const { setIsLoggedIn, setUserEmail, isBiometricSupported, 
        authenticate, setBiometricEnabled, isBiometricEnrolled, 
        biometricLogin, setAwaitingUser, awaitingUser, isLoggedIn } = useAuth();
    
        const handleLogin = async () => {
            try {
                await login(email, password, setIsLoggedIn, setUserEmail);
                setError(null);
                setShowSuccessMessage(true);
        
                if (isBiometricSupported && isBiometricEnrolled) {
                    const result = await authenticate();
                    if (result.success) {
                        await setBiometricEnabled(true);
                        Alert.alert('Autenticação biométrica ativada!', 'Na próxima vez, você pode usar só a biometria para acessar o app.');
                    }
                }
        
                setTimeout(() => {
                    setShowSuccessMessage(false);
                    navigation.replace('(tabs)', { screen: 'index' } as NavigatorScreenParams<TabParamList>);  
                }, 2000);
        
            } catch (e: any) {
                setError(e.message);
                Alert.alert('Falha ao fazer login', e.message);
            }
        };

        const handleBiometricLogin = async () => {
            // Atualiza o estado para não aguardar usuário
            setAwaitingUser(false);
        
            try {
                const success = await biometricLogin(true);
                if (success) {
                    setShowSuccessMessage(true);
                    setTimeout(() => {
                        setShowSuccessMessage(false);
                        navigation.replace('(tabs)', { screen: 'index' } as NavigatorScreenParams<TabParamList>); 
                    }, 2000);
                } else {
                    // separar os dois casos
                    Alert.alert('Falha na autenticação biométrica', 'Faça login com e-mail e senha antes para ativar a biometria');
                    console.log("isLoggedIn: ", isLoggedIn);
                    console.log("Awaiting user: ", awaitingUser);
                }
            } catch (e: any) {
                setError(e.message);
                Alert.alert('Falha na autenticação biométrica', e.message);
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
                            style={[styles.input, { color: '#003883' }]}
                            placeholderTextColor="#256ed0"
                        />
                        <ThemedText style={styles.label}>Senha</ThemedText>
                        <TextInput
                            placeholder="Insira sua senha..."
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            style={[styles.input, { color: '#003883' }]}
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
                                <Text style={styles.buttonText}>Biometria</Text>
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
                    <ThemedText style={styles.successLogin}>Bem-Vindo ao Minhas Senhas!</ThemedText>
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
        width: 300,
        height: 300,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 10,
        marginTop: 1,
    },
    welcomeText: {
        fontSize: 24,
        marginBottom: 460,
        color: '#003883',
        marginTop: 50,
    },
    registerContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 200,
    },
    loginContainer: {
        alignItems: 'center',
    },
    registerText: {
        marginBottom: 8,
        borderColor: 'white',
        color: '#003883',
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
        color: '#003883',
        fontSize: 24,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#003883',
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
        color: '#003883', 
    },
    linkText: {
        color: '#003883', 
        textDecorationLine: 'underline',
        marginTop: 8,
        fontSize: 16,
    },

    buttonLogout: {
        backgroundColor: '#003883',
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

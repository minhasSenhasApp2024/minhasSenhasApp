import React, { useCallback, useState, useEffect, useRef } from 'react';
import { auth } from '@/firebaseConfig';
import { useNavigation, NavigatorScreenParams } from '@react-navigation/native';
import { useFocusEffect } from "@react-navigation/native";
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { View, TextInput, Button, TouchableOpacity, Text, StyleSheet, Image, Modal } from 'react-native';
import { login } from '@/services/authService';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/context/AuthContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/types/RootStackParamList';
import { TabParamList } from '@/types/TabParamList';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SecretKeyDialog } from './SecretKeyDialog';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // Novo estado para controlar a visibilidade da senha
    const [error, setError] = useState<string | null>(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
    const [showBiometricFailModal, setShowBiometricFailModal] = useState<boolean>(false); // Novo estado para o modal de falha
    const [showBiometricActivationModal, setShowBiometricActivationModal] = useState<boolean>(false); // Novo estado para o modal de ativação
    const [showLoginFailModal, setShowLoginFailModal] = useState<boolean>(false); // Novo estado para o modal de falha de login
    const [showSecretKeyFailModal, setShowSecretKeyFailModal] = useState<boolean>(false);
    const [showSecretKeySuccessModal, setShowSecretKeySuccessModal] = useState<boolean>(false);
    const didInputSecretKey = useRef(false); // Rastreia a inserção manual da chave secreta
    const navigation = useNavigation<LoginScreenNavigationProp>();

    const [secretKey, setSecretKey] = useState('');
    const [isSecretKeyDialogVisible, setIsSecretKeyDialogVisible] = useState(false);
    const [dialogHandlers, setDialogHandlers] = useState<{
        handleConfirm: (key: string) => void;
        handleCancel: () => void;
    }>({
        handleConfirm: () => {},
        handleCancel: () => {}
    });


    const { setIsLoggedIn, setUserEmail, isBiometricSupported,
        authenticate, setBiometricEnabled, isBiometricEnrolled,
        biometricLogin, setAwaitingUser, awaitingUser, isLoggedIn } = useAuth();

        const handleLogin = async () => {
            didInputSecretKey.current = false; // Reseta o rastreamento
            try {
                const user = await login(
                    email, 
                    password, 
                    setIsLoggedIn, 
                    setUserEmail, 
                    setAwaitingUser,
                    handleSecretKeyRequest
                );
                
                if (user) {
                    setError(null);
                    setShowSuccessMessage(true);

                    // Exibir o modal de sucesso da chave secreta somente se for inserida manualmente
                    if (didInputSecretKey.current) {
                        setShowSecretKeySuccessModal(true); 
                    }
        
                    if (isBiometricSupported && isBiometricEnrolled) {
                        const result = await authenticate();
                        if (result.success) {
                            await setBiometricEnabled(true);
                            setShowBiometricActivationModal(true);
                        }
                    }
        
                    setTimeout(() => {
                        setShowSuccessMessage(false);
                        navigation.replace('(tabs)', { screen: 'index' } as NavigatorScreenParams<TabParamList>);
                        didInputSecretKey.current = false; // Resetar a referência para futuras tentativas de login
                    }, 2000);
                }
            } catch (e: any) {
                setError(e.message);
                if (e.message === 'A chave secreta fornecida é inválida.') {
                    setShowSecretKeyFailModal(true);
                } else if (e.message === 'É necessário fornecer a chave secreta para acessar a conta.') {
                    setShowLoginFailModal(true);
                } else {
                    setShowLoginFailModal(true);
                }
            }
        };

    const handleSecretKeyRequest = async (): Promise<string | null> => {
        return new Promise((resolve) => {
            setIsSecretKeyDialogVisible(true);
            
            const handleConfirm = (key: string) => {
                didInputSecretKey.current = true; // Marca que a chave foi inserida manualmente
                setIsSecretKeyDialogVisible(false);
                resolve(key);
            };
    
            const handleCancel = () => {
                setIsSecretKeyDialogVisible(false);
                resolve(null);
            };
    
            // Armazena os handlers para uso no componente
            setDialogHandlers({ handleConfirm, handleCancel });
        });
    };

    const handleBiometricLogin = async () => {
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
                setShowBiometricFailModal(true); // Exibe o modal de falha biométrica
            }
        } catch (e: any) {
            setError(e.message);
            setShowBiometricFailModal(true); // Exibe o modal de falha biométrica em caso de erro
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
                        placeholderTextColor="#003883"
                    />
                    <ThemedText style={styles.label}>Senha</ThemedText>
                    <View style={styles.passwordContainer}>                    
                        <TextInput
                            style={[styles.input, { color: '#003883' }]}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword} // Altera o tipo do campo de senha
                            placeholder="Insira sua senha..."
                            placeholderTextColor="#003883"
                        />                        
                    </View>
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Icon name={showPassword ? "eye-slash" : "eye"} size={20} color="#003883" />
                        </TouchableOpacity>
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

            {/* Modal para falha ao fazer login */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showLoginFailModal}
                onRequestClose={() => {
                    setShowLoginFailModal(false);
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <ThemedText style={styles.successLogin}>Falha ao fazer login</ThemedText>
                        <ThemedText style={styles.modalMessage}>
                            Informe um login e uma senha cadastrados.
                        </ThemedText>
                        <TouchableOpacity style={styles.button} onPress={() => setShowLoginFailModal(false)}>
                            <Text style={styles.buttonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal para falha na autenticação biométrica */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showBiometricFailModal}
                onRequestClose={() => {
                    setShowBiometricFailModal(false);
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <ThemedText style={styles.successLogin}>Falha na autenticação biométrica</ThemedText>
                        <ThemedText style={styles.modalMessage}>
                            Faça login com e-mail e senha antes para ativar a biometria.
                        </ThemedText>
                        <TouchableOpacity style={styles.button} onPress={() => setShowBiometricFailModal(false)}>
                            <Text style={styles.buttonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal para ativação da biometria */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showBiometricActivationModal}
                onRequestClose={() => {
                    setShowBiometricActivationModal(false);
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <ThemedText style={styles.successLogin}>Autenticação biométrica ativada!</ThemedText>
                        <ThemedText style={styles.modalMessage}>
                            Na próxima vez, você pode usar só a biometria para acessar o app.
                        </ThemedText>
                    </View>
                </View>
            </Modal>
            {/* Modal para sucesso na validação da chave secreta */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showSecretKeySuccessModal}
                onRequestClose={() => {
                    setShowSecretKeySuccessModal(false);
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <ThemedText style={styles.successLogin}>Chave Secreta Validada com Sucesso!</ThemedText>
                        <ThemedText style={styles.modalMessage}>
                            A autenticação biométrica será iniciada agora.
                        </ThemedText>
                        <TouchableOpacity style={styles.button} onPress={() => setShowSecretKeySuccessModal(false)}>
                            <Text style={styles.buttonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            {/* Modal para falha na validação da chave secreta */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showSecretKeyFailModal}
                onRequestClose={() => {
                    setShowSecretKeyFailModal(false);
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <ThemedText style={styles.successLogin}>Falha na Validação da Chave Secreta</ThemedText>
                        <ThemedText style={styles.modalMessage}>
                            A chave secreta fornecida é inválida. Por favor, tente novamente.
                        </ThemedText>
                        <TouchableOpacity style={styles.button} onPress={() => setShowSecretKeyFailModal(false)}>
                            <Text style={styles.buttonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <SecretKeyDialog
    visible={isSecretKeyDialogVisible}
    onCancel={() => dialogHandlers.handleCancel()}
                onConfirm={(key) => dialogHandlers.handleConfirm(key)}
            />
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
        height: 50,
        borderColor: '#E9F0FF',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 8,
        borderRadius: 4,
        backgroundColor: '#E9F0FF',
        width: 270,
    },
    error: {
        color: 'red',
        marginTop: 8,
    },
    modalContainer: {
        width: '80%', // Largura do modal
        padding: 20,
        backgroundColor: '#d5e8ff', // Cor de fundo do modal
        borderRadius: 10, // Bordas arredondadas
        alignItems: 'center',
        shadowColor: '#000', // Sombra do modal
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5, // Elevação para Android
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
    modalMessage: {
        color: '#003883',
        fontSize: 16,
        textAlign: 'center',
        marginVertical: 10,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fundo semi-transparente
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: 'transparent',
        borderWidth: 1,
        width: '80%',
    },
    icon: {
        color: '#003883', // Nova cor para o ícone
    },
});

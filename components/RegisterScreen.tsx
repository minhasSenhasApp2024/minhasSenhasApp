import React, { useState, useCallback, useEffect } from 'react';
import { View, TouchableOpacity, Text, TextInput, StyleSheet, Modal, Image, Button, Alert } from 'react-native';
import { register } from '@/services/authService';

import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { generateStrongPassword } from '@/utils/passwordGen';
import { checkPasswordStrength } from '@/utils/checkPasswordStrength';
import { RootStackParamList } from '@/types/RootStackParamList';
import { useAuth } from '@/context/AuthContext';

import * as Clipboard from 'expo-clipboard'; 

export default function RegisterScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordStrength, setPasswordStrength] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const { setIsLoggedIn, setUserEmail, setAwaitingUser } = useAuth();

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    useFocusEffect(
        useCallback(() => {
            return () => {
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setSuccess(false);
                setModalVisible(false);
            };
        }, [])
    );

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            setError("As senhas não são iguais");
            return;
        }
        try {
            const { user, secretKey } = await register(email, password, setIsLoggedIn, setUserEmail, setAwaitingUser);
            setError(null);
            setSuccess(true);

            // Exibir alert para copiar a chave secreta
            Alert.alert(
                'IMPORTANTE!\nBackup da Chave Secreta',
                            `Sua chave secreta é:\n\n${secretKey}\n\nPor favor, copie e armazene-a em um local seguro. Você precisará dela para recuperar sua conta e em novos dispositivos.`,
                            [
                                {
                                    text: 'Copiar',
                                    onPress: async () => {
                                        try {
                                            await Clipboard.setStringAsync(secretKey);
                                            Alert.alert('Chave copiada', 'A chave secreta foi copiada para a área de transferência.', [
                                                {
                                                    text: 'Pronto, já guardei a chave secreta em um local seguro',
                                                    onPress: () => {
                                                        // Exibir o modal após o usuário confirmar que guardou a chave
                                                        setModalVisible(true);
                                                        // Navegar para o Login após fechar o modal
                                                        setTimeout(() => {
                                                            setModalVisible(false);
                                                            navigation.navigate('Login');
                                                        }, 3400); // O modal fechará após 3,4 segundos
                                                    }
                                                }
                                            ]);
                                        } catch (clipboardError) {
                                            console.error("Erro ao copiar para a área de transferência:", clipboardError);
                                            Alert.alert('Erro', 'Não foi possível copiar a chave secreta.');
                                        }
                                    }
                                }
                            ],
                            { cancelable: false }
                        );
        } catch (e: any) {
            setError(e.message);
        }
    };

    const handleNavigateToLogin = () => {
        setModalVisible(false);
        navigation.navigate('Login');
    };

    const handleGeneratePassword = () => {
        const strongPassword = generateStrongPassword();
        setPassword(strongPassword);
        setConfirmPassword(strongPassword);
        setPasswordStrength(checkPasswordStrength(strongPassword));
    };

    const textColor = useThemeColor({}, 'text');

    return (
        <ThemedView style={styles.container}>
            <View style={styles.imageContainer}>
                <Image
                    source={require('../assets/images/logo.png')}
                    style={styles.image}
                />
            </View>
            <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>E-mail</ThemedText>
                <TextInput
                    placeholder="informe um e-mail..."
                    value={email}
                    onChangeText={setEmail}
                    style={[styles.input, { color: '#003883' }]}
                    placeholderTextColor="#003883"
                />
                <ThemedText style={styles.label}>Senha</ThemedText>
                <View style={styles.passwordInputContainer}>
                    <TextInput
                        placeholder="Digite sua senha..."
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            setPasswordStrength(checkPasswordStrength(text));
                        }}
                        secureTextEntry={!isPasswordVisible}
                        style={[styles.input, styles.passwordInput, { color: '#003883' }]}
                        placeholderTextColor="#003883"
                    />
                    <TouchableOpacity onPress={togglePasswordVisibility}>
                        <ThemedText style={styles.showHideButton}>
                            {isPasswordVisible ? 'Ocultar' : 'Mostrar'}
                        </ThemedText>
                    </TouchableOpacity>
                </View>
                <ThemedText style={styles.label}>Confirmar Senha</ThemedText>
                <View style={styles.passwordInputContainer}>
                    <TextInput
                        placeholder="Confirmar Senha"
                        value={confirmPassword}
                        onChangeText={(text) => {
                            setConfirmPassword(text);
                            setPasswordStrength(checkPasswordStrength(text));
                        }}
                        secureTextEntry={!isPasswordVisible}
                        style={[styles.input, styles.passwordInput, { color: '#003883' }]}
                        placeholderTextColor="#003883"
                    />
                    <TouchableOpacity onPress={togglePasswordVisibility}>
                        <ThemedText style={styles.showHideButton}>
                            {isPasswordVisible ? 'Ocultar' : 'Mostrar'}
                        </ThemedText>
                    </TouchableOpacity>
                </View> 
            </View>
            <ThemedText style={styles.strengthIndicator}>{passwordStrength}</ThemedText>
            
            <View style={styles.linkTextContainer}>
                <TouchableOpacity onPress={handleGeneratePassword}>
                    <Text style={styles.linkText}>Gerar Senha Forte</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonCadastrar} onPress={handleRegister}>
                    <Text style={styles.buttonCadastrarText}>Cadastrar</Text>
                </TouchableOpacity>
            </View>
            
            {error && <ThemedText style={styles.error}>{error}</ThemedText>}
            <View style={styles.linkTextContainer}>
                <TouchableOpacity onPress={handleNavigateToLogin}>
                    <Text style={styles.linkText}>Ir para o Login</Text>
                </TouchableOpacity>
            </View>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <ThemedText style={styles.successModalText}>
                            Cadastro realizado com sucesso! Acesse sua conta
                        </ThemedText>
                    </View>
                </View>
            </Modal>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#afd4ff',
        paddingBottom: 200,
    },
    image: {
        width: 300,
        height: 300,
    },
    imageContainer: {
        alignItems: 'center',
        paddingTop: 40,
    },
    inputContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)', // Fundo escuro transparente
    },
    modalContent: {
        backgroundColor: '#afd4ff',
        padding: 30,
        borderRadius: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    label: {
        marginBottom: 4,
        color: '#003883',
        width: '80%',
    },
    input: {
        height: 50,
        borderColor: '#E9F0FF',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 8,
        borderRadius: 4,
        backgroundColor: '#E9F0FF',
        width: '80%',
    },
    success: {
        color: '#003883',
        marginBottom: 22,
        fontSize: 25,
        textAlign: 'center',
    },
    successModalText: {
        fontSize: 18,
        textAlign: 'center',
        color: '#003883',
    },
    strengthIndicator: {
        fontSize: 16,
        color: 'green',
        paddingHorizontal: 40,
    },
    passwordInputContainer: {
        flexDirection: 'row',
        marginBottom: 0,
        width: '80%',
    },
    passwordInput: {
        flex: 1,
        marginRight: 10,
    },
    showHideButton: {
        color: '#003883',
        paddingVertical: 6,
        fontSize: 14,
    },
    buttonCadastrar: {
        backgroundColor: '#003883',
        height: 38,
        justifyContent: 'center',
        width: 120,
        borderRadius: 5,
        alignItems: 'center',
        marginVertical: 6,
    },
    buttonCadastrarText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
    },
    linkTextContainer: {
        alignItems: 'center',
        marginVertical: 10,
    },
    linkText: {
        textDecorationLine: 'underline',
        color: '#003883',
        marginVertical: 6,
    },
    error: {
        color: 'red',
        marginTop: 10,
        textAlign: 'center',
    },
});

import React, { useState, useCallback, useEffect } from 'react';
import { View, TouchableOpacity, Text, TextInput, StyleSheet, Modal, Image, Button } from 'react-native';
import { register } from '@/services/authService';

import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { generateStrongPassword } from '@/utils/passwordGen';
import { checkPasswordStrength } from '@/utils/checkPasswordStrength';
import { RootStackParamList } from '@/types/RootStackParamList';

import { useAuth } from '@/context/AuthContext';

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
            await register(email, password, setIsLoggedIn, setUserEmail, setAwaitingUser);
            setError(null);
            setSuccess(true);
            setModalVisible(true);
            setTimeout(() => {
                setModalVisible(false);
                navigation.navigate('Login');
            }, 3000); // O modal fechará após 3 segundos
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
                    style={[styles.input, { color: '#004aad' }]}
                    placeholderTextColor="#256ed0"
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
                        style={[styles.input, styles.passwordInput, { color: '#004aad' }]}
                        placeholderTextColor="#256ed0"
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
                        style={[styles.input, styles.passwordInput, { color: '#004aad' }]}
                        placeholderTextColor="#256ed0"
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
                        <ThemedText style={styles.successModalText}>Cadastro realizado com sucesso! Acesse sua conta</ThemedText>
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
        paddingTop: 30,
    },
    image: {
        width: 210,
        height: 210,
    },
    imageContainer: {
        alignItems: 'center',
        paddingTop: 100,
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
        color: '#004aad',
        width: '80%',
    },
    input: {
        height: 40,
        borderColor: '#E9F0FF',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 8,
        borderRadius: 4,
        backgroundColor: '#E9F0FF',
        width: '80%',
    },
    success: {
        color: '#004aad',
        marginBottom: 22,
        fontSize: 25,
        textAlign: 'center',
    },
    successModalText: {
        fontSize: 18,
        textAlign: 'center',
        color: '#004aad',
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
        color: '#004aad',
        paddingVertical: 6,
        fontSize: 14,
    },
    buttonCadastrar: {
        backgroundColor: '#004aad',
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
        color: '#004aad',
        marginVertical: 6,
    },
    error: {
        color: 'red',
        marginTop: 10,
        textAlign: 'center',
    },
});

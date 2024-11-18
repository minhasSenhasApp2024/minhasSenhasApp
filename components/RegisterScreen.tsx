import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, Text, TextInput, StyleSheet, Modal, Image } from 'react-native';
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
    const [secretKey, setSecretKey] = useState<string | null>(null);
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
            const { user, secretKey: key } = await register(email, password, setIsLoggedIn, setUserEmail, setAwaitingUser);
            setError(null);
            setSecretKey(key);
            setSuccess(true);
            setModalVisible(true);
        } catch (e: any) {
            setError(e.message);
        }
    };

    const handleCopyKey = async () => {
        if (secretKey) {
            try {
                await Clipboard.setStringAsync(secretKey);
                setModalVisible(false);
                navigation.navigate('Login');
            } catch (clipboardError) {
                console.error("Erro ao copiar para a área de transferência:", clipboardError);
                setError('Não foi possível copiar a chave secreta.');
            }
        }
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
                    placeholder="Informe um e-mail..."
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
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <ThemedText style={styles.successModalText}>
                            IMPORTANTE!
                        </ThemedText>
                        <ThemedText style={styles.successModalText}>
                            Backup da Chave Secreta
                        </ThemedText>
                        <ThemedText style={styles.modalText}>
                            Sua chave secreta é:
                        </ThemedText>
                        <ThemedText style={styles.secretKey}>
                            {secretKey}
                        </ThemedText>
                        <ThemedText style={styles.modalText}>
                            Por favor, copie e armazene-a em um local seguro. Você precisará dela para recuperar sua conta e em novos dispositivos.
                        </ThemedText>
                        <TouchableOpacity style={styles.buttonCopy} onPress={handleCopyKey}>
                            <Text style={styles.buttonText}>Copiar e Prosseguir</Text>
                        </TouchableOpacity>
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
        paddingBottom: 110,
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
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    modalContent: {
        backgroundColor: '#afd4ff',
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    successModalText: {
        fontSize: 18,
        color: '#003883',
        textAlign: 'center',
        marginBottom: 10,
    },
    modalText: {
        fontSize: 16,
        color: '#003883',
        textAlign: 'center',
        marginBottom: 10,
    },
    secretKey: {
        fontSize: 14,
        color: '#003883',
        textAlign: 'center',
        marginVertical: 10,
    },
    buttonCopy: {
        backgroundColor: '#003883',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
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
        borderRadius: 5,
        backgroundColor: '#E9F0FF',
        width: '80%',
    },
    success: {
        color: '#003883',
        marginBottom: 22,
        fontSize: 25,
        textAlign: 'center',
    },
    strengthIndicator: {
        fontSize: 16,
        color: 'green',
    },
    passwordInputContainer: {
        flexDirection: 'row',
        marginBottom: 0,
        width: '80%',
    },
    passwordInput: {
        flex: 1,
        paddingRight: 55,
    },
    showHideButton: {
        marginRight: 5,
        marginTop: 15,
        color: '#003883',
        marginLeft: 10,
    },
    linkText: {
        textDecorationLine: 'underline',
        color: '#000',
        marginTop: 10,
    },
    linkTextContainer: {
        alignItems: 'center',
        padding: 10,
    },
    buttonCadastrar: {
        backgroundColor: '#003883',
        height: 50,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        width: '80%',
        marginTop: 16,
    },
    buttonCadastrarText: {
        color: '#fff',
        fontSize: 18,
    },
    error: {
        color: 'red',
        marginTop: 15,
        marginBottom: 10,
        textAlign: 'center',
        fontWeight: 'bold',
    },
});

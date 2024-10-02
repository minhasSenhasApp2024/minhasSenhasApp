import React, { useState, useCallback } from 'react';
import { TextInput, StyleSheet, Modal, View, TouchableOpacity, Text } from 'react-native';
import { register, onAuthStateChanged, logout } from '@/services/authService';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { auth } from '@/firebaseConfig';
import { generateStrongPassword } from '@/utils/passwordGen';
import { checkPasswordStrength } from '@/utils/checkPasswordStrength';

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

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    useFocusEffect(
        useCallback(() => {
            const checkAuthState = () => {
                const user = auth.currentUser;
                if (user) {
                    console.log("User is already logged in, redirecting...");
                    navigation.navigate('index' as never);
                } else {
                    console.log("User is not logged in, staying on register page");
                }
            };

            checkAuthState();

            // Clean up function
            return () => {
                setEmail('');
                setPassword('');
                setSuccess(false);
                setModalVisible(false);
            };
        }, [navigation])
    );

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            setError("As senhas não são iguais");
            return;
        }
        try {
            await register(email, password);
            setError(null);
            setSuccess(true);
            setModalVisible(true);

            await logout();
        } catch (e) {
            // @ts-ignore
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
                    onChangeText={(text) => {
                        setPassword(text);
                        setPasswordStrength(checkPasswordStrength(text));
                    }}
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
                    style={[styles.input, styles.passwordInput, { color: textColor }]}
                    placeholderTextColor="#888"
                />
                <TouchableOpacity onPress={togglePasswordVisibility}>
                    <ThemedText style={styles.showHideButton}>
                        {isPasswordVisible ? 'Ocultar' : 'Mostrar'}
                    </ThemedText>
                </TouchableOpacity>
            </View>
            <ThemedText style={styles.strengthIndicator}>{passwordStrength}</ThemedText>
            
            <View style={styles.linkTextContainer}>
                <TouchableOpacity onPress={handleGeneratePassword}>
                <Text style={styles.linkText}>Gerar Senha Forte</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonCadastrar} onPress={handleRegister}>
                    <Text style={styles.buttonCadastrarText}>Cadastrar-se</Text>
                </TouchableOpacity>
            </View>
            
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
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                            <Text style={styles.closeButtonText}>&times;</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buttonLogin} onPress={handleNavigateToLogin}>
                            <Text style={styles.buttonLoginText}>Ir para o Login</Text>
                        </TouchableOpacity>
                        {error && <ThemedText style={styles.error}>{error}</ThemedText>}
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
        backgroundColor: '#ADD8E6', // Azul claro
        paddingBottom: 250,
        paddingTop: 100,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 5,
        width: '80%',
        maxWidth: 400,
        textAlign: 'center',
        position: 'relative',
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    closeButtonText: {
        fontSize: 24,
        color: 'black',
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
        borderRadius: 4,
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
    strengthIndicator: {
        fontSize: 16,
        color: 'green',
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
    },
    buttonContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    button: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginVertical: 10,
        width: 150,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    buttonCadastrar: {
        backgroundColor: '#004aad',
        height: 38,
        justifyContent: 'center',
        width: 150,
        borderRadius: 5,
        alignItems: 'center',
        marginVertical: 10,
    },
    buttonCadastrarText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
    },
    buttonLoginText: {
        color: 'white',
        fontSize: 16,
    },
    linkTextContainer: {
        alignItems: 'center',
        marginVertical: 20,
        color:'#007bff',
    },
    linkText: {
        textDecorationLine: 'underline',
        marginVertical: 10,
    },
});
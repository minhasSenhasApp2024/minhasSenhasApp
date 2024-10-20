import React, { useState, useCallback, useEffect } from 'react';
import { View, TouchableOpacity, Text, TextInput, StyleSheet, Modal, Image, Button } from 'react-native';
import { register } from '@/services/authService';

import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { auth } from '@/firebaseConfig';
import { generateStrongPassword } from '@/utils/passwordGen';
import { checkPasswordStrength } from '@/utils/checkPasswordStrength';

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
    const { setIsLoggedIn, setUserEmail } = useAuth();

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

      useFocusEffect(
        useCallback(() => {
            // Clean up function
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
            await register(email, password, setIsLoggedIn, setUserEmail);
            setError(null);
            setSuccess(true);
            setModalVisible(true);
            setTimeout(() => {
                setModalVisible(false);
                navigation.navigate('Login');
            }, 2000);
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
            {success && <ThemedText style={styles.success}>Cadastro bem-sucedido!</ThemedText>}
            <View style={styles.linkTextContainer}>
            <TouchableOpacity onPress={handleNavigateToLogin}>
                <Text style={styles.linkText}>Ir para o Login</Text>
            </TouchableOpacity>
            </View>
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
        backgroundColor: '#afd4ff',
        paddingBottom: 150,
        paddingTop: 30,
    },
    image: {
        width: 210,
        height: 210,
    },
    imageContainer: {
        alignItems: 'center',
    },
    inputContainer: {
        marginBottom: 20,
        alignItems: 'center',
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
        textAlign: 'center',
        position: 'relative',
    },
    label: {
        marginBottom: 4,
        color: '#004aad',
        width: '80%',
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
    buttonLoginText: {
        color: 'white',
        fontSize: 16,
    },
    linkTextContainer: {
        alignItems: 'center',
        marginVertical: 10,
    },
    linkText: {
        textDecorationLine: 'underline',
        marginVertical: 5,
        color:'#004aad',
        marginBottom: 10,
    },
});
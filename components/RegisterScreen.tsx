import React, { useState, useCallback } from 'react';
import { TextInput, Button, StyleSheet, Modal, View, TouchableOpacity } from 'react-native';
import { register } from '@/services/authService';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { auth } from '@/firebaseConfig';
import { generateStrongPassword } from '@/utils/passwordGen';
import { checkPasswordStrength } from '@/utils/checkPasswordStrength';
import { RootStackParamList } from '@/types/RootStackParamList';
import { useRouter } from 'expo-router';

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

    const router = useRouter();

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    useFocusEffect(
        useCallback(() => {
            const checkAuthState = () => {
                const user = auth.currentUser;
                if (user) {
                    console.log("Usuário já está logado, redirecionando...");
                    router.push('/');
                } else {
                    console.log("Usuário não está logado, permanecendo na página de registro");
                }
            };

            checkAuthState();

            // Clean up function
            return () => {
                setEmail('');
                setPassword('');
                setConfirmPassword('');
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
            setTimeout(() => {
                setModalVisible(false);
                router.push('/masterpassword?action=set');
            }, 2000);
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
                    onChangeText={setConfirmPassword}
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

            <Button title="Gerar Senha Forte" onPress={handleGeneratePassword} />
            <Button title="Cadastrar-se" onPress={handleRegister} />
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
                <ThemedView style={styles.container}>
                    <ThemedText style={styles.success}>Cadastro bem-sucedido!</ThemedText>
                    <Button title="Ir para o Login" onPress={handleNavigateToLogin} />
                </ThemedView>
            </Modal>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
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
        marginBottom: 22,
        fontSize: 25,
        textAlign: 'center',
    },
    strengthIndicator: {
        fontSize: 16,
        color: 'green',
        marginBottom: 12,
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
});
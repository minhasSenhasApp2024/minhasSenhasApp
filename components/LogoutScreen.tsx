import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ThemedText } from '@/components/ThemedText';
import { logout } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';

export default function LogoutScreen() {
    const { setIsLoggedIn, userEmail, setUserEmail } = useAuth();

const handleLogout = async () => {
    await logout(setIsLoggedIn, setUserEmail);
};

    // useFocusEffect(
    //     useCallback(() => {
    //         return () => {
    //             setEmail('');
    //             setPassword('');
    //             // setSuccess(false);
    //         };
    //     }, [])
    // );

    return (
    <View style={styles.loggedInContainer}>
        <ThemedText style={styles.welcomeText}>Bem-vindo, {userEmail}!</ThemedText>
        <TouchableOpacity style={styles.buttonLogout} onPress={handleLogout}>
            <ThemedText style={styles.buttonTextLogout}>Logout</ThemedText>
        </TouchableOpacity>
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

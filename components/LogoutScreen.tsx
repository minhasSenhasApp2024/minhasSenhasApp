import React, { useCallback } from 'react'; 
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ThemedText } from '@/components/ThemedText';
import { logout } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';

export default function LogoutScreen() {
    const { setIsLoggedIn, userEmail, setUserEmail, setAwaitingUser } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation();

const handleLogout = async () => {
    await logout(setIsLoggedIn, setUserEmail, setAwaitingUser);
    navigation.navigate('Login' as never);
};

    useFocusEffect(
        useCallback(() => {
            return () => {
                setEmail('');
                setPassword('');
                // setSuccess(false);
            };
        }, [])
    );

    return (
        <ScrollView style={styles.container}>
            <ThemedText style={styles.welcomeText}>{userEmail}</ThemedText>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('DadosPessoais')}>
                <ThemedText style={styles.menuText}>Dados Pessoais</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Tema')}>
                <ThemedText style={styles.menuText}>Tema</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ExportacaoDados')}>
                <ThemedText style={styles.menuText}>Exportação de Dados</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Avaliacao')}>
                <ThemedText style={styles.menuText}>Avaliação</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonLogout} onPress={handleLogout}>
                <ThemedText style={styles.buttonTextLogout}>Sair</ThemedText>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#afd4ff', // Background color for the whole screen
        padding: 20,
    },
    welcomeText: {
        fontSize: 24,
        marginBottom: 20,
        color: '#004aad',
        marginTop: 10,
        paddingBottom: 40,
    },
    menuItem: {
        backgroundColor: '#004aad',
        padding: 15,
        borderRadius: 5,
        marginBottom: 10,
        width: '100%'
    },
    menuText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
    },
    buttonLogout: {
        backgroundColor: '#004aad',
        padding: 10,
        borderRadius: 5,
        width: 100,
        height: 42,
        justifyContent: 'center',
        marginBottom: 20,
        alignSelf: 'center', // Center the logout button
        marginTop: 40
    },
    buttonTextLogout: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
    },
});

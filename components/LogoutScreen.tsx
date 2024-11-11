import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ThemedText } from '@/components/ThemedText';
import { logout } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import ExportacaoDados from '@/app/(tabs)/ExportacaoDados';

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
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('DadosPessoais' as never)}>
                <ThemedText style={styles.menuText}>Dados Pessoais</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Tema' as never)}>
                <ThemedText style={styles.menuText}>Tema</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ExportacaoDados' as never)}>
                <ThemedText style={styles.menuText}>Exportação de Dados</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Avaliacao' as never)}>
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
        color: '#003883',
        marginTop: 10,
        paddingBottom: 40,
    },
    menuItem: {
        backgroundColor: '#003883',
        padding: 15,
        borderRadius: 5,
        marginBottom: 10,
        width: '100%',
        shadowColor: '#000', // Cor do sombreado
        shadowOffset: { width: 4, height: 2 }, // Deslocamento do sombreado
        shadowOpacity: 0.5, // Opacidade do sombreado
        shadowRadius: 3.84, // Raio do sombreado
        elevation: 10, // Sombreado para Android
    },
    menuText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
    },
    buttonLogout: {
        backgroundColor: '#003883',
        padding: 10,
        borderRadius: 5,
        width: 100,
        height: 42,
        justifyContent: 'center',
        marginBottom: 20,
        alignSelf: 'center', // Center the logout button
        marginTop: 40,
        shadowColor: '#000', // Cor do sombreado
        shadowOffset: { width: 4, height: 4 }, // Deslocamento do sombreado
        shadowOpacity: 0.5, // Opacidade do sombreado
        shadowRadius: 6, // Raio do sombreado
        elevation: 10, // Sombreado para Android
    },
    buttonTextLogout: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
    },
});

import React from 'react';
import { View, StyleSheet } from 'react-native';
import LogoutScreen from '@/components/LogoutScreen';
import { useAuth } from '@/context/AuthContext';
import { ThemedText } from '@/components/ThemedText';

export default function Profile() {
    const { isLoggedIn } = useAuth();

    if (!isLoggedIn) {
        return (
            <View style={styles.container}>
                <ThemedText style={styles.message}>Você não está logado.</ThemedText>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ThemedText style={styles.title}>Meu perfil</ThemedText>
            <LogoutScreen />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#afd4ff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#004aad',
    },
    message: {
        fontSize: 18,
        color: '#004aad',
    },
});
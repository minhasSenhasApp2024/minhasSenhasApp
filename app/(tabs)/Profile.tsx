import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import LogoutScreen from '@/components/LogoutScreen';
import { useAuth } from '@/context/AuthContext';
import { ThemedText } from '@/components/ThemedText';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
            <Icon name="person" size={80} color="#003883" />
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
        fontSize: 29,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#003883',
        paddingTop: 120
    },
    message: {
        fontSize: 18,
        color: '#003883',
    },
});
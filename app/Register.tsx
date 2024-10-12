import React from 'react';
import RegisterScreen from '@/components/RegisterScreen';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { ThemedText } from '@/components/ThemedText';

export default function RegisterPage() {
    const { isLoggedIn } = useAuth();

    if (isLoggedIn) {
        return (
            <View style={styles.container}>
                <ThemedText>You are already registered and logged in.</ThemedText>
            </View>
        );
    }

    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
            headerImage={<Ionicons size={310} name="person-add" style={styles.headerImage} />}
        >
            <RegisterScreen />
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    headerImage: {
        color: '#808080',
        bottom: -90,
        left: -35,
        position: 'absolute',
    },
});
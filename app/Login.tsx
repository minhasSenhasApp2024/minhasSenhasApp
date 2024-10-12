import React from 'react';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet } from 'react-native';
import LoginScreen from "@/components/LoginScreen";

export default function LoginPage() {
    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
            headerImage={<Ionicons size={310} name="person-add" style={styles.headerImage} />}
        >
            <LoginScreen />
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    headerImage: {
        color: '#808080',
        bottom: -90,
        left: -35,
        position: 'absolute',
    },
});
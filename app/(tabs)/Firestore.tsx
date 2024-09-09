import React from 'react';
import { addTestData } from '@/firebaseConfig';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import ParallaxScrollView from "@/components/ParallaxScrollView";
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform, Button } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import FirestoreData from "@/components/FirestoreData";


export default function FirestoreScreen() {
    const [result, setResult] = React.useState<string | null>(null);

    const handleTestConnection = async () => {
        const success = await addTestData();
        setResult(success ? "Data added successfully!" : "Failed to add data.");
    };

    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
            headerImage={<Ionicons size={310} name="code-slash" style={styles.container} />}>
            <ThemedView style={styles.container}>
                <Button title="Test Firestore Connection" onPress={handleTestConnection} />
                {result && <ThemedText>{result}</ThemedText>}
                <FirestoreData/>
                <ThemedText>1111</ThemedText>
            </ThemedView>
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
});

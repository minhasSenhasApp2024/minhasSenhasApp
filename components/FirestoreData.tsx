import React, { useEffect, useState } from 'react';
import { fetchData } from '@/firebaseConfig';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { StyleSheet, FlatList } from 'react-native';

export default function FirestoreData() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getData = async () => {
            const fetchedData = await fetchData();
            setData(fetchedData);
            setLoading(false);
        };
        getData();
    }, []);

    if (loading) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText>Loading...</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <FlatList
                data={data}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <ThemedText>{JSON.stringify(item)}</ThemedText>
                )}
            />
        </ThemedView>
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

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { exportPasswords } from '@/services/passwordService';
import { ThemedText } from '@/components/ThemedText';

export default function ExportacaoDados() {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await exportPasswords();
            Alert.alert('Sucesso', 'Senhas exportadas com sucesso!');
        } catch (error) {
            Alert.alert('Erro', 'Falha ao exportar senhas.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <View style={styles.container}>
            <ThemedText style={styles.title}>Exportar Senhas</ThemedText>
            <TouchableOpacity style={styles.button} onPress={handleExport} disabled={isExporting}>
                {isExporting ? (
                    <ActivityIndicator color="#ffffff" />
                ) : (
                    <Text style={styles.buttonText}>Exportar para JSON</Text>
                )}
            </TouchableOpacity>
            <ThemedText style={styles.warningText}>
                Atenção: O arquivo exportado contém suas senhas em formato JSON. Guarde-o em um local seguro e evite compartilhá-lo para proteger seus dados.
            </ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#003883',
    },
    button: {
        backgroundColor: '#003883',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        width: '80%',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
    },
    warningText: {
        marginTop: 20,
        color: '#ff0000',
        fontSize: 14,
        textAlign: 'center',
    },
});
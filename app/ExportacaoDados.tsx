import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { exportPasswords } from '@/services/passwordService';
import { ThemedText } from '@/components/ThemedText';
import { Picker } from '@react-native-picker/picker';

export default function ExportacaoDados() {
    const [isExporting, setIsExporting] = useState(false);
    const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await exportPasswords(exportFormat);
            Alert.alert('Sucesso', `Senhas exportadas com sucesso! Verifique o arquivo "minhas_senhas.${exportFormat}".`);
        } catch (error) {
            Alert.alert('Erro', 'Falha ao exportar senhas.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <View style={styles.container}>
            <ThemedText style={styles.title}>Exportar Senhas</ThemedText>
            {/* Dropdown para selecionar o formato */}
            <View style={styles.pickerContainer}>
                <Text style={styles.label}>Selecione o formato:</Text>
                <Picker
                    selectedValue={exportFormat}
                    style={styles.picker}
                    onValueChange={(itemValue: any) => setExportFormat(itemValue)}
                >
                    <Picker.Item label="JSON" value="json" />
                    <Picker.Item label="CSV" value="csv" />
                </Picker>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleExport} disabled={isExporting}>
                {isExporting ? (
                    <ActivityIndicator color="#ffffff" />
                ) : (
                    <Text style={styles.buttonText}>Exportar</Text>
                )}
            </TouchableOpacity>
            <ThemedText style={styles.warningText}>
            Atenção: O arquivo exportado contém suas senhas em formato {exportFormat.toUpperCase()}. Guarde-o em um local seguro e evite compartilhá-lo para proteger seus dados.
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
    pickerContainer: {
        width: '80%',
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        color: '#003883',
    },
    picker: {
        height: 50,
        width: '100%',
        borderColor: '#003883',
        borderWidth: 1,
        borderRadius: 5,
    },
    button: {
        backgroundColor: '#003883',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        width: '80%',
        marginBottom: 20,
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
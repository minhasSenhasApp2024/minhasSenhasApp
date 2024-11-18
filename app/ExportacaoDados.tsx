import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { exportPasswords } from '@/services/passwordService';
import { ThemedText } from '@/components/ThemedText';
import { Picker } from '@react-native-picker/picker';
import * as LocalAuthentication from 'expo-local-authentication';

export default function ExportacaoDados() {
    const [isExporting, setIsExporting] = useState(false);
    const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalTitle, setModalTitle] = useState('');

    const authenticateUser = async (): Promise<boolean> => {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            if (!hasHardware) {
                showModal('Erro', 'Autenticação biométrica não está disponível neste dispositivo.');
                return false;
            }

            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            if (!isEnrolled) {
                showModal('Erro', 'Nenhuma biometria cadastrada. Por favor, configure sua biometria nas configurações do dispositivo.');
                return false;
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Autenticação Necessária',
                fallbackLabel: 'Use Senha',
                disableDeviceFallback: false,
            });

            return result.success;
        } catch (error) {
            console.error('Erro durante a autenticação biométrica:', error);
            showModal('Erro', 'Falha na autenticação biométrica.');
            return false;
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const isAuthenticated = await authenticateUser();
            if (!isAuthenticated) {
                showModal('Autenticação Cancelada', 'A exportação das senhas foi cancelada.');
                return;
            }

            await exportPasswords(exportFormat);
            showModal('Sucesso', `Senhas exportadas com sucesso! Verifique o arquivo "minhas_senhas.${exportFormat}".`);
        } catch (error) {
            showModal('Erro', 'Falha ao exportar senhas.');
        } finally {
            setIsExporting(false);
        }
    };

    const showModal = (title: string, message: string) => {
        setModalTitle(title);
        setModalMessage(message);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
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

            {/* Modal */}
            <Modal
                transparent={true}
                animationType="slide"
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>{modalTitle}</Text>
                        <Text style={styles.modalMessage}>{modalMessage}</Text>
                        <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
                            <Text style={styles.modalButtonText}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        color: '#003883',
    },
    pickerContainer: {
        width: '80%',
        marginBottom: 20,
        backgroundColor: '#afd4ff',
        borderRadius: 5,
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
        backgroundColor: '#E9F0FF',
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
        color: '#003883',
        fontSize: 14,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: '#afd4ff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#003883',
        marginBottom: 10,
    },
    modalMessage: {
        fontSize: 16,
        color: '#003883',
        textAlign: 'center',
        marginBottom: 20,
    },
    modalButton: {
        backgroundColor: '#003883',
        padding: 10,
        borderRadius: 5,
    },
    modalButtonText: {
        color: 'white',
        fontSize: 16,
    },
});

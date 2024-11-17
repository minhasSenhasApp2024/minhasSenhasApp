import React, { useState } from 'react';
import { View, Modal, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface SecretKeyDialogProps {
    visible: boolean;
    onCancel: () => void;
    onConfirm: (key: string) => void;
}

export function SecretKeyDialog({ visible, onCancel, onConfirm }: SecretKeyDialogProps) {
    const [secretKey, setSecretKey] = useState('');

    const handleConfirm = () => {
        onConfirm(secretKey);
        setSecretKey(''); // Limpa o input após confirmar
    };

    const handleCancel = () => {
        setSecretKey(''); // Limpa o input ao cancelar
        onCancel();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleCancel}
        >
            <View style={styles.container}>
                <View style={styles.dialog}>
                    <Text style={styles.title}>Recuperação de Conta</Text>
                    <Text style={styles.message}>
                        Insira sua chave secreta para recuperar os dados:
                    </Text>
                    <TextInput
                        style={styles.input}
                        value={secretKey}
                        onChangeText={setSecretKey}
                        placeholder="Cole sua chave secreta aqui"
                        secureTextEntry
                        multiline
                    />
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity 
                            style={[styles.button, styles.cancelButton]} 
                            onPress={handleCancel}
                        >
                            <Text style={styles.buttonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.button, styles.confirmButton]} 
                            onPress={handleConfirm}
                        >
                            <Text style={styles.buttonText}>Confirmar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dialog: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        width: '90%',
        maxWidth: 400,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    message: {
        marginBottom: 15,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        flex: 1,
        padding: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#ccc',
    },
    confirmButton: {
        backgroundColor: '#003883',
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});
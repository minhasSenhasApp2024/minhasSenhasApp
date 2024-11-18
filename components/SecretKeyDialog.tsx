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
                    <Text style={styles.title}>Necessário fornecer a chave secreta:</Text>
                    <Text style={styles.message}>
                        Seus dados estão criptografados. Insira sua chave secreta para acessá-los:
                    </Text>
                    <TextInput
                        style={styles.input}
                        value={secretKey}
                        onChangeText={setSecretKey}
                        placeholder="Cole sua chave secreta aqui"
                        // secureTextEntry
                        multiline={false}
                        blurOnSubmit={true}
                        returnKeyType="done"
                        // autoFocus
                    />
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity 
                            style={[styles.button, styles.cancelButton]} 
                            onPress={handleCancel}
                            accessible={true}
                            accessibilityLabel="Cancelar inserção da chave secreta"
                        >
                            <Text style={styles.buttonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.button, styles.confirmButton]} 
                            onPress={handleConfirm}
                            accessible={true}
                            accessibilityLabel="Confirmar inserção da chave secreta"
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
        backgroundColor: '#afd4ff',
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
        color: '#003883',
    },
    message: {
        marginBottom: 15,
        textAlign: 'center',
        color: '#003883',
    },
    input: {
        borderWidth: 1,
        borderColor: '#003883',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        height: 50,
        color: '#003883',
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
        backgroundColor: '#ff516b',
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
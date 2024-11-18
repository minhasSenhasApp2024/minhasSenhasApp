import React, { useState } from 'react';
import { View, StyleSheet, Image, Modal, Text, TouchableOpacity, Button } from 'react-native';
import LogoutScreen from '@/components/LogoutScreen';
import { useAuth } from '@/context/AuthContext';
import { ThemedText } from '@/components/ThemedText';
import Icon from 'react-native-vector-icons/MaterialIcons';

// EXCLUIR
import { auth } from '@/firebaseConfig';
import { deleteSecureData } from '@/services/secureStorageService';
import { useNavigation } from '@react-navigation/native';// EXCLUIR

export default function Profile() {
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalType, setModalType] = useState('success'); // 'success' ou 'error'

    const { isLoggedIn } = useAuth();

    if (!isLoggedIn) {
        return (
            <View style={styles.container}>
                <ThemedText style={styles.message}>Você não está logado.</ThemedText>
            </View>
        );
    }

    const handleDeleteSecretKey = async () => {
        const user = auth.currentUser;
        if (!user) {
            setModalMessage('Usuário não autenticado.');
            setModalType('error');
            setModalVisible(true);
            return;
        }

        setModalMessage('Tem certeza que deseja excluir a chave secreta? Isso pode afetar sua capacidade de acessar suas senhas.');
        setModalType('confirmation');
        setModalVisible(true);
    };

    const confirmDeleteSecretKey = async () => {
        try {
            const user = auth.currentUser;
            const secretKeyStorageKey = `secretKey_${user.uid}`;
            await deleteSecureData(secretKeyStorageKey);
            setModalMessage('Chave secreta excluída com sucesso.');
            setModalType('success');
        } catch (error) {
            console.error('Erro ao excluir a chave secreta:', error);
            setModalMessage('Não foi possível excluir a chave secreta.');
            setModalType('error');
        } finally {
            setModalVisible(true);
        }
    };

    return (
        <View style={styles.container}>
            <ThemedText style={styles.title}>Meu perfil</ThemedText>
            <Icon name="person" size={80} color="#003883" />

            <Button
                title="Excluir Chave Secreta"
                onPress={handleDeleteSecretKey}
                color="#ff516b"
            />
            <LogoutScreen />

            {/* Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>{modalMessage}</Text>
                        {modalType === 'confirmation' ? (
                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.buttonText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.deleteButton]}
                                    onPress={() => {
                                        setModalVisible(false);
                                        confirmDeleteSecretKey();
                                    }}
                                >
                                    <Text style={styles.buttonText}>Excluir</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={[ styles.okButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>OK</Text>
                            </TouchableOpacity>
                        )}
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
        fontSize: 29,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#003883',
        paddingTop: 120,
    },
    message: {
        fontSize: 18,
        color: '#003883',
    },
    button: {
        borderRadius: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: '#afd4ff', 
        borderRadius: 10,
        alignItems: 'center',
    },
    modalText: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
        color: '#003883',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#003883',
    },
    deleteButton: {
        backgroundColor: '#ff516b',
        height: 55,
    },
    okButton: {
        backgroundColor: '#003883',
        height: 40,
        borderRadius: 5,
        width: 80,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        paddingTop: 8,
    },
});

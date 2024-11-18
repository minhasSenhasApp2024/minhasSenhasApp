import React from 'react';
import { View, StyleSheet, Image, Alert, Button } from 'react-native';
import LogoutScreen from '@/components/LogoutScreen';
import { useAuth } from '@/context/AuthContext';
import { ThemedText } from '@/components/ThemedText';
import Icon from 'react-native-vector-icons/MaterialIcons';

// EXCLUIR
import { auth } from '@/firebaseConfig';
import { deleteSecureData } from '@/services/secureStorageService';
import { useNavigation } from '@react-navigation/native';// EXCLUIR

export default function Profile() {
    // EXCLUI
    const navigation = useNavigation();// EXCLUIR


    const { isLoggedIn } = useAuth();

    if (!isLoggedIn) {
        return (
            <View style={styles.container}>
                <ThemedText style={styles.message}>Você não está logado.</ThemedText>
            </View>
        );
    }

        // Função para lidar com a exclusão da chave secreta
        const handleDeleteSecretKey = async () => {
            const user = auth.currentUser;
            if (!user) {
                Alert.alert('Erro', 'Usuário não autenticado.');
                return;
            }
    
            Alert.alert(
                'Confirmar Exclusão',
                'Tem certeza que deseja excluir a chave secreta? Isso pode afetar sua capacidade de acessar suas senhas.',
                [
                    {
                        text: 'Cancelar',
                        style: 'cancel',
                    },
                    {
                        text: 'Excluir',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                const secretKeyStorageKey = `secretKey_${user.uid}`;
                                await deleteSecureData(secretKeyStorageKey);
                                Alert.alert('Sucesso', 'Chave secreta excluída com sucesso.');
                                

                            } catch (error) {
                                console.error('Erro ao excluir a chave secreta:', error);
                                Alert.alert('Erro', 'Não foi possível excluir a chave secreta.');
                            }
                        },
                    },
                ],
                { cancelable: true }
            );
        };

    return (
        <View style={styles.container}>
            <ThemedText style={styles.title}>Meu perfil</ThemedText>
            <Icon name="person" size={80} color="#003883" />
            
            <Button
                title="Excluir Chave Secreta"
                onPress={handleDeleteSecretKey}
                color="#ff516b" // Cor vermelha para destacar a ação de exclusão
            />
            <LogoutScreen />
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
        paddingTop: 120
    },
    message: {
        fontSize: 18,
        color: '#003883',
    },
    button: {
        borderRadius: 10,
    }
});
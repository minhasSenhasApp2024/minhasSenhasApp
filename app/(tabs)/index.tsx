import React, { useState, useCallback } from 'react'; 
import { View, Text, TextInput, Alert, TouchableOpacity, FlatList, StyleSheet, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { addPasswordToFirestore, fetchUserPasswords, updatePasswordInFirestore, deletePasswordFromFirestore } from '@/services/passwordService';
import { generateStrongPassword } from '@/utils/passwordGen';
import { checkPasswordStrength } from '@/utils/checkPasswordStrength';
import { ThemedText } from '@/components/ThemedText';
import Icon from 'react-native-vector-icons/FontAwesome';

import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';

interface Password {
  id: string;
  name: string;
  login: string;
  value: string;
  category: string;
}

const PasswordList: React.FC<{ passwords: Password[]; onPasswordUpdated: () => void }> = ({ passwords, onPasswordUpdated }) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [visiblePassword, setVisiblePassword] = useState<string | null>(null);
  const [editingPassword, setEditingPassword] = useState<Password | null>(null);
  const [updatedPassword, setUpdatedPassword] = useState<Password | null>(null);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [selectedPasswordId, setSelectedPasswordId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePassword(visiblePassword === id ? null : id);
  };

  const startEditing = (password: Password) => {
    setEditingPassword(password);
    setUpdatedPassword(password);
  };

  const cancelEditing = () => {
    setEditingPassword(null);
    setUpdatedPassword(null);
  };

  const { setIsLoggedIn, setUserEmail } = useAuth();
  const navigation = useNavigation();

  const handleDelete = async () => {
    if (selectedPasswordId) {
      const success = await deletePasswordFromFirestore(selectedPasswordId);
      if (success) {
        console.log(`Password with ID ${selectedPasswordId} deleted successfully.`);
        onPasswordUpdated();
      } else {
        console.error('Failed to delete password.');
        Alert.alert('Erro', 'Falha ao excluir a senha.');
      }
      setIsConfirmModalVisible(false);
    }
  };

  const openConfirmModal = (passwordId: string) => {
    setSelectedPasswordId(passwordId);
    setIsConfirmModalVisible(true);
  };

  const renderItem = ({ item: password }: { item: Password }) => (
    <View style={styles.passwordItem}>
      <TouchableOpacity style={styles.passwordHeader} onPress={() => toggleExpand(password.id)}>
        <Text style={styles.passwordTitle}>{password.name}</Text>
        <Icon name={expanded === password.id ? 'angle-up' : 'angle-down'} size={20} color="#003883" />
      </TouchableOpacity>
      {expanded === password.id && (
        <View style={styles.passwordDetails}>
          {editingPassword && editingPassword.id === password.id ? (
            <View>
              <Text style={styles.bold}>Nome da Senha:</Text>
              <TextInput
                style={styles.input}
                value={updatedPassword?.name || ''}
                onChangeText={(text) => setUpdatedPassword(prev => prev ? { ...prev, name: text } : null)}
              />
              <Text style={styles.bold}>Login:</Text>
              <TextInput
                style={styles.input}
                value={updatedPassword?.login || ''}
                onChangeText={(text) => setUpdatedPassword(prev => prev ? { ...prev, login: text } : null)}
              />
              <Text style={styles.bold}>Categoria:</Text>
              <TextInput
                style={styles.input}
                value={updatedPassword?.category || ''}
                onChangeText={(text) => setUpdatedPassword(prev => prev ? { ...prev, category: text } : null)}
              />
              <Text style={styles.bold}>Senha:</Text>
              <TextInput
                style={styles.input}
                value={updatedPassword?.value || ''}
                onChangeText={(text) => setUpdatedPassword(prev => prev ? { ...prev, value: text } : null)}
                secureTextEntry={true}
              />
              <View style={styles.editButtonsContainer}>
                <TouchableOpacity 
                  style={[styles.button, styles.saveButton]} 
                  onPress={async () => {
                    if (updatedPassword) {
                      const success = await updatePasswordInFirestore(password.id, {
                        name: updatedPassword.name,
                        login: updatedPassword.login,
                        value: updatedPassword.value,
                        category: updatedPassword.category,
                      });
                      if (success) {
                        setEditingPassword(null);
                        setUpdatedPassword(null);
                        onPasswordUpdated();
                      } else {
                        Alert.alert('Erro', 'Falha ao atualizar a senha.');
                      }
                    }
                  }}
                >
                  <Text style={styles.buttonText}>Salvar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]} 
                  onPress={cancelEditing}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <Text style={styles.bold1}>
                <Text style={styles.bold}>Login:</Text> {password.login}
              </Text>
              <Text style={styles.bold1}>
                <Text style={styles.bold}>Categoria:</Text> {password.category}
              </Text>
              <Text style={styles.bold1}>
                <Text style={styles.bold}>Senha:</Text> 
                {visiblePassword === password.id ? password.value : '••••••••'}
              </Text>
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity onPress={() => togglePasswordVisibility(password.id)} style={styles.actionButton}>
                  <Icon name={visiblePassword === password.id ? 'eye-slash' : 'eye'} size={25} color="#003883" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => startEditing(password)} style={styles.actionButton}>
                  <Icon name="edit" size={25} color="#003883" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openConfirmModal(password.id)} style={styles.actionButton}>
                  <Icon name="trash" size={25} color="#ff516b" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );

  return (
    <>
      <FlatList
        data={passwords}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.passwordList}
      />
      <Modal visible={isConfirmModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContainer}>
            <Text style={styles.confirmText}>Quer mesmo excluir esta senha?</Text>
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity style={styles.cancelButtonExcluir} onPress={() => setIsConfirmModalVisible(false)}>
                <Text style={styles.buttonTextModal}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Text style={styles.buttonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const AddPasswordModal: React.FC<{ visible: boolean, onClose: () => void, onAdd: (password: Omit<Password, 'id'>) => void }> = ({ visible, onClose, onAdd }) => {
  const [newPasswordName, setNewPasswordName] = useState('');
  const [newPasswordLogin, setNewPasswordLogin] = useState('');
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [newPasswordCategory, setNewPasswordCategory] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleGeneratePassword = () => {
    const strongPassword = generateStrongPassword();
    setNewPasswordValue(strongPassword);
    setPasswordStrength(checkPasswordStrength(strongPassword));
  };

  const handleSubmit = () => {
    const newPassword = {
      name: newPasswordName,
      login: newPasswordLogin,
      value: newPasswordValue,
      category: newPasswordCategory,
    };
    onAdd(newPassword);
    setNewPasswordName('');
    setNewPasswordLogin('');
    setNewPasswordValue('');
    setNewPasswordCategory('');
    setPasswordStrength('');
    onClose();
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>&times;</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Adicionar Nova Senha</Text>
          <TextInput
            style={styles.inputModal}
            placeholder="Nome da Senha"
            value={newPasswordName}
            onChangeText={setNewPasswordName}
          />
          <TextInput
            style={styles.inputModal}
            placeholder="Login"
            value={newPasswordLogin}
            onChangeText={setNewPasswordLogin}
          />
           <View style={styles.passwordValueContainer}>
            <TextInput
              style={[styles.inputModal, styles.passwordInput]}
              placeholder="Senha"
              value={newPasswordValue}
              onChangeText={(text) => {
                setNewPasswordValue(text);
                setPasswordStrength(checkPasswordStrength(text));
              }}
              secureTextEntry={!isPasswordVisible}
              placeholderTextColor="#003883"
            />
            <TouchableOpacity onPress={togglePasswordVisibility}>
              <Text style={styles.showHideButton}>
                {isPasswordVisible ? 'Ocultar' : 'Mostrar'}
              </Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.inputModal}
            placeholder="Categoria"
            value={newPasswordCategory}
            onChangeText={setNewPasswordCategory}
          />
          <ThemedText style={styles.strengthIndicator}>{passwordStrength}</ThemedText>
          <TouchableOpacity style={styles.linkButton} onPress={handleGeneratePassword}>
            <Text style={styles.linkText}>Gerar Senha Forte</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
            <Text style={styles.addButtonText}>Adicionar Senha</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};


const HomePage: React.FC = () => {
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { isLoggedIn } = useAuth();
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      const checkAuthState = () => {
        if (!isLoggedIn) {
          console.log("User is not logged in, redirecting to login...");
          navigation.navigate('Login' as never);
        } else {
          console.log("User is logged in, loading passwords...");
          loadPasswords();
        }
      };
  
      checkAuthState();
  
      // Clean up function
      return () => {
        setPasswords([]);
        setSearch('');
        setIsLoading(true);
      };
    }, [navigation, isLoggedIn])
  );

  const loadPasswords = async () => {
    setIsLoading(true);
    try {
      const fetchedPasswords = await fetchUserPasswords();
      setPasswords(fetchedPasswords as Password[]);
    } catch (error) {
      console.error('Error fetching passwords:', error);
      Alert.alert('Erro', 'Falha ao carregar as senhas.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPasswords = passwords.filter(password =>
    password.name.toLowerCase().includes(search.toLowerCase())
  );

  const addPassword = async (newPassword: Omit<Password, 'id'>) => {
    const success = await addPasswordToFirestore(newPassword);
    if (success) {
      await loadPasswords();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.title}>Minhas Senhas</Text>
        <TextInput
          style={styles.searchBar}
          placeholder="Pesquisar senhas..."
          value={search}
          onChangeText={setSearch}
        />
        {isLoading ? (
          <ActivityIndicator size="large" color="#ffffff" />
        ) : (
          <PasswordList passwords={filteredPasswords} onPasswordUpdated={loadPasswords} />
        )}
        <TouchableOpacity style={styles.addPasswordButton} onPress={() => setIsModalOpen(true)}>
          <Text style={styles.addPasswordButtonText}>Adicionar Nova Senha</Text>
        </TouchableOpacity>
        <AddPasswordModal visible={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={addPassword} 
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#afd4ff',
    paddingTop: 40,
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 40,
    paddingBottom: 35,
    color: '#003883',
  },
  searchBar: {
    width: '80%',
    maxWidth: 400,
    height: 40,
    borderColor: '#d9eafd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#d9eafd',
    marginTop: 20,
    marginBottom: 30,
    color: '#003883',
    shadowColor: '#000', // Cor do sombreado
    shadowOffset: { width: 0, height: 2 }, // Deslocamento do sombreado
    shadowOpacity: 0.25, // Opacidade do sombreado
    shadowRadius: 3.84, // Raio do sombreado
    elevation: 5, // Sombreado para Android
  },
  passwordTitle: {
    color: '#003883',
    fontSize: 20,
    fontWeight: 'bold',
  },
  passwordList: {
    width: '80%',
    maxWidth: 600,
    marginBottom: 10,
  },
  passwordItem: {
    backgroundColor: '#d9eafd',
    marginVertical: 5,
    padding: 10,
    borderRadius: 5,
    shadowColor: '#000', // Cor do sombreado
    shadowOffset: { width: 0, height: 2 }, // Deslocamento do sombreado
    shadowOpacity: 0.25, // Opacidade do sombreado
    shadowRadius: 3.84, // Raio do sombreado
    elevation: 5, // Sombreado para Android
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  setas: {
    fontSize: 20,
    color: '#003883',
  },
  passwordDetails: {
    marginTop: 10,
  },
  passwordValue: {
    marginRight: 10,
    color: '#003883',
  },
  bold: {
    fontWeight: 'bold',
    color: '#003883',
    paddingVertical: 10,
  },
  bold1: {
    color: '#003883',
    paddingVertical: 10,
  },
  showHideButton: {
    color: '#003883',
  },
  addPasswordButton: {
    backgroundColor: '#003883',
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
    marginBottom: 60,
    shadowColor: '#000', // Cor do sombreado
    shadowOffset: { width: 0, height: 2 }, // Deslocamento do sombreado
    shadowOpacity: 0.25, // Opacidade do sombreado
    shadowRadius: 3.84, // Raio do sombreado
    elevation: 5, // Sombreado para Android
  },
  addPasswordButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#003883',
  },

    modalContent: {
    width: '80%',
    backgroundColor: '#afd4ff',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
linkButton: {
    alignItems: 'center',
    marginBottom: 15,
  },
  linkText: {
    color: '#003883',
    textDecorationLine: 'underline',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d9eafd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  inputModal: {
    borderWidth: 1,
    borderColor: '#d9eafd', // Changed to appropriate color
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    color: '#003883', // Text color remains
    backgroundColor: '#d9eafd',
  },
  addButton: {
    backgroundColor: '#003883',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: 150,
    alignSelf: 'center',
    shadowColor: '#000', // Cor do sombreado
    shadowOffset: { width: 0, height: 2 }, // Deslocamento do sombreado
    shadowOpacity: 0.25, // Opacidade do sombreado
    shadowRadius: 3.84, // Raio do sombreado
    elevation: 5, // Sombreado para Android
  },
  addButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  strengthIndicator: {
    fontSize: 16,
    color: 'green',
  },
  passwordValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  passwordInput: {
    flex: 1,
    marginRight: 10,
  },
  deleteText: {
    color: '#ff0000',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginTop: 10,
    shadowColor: '#000', // Cor do sombreado
    shadowOffset: { width: 0, height: 2 }, // Deslocamento do sombreado
  },
  actionButton: {
    marginRight: 15,
  },
  editButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 8, // Diminuir a altura
    paddingHorizontal: 15, // Diminuir a largura
    shadowColor: '#000', // Cor do sombreado
    shadowOffset: { width: 0, height: 2 }, // Deslocamento do sombreado
    shadowOpacity: 0.25, // Opacidade do sombreado
    shadowRadius: 3.84, // Raio do sombreado
    elevation: 5, // Sombreado para Android
  },
  saveButton: {
    backgroundColor: '#003883',
  },
  cancelButton: {
    backgroundColor: '#ff516b',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModalContainer: {
    backgroundColor: '#d5e8ff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 18,
    color: '#003883',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  deleteButton: {
    backgroundColor: '#ff516b',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000', // Cor do sombreado
    shadowOffset: { width: 0, height: 2 }, // Deslocamento do sombreado
    shadowOpacity: 0.25, // Opacidade do sombreado
    shadowRadius: 3.84, // Raio do sombreado
    elevation: 5, // Sombreado para Android
  },
  buttonTextModal: {
    backgroundColor: '#003883',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    color: 'white',
    fontWeight: 'bold',
    shadowColor: '#000', // Cor do sombreado
    shadowOffset: { width: 0, height: 2 }, // Deslocamento do sombreado
    shadowOpacity: 0.25, // Opacidade do sombreado
    shadowRadius: 3.84, // Raio do sombreado
    elevation: 5, // Sombreado para Android
  },
});

export default HomePage;
import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Modal, ScrollView, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { addPasswordToFirestore, fetchUserPasswords } from '@/services/passwordService';
import { generateStrongPassword } from '@/utils/passwordGen';
import { checkPasswordStrength } from '@/utils/checkPasswordStrength';
import { ThemedText } from '@/components/ThemedText';

import { useNavigation } from '@react-navigation/native';
import { auth } from '@/firebaseConfig';

import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';


interface Password {
  id: string;
  name: string;
  login: string;
  value: string;
  category: string;
}

const PasswordList: React.FC<{ passwords: Password[] }> = ({ passwords }) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [visiblePassword, setVisiblePassword] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePassword(visiblePassword === id ? null : id);
  };
  
  const renderItem = ({ item: password }: { item: Password }) => (
    <View style={styles.passwordItem}>
      <TouchableOpacity style={styles.passwordHeader} onPress={() => toggleExpand(password.id)}>
        <Text style={styles.passwordTitle}>{password.name}</Text>
        <Text style={styles.setas}>{expanded === password.id ? '⮟' : '⮝'}</Text>
      </TouchableOpacity>
      {expanded === password.id && (
        <View style={styles.passwordDetails}>
          <Text style={styles.bold1}><Text style={styles.bold}>Login:</Text> {password.login}</Text>
          <Text style={styles.bold1}><Text style={styles.bold}>Categoria:</Text> {password.category}</Text>
          <View style={styles.passwordValueContainer}>
            <Text style={styles.bold}>Senha: </Text>
            <Text style={styles.passwordValue}>
              {visiblePassword === password.id ? password.value : '••••••••'}
            </Text>
            <TouchableOpacity onPress={() => togglePasswordVisibility(password.id)}>
              <Text style={styles.showHideButton}>
                {visiblePassword === password.id ? 'Ocultar' : 'Mostrar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <FlatList
      data={passwords}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      style={styles.passwordList}
    />
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
            style={styles.input}
            placeholder="Nome da Senha"
            value={newPasswordName}
            onChangeText={setNewPasswordName}
          />
          <TextInput
            style={styles.input}
            placeholder="Login"
            value={newPasswordLogin}
            onChangeText={setNewPasswordLogin}
          />
           <View style={styles.passwordValueContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Senha"
              value={newPasswordValue}
              onChangeText={(text) => {
                setNewPasswordValue(text);
                setPasswordStrength(checkPasswordStrength(text));
              }}
              secureTextEntry={!isPasswordVisible}
              placeholderTextColor="#888"
            />
            <TouchableOpacity onPress={togglePasswordVisibility}>
              <Text style={styles.showHideButton}>
                {isPasswordVisible ? 'Ocultar' : 'Mostrar'}
              </Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Categoria"
            value={newPasswordCategory}
            onChangeText={setNewPasswordCategory}
          />
          <ThemedText style={styles.strengthIndicator}>{passwordStrength}</ThemedText>
          <TouchableOpacity style={styles.addButton} onPress={handleGeneratePassword}>
            <Text style={styles.addButtonText}>Gerar Senha Forte</Text>
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
          <PasswordList passwords={filteredPasswords} />
        )}
        <TouchableOpacity style={styles.addPasswordButton} onPress={() => setIsModalOpen(true)}>
          <Text style={styles.addPasswordButtonText}>Adicionar Nova Senha</Text>
        </TouchableOpacity>
        <AddPasswordModal visible={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={addPassword} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#afd4ff',
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 40,
    paddingBottom: 35,
    color: '#004aad',
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
    color: '#004aad'
  },
  passwordTitle: {
    color: '#004aad',
    fontSize: 16,
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
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  setas: {
    fontSize: 16,
    color: '#004aad',
  },
  passwordDetails: {
    marginTop: 10,
  },
  passwordValue: {
    marginRight: 10,
    color: '#004aad',
  },
  bold: {
    fontWeight: 'bold',
    color: '#004aad',
    paddingVertical: 10,
  },
  bold1: {
    color: '#004aad',
    paddingVertical: 10,
  },
  showHideButton: {
    color: '#004aad',
  },
  addPasswordButton: {
    backgroundColor: '#004aad',
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
    marginBottom: 60
  },
  addPasswordButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 5,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
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

});

export default HomePage;
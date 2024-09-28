import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { addPasswordToFirestore, fetchUserPasswords } from '@/services/passwordService';
import { generateStrongPassword } from '@/utils/passwordGen';
import { checkPasswordStrength } from '@/utils/checkPasswordStrength';
import { ThemedText } from '@/components/ThemedText';
import { auth } from '@/firebaseConfig';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';

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
        <Text>{password.name}</Text>
        <Text>{expanded === password.id ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {expanded === password.id && (
        <View style={styles.passwordDetails}>
          <Text><Text style={styles.bold}>Login:</Text> {password.login}</Text>
          <Text><Text style={styles.bold}>Categoria:</Text> {password.category}</Text>
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
  const [masterPassword, setMasterPassword] = useState('');
  const router = useRouter();

  const params = useLocalSearchParams();

  useEffect(() => {
    console.log("Master password received:", params.masterPassword);
    if (params.masterPassword) {
      setMasterPassword(params.masterPassword as string);
    }
  }, [params]);
  
  useEffect(() => {
    if (masterPassword) {
      loadPasswords();
    }
  }, [masterPassword]);
  
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
  
      const checkAuthState = async () => {
        const user = auth.currentUser;
        if (!user && isActive) {
          console.log("Usuário não está logado, redirecionando para login...");
          router.replace('/Login');
        } else if (user && isActive) {
          if (!masterPassword) {
            console.log("Usuário está logado, solicitando senha mestra...");
            router.push('/masterpassword?action=verify');
          } else {
            loadPasswords();
          }
        }
      };
  
      checkAuthState();
  
      return () => {
        isActive = false;
      };
    }, [router, masterPassword])
  );

  const loadPasswords = async () => {
    console.log("Loading passwords with master password:", masterPassword);
    setIsLoading(true);
    try {
      if (!masterPassword) {
        console.error('Master password not set');
        return;
      }
      const fetchedPasswords = await fetchUserPasswords(masterPassword);
      setPasswords(fetchedPasswords as Password[]);
    } catch (error) {
      console.error('Erro ao buscar senhas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPasswords = passwords.filter(password =>
    password.name.toLowerCase().includes(search.toLowerCase())
  );

  const addPassword = async (newPassword: Omit<Password, 'id'>) => {
    const success = await addPasswordToFirestore(newPassword, masterPassword);
    if (success) {
      await loadPasswords();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.title}>Senhas Cadastradas</Text>
        <TextInput
          style={styles.searchBar}
          placeholder="Pesquisar..."
          value={search}
          onChangeText={setSearch}
        />
        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
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
    backgroundColor: '#fff',
    padding: 16,
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    
  },
  searchBar: {
    width: '100%',
    maxWidth: 400,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  passwordList: {
    width: '100%',
    maxWidth: 600,
  },
  passwordItem: {
    backgroundColor: '#f4f4f4',
    marginVertical: 5,
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  passwordName: {
    fontSize: 18,
    fontWeight: 'bold',
},
passwordLogin: {
    fontSize: 16,
    color: '#555',
},
passwordValue: {
    fontSize: 16,
    color: '#555',
},
passwordCategory: {
    fontSize: 14,
    color: '#777',
},
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passwordDetails: {
    marginTop: 10,
  },
  bold: {
    fontWeight: 'bold',
  },
  showHideButton: {
    color: 'blue',
  },
  addPasswordButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
  addPasswordButtonText: {
    color: '#fff',
    fontSize: 16,
},
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    elevation: 5,
    width: '80%',
    maxWidth: 400,
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  strengthIndicator: {
    fontSize: 16,
    color: 'green',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  passwordValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  passwordInput: {
    flex: 1,
    marginRight: 10,
  },
});

export default HomePage;
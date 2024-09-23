import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Definição do tipo para a senha
interface Password {
  id: number;
  name: string;
  login: string;
  value: string;
}

// Componente para renderizar a lista de senhas
const PasswordList: React.FC<{ passwords: Password[] }> = ({ passwords }) => {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [visiblePassword, setVisiblePassword] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpanded(expanded === id ? null : id);
  };

  const togglePasswordVisibility = (id: number) => {
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
      keyExtractor={(item) => item.id.toString()}
      style={styles.passwordList}
    />
  );
};

// Componente de modal para adicionar nova senha
const AddPasswordModal: React.FC<{ visible: boolean, onClose: () => void, onAdd: (password: Password) => void }> = ({ visible, onClose, onAdd }) => {
  const [newPasswordName, setNewPasswordName] = useState('');
  const [newPasswordLogin, setNewPasswordLogin] = useState('');
  const [newPasswordValue, setNewPasswordValue] = useState('');

  const handleSubmit = () => {
    const newPassword: Password = {
      id: Math.random(), // Gera um ID aleatório
      name: newPasswordName,
      login: newPasswordLogin,
      value: newPasswordValue,
    };
    onAdd(newPassword);
    setNewPasswordName('');
    setNewPasswordLogin('');
    setNewPasswordValue('');
    onClose();
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
          <TextInput
            style={styles.input}
            placeholder="Senha"
            value={newPasswordValue}
            onChangeText={setNewPasswordValue}
            secureTextEntry
          />
          <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
            <Text style={styles.addButtonText}>Adicionar Senha</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Componente principal da página inicial
const HomePage: React.FC = () => {
  const [passwords, setPasswords] = useState<Password[]>([
    { id: 1, name: 'Senha do Email', login: 'email@example.com', value: 'senha123' },
    { id: 2, name: 'Senha do Banco', login: 'banco@example.com', value: 'senha456' },
    { id: 3, name: 'Senha do GitHub', login: 'github@example.com', value: 'senha789' },
  ]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredPasswords = passwords.filter(password =>
    password.name.toLowerCase().includes(search.toLowerCase())
  );

  const addPassword = (newPassword: Password) => {
    setPasswords([...passwords, newPassword]);
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
        <PasswordList passwords={filteredPasswords} />
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
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
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
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passwordDetails: {
    marginTop: 10,
  },
  passwordValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordValue: {
    marginRight: 10,
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
});

export default HomePage;
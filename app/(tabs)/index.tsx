import React, { useState } from 'react';
import './index.css'; // Importa o arquivo CSS

// Definição do tipo para a senha
interface Password {
  id: number;
  name: string;
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

  return (
    <div className="password-list">
      <h2>Lista de Senhas</h2>
      <ul>
        {passwords.map(password => (
          <li key={password.id} className="password-item">
            <div className="password-header">
              <span>{password.name}</span>
              <button onClick={() => toggleExpand(password.id)}>
                {expanded === password.id ? '▲' : '▼'}
              </button>
            </div>
            {expanded === password.id && (
              <div className="password-details">
                <p><strong>Login:</strong> exemplo@login.com</p>
                <p>
                  <strong>Senha:</strong> 
                  <span className="password-value">
                    {visiblePassword === password.id ? 'senha123' : '••••••••'}
                  </span>
                  <button onClick={() => togglePasswordVisibility(password.id)}>
                    {visiblePassword === password.id ? 'Ocultar' : 'Mostrar'}
                  </button>
                </p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

// Componente de modal para adicionar nova senha
const AddPasswordModal: React.FC<{ onClose: () => void, onAdd: (password: Password) => void }> = ({ onClose, onAdd }) => {
  const [newPasswordName, setNewPasswordName] = useState('');
  const [newPasswordLogin, setNewPasswordLogin] = useState('');
  const [newPasswordValue, setNewPasswordValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPassword: Password = {
      id: Math.random(), // Gera um ID aleatório
      name: newPasswordName,
    };
    onAdd(newPassword);
    setNewPasswordName('');
    setNewPasswordLogin('');
    setNewPasswordValue('');
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Adicionar Nova Senha</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nome da Senha"
            value={newPasswordName}
            onChange={(e) => setNewPasswordName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Login"
            value={newPasswordLogin}
            onChange={(e) => setNewPasswordLogin(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={newPasswordValue}
            onChange={(e) => setNewPasswordValue(e.target.value)}
            required
          />
          <button type="submit">Adicionar Senha</button>
        </form>
      </div>
    </div>
  );
};

// Componente principal da página inicial
const HomePage: React.FC = () => {
  // Estado para armazenar a lista de senhas
  const [passwords, setPasswords] = useState<Password[]>([
    { id: 1, name: 'Senha do Email' },
    { id: 2, name: 'Senha do Banco' },
    { id: 3, name: 'Senha do GitHub' },
  ]);

  // Estado para armazenar o valor da pesquisa
  const [search, setSearch] = useState('');

  // Estado para controlar a visibilidade do modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtra as senhas com base no valor da pesquisa
  const filteredPasswords = passwords.filter(password =>
    password.name.toLowerCase().includes(search.toLowerCase())
  );

  // Função para adicionar uma nova senha
  const addPassword = (newPassword: Password) => {
    setPasswords([...passwords, newPassword]);
  };

  return (
    <div className="home-page">
      <h1>Senhas Cadastradas</h1>
      <input
        type="text"
        className="search-bar"
        placeholder="Pesquisar..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <PasswordList passwords={filteredPasswords} />
      <button className="add-password-button" onClick={() => setIsModalOpen(true)}>
        Adicionar Nova Senha
      </button>
      {isModalOpen && <AddPasswordModal onClose={() => setIsModalOpen(false)} onAdd={addPassword} />}
    </div>
  );
};

export default HomePage;

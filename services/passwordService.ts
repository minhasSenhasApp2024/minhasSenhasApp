import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '@/firebaseConfig'; // Importar o auth para obter o usuário atual
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { unparse } from 'papaparse';
import { encryptText, decryptText } from '@/utils/encryption';

interface Password {
  id: string;
  name: string;
  login: string;
  value: string;
  category: string;
}

const FIELD_MAPPING: { [key in keyof Password]: string } = {
  id: "ID",
  name: "Serviço/Aplicativo",
  login: "Usuário/E-mail",
  value: "Senha",
  category: "Categoria",
};

const DESIRED_FIELD_ORDER: string[] = [
  "ID",
  "Serviço/Aplicativo",
  "Usuário/E-mail",
  "Senha",
  "Categoria"
];

// Define o BOM para UTF-8
const BOM = '\uFEFF';

/**
 * Adiciona uma senha ao Firestore.
 * @param passwordData Dados da senha a serem adicionados.
 * @returns Booleano indicando sucesso ou falha.
 */
export async function addPasswordToFirestore(passwordData: { name: string; login: string; value: string; category: string }) {
  const user = auth.currentUser;
  if (user) {
      try {
          console.log("Iniciando adição de senha...");
          // Criptografa todos os campos
          const encryptedData = {
            name: await encryptText(passwordData.name),
            login: await encryptText(passwordData.login),
            value: await encryptText(passwordData.value),
            category: await encryptText(passwordData.category)
          };

          const docRef = await addDoc(collection(db, `users/${user.uid}/passwords`), encryptedData);
          console.log("Senha adicionada com ID: ", docRef.id);
          return true;
      } catch (e) {
          console.error("Erro ao adicionar senha: ", e);
          return false;
      }
  } else {
      console.error("Usuário não autenticado.");
      return false;
  }
}

/**
 * Busca todas as senhas do usuário atual do Firestore.
 * @returns Array de objetos Password descriptografados.
 */
export async function fetchUserPasswords(): Promise<Password[]> {
  const user = auth.currentUser;
  if (!user) {
      console.error("Usuário não autenticado.");
      return [];
  }

  try {
      console.log("Buscando senhas do usuário...");
      const passwordCollection = collection(db, `users/${user.uid}/passwords`);
      const passwordSnapshot = await getDocs(passwordCollection);
      const passwords: Password[] = [];

      for (const docSnap of passwordSnapshot.docs) {
          const data = docSnap.data();
          const decryptedPassword: Password = {
              id: docSnap.id,
              name: await decryptText(data.name),
              login: await decryptText(data.login),
              value: await decryptText(data.value),
              category: await decryptText(data.category)
          };
          passwords.push(decryptedPassword);
      }

      console.log("Senhas recuperadas com sucesso.");
      return passwords;
  } catch (error) {
      console.error("Erro ao buscar senhas:", error);
      return [];
  }
}

/**
 * Atualiza uma senha no Firestore.
 * @param passwordId ID da senha a ser atualizada.
 * @param updatedPassword Dados atualizados da senha.
 * @returns Booleano indicando sucesso ou falha.
 */
export async function updatePasswordInFirestore(passwordId: string, passwordData: { name: string; login: string; value: string; category: string }): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) {
      console.error("Usuário não autenticado.");
      return false;
  }

  try {
      console.log(`Iniciando atualização da senha com ID: ${passwordId}...`);
      // Criptografa todos os campos
      const encryptedData = {
          name: await encryptText(passwordData.name),
          login: await encryptText(passwordData.login),
          value: await encryptText(passwordData.value),
          category: await encryptText(passwordData.category)
      };

      const passwordDocRef = doc(db, `users/${user.uid}/passwords`, passwordId);
      await updateDoc(passwordDocRef, encryptedData);
      console.log("Senha atualizada com sucesso.");
      return true;
  } catch (error) {
      console.error("Erro ao atualizar senha:", error);
      return false;
  }
}

/**
 * Deleta uma senha do Firestore.
 * @param passwordId ID da senha a ser deletada.
 * @returns Booleano indicando sucesso ou falha.
 */
export async function deletePasswordFromFirestore(passwordId: string): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) {
      console.error("Usuário não autenticado.");
      return false;
  }

  try {
      console.log(`Iniciando deleção da senha com ID: ${passwordId}...`);
      const passwordDocRef = doc(db, `users/${user.uid}/passwords`, passwordId);
      await deleteDoc(passwordDocRef);
      console.log("Senha deletada com sucesso.");
      return true;
  } catch (error) {
      console.error("Erro ao deletar senha:", error);
      return false;
  }
}

/**
 * Exporta as senhas do usuário para um arquivo CSV ou JSON.
 * @param format Formato de exportação ('json' ou 'csv').
 */
export async function exportPasswords(format: 'json' | 'csv' = 'json'): Promise<void> {
  try {
    const passwords = await fetchUserPasswords();

    // Mapeia os campos para os nomes desejados
    const mappedPasswords = passwords.map(password => {
      const mapped: { [key: string]: any } = {};

      DESIRED_FIELD_ORDER.forEach(field => {
        // Obtém a chave original a partir do mapeamento
        const originalKey = Object.keys(FIELD_MAPPING).find(key => FIELD_MAPPING[key as keyof Password] === field);
        if (originalKey) {
          mapped[field] = (password as any)[originalKey];
        }
      });

      return mapped;
    });

    let fileUri: string;
    let fileName: string;
    let fileContent: string;

    if (format === 'csv') {
      const csv = unparse(mappedPasswords, { header: true, columns: DESIRED_FIELD_ORDER });
      fileName = 'minhas_senhas.csv';
      fileUri = FileSystem.documentDirectory + fileName;
      fileContent = BOM + csv; // Adiciona o BOM
      await FileSystem.writeAsStringAsync(fileUri, fileContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    } else {
      // Formato JSON
      const json = JSON.stringify(mappedPasswords, null, 2);
      fileName = 'minhas_senhas.json';
      fileUri = FileSystem.documentDirectory + fileName;
      fileContent = BOM + json; // Adiciona o BOM
      await FileSystem.writeAsStringAsync(fileUri, fileContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    }

    if (await Sharing.isAvailableAsync()) { 
      await Sharing.shareAsync(fileUri, {
        mimeType: format === 'csv' ? 'text/csv' : 'application/json',
        dialogTitle: 'Exportar Senhas',
        UTI: format === 'csv' ? 'public.comma-separated-values-text' : 'public.json',
      });
    } else {
      alert('Compartilhamento não está disponível nesta plataforma.');
    }
  } catch (error) {
    console.error('Erro ao exportar senhas:', error);
    throw error;
  }
}
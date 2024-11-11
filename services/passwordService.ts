import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '@/firebaseConfig'; // Importar o auth para obter o usuário atual
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { unparse } from 'papaparse';

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

export async function addPasswordToFirestore(passwordData: { name: string; login: string; value: string; category: string }) {
  const user = auth.currentUser;
  if (user) {
    try {
      const docRef = await addDoc(collection(db, `users/${user.uid}/passwords`), passwordData);
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

export async function fetchUserPasswords(): Promise<Password[]> {
  const user = auth.currentUser;
  if (user) {
    try {
      const passwordsCollection = collection(db, `users/${user.uid}/passwords`);
      const querySnapshot = await getDocs(passwordsCollection);
      const passwords = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Password, 'id'>)
      }));
      return passwords as Password[];
    } catch (e) {
      console.error("Erro ao buscar senhas: ", e);
      return [];
    }
  } else {
    console.error("Usuário não autenticado.");
    return [];
  }
}

export async function updatePasswordInFirestore(passwordId: string, updatedPassword: Omit<Password, 'id'>): Promise<boolean> {
  const user = auth.currentUser;
  if (user) {
    try {
      const passwordRef = doc(db, `users/${user.uid}/passwords`, passwordId);
      await updateDoc(passwordRef, updatedPassword);
      console.log("Password updated successfully - PASSWORDSERVICE");
      return true;
    } catch (e) {
      console.error("Error updating password: ", e);
      return false;
    }
  } else {
    console.error("User not authenticated.");
    return false;
  }
}

export async function deletePasswordFromFirestore(passwordId: string): Promise<boolean> {
  const user = auth.currentUser;
  if (user) {
    try {
      const passwordRef = doc(db, `users/${user.uid}/passwords`, passwordId);
      await deleteDoc(passwordRef);
      console.log(`Password with ID ${passwordId} deleted successfully.`);
      return true;
    } catch (e) {
      console.error(`Error deleting password with ID ${passwordId}: `, e);
      return false;
    }
  } else {
    console.error("User not authenticated.");
    return false;
  }
}

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

    if (format === 'csv') {
      const csv = unparse(mappedPasswords, { header: true, columns: DESIRED_FIELD_ORDER });
      fileName = 'minhas_senhas.csv';
      fileUri = FileSystem.documentDirectory + fileName;
      await FileSystem.writeAsStringAsync(fileUri, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    } else {
      // Formato JSON
      const json = JSON.stringify(mappedPasswords, null, 2);
      fileName = 'minhas_senhas.json';
      fileUri = FileSystem.documentDirectory + fileName;
      await FileSystem.writeAsStringAsync(fileUri, json, {
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
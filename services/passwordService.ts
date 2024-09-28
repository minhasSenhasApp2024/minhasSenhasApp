import { collection, addDoc, getDocs } from 'firebase/firestore';
import { auth, db } from '@/firebaseConfig'; // Importar o auth para obter o usuário atual
import CryptoJS from 'crypto-js';
import { deriveKey } from '@/utils/cryptoUtils';

interface Password {
  id: string;
  name: string;
  login: string;
  value: string;
  category: string;
}

export async function addPasswordToFirestore(passwordData: { name: string; login: string; value: string; category: string }, masterPassword: string) {
  const user = auth.currentUser;
  if (user) {
    try {
      const isValid = await verifyMasterPassword(masterPassword);
      if (!isValid) {
        throw new Error("Senha mestra incorreta");
      }
      // Obter o salt armazenado
      const encryptionSnapshot = await getDocs(collection(db, `users/${user.uid}/encryption`));
      const encryptionData = encryptionSnapshot.docs[0].data();
      const salt = encryptionData.salt;

      // Derivar a chave de criptografia
      const encryptionKey = deriveKey(masterPassword, salt);

      // Criptografar o valor da senha
      const encryptedValue = CryptoJS.AES.encrypt(passwordData.value, encryptionKey).toString();

      const encryptedPasswordData = {
        name: CryptoJS.AES.encrypt(passwordData.name, encryptionKey).toString(),
        login: CryptoJS.AES.encrypt(passwordData.login, encryptionKey).toString(),
        value: encryptedValue,
        category: CryptoJS.AES.encrypt(passwordData.category, encryptionKey).toString(),
      };

      const docRef = await addDoc(collection(db, `users/${user.uid}/passwords`), encryptedPasswordData);
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

export async function fetchUserPasswords(masterPassword: string): Promise<Password[]> {
  const user = auth.currentUser;
  if (user) {
    try {
      console.log("Fetching passwords for user:", user.uid);
      const isValid = await verifyMasterPassword(masterPassword);
      if (!isValid) {
        console.error("Invalid master password");
        throw new Error("Senha mestra incorreta");
      }

      // Obter o salt armazenado
      const encryptionSnapshot = await getDocs(collection(db, `users/${user.uid}/encryption`));
      const encryptionData = encryptionSnapshot.docs[0].data();
      const salt = encryptionData.salt;

      // Derivar a chave de criptografia
      const encryptionKey = deriveKey(masterPassword, salt);

      const passwordsCollection = collection(db, `users/${user.uid}/passwords`);
      const querySnapshot = await getDocs(passwordsCollection);
      const passwords = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const decryptedName = CryptoJS.AES.decrypt(data.name, encryptionKey).toString(CryptoJS.enc.Utf8);
        const decryptedLogin = CryptoJS.AES.decrypt(data.login, encryptionKey).toString(CryptoJS.enc.Utf8);
        const decryptedValue = CryptoJS.AES.decrypt(data.value, encryptionKey).toString(CryptoJS.enc.Utf8);
        const decryptedCategory = CryptoJS.AES.decrypt(data.category, encryptionKey).toString(CryptoJS.enc.Utf8);

        return {
          id: doc.id,
          name: decryptedName,
          login: decryptedLogin,
          value: decryptedValue,
          category: decryptedCategory,
        } as Password;
      });
      return passwords;
    } catch (e) {
      console.error("Erro ao buscar senhas: ", e);
      throw e;
    }
  } else {
    console.error("Usuário não autenticado.");
    return [];
  }
}
  
export async function verifyMasterPassword(masterPassword: string): Promise<boolean> {
  const user = auth.currentUser;
  if (user) {
      try {
          const encryptionSnapshot = await getDocs(collection(db, `users/${user.uid}/encryption`));
          const encryptionData = encryptionSnapshot.docs[0].data();
          const salt = encryptionData.salt;
          const storedHash = encryptionData.masterPasswordHash;

          const derivedKey = deriveKey(masterPassword, salt);
          return derivedKey === storedHash;
      } catch (e) {
          console.error("Erro ao verificar senha mestra: ", e);
          return false;
      }
  }
  return false;
}

export async function setMasterPassword(masterPassword: string): Promise<boolean> {
  const user = auth.currentUser;
  if (user) {
      try {
          const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
          const derivedKey = deriveKey(masterPassword, salt);

          await addDoc(collection(db, `users/${user.uid}/encryption`), {
              salt,
              masterPasswordHash: derivedKey
          });
          return true;
      } catch (e) {
          console.error("Erro ao definir senha mestra: ", e);
          return false;
      }
  }
  return false;
}



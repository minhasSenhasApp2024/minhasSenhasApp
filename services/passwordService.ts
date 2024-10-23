import { collection, addDoc, getDocs, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/firebaseConfig'; // Importar o auth para obter o usuário atual

interface Password {
  id: string;
  name: string;
  login: string;
  value: string;
  category: string;
}

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
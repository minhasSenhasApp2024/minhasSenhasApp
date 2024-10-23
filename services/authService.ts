import {createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut} from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { saveSecureData, getSecureData, deleteSecureData } from '@/services/secureStorageService';


/**
 * Registra um novo usuário.
 * @param email E-mail do usuário.
 * @param password Senha do usuário.
 * @param setIsLoggedIn Função para atualizar o estado de login.
 * @param setUserEmail Função para atualizar o e-mail do usuário.
 * @param setAwaitingUser Função para atualizar o estado de aguardando usuário.
 * @returns O usuário registrado.
 */
export async function register(
    email: string, 
    password: string, 
    setIsLoggedIn: (value: boolean) => void, 
    setUserEmail: (email: string | null) => void, 
    setAwaitingUser: (value: boolean) => void
) {
    try {
        // Remove dados armazenados anteriormente, se existirem
        await deleteSecureData('userEmail');
        await deleteSecureData('userPassword');
        await deleteSecureData('biometricEnabled');

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("Registro bem-sucedido!\nUID do usuário:", user.uid);
        console.log("E-mail do usuário:", user.email);
        await logout(setIsLoggedIn, setUserEmail, setAwaitingUser); // Log out immediately after registration
        return user;
    } catch (error) {
        console.error("Erro ao registrar usuário:", error);
        throw error;
    }
}

export async function login(
    email: string, 
    password: string, 
    setIsLoggedIn: (value: boolean) => void, 
    setUserEmail: (email: string | null) => void) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        setIsLoggedIn(true);
        setUserEmail(user.email);
        await saveSecureData('userEmail', user.email || '');
        await saveSecureData('userPassword', password);
        await saveSecureData('biometricEnabled', 'true');
        console.log("Login bem-sucedido!\nUID do usuário:", user.uid);
        console.log("E-mail do usuário:", user.email);
        return user;
    } catch (error) {
        console.error("Erro ao fazer login:", error);
        throw error;
    }
}

export async function logout(
    setIsLoggedIn: (value: boolean) => void, 
    setUserEmail: (email: string | null) => void, 
    setAwaitingUser: (value: boolean) => void) {
    try {
        await signOut(auth);
        setIsLoggedIn(false);
        setUserEmail(null);
        setAwaitingUser(true);
        console.log("Logout bem-sucedido!");
    } catch (error) {
        console.error("Erro ao fazer logout:", error);
        throw error;
    }
}

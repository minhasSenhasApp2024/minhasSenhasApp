import {createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut} from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { saveSecureData, getSecureData, deleteSecureData } from '@/services/secureStorageService';
import CryptoJS from 'crypto-js';
import * as Crypto from 'expo-crypto';

/**
 * Gera uma chave secreta aleatória de 256 bits utilizando expo-crypto.
 * @returns A chave secreta como string hexadecimal.
 */
async function generateSecretKey(): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(32); // 256 bits = 32 bytes
    return CryptoJS.enc.Hex.stringify(CryptoJS.lib.WordArray.create(randomBytes)); // Convertendo para string hexadecimal
}

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

        // Gera e armazena a chave secreta com base no UID do usuário
        const secretKey = await generateSecretKey();
        const secretKeyStorageKey = `secretKey_${user.uid}`;
        console.log("Chave secreta gerada:", secretKeyStorageKey, secretKey);
        await saveSecureData(secretKeyStorageKey, secretKey);

        await logout(setIsLoggedIn, setUserEmail, setAwaitingUser); // Log out imediatamente após registro
        return { user, secretKey };
    } catch (error) {
        console.error("Erro ao registrar usuário:", error);
        throw error;
    }
}

/**
 * Faz login do usuário.
 * @param email E-mail do usuário.
 * @param password Senha do usuário.
 * @param setIsLoggedIn Função para atualizar o estado de login.
 * @param setUserEmail Função para atualizar o e-mail do usuário.
 * @returns O usuário autenticado.
 */
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

        // Recupera a chave secreta do usuário
        const secretKeyStorageKey = `secretKey_${user.uid}`;
        const secretKey = await getSecureData(secretKeyStorageKey);
        if (!secretKey) {
            console.warn('Chave secreta não encontrada para o usuário.');
            // Opcional: pode gerar uma nova chave ou forçar a regeneração
        }

        return user;
    } catch (error) {
        console.error("Erro ao fazer login:", error);
        throw error;
    }
}

/**
 * Faz logout do usuário.
 * @param setIsLoggedIn Função para atualizar o estado de login.
 * @param setUserEmail Função para atualizar o e-mail do usuário.
 * @param setAwaitingUser Função para atualizar o estado de aguardando usuário.
 */
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
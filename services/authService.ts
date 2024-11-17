import {createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut} from 'firebase/auth';
import { auth, db } from '@/firebaseConfig';
import { saveSecureData, getSecureData, deleteSecureData } from '@/services/secureStorageService';
import CryptoJS from 'crypto-js';
import * as Crypto from 'expo-crypto';
import { encryptText, validateUserSecretKey } from '@/utils/encryption';
import { Alert } from 'react-native';
import { doc, setDoc } from 'firebase/firestore';

/**
 * Gera uma chave secreta aleatória de 256 bits utilizando expo-crypto.
 * @returns A chave secreta como string hexadecimal.
 */
async function generateSecretKey(): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(32); // 256 bits = 32 bytes
    return CryptoJS.enc.Hex.stringify(CryptoJS.lib.WordArray.create(randomBytes)); // Convertendo para string hexadecimal
}

/**
 * Gera e armazena a chave secreta do usuário durante o cadastro.
 * @param userId ID único do usuário.
 * @returns A chave secreta gerada.
 */
async function generateAndStoreSecretKey(userId: string): Promise<string> {
    // Gera uma chave secreta aleatória
    const secretKey = await generateSecretKey();

    // Criptografa o dado de verificação
    const verificationData = "verificação";
    const encryptedVerification = await encryptText(verificationData, secretKey);

    // Armazena a chave secreta no SecureStore
    await saveSecureData(`secretKey_${userId}`, secretKey);

    // Armazena o dado de verificação no Firestore
    const verificationDocRef = doc(db, `users/${userId}/metadata`, 'verification');
    await setDoc(verificationDocRef, { encryptedVerification });

    return secretKey;
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
        const secretKey = await generateAndStoreSecretKey(user.uid);
        console.log("Chave secreta gerada:", secretKey);

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
    setUserEmail: (email: string | null) => void,
    setAwaitingUser: (value: boolean) => void,
    requestSecretKey: () => Promise<string | null>,
    // userId: string // Adicione o ID do usuário como parâmetro
) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Recupera a chave secreta do usuário
        const secretKeyStorageKey = `secretKey_${user.uid}`;
        let secretKey = await getSecureData(secretKeyStorageKey);
        
        if (!secretKey) {
            console.log('Solicitando chave secreta ao usuário...');
            secretKey = await requestSecretKey();
            
            if (!secretKey) {
                console.log('Usuário cancelou a inserção da chave secreta');
                await logout(setIsLoggedIn, setUserEmail, setAwaitingUser);
                throw new Error('É necessário fornecer a chave secreta para acessar a conta.');
            }

            const isValid = await validateUserSecretKey(secretKey, user.uid);
            if (!isValid) {
                console.log('Chave secreta inválida fornecida');
                await logout(setIsLoggedIn, setUserEmail, setAwaitingUser);
                throw new Error('A chave secreta fornecida é inválida.');
            }

            await saveSecureData(secretKeyStorageKey, secretKey);
            console.log('Chave secreta validada e armazenada com sucesso');
        }

        // Se chegou aqui, a chave é válida (seja existente ou recém-validada)
        setIsLoggedIn(true);
        setUserEmail(user.email);
        await saveSecureData('userEmail', user.email || '');
        await saveSecureData('userPassword', password);
        await saveSecureData('biometricEnabled', 'true');
        
        return user;
    } catch (error: any) {
        console.error("Erro no processo de login:", error);
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
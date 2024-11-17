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
    try {
        const randomBytes = await Crypto.getRandomBytesAsync(32); // 256 bits = 32 bytes
        return CryptoJS.enc.Hex.stringify(CryptoJS.lib.WordArray.create(randomBytes)); // Convertendo para string hexadecimal
    } catch (error) {
        console.error("Erro ao gerar a chave secreta:", error);
        throw new Error("Não foi possível gerar a chave secreta. Por favor, tente novamente.");
    }
}

/**
 * Gera e armazena a chave secreta do usuário durante o cadastro.
 * @param userId ID único do usuário.
 * @returns A chave secreta gerada.
 */
async function generateAndStoreSecretKey(userId: string): Promise<string> {
    // Passo 1: Geração da Chave Secreta
    let secretKey: string;
    try {
        secretKey = await generateSecretKey();
        console.log("Chave secreta gerada com sucesso:", secretKey);
    } catch (error) {
        console.error("Falha na geração da chave secreta:", error);
        throw error; // Propaga o erro para que possa ser tratado na camada superior
    }

    // Passo 2: Criptografia do Dado de Verificação
    const verificationData = "verificação";
    let encryptedVerification: string;
    try {
        encryptedVerification = await encryptText(verificationData, secretKey);
        console.log("Dado de verificação criptografado com sucesso.");
    } catch (error) {
        console.error("Falha na criptografia do dado de verificação:", error);
        throw new Error("Não foi possível criptografar o dado de verificação. Por favor, tente novamente.");
    }

    // Passo 3: Armazenamento do Dado de Verificação no Firestore
    try {
        const verificationDocRef = doc(db, `users/${userId}/metadata`, 'verification');
        await setDoc(verificationDocRef, { encryptedVerification });
        console.log("Dado de verificação armazenado no Firestore com sucesso.");
    } catch (error) {
        console.error("Falha ao armazenar o dado de verificação no Firestore:", error);
        throw new Error("Não foi possível armazenar o dado de verificação. Por favor, tente novamente.");
    }

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
    // Passo 1: Limpeza de Dados Anteriores
    try {
        // Remove dados armazenados anteriormente, se existirem
        await deleteSecureData('userEmail');
        await deleteSecureData('userPassword');
        await deleteSecureData('biometricEnabled');

    // Passo 2: Criação do Usuário no Firebase Auth
    let user;
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        user = userCredential.user;
        console.log("Registro bem-sucedido!\nUID do usuário:", user.uid);
        console.log("E-mail do usuário:", user.email);
    } catch (error: any) {
        console.error("Erro ao criar o usuário no Firebase Auth:", error);
        // Personalize a mensagem de erro de acordo com o tipo de falha
        let errorMessage = "Erro ao registrar usuário. Por favor, tente novamente.";
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = "Esse e-mail já está em uso.";
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = "E-mail inválido.";
        } else if (error.code === 'auth/weak-password') {
            errorMessage = "A senha é muito fraca.";
        }
        throw new Error(errorMessage);
    }

    // Passo 3: Geração e Armazenamento da Chave Secreta
    let secretKey: string;
    try {
        secretKey = await generateAndStoreSecretKey(user.uid);
        console.log("Chave secreta gerada:", secretKey);
    } catch (error: any) {
        console.error("Erro ao gerar e armazenar a chave secreta:", error);
        // Opcional: Excluir o usuário recém-criado para evitar inconsistências
        try {
            await user.delete();
            console.log("Usuário excluído devido a falha na geração da chave secreta.");
        } catch (deleteError) {
            console.error("Erro ao excluir o usuário após falha na chave secreta:", deleteError);
        }
        throw new Error("Falha ao configurar segurança do usuário. Por favor, tente novamente.");
    }
    // Passo 4: Logout após Registro para garantir que o usuário faça o login novamente com a nova chave secreta
    try {
        await logout(setIsLoggedIn, setUserEmail, setAwaitingUser);
        console.log("Logout realizado com sucesso após registro.");
    } catch (error: any) {
        console.error("Erro ao realizar logout após registro:", error);
    }
        return { user, secretKey };
    } catch (error: any) {
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
        
        // Passo 1: Recuperação da Chave Secreta
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
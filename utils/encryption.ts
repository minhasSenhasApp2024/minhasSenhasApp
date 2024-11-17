import CryptoJS from 'crypto-js';
import { getSecureData, saveSecureData } from '@/services/secureStorageService';
import { auth, db } from '@/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

async function getUserSecretKey(userId: string): Promise<string | null> {
    const secretKeyStorageKey = `secretKey_${userId}`;
    try {
        const secretKey = await getSecureData(secretKeyStorageKey);
        if (!secretKey) {
            console.error('Chave secreta não encontrada para o usuário.');
        } else {
            console.log('Chave secreta recuperada com sucesso:', secretKey);
        }
        return secretKey;
    } catch (error) {
        console.error('Erro ao recuperar a chave secreta:', error);
        return null;
    }
}

// Função para gerar IV sem depender do módulo nativo de criptografia
function generateIV(): CryptoJS.lib.WordArray {
    const timestamp = Date.now().toString();
    const randomStr = Math.random().toString(36).substring(2);
    const combined = timestamp + randomStr;
    
    // Usa o hash SHA-256 para gerar 16 bytes consistentes
    const hash = CryptoJS.SHA256(combined);
    return CryptoJS.lib.WordArray.create(hash.words.slice(0, 4)); // Pegamos apenas os primeiros 16 bytes
}

/**
 * Criptografa um texto usando a chave secreta fornecida.
 * @param text Texto a ser criptografado.
 * @param secretKey Chave secreta para criptografia.
 * @returns Texto criptografado combinado com o IV.
 */
export async function encryptText(text: string, secretKey: string): Promise<string> {
    try {
        const textWordArray = CryptoJS.enc.Utf8.parse(text);
        const keyWordArray = CryptoJS.enc.Hex.parse(secretKey);
        const iv = generateIV();
        
        const encrypted = CryptoJS.AES.encrypt(textWordArray, keyWordArray, {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
            iv: iv
        });
        
        // Combina o IV com o texto cifrado para poder descriptografar depois
        const ivHex = CryptoJS.enc.Hex.stringify(iv);
        const combined = ivHex + encrypted.toString();
        
        console.log("Texto criptografado com sucesso.");
        return combined;
    } catch (error) {
        console.error("Erro ao criptografar o texto:", error);
        throw error;
    }
}

/**
 * Descriptografa um texto usando a chave secreta fornecida.
 * @param combined Texto combinado com IV.
 * @param secretKey Chave secreta para descriptografia.
 * @returns Texto descriptografado.
 */
export async function decryptText(combined: string, secretKey: string): Promise<string> {
    try {
        // Extrai o IV e o texto cifrado
        const ivHex = combined.slice(0, 32); // 16 bytes = 32 caracteres hex
        const ciphertext = combined.slice(32);
        
        const keyWordArray = CryptoJS.enc.Hex.parse(secretKey);
        const iv = CryptoJS.enc.Hex.parse(ivHex);
        
        const decrypted = CryptoJS.AES.decrypt(ciphertext, keyWordArray, {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
            iv: iv
        });
        
        const originalText = decrypted.toString(CryptoJS.enc.Utf8);
        console.log("Texto descriptografado com sucesso.");
        return originalText;
    } catch (error) {
        console.error("Erro ao descriptografar o texto:", error);
        throw error;
    }
}


/**
 * Valida a chave secreta fornecida pelo usuário verificando contra o dado de verificação armazenado no Firestore.
 * @param secretKey Chave secreta inserida pelo usuário.
 * @param userId ID único do usuário.
 * @returns Booleano indicando se a chave é válida.
 */
export async function validateUserSecretKey(secretKey: string, userId: string): Promise<boolean> {
    if (!secretKey || secretKey.length !== 64) { // Chave deve ter 64 caracteres (32 bytes em hex)
        console.log('Chave secreta com formato inválido');
        return false;
    }

    try {
        // Recupera o dado de verificação diretamente do Firestore
        const verificationDocRef = doc(db, `users/${userId}/metadata`, 'verification');
        const verificationDoc = await getDoc(verificationDocRef);

        if (!verificationDoc.exists()) {
            throw new Error("Documento de verificação não encontrado no Firestore.");
        }

        const data = verificationDoc.data();
        const verificationEncrypted = data.encryptedVerification;

        if (!verificationEncrypted) {
            throw new Error("Dado de verificação não encontrado no Firestore.");
        }
        
        // Descriptografa o dado de verificação usando a chave fornecida
        const decryptedVerification = await decryptText(verificationEncrypted, secretKey);
        const isValid = decryptedVerification === "verificação";
        
        console.log('Resultado da validação da chave:', isValid);
        return isValid;
    } catch (error) {
        console.error('Erro ao validar chave secreta:', error);
        return false;
    }
}
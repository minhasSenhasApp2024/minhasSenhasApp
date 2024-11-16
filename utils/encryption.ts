import CryptoJS from 'crypto-js';
import { getSecureData } from '@/services/secureStorageService';
import { auth } from '@/firebaseConfig';

async function getUserSecretKey(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) {
        console.error('Nenhum usuário autenticado.');
        return null;
    }
    const secretKeyStorageKey = `secretKey_${user.uid}`;
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

export async function encryptText(text: string): Promise<string> {
    try {
        const secretKey = await getUserSecretKey();
        if (!secretKey) {
            throw new Error("Chave secreta não encontrada.");
        }
        
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

export async function decryptText(combined: string): Promise<string> {
    try {
        const secretKey = await getUserSecretKey();
        if (!secretKey) {
            throw new Error("Chave secreta não encontrada.");
        }
        
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
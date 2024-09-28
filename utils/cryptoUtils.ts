import CryptoJS from 'crypto-js';

export const deriveKey = (masterPassword: string, salt: string): string => {
    const key = CryptoJS.PBKDF2(masterPassword, CryptoJS.enc.Hex.parse(salt), {
        keySize: 256 / 32,
        iterations: 100000,
    });
    return key.toString();
};

export const encrypt = (data: string, key: string): string => {
    return CryptoJS.AES.encrypt(data, key).toString();
};

export const decrypt = (ciphertext: string, key: string): string => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    return bytes.toString(CryptoJS.enc.Utf8);
};
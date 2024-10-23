import * as SecureStore from 'expo-secure-store';

/**
 * Salva dados de forma segura, exigindo autenticação biométrica para acesso.
 * @param key A chave para armazenar o dado.
 * @param value O valor a ser armazenado.
 */
export async function saveSecureData(key: string, value: string): Promise<void> {
    try {
        await SecureStore.setItemAsync(key, value, {
            keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
            // Exige autenticação biométrica ao acessar o dado
            keychainService: undefined,
            // androidBiometricPromptTitle: 'Autenticação Biométrica',
            // androidBiometricPromptSubtitle: 'Confirmar para acessar as credenciais',
        });
        console.log(`Dados salvos com SecureStore: ${key}`);
    } catch (error) {
        console.error("Erro ao salvar dados seguros:", error);
        throw error;
    }
}

/**
 * Obtém dados de forma segura, exigindo autenticação biométrica.
 * @param key A chave do dado a ser recuperado.
 * @returns O valor armazenado ou null se não existir.
 */
export async function getSecureData(key: string): Promise<string | null> {
    try {
        const result = await SecureStore.getItemAsync(key, {
            keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
            // androidBiometricPromptTitle: 'Autenticação Biométrica',
            // androidBiometricPromptSubtitle: 'Confirmar para acessar as credenciais',
        });
        return result;
    } catch (error) {
        console.error("Erro ao obter dados seguros:", error);
        throw error;
    }
}

/**
 * Deleta dados de forma segura.
 * @param key A chave do dado a ser deletado.
 */
export async function deleteSecureData(key: string): Promise<void> {
    try {
        await SecureStore.deleteItemAsync(key);
    } catch (error) {
        console.error("Erro ao deletar dados seguros:", error);
        throw error;
    }
}
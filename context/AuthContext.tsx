import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { auth } from '@/firebaseConfig';
import * as LocalAuthentication from 'expo-local-authentication';
import { login, logout, register } from '@/services/authService';
import { saveSecureData, getSecureData, deleteSecureData } from '@/services/secureStorageService';


interface AuthContextProps {
    isLoggedIn: boolean;
    setIsLoggedIn: (value: boolean) => void;
    userEmail: string | null;
    setUserEmail: (email: string | null) => void;
    isBiometricSupported: boolean;
    isBiometricEnrolled: boolean;
    checkBiometricSupport: () => Promise<void>;
    authenticate: () => Promise<LocalAuthentication.LocalAuthenticationResult>;
    setBiometricEnabled: (enabled: boolean) => Promise<void>;
    isBiometricEnabled: () => Promise<boolean>;
    biometricLogin: (force?: boolean) => Promise<boolean>;
    awaitingUser: boolean;
    setAwaitingUser: (value: boolean) => void;

}

const AuthContext = createContext<AuthContextProps>({
    isLoggedIn: false,
    setIsLoggedIn: () => {},
    userEmail: null,
    setUserEmail: () => {},
    isBiometricSupported: false,
    isBiometricEnrolled: false,
    checkBiometricSupport: async () => {},
    authenticate: async () => ({ success: false, error: 'Authentication failed' }),
    setBiometricEnabled: async () => {},
    isBiometricEnabled: async () => false,
    biometricLogin: async (_force?: boolean) => false,
    awaitingUser: false,
    setAwaitingUser: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [isBiometricSupported, setIsBiometricSupported] = useState(false);
    const [isBiometricEnrolled, setIsBiometricEnrolled] = useState(false);
    const [awaitingUser, setAwaitingUser] = useState(false);

    const checkBiometricSupport = async () => {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        setIsBiometricSupported(compatible);

        if (compatible) {
            const enrolled = await LocalAuthentication.isEnrolledAsync();
            setIsBiometricEnrolled(enrolled);
        } else {
            setIsBiometricEnrolled(false);
        }
    };

    const authenticate = async () => {
        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Autenticação Biométrica',
            fallbackLabel: 'Use o Código',
        });
        return result;
    };

    const setBiometricEnabled = async (enabled: boolean) => {
      if (enabled && userEmail) {
          // Salva as credenciais no SecureStore
          await saveSecureData('biometricEnabled', 'true');
      } else if (!enabled) {
          // Remove as credenciais do SecureStore
          await deleteSecureData('userEmail');
          await deleteSecureData('userPassword');
          await deleteSecureData('biometricEnabled');
      }
  };

  const isBiometricEnabled = async () => {
    const enabled = await getSecureData('biometricEnabled');
    return enabled === 'true';
};

    const biometricLogin = useCallback(async (force: boolean = false): Promise<boolean> => {
      const biometricEnabled = await isBiometricEnabled();
      if (biometricEnabled && (!awaitingUser || force)) {
          const result = await authenticate();
          if (result.success) {
              const storedEmail = await getSecureData('userEmail');
              const storedPassword = await getSecureData('userPassword');
              if (storedEmail && storedPassword) {
                  try {
                      await login(storedEmail, storedPassword, setIsLoggedIn, setUserEmail);
                      return true;
                  } catch (error) {
                      console.error("Falha ao autenticar com Firebase:", error);
                  }
              } else {
                  console.error("Nenhuma credencial armazenada encontrada para login biométrico");
              }
          } else {
              console.error("Falha na autenticação biométrica");
          }
      } else {
          console.error("Login biométrico não está habilitado ou aguardando o usuário");
      }
      return false;
  }, [authenticate, isBiometricEnabled, login, setIsLoggedIn, setUserEmail, awaitingUser]);

  useEffect(() => {
    checkBiometricSupport();
}, []);

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn,
                setIsLoggedIn,
                userEmail,
                setUserEmail,
                isBiometricSupported,
                isBiometricEnrolled,
                checkBiometricSupport,
                authenticate,
                setBiometricEnabled,
                isBiometricEnabled,
                biometricLogin,
                awaitingUser,
                setAwaitingUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);
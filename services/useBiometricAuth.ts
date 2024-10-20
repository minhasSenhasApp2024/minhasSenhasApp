// hooks/useBiometricAuth.ts
import * as LocalAuthentication from 'expo-local-authentication';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useBiometricAuth = () => {
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isBiometricEnrolled, setIsBiometricEnrolled] = useState(false);

  const checkBiometricSupport = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    setIsBiometricSupported(compatible);

    if (compatible) {
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricEnrolled(enrolled);
    }
  };

  const authenticate = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate',
      fallbackLabel: 'Use Passcode',
    });
    return result;
  };

  const setBiometricEnabled = async (enabled: boolean) => {
    await AsyncStorage.setItem('biometricEnabled', JSON.stringify(enabled));
  };

  const isBiometricEnabled = async () => {
    const enabled = await AsyncStorage.getItem('biometricEnabled');
    return enabled === 'true';
  };

  return {
    isBiometricSupported,
    isBiometricEnrolled,
    checkBiometricSupport,
    authenticate,
    setBiometricEnabled,
    isBiometricEnabled,
  };
};
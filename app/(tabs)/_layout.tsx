import { Tabs, Redirect } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import LoginPage from '../Login';
// import LoginScreen from '../Login';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function TabLayout() {
  const { isLoggedIn, biometricLogin, awaitingUser } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      if (!isLoggedIn && !awaitingUser) {
        const success = await biometricLogin();
        if (success) {
          console.log("Biometric login successful");
          setShowLogin(false);
        } else {
          console.log("Biometric login failed, showing login screen...");
          setShowLogin(true);
        }
      } else if (isLoggedIn) {
        setShowLogin(false);
      } else {
        setShowLogin(true);
      }
      setIsCheckingAuth(false);
    };
  
    if (isCheckingAuth) {
      checkAuthentication();
    }
  }, [isLoggedIn, biometricLogin, awaitingUser, isCheckingAuth]);

  if (isCheckingAuth) {
      return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
              <ActivityIndicator size="large" color="#003883" />
          </View>
      );
  }

  if (showLogin) {
      return <LoginPage />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#afd4ff',  // Muda a cor do ícone quando está ativo
        tabBarInactiveTintColor: '#afd4ff', // Muda a cor do ícone quando está inativo
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#003883', // Cor de fundo da tab bar
          borderTopLeftRadius: 15,    // Adiciona border radius no canto superior esquerdo
          borderTopRightRadius: 15,   // Adiciona border radius no canto superior direito
          borderTopWidth: 0,          // Remove a borda cinza do menu
          overflow: 'hidden',          // Garante que o border radius seja aplicado corretamente
          position: 'absolute',        // Mantém a tab bar no lugar
          bottom: 0,                   // Alinha a tab bar na parte inferior
          left: 0,
          right: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color="#afd4ff" size={22} /> 
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Meu perfil',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'person' : 'person-outline'} color="#afd4ff" size={22} /> 
          ),
        }}
      />
    </Tabs>
  );
}

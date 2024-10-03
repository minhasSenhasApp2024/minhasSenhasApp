import { Tabs, Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return (
      <Stack>
        <Stack.Screen name="Login" options={{ headerShown: false }} />
        <Stack.Screen name="Register" options={{ headerShown: false }} />
      </Stack>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#afd4ff',  // Muda a cor do ícone quando está ativo
        tabBarInactiveTintColor: '#afd4ff', // Muda a cor do ícone quando está inativo
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#004aad', // Cor de fundo da tab bar
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
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color="#afd4ff" size={22} /> // Cor dos ícones definida para vermelho
          ),
        }}
      />
      <Tabs.Screen
        name="Login"
        options={{
          title: 'Meu perfil',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'person' : 'person-outline'} color="#afd4ff" size={22}/> // Cor dos ícones definida para vermelho
          ),
        }}
      />
    </Tabs>
  );
}

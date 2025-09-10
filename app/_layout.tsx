import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { createContext, useState } from 'react';
import { Alert } from 'react-native';

interface User {
  id: string;
  name: string;
  description: string;
  profileImage: string;
}

interface AuthContextType {
  user: User | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);

  const login = () => {
    console.log('login');
    return fetch('/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'user0',
        password: '1235', // '234'
      }),
    })
      .then((res) => {
        console.log('res', res, res.status);
        if (res.status >= 400) {
          return Alert.alert('Error', 'Invalid credentials');
        }
        return res.json();
      })
      .then((data) => {
        console.log('data', data);
        return Promise.all([
          SecureStore.setItem('accessToken', data.accessToken),
          SecureStore.setItem('refreshToken', data.refreshToken),
          AsyncStorage.setItem('user', JSON.stringify(data.user)),
        ]).then(() => {
          setUser(data.user);
          router.push('/(tabs)');
        });
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const logout = async () => {
    setUser(null);
    await Promise.all([
      SecureStore.deleteItemAsync('accessToken'),
      SecureStore.deleteItemAsync('refreshToken'),
      AsyncStorage.removeItem('user'),
    ]);
  };

  return (
    <AuthContext value={{ user, login, logout }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </AuthContext>
  );
}

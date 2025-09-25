import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';
import Constants from 'expo-constants';
import { Stack, router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Alert, Animated, StyleSheet, View } from 'react-native';
import Toast, { BaseToast } from 'react-native-toast-message';

// Instruct SplashScreen not to hide yet, we want to do this manually
SplashScreen.preventAutoHideAsync().catch(() => {
  // reloading the app might trigger same race conditions, ignore them
});

export interface User {
  id: string;
  name: string;
  description: string;
  profileImageUrl: string;
  link?: string;
  showInstagramBadge?: boolean;
  isPrivate?: boolean;
  isVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  login?: () => Promise<any>;
  logout?: () => Promise<any>;
  updateUser?: (user: User) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
});

function AnimatedAppLoader({
  children,
  image,
}: {
  children: React.ReactNode;
  image: number;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isSplashReady, setSplashReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      await Asset.loadAsync(image); // Local image loading
      setSplashReady(true);
    }
    prepare();
  }, [image]);

  const login = () => {
    console.log('login');
    return fetch('/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'user0',
        password: '1234', // '1234'
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

        // 토큰이 유효한지 확인
        if (!data.accessToken || !data.refreshToken) {
          throw new Error('Invalid response: missing tokens');
        }

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

  const updateUser = (user: User | null) => {
    setUser(user);
    if (user) {
      AsyncStorage.setItem('user', JSON.stringify(user));
    } else {
      AsyncStorage.removeItem('user');
    }
  };

  const logout = async () => {
    setUser(null);
    await Promise.all([
      SecureStore.deleteItemAsync('accessToken'),
      SecureStore.deleteItemAsync('refreshToken'),
      AsyncStorage.removeItem('user'),
    ]);
  };

  useEffect(() => {
    AsyncStorage.getItem('user').then((user) => {
      setUser(user ? JSON.parse(user) : null);
    });
    // TODO: validating accessToken
  }, []);

  if (!isSplashReady) {
    return null;
  }

  return (
    <AuthContext value={{ user, login, logout, updateUser }}>
      <AnimatedSplashScreen image={image}>{children}</AnimatedSplashScreen>
    </AuthContext>
  );
}

function AnimatedSplashScreen({
  children,
  image,
}: {
  children: React.ReactNode;
  image: number;
}) {
  const [isAppReady, setIsAppReady] = useState(false);
  const [isSplashAnimationComplete, setAnimationComplete] = useState(false);
  const animation = useRef(new Animated.Value(1)).current;
  const { updateUser } = useContext(AuthContext);

  useEffect(() => {
    if (isAppReady) {
      Animated.timing(animation, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }).start(() => setAnimationComplete(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAppReady]);

  const onImageLoaded = async () => {
    try {
      // 데이터 준비
      await Promise.all([
        AsyncStorage.getItem('user').then((user) => {
          updateUser?.(user ? JSON.parse(user) : null);
        }),
        // TODO: validating accessToken
      ]);
      await SplashScreen.hideAsync(); // 수동으로 SplashScreen 숨기기
    } catch (error) {
      console.error(error);
    } finally {
      setIsAppReady(true);
    }
  };

  const rotateValue = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={{ flex: 1 }}>
      {isAppReady && children}
      {!isSplashAnimationComplete && (
        <Animated.View
          pointerEvents="none"
          style={{
            ...StyleSheet.absoluteFillObject,
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor:
              Constants.expoConfig?.splash?.backgroundColor || '#ffffff',
            opacity: animation,
          }}
        >
          <Animated.Image
            source={image}
            style={{
              resizeMode: Constants.expoConfig?.splash?.resizeMode || 'contain',
              width: Constants.expoConfig?.splash?.imageWidth || 200,
              transform: [{ scale: animation }, { rotate: rotateValue }],
            }}
            onLoadEnd={onImageLoaded}
            fadeDuration={0}
          />
        </Animated.View>
      )}
    </View>
  );
}

export default function RootLayout() {
  const toastConfig = {
    customToast: (props: any) => (
      <BaseToast
        style={{
          backgroundColor: 'white',
          borderRadius: 20,
          height: 40,
          borderLeftWidth: 0,
          shadowOpacity: 0,
          justifyContent: 'center',
        }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          alignItems: 'center',
          height: 40,
        }}
        text1Style={{
          color: 'black',
          fontSize: 14,
          fontWeight: '500',
        }}
        text1={props.text1}
        onPress={props.onPress}
      />
    ),
  };

  return (
    <AnimatedAppLoader image={require('../assets/images/react-logo.png')}>
      <StatusBar style="auto" animated />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      <Toast config={toastConfig} />
    </AnimatedAppLoader>
  );
}

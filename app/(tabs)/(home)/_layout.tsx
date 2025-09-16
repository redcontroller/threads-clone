import { AuthContext } from '@/app/_layout';
import SideMenu from '@/components/SideMenu';
import { Ionicons } from '@expo/vector-icons';
import {
  type MaterialTopTabNavigationEventMap,
  type MaterialTopTabNavigationOptions,
  createMaterialTopTabNavigator,
} from '@react-navigation/material-top-tabs';
import type {
  ParamListBase,
  TabNavigationState,
} from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { Slot, router, withLayoutContext } from 'expo-router';
import { useContext, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const { user } = useContext(AuthContext) || {};
  const isLoggedIn = !!user?.id;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top },
        colorScheme === 'dark' ? styles.containerDark : styles.containerLight,
      ]}
    >
      <BlurView
        style={[
          styles.header,
          colorScheme === 'dark' ? styles.headerDark : styles.headerLight,
        ]}
        intensity={colorScheme === 'dark' ? 5 : 70}
      >
        {isLoggedIn && (
          <Pressable
            style={styles.menuButton}
            onPress={() => {
              setIsSideMenuOpen(true);
            }}
          >
            <Ionicons
              name="menu"
              size={24}
              color={colorScheme === 'dark' ? 'gray' : 'black'}
            />
          </Pressable>
        )}
        <SideMenu
          isVisible={isSideMenuOpen}
          onClose={() => setIsSideMenuOpen(false)}
        />
        <Image
          source={require('../../../assets/images/react-logo.png')}
          style={[styles.headerLogo]}
        />
        {!isLoggedIn && (
          <TouchableOpacity
            style={[
              styles.loginButton,
              colorScheme === 'dark'
                ? styles.loginButtonDark
                : styles.loginButtonLight,
            ]}
            onPress={() => {
              console.log('loginButton onPress');
              router.replace('/login');
            }}
          >
            <Text
              style={
                colorScheme === 'dark'
                  ? styles.loginButtonTextDark
                  : styles.loginButtonTextLight
              }
            >
              로그인
            </Text>
          </TouchableOpacity>
        )}
      </BlurView>
      {isLoggedIn ? (
        <MaterialTopTabs
          screenOptions={{
            lazy: true,
            tabBarStyle: {
              backgroundColor: colorScheme === 'dark' ? '#101010' : 'white',
              shadowColor: 'transparent',
              position: 'relative',
            },
            tabBarPressColor: 'transparent',
            tabBarActiveTintColor: colorScheme === 'dark' ? 'white' : '#555',
            tabBarIndicatorStyle: {
              backgroundColor: colorScheme === 'dark' ? 'white' : 'black',
              height: 1.5,
            },
            tabBarIndicatorContainerStyle: {
              backgroundColor: colorScheme === 'dark' ? '#aaa' : '#555',
              position: 'absolute',
              top: 49,
              height: 1,
            },
          }}
        >
          <MaterialTopTabs.Screen name="index" options={{ title: 'For you' }} />
          <MaterialTopTabs.Screen
            name="following"
            options={{ title: 'Following' }}
          />
        </MaterialTopTabs>
      ) : (
        <Slot />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: 'white',
  },
  containerDark: {
    backgroundColor: '#101010',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 50,
  },
  headerLight: {
    backgroundColor: 'white',
  },
  headerDark: {
    backgroundColor: '#101010',
  },
  headerLogo: {
    width: 42, // DP, DIP
    height: 42,
  },
  headerLogoLight: {
    backgroundColor: '#fff',
  },
  headerLogoDark: {
    backgroundColor: '#101010',
  },
  menuButton: {
    position: 'absolute',
    left: 16,
  },
  loginButton: {
    padding: 8,
    borderRadius: 4,
    position: 'absolute',
    right: 16,
  },
  loginButtonDark: {
    backgroundColor: 'white',
  },
  loginButtonLight: {
    backgroundColor: 'black',
  },
  loginButtonTextLight: {
    color: 'white',
  },
  loginButtonTextDark: {
    color: 'black',
  },
});

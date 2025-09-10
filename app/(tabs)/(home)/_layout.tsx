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
import { router, Slot, withLayoutContext } from 'expo-router';
import { useContext, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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
  const insets = useSafeAreaInsets();
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const { user } = useContext(AuthContext) || {};
  const isLoggedIn = !!user?.id;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <BlurView style={styles.header} intensity={70}>
        {isLoggedIn && (
          <Pressable
            style={styles.menuButton}
            onPress={() => {
              setIsSideMenuOpen(true);
            }}
          >
            <Ionicons name="menu" size={24} color="black" />
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
            style={styles.loginButton}
            onPress={() => {
              console.log('loginButton onPress');
              router.replace('/login');
            }}
          >
            <Text style={styles.loginButtonText}>로그인</Text>
          </TouchableOpacity>
        )}
      </BlurView>
      {isLoggedIn ? (
        <MaterialTopTabs
          screenOptions={{
            lazy: true,
            tabBarStyle: {
              backgroundColor: 'white',
              shadowColor: 'transparent',
              position: 'relative',
            },
            tabBarPressColor: 'transparent',
            tabBarActiveTintColor: '#555',
            tabBarIndicatorStyle: {
              backgroundColor: 'black',
              height: 1,
            },
            tabBarIndicatorContainerStyle: {
              backgroundColor: '#aaa',
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
  tabContainer: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerLogo: {
    width: 42, // DP, DIP
    height: 42,
  },
  menuButton: {
    padding: 8,
    position: 'absolute',
    left: 16,
  },
  loginButton: {
    backgroundColor: 'black',
    padding: 8,
    borderRadius: 4,
    position: 'absolute',
    right: 16,
  },
  loginButtonText: {
    color: 'white',
  },
});

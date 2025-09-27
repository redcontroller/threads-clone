import { Ionicons } from '@expo/vector-icons';
import { type BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { useContext, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { AuthContext } from '../_layout';

const AnimatedTabBarButton = ({
  children,
  onPress,
  style,
  ...restProps
}: BottomTabBarButtonProps) => {
  // Extract ref from restProps to avoid type conflicts
  const { ref, ...pressableProps } = restProps;
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressOut = () => {
    Animated.sequence([
      Animated.spring(scaleValue, {
        toValue: 1.2,
        useNativeDriver: true,
        speed: 200,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        speed: 200,
      }),
    ]).start();
  };

  return (
    <Pressable
      {...pressableProps}
      onPress={onPress}
      onPressOut={handlePressOut}
      style={[
        { flex: 1, justifyContent: 'center', alignItems: 'center' },
        style,
      ]}
      // Disable Android ripple effect
      android_ripple={{ borderless: false, radius: 0 }}
    >
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default function TabLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const { user } = useContext(AuthContext) || {};
  const isLoggedIn = !!user?.id;
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const toLoginPage = () => {
    setIsLoginModalOpen(false);
    router.push('/login');
  };

  return (
    <>
      <Tabs
        backBehavior="history"
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colorScheme === 'dark' ? '#101010' : 'white',
            borderTopWidth: 0,
          },
          tabBarButton: (props) => <AnimatedTabBarButton {...props} />,
        }}
      >
        <Tabs.Screen
          name="(home)"
          options={{
            tabBarLabel: () => null,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name="home"
                size={24}
                color={
                  focused
                    ? colorScheme === 'dark'
                      ? 'white'
                      : 'black'
                    : 'gray'
                }
              />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            tabBarLabel: () => null,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name="search"
                size={24}
                color={
                  focused
                    ? colorScheme === 'dark'
                      ? 'white'
                      : 'black'
                    : 'gray'
                }
              />
            ),
          }}
        />
        <Tabs.Screen
          name="add"
          listeners={{
            tabPress: (e) => {
              console.log('tabPress');
              e.preventDefault();
              if (isLoggedIn) {
                router.navigate('/modal');
              } else {
                openLoginModal();
              }
            },
          }}
          options={{
            tabBarLabel: () => null,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name="add"
                size={24}
                color={
                  focused
                    ? colorScheme === 'dark'
                      ? 'white'
                      : 'black'
                    : 'gray'
                }
              />
            ),
          }}
        />
        <Tabs.Screen
          name="activity"
          listeners={{
            tabPress: (e) => {
              if (!isLoggedIn) {
                e.preventDefault();
                openLoginModal();
              }
            },
          }}
          options={{
            tabBarLabel: () => null,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name="heart-outline"
                size={24}
                color={
                  focused
                    ? colorScheme === 'dark'
                      ? 'white'
                      : 'black'
                    : 'gray'
                }
              />
            ),
          }}
        />
        <Tabs.Screen
          name="[username]"
          listeners={{
            tabPress: (e) => {
              if (!isLoggedIn) {
                e.preventDefault();
                openLoginModal();
              } else {
                router.navigate(`/@${user.id}`);
              }
            },
          }}
          options={{
            tabBarLabel: () => null,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name="person-outline"
                size={24}
                color={
                  focused && user?.id === pathname?.slice(2) // '/@user0'
                    ? colorScheme === 'dark'
                      ? 'white'
                      : 'black'
                    : 'gray'
                }
              />
            ),
          }}
        />
        <Tabs.Screen
          name="(post)/[username]/post/[postID]"
          options={{
            href: null,
          }}
        />
      </Tabs>
      <Modal
        visible={isLoginModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={closeLoginModal}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              padding: 20,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              minHeight: 200,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                로그인이 필요합니다
              </Text>
              <Pressable onPress={closeLoginModal}>
                <Ionicons name="close" size={24} color="#555" />
              </Pressable>
            </View>
            <Pressable
              onPress={toLoginPage}
              style={[
                styles.modalLoginButton,
                colorScheme === 'dark'
                  ? styles.modalLoginButtonDark
                  : styles.modalLoginButtonLight,
              ]}
            >
              <Text
                style={[
                  styles.modalLoginText,
                  colorScheme === 'dark'
                    ? styles.modalLoginTextDark
                    : styles.modalLoginTextLight,
                ]}
              >
                로그인하기
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalLoginButton: {
    backgroundColor: 'black',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalLoginButtonDark: {
    backgroundColor: 'white',
  },
  modalLoginButtonLight: {
    backgroundColor: 'black',
  },
  modalLoginText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalLoginTextDark: {
    color: 'black',
  },
  modalLoginTextLight: {
    color: 'white',
  },
});

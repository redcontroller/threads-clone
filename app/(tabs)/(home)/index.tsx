import { AuthContext } from '@/app/_layout';
import { usePathname, useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import {
  Dimensions,
  PixelRatio,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Index() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const { user } = useContext(AuthContext) || {};
  const isLoggedIn = !!user?.id;

  console.log('pathname', pathname);
  console.log('insets', insets);

  const { width, height } = Dimensions.get('window');

  console.log(`화면 너비: ${width}dp, 높이: ${height}dp`);
  console.log(
    `화면 너비: ${width * PixelRatio.get()}px, 높이: ${
      height * PixelRatio.get()
    }px`
  );

  return (
    <View
      style={
        colorScheme === 'dark' ? styles.containerDark : styles.containerLight
      }
    >
      <View>
        <TouchableOpacity onPress={() => router.replace('/@morkim/post/1')}>
          <Text
            style={colorScheme === 'dark' ? styles.textDark : styles.textLight}
          >
            게시글1
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity onPress={() => router.replace('/@morkim/post/2')}>
          <Text
            style={colorScheme === 'dark' ? styles.textDark : styles.textLight}
          >
            게시글2
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity onPress={() => router.replace('/@morkim/post/3')}>
          <Text
            style={colorScheme === 'dark' ? styles.textDark : styles.textLight}
          >
            게시글3
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerDark: {
    backgroundColor: '#101010',
  },
  containerLight: {
    backgroundColor: '#fff',
  },
  textDark: {
    color: '#fff',
  },
  textLight: {
    color: '#000',
  },
});

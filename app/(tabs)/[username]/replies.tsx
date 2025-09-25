import { AuthContext } from '@/app/_layout';
import { useLocalSearchParams, usePathname } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

export default function Replies() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const { username } = useLocalSearchParams();
  console.log(pathname);
  const { user } = useContext(AuthContext);
  const [threads, setThreads] = useState<any[]>([]);

  useEffect(() => {
    setThreads([]);
    fetch(`/users/${username?.slice(1)}/replies`)
      .then((res) => res.json())
      .then((data) => {
        setThreads(data.posts);
      });
  }, [username]);

  const onEndReached = () => {
    console.log(
      'onEndReached',
      `/users/${username?.slice(1)}/replies?cursor=${threads.at(-1)?.id}`
    );
    fetch(`/users/${username?.slice(1)}/replies?cursor=${threads.at(-1)?.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.replies.length > 0) {
          setThreads((prev) => [...prev, ...data.replies]);
        }
      });
  };

  return (
    <View
      style={[
        styles.container,
        colorScheme === 'dark' ? styles.containerDark : styles.containerLight,
      ]}
    >
      {pathname === '/undefined' && (
        <View style={styles.postInputContainer}>
          <Image
            source={{ uri: user?.profileImageUrl }}
            style={styles.profileAvatar}
          />
          <Text
            style={
              colorScheme === 'dark'
                ? styles.postInputTextDark
                : styles.postInputTextLight
            }
          >
            What&apos;s new?
          </Text>
          <Pressable
            style={[
              styles.postButton,
              colorScheme === 'dark'
                ? styles.postButtonDark
                : styles.postButtonLight,
            ]}
          >
            <Text
              style={[
                styles.postButtonText,
                colorScheme === 'dark'
                  ? styles.postButtonTextDark
                  : styles.postButtonTextLight,
              ]}
            >
              Post
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  containerDark: {
    backgroundColor: '#101010',
  },
  containerLight: {
    backgroundColor: 'white',
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  postInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#aaa',
  },
  postButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 22,
    position: 'absolute',
    right: 0,
  },
  postButtonLight: {
    backgroundColor: 'black',
  },
  postButtonDark: {
    backgroundColor: 'white',
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: '800',
  },
  postButtonTextLight: {
    color: 'white',
  },
  postButtonTextDark: {
    color: 'black',
  },
  postInputText: {
    fontSize: 16,
    fontWeight: '600',
  },
  postInputTextLight: {
    color: 'black',
  },
  postInputTextDark: {
    color: '#aaa',
  },
});

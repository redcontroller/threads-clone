import { AuthContext } from '@/app/_layout';
import ActivityItem from '@/components/Activity';
import SideMenu from '@/components/SideMenu';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import { usePathname, useRouter } from 'expo-router';
import { useCallback, useContext, useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ActivityData {
  id: string;
  type: string;
  content: string;
  timeAgo: string;
  otherCount?: number;
  likes?: number;
  isRead: boolean;
  user: {
    id: string;
    name: string;
    description: string;
    profileImageUrl: string;
    isVerified?: boolean;
  };
  post?: {
    id: string;
    content: string;
    imageUrls?: string[];
    likes: number;
    comments: number;
    reposts: number;
  };
}

// 시간순 정렬 (최신순)
const sortedActivities = (activities: ActivityData[]) => {
  activities.sort((a: any, b: any) => {
    const timeOrder = [
      '1m',
      '5m',
      '10m',
      '30m',
      '1h',
      '2h',
      '5h',
      '1d',
      '2d',
      '1w',
    ];
    return timeOrder.indexOf(a.timeAgo) - timeOrder.indexOf(b.timeAgo);
  });
};

export default function Index() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const { user } = useContext(AuthContext) || {};
  const isLoggedIn = !!user?.id;
  const colorScheme = useColorScheme();

  // Activity 데이터 상태 관리
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // 현재 탭 타입 결정
  const getCurrentTabType = useCallback(() => {
    console.log('pathname', pathname);
    if (pathname === '/activity') return 'all';
    if (pathname === '/activity/follows') return 'follows';
    if (pathname === '/activity/replies') return 'replies';
    if (pathname === '/activity/mentions') return 'mentions';
    if (pathname === '/activity/quotes') return 'quotes';
    if (pathname === '/activity/verified') return 'verified';
    return 'all';
  }, [pathname]);

  // Activity 데이터 로딩 함수
  const onEndReached = useCallback(() => {
    console.log('onEndReached', activities.at(-1)?.id);
    const tabType = getCurrentTabType();

    fetch(`/activities?type=${tabType}&cursor=${activities.at(-1)?.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.activities && data.activities.length > 0) {
          sortedActivities(data.activities);
          setActivities((prev) => [...prev, ...data.activities]);
        }
      });
  }, [activities, getCurrentTabType]);

  const onRefresh = () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fetch(`/activities?type=${getCurrentTabType()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.activities && data.activities.length > 0) {
          sortedActivities(data.activities);
          setActivities((prev) => [...prev, ...data.activities]);
        }
      })
      .finally(() => setRefreshing(false));
  };

  // 초기 데이터 로딩
  useEffect(() => {
    fetch(`/activities?type=${getCurrentTabType()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.activities && data.activities.length > 0) {
          // console.log('data', data);
          sortedActivities(data.activities);
          setActivities((prev) => [...prev, ...data.activities]);
        }
      })
      .catch((error) => {
        console.error('Failed to load initial activities:', error);
      });
  }, [getCurrentTabType]);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
        colorScheme === 'dark' ? styles.containerDark : styles.containerLight,
      ]}
    >
      <View
        style={[
          styles.header,
          colorScheme === 'dark' ? styles.headerDark : styles.headerLight,
        ]}
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
        <Image
          source={require('@/assets/images/react-logo.png')}
          style={styles.logo}
        />
        <SideMenu
          isVisible={isSideMenuOpen}
          onClose={() => setIsSideMenuOpen(false)}
        />
      </View>
      <ScrollView
        horizontal
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContainer}
      >
        <View>
          <TouchableOpacity
            style={[
              styles.tabButton,
              colorScheme === 'dark'
                ? styles.tabButtonDark
                : styles.tabButtonLight,
              pathname === '/activity' &&
                (colorScheme === 'dark'
                  ? styles.tabButtonActiveDark
                  : styles.tabButtonActiveLight),
            ]}
            onPress={() => router.replace(`/activity`)}
          >
            <Text
              style={[
                styles.tabButtonText,
                colorScheme === 'dark'
                  ? styles.tabButtonTextDark
                  : styles.tabButtonTextLight,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity
            style={[
              styles.tabButton,
              colorScheme === 'dark'
                ? styles.tabButtonDark
                : styles.tabButtonLight,
              pathname === '/activity/follows' &&
                (colorScheme === 'dark'
                  ? styles.tabButtonActiveDark
                  : styles.tabButtonActiveLight),
            ]}
            onPress={() => router.replace(`/activity/follows`)}
          >
            <Text
              style={[
                styles.tabButtonText,
                colorScheme === 'dark'
                  ? styles.tabButtonTextDark
                  : styles.tabButtonTextLight,
              ]}
            >
              Follows
            </Text>
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity
            style={[
              styles.tabButton,
              colorScheme === 'dark'
                ? styles.tabButtonDark
                : styles.tabButtonLight,
              pathname === '/activity/replies' &&
                (colorScheme === 'dark'
                  ? styles.tabButtonActiveDark
                  : styles.tabButtonActiveLight),
            ]}
            onPress={() => router.replace(`/activity/replies`)}
          >
            <Text
              style={[
                styles.tabButtonText,
                colorScheme === 'dark'
                  ? styles.tabButtonTextDark
                  : styles.tabButtonTextLight,
              ]}
            >
              Replies
            </Text>
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity
            style={[
              styles.tabButton,
              colorScheme === 'dark'
                ? styles.tabButtonDark
                : styles.tabButtonLight,
              pathname === '/activity/mentions' &&
                (colorScheme === 'dark'
                  ? styles.tabButtonActiveDark
                  : styles.tabButtonActiveLight),
            ]}
            onPress={() => router.replace(`/activity/mentions`)}
          >
            <Text
              style={[
                styles.tabButtonText,
                colorScheme === 'dark'
                  ? styles.tabButtonTextDark
                  : styles.tabButtonTextLight,
              ]}
            >
              Mentions
            </Text>
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity
            style={[
              styles.tabButton,
              colorScheme === 'dark'
                ? styles.tabButtonDark
                : styles.tabButtonLight,
              pathname === '/activity/quotes' &&
                (colorScheme === 'dark'
                  ? styles.tabButtonActiveDark
                  : styles.tabButtonActiveLight),
            ]}
            onPress={() => router.replace(`/activity/quotes`)}
          >
            <Text
              style={[
                styles.tabButtonText,
                colorScheme === 'dark'
                  ? styles.tabButtonTextDark
                  : styles.tabButtonTextLight,
              ]}
            >
              Quotes
            </Text>
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity
            style={[
              styles.tabButton,
              colorScheme === 'dark'
                ? styles.tabButtonDark
                : styles.tabButtonLight,
              pathname === '/activity/verified' &&
                (colorScheme === 'dark'
                  ? styles.tabButtonActiveDark
                  : styles.tabButtonActiveLight),
            ]}
            onPress={() => router.replace(`/activity/verified`)}
          >
            <Text
              style={[
                styles.tabButtonText,
                colorScheme === 'dark'
                  ? styles.tabButtonTextDark
                  : styles.tabButtonTextLight,
              ]}
            >
              Verified
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <View style={styles.listContainer}>
        <FlashList
          data={activities}
          renderItem={({ item }) => (
            <ActivityItem
              id={item.id}
              userId={item.user.id}
              profileImageUrl={item.user.profileImageUrl}
              timeAgo={item.timeAgo}
              content={item.content}
              type={item.type}
              postId={item.post?.id}
              likes={item.likes}
              isRead={item.isRead}
              isVerified={item.user.isVerified || false}
            />
          )}
          estimatedItemSize={350}
          onEndReachedThreshold={0.5}
          onEndReached={onEndReached}
          onRefresh={onRefresh}
          refreshing={refreshing}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text
                style={[
                  styles.emptyText,
                  colorScheme === 'dark'
                    ? styles.emptyTextDark
                    : styles.emptyTextLight,
                ]}
              >
                No activities found
              </Text>
            </View>
          )}
        />
      </View>
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
    height: 50,
  },
  headerLight: {
    backgroundColor: 'white',
  },
  headerDark: {
    backgroundColor: '#101010',
  },
  menuButton: {
    position: 'absolute',
    left: 16,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 7,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#aaa',
    backgroundColor: '#101010',
  },
  tabButtonLight: {
    backgroundColor: 'white',
  },
  tabButtonDark: {
    backgroundColor: '#101010',
  },
  tabButtonActiveLight: {
    backgroundColor: '#eee',
  },
  tabButtonActiveDark: {
    backgroundColor: '#202020',
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '900',
  },
  tabButtonTextLight: {
    color: 'black',
  },
  tabButtonTextDark: {
    color: 'white',
  },
  tabBar: {
    flexGrow: 0,
  },
  tabBarContainer: {
    height: 45,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  logo: {
    width: 32,
    height: 32,
  },
  listContainer: {
    flex: 1,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  emptyTextLight: {
    color: '#666',
  },
  emptyTextDark: {
    color: '#ccc',
  },
});

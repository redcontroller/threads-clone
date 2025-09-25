import SideMenu from '@/components/SideMenu';
import { Ionicons } from '@expo/vector-icons';
import { useContext, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../_layout';

interface searchResultData {
  id: string;
  name: string;
  content: string;
  profileImageUrl: string;
  followers: number;
  isConnections: boolean;
  isFollowed: boolean;
  isVerified: boolean;
}

export default function Index() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const { user } = useContext(AuthContext) || {};
  const isLoggedIn = !!user?.id;
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<searchResultData[]>([]);

  const fetchSearchResults = async (query = '') => {
    try {
      const url = query ? `/search?q=${encodeURIComponent(query)}` : '/search';
      const response = await fetch(url);
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  useEffect(() => {
    fetchSearchResults();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSearchResults(searchQuery);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const renderSearchItem = ({ item }: { item: searchResultData }) => (
    <View
      style={[
        styles.searchItem,
        colorScheme === 'dark' ? styles.searchItemDark : styles.searchItemLight,
      ]}
    >
      <View style={styles.userInfo}>
        <View style={styles.userInfoHeader}>
          <Image
            source={{ uri: item.profileImageUrl }}
            style={styles.profileImage}
          />
          <View style={styles.userInfoText}>
            <View style={styles.userNameContainer}>
              <Text
                style={[
                  styles.userId,
                  colorScheme === 'dark' ? styles.textDark : styles.textLight,
                ]}
              >
                {item.id}
              </Text>
              {item.isVerified && (
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color="#1DA1F2"
                  style={styles.verifiedIcon}
                />
              )}
            </View>
            <Text
              style={[
                styles.userName,
                colorScheme === 'dark' ? styles.textDark : styles.textLight,
              ]}
            >
              {item.name}
            </Text>
          </View>
          <Pressable
            style={[
              styles.followButton,
              colorScheme === 'dark'
                ? styles.followButtonDark
                : styles.followButtonLight,
            ]}
          >
            <Text
              style={[
                styles.followButtonText,
                colorScheme === 'dark'
                  ? styles.followButtonTextDark
                  : styles.followButtonTextLight,
              ]}
            >
              {item.isConnections ? 'Follow back' : 'Follow'}
            </Text>
          </Pressable>
        </View>
        <View style={styles.userContentContainer}>
          <Text
            style={[
              styles.userContent,
              colorScheme === 'dark' ? styles.textDark : styles.textLight,
            ]}
          >
            {item.content}
          </Text>
          <Text
            style={[
              styles.followerCount,
              colorScheme === 'dark' ? styles.textDark : styles.textLight,
            ]}
          >
            {item.followers} followers
          </Text>
        </View>
      </View>
      <View
        style={[
          styles.dividingLine,
          colorScheme === 'dark'
            ? styles.dividingLineDark
            : styles.dividingLineLight,
        ]}
      ></View>
    </View>
  );

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
      <View
        style={[
          styles.searchBarArea,
          colorScheme === 'dark'
            ? styles.searchBarAreaDark
            : styles.searchBarAreaLight,
        ]}
      >
        <View
          style={[
            styles.searchBar,
            colorScheme === 'dark'
              ? styles.searchBarDark
              : styles.searchBarLight,
          ]}
        >
          <Ionicons
            name="search"
            size={24}
            color={colorScheme === 'dark' ? 'gray' : 'black'}
          />
          <TextInput
            style={[
              styles.searchInput,
              colorScheme === 'dark'
                ? styles.searchInputDark
                : styles.searchInputLight,
            ]}
            placeholder="Search"
            placeholderTextColor={colorScheme === 'dark' ? 'gray' : 'black'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      <View style={styles.sectionHeader}>
        <Text
          style={[
            styles.sectionTitle,
            colorScheme === 'dark'
              ? styles.sectionTitleDark
              : styles.sectionTitleLight,
          ]}
        >
          {searchQuery
            ? `Search results for "${searchQuery}"`
            : 'Follow suggestions'}
        </Text>
      </View>
      <FlatList
        data={searchResults}
        renderItem={renderSearchItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logo: { width: 42, height: 42 },
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
  searchBarArea: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  searchBarAreaLight: {
    backgroundColor: 'white',
  },
  searchBarAreaDark: {
    backgroundColor: '#1d1d1d',
  },
  searchBar: {
    width: '100%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 20,
    paddingHorizontal: 30,
  },
  searchBarLight: {
    backgroundColor: 'white',
    borderWidth: StyleSheet.hairlineWidth,
  },
  searchBarDark: {
    backgroundColor: 'black',
    color: 'white',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#aaa',
  },
  searchInput: { marginLeft: 10 },
  searchInputLight: {
    color: 'black',
  },
  searchInputDark: {
    color: 'white',
  },
  textDark: {
    color: 'white',
  },
  textLight: {
    color: 'black',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitleDark: {
    color: 'white',
    opacity: 0.5,
  },
  sectionTitleLight: {
    color: 'black',
  },
  list: {
    flex: 1,
  },
  searchItem: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  searchItemLight: {
    backgroundColor: 'white',
  },
  searchItemDark: {
    backgroundColor: '#101010',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  userInfoText: {
    flex: 1,
  },
  userId: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  followButton: {
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 12,
  },
  followButtonLight: {
    backgroundColor: 'black',
  },
  followButtonDark: {
    backgroundColor: 'white',
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  followButtonTextLight: {
    color: 'white',
  },
  followButtonTextDark: {
    color: 'black',
  },
  userContent: {
    fontSize: 16,
    marginBottom: 8,
  },
  userContentContainer: {
    flex: 1,
    marginLeft: 60,
  },
  followerCount: {
    fontSize: 14,
    opacity: 0.5,
    paddingBottom: 8,
  },
  dividingLine: {
    flex: 1,
    paddingLeft: 60,
    height: 0.5,
  },
  dividingLineDark: {
    backgroundColor: '#333',
  },
  dividingLineLight: {
    backgroundColor: '#eee',
  },
});

import SideMenu from '@/components/SideMenu';
import { Ionicons } from '@expo/vector-icons';
import { useContext, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../_layout';

export default function Index() {
  const insets = useSafeAreaInsets();
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const { user } = useContext(AuthContext) || {};
  const isLoggedIn = !!user?.id;
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.header}>
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
      </View>
      <View>
        <TextInput
          style={styles.searchBar}
          placeholder="Search"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 50,
  },
  menuButton: {
    position: 'absolute',
    left: 20,
    top: 10,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  profile: {},
  profileHeader: {},
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  searchBar: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    width: '90%',
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 20,
    padding: 10,
  },
});

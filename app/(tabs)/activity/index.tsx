import NotFound from '@/app/+not-found';
import { usePathname, useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

export default function Index() {
  const router = useRouter();
  const pathname = usePathname();

  if (
    ![
      '/activity',
      '/activity/follows',
      '/activity/replies',
      '/activity/mentions',
      '/activity/quotes',
      '/activity/verified',
    ]
  ) {
    return <NotFound href="/activity" />;
  }
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View>
        <TouchableOpacity onPress={() => router.push(`/activity`)}>
          <Text>All</Text>
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity onPress={() => router.push(`/activity/follows`)}>
          <Text>Follows</Text>
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity onPress={() => router.push(`/activity/replies`)}>
          <Text>Replies</Text>
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity onPress={() => router.push(`/activity/mentions`)}>
          <Text>Mentions</Text>
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity onPress={() => router.push(`/activity/quotes`)}>
          <Text>Quotes</Text>
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity onPress={() => router.push(`/activity/verified`)}>
          <Text>Verified</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

import Post, { type IPost as PostType } from '@/components/Post';
import { FlashList } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import { usePathname } from 'expo-router';
import { useCallback, useContext, useRef, useState } from 'react';
import { PanResponder, StyleSheet, useColorScheme, View } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { AnimatedContext } from './_layout';

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList<PostType>);

export default function Following() {
  const colorScheme = useColorScheme();
  const path = usePathname();
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<PostType[]>([]);
  // RN Animated 변수 선언
  const scrollPosition = useSharedValue(0); // 자주 바뀌되 리렌더링 안됨
  const isReadyToRefresh = useSharedValue(false); // 리프레시 준비 여부
  const { pullDownPosition } = useContext(AnimatedContext); // _layout.tsx에서 선언한 변수

  const onEndReached = useCallback(() => {
    // const lastPost = posts[posts.length - 1];
    // console.log('onEndReached', lastPost?.id);
    fetch(`/posts?type=following&cursor=${posts.at(-1)?.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.posts.length > 0) {
          setPosts((prev) => [...prev, ...data.posts]);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts, path]);

  const onRefresh = (callback: () => void) => {
    setPosts([]);
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fetch(`/posts?type=following`)
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts);
      })
      .finally(() => {
        callback();
      });
  };

  const onPanRelease = () => {
    pullDownPosition.value = withTiming(isReadyToRefresh.value ? 60 : 0, {
      duration: 180,
    }); // 잡았다가 놨을 때 애니메이션
    console.log('onPanRelease', isReadyToRefresh.value);
    if (isReadyToRefresh.value) {
      onRefresh(() => {
        pullDownPosition.value = withTiming(0, { duration: 180 });
      });
    }
  };

  const panResponderRef = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true, // Pan 작업에 반응하도록 설정
      onPanResponderMove: (event, gestureState) => {
        console.log('onPanResponderMove', gestureState.dy);
        const max = 120;
        pullDownPosition.value = Math.max(Math.min(gestureState.dy, max), 0);
        console.log('pullDownPosition', pullDownPosition.value);

        if (
          pullDownPosition.value >= max / 2 &&
          isReadyToRefresh.value === false
        ) {
          isReadyToRefresh.value = true;
        }

        if (
          pullDownPosition.value < max / 2 &&
          isReadyToRefresh.value === true
        ) {
          isReadyToRefresh.value = false;
        }
      },
      onPanResponderRelease: onPanRelease,
      onPanResponderTerminate: onPanRelease,
    })
  );

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      console.log('onScroll', event.contentOffset.y);
      scrollPosition.value = event.contentOffset.y;
    },
  });

  const pullDownStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: pullDownPosition.value }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.container,
        colorScheme === 'dark' ? styles.containerDark : styles.containerLight,
        pullDownStyles, // Pan 제스쳐로 아래로 내렸을 때 호출
      ]}
      {...panResponderRef.current.panHandlers}
    >
      <AnimatedFlashList
        data={posts}
        refreshControl={<View />}
        onScroll={scrollHandler} // 스크롤을 밑으로 내렸을 때 호출
        scrollEventThrottle={16} // 최대한 부드럽게
        refreshing={refreshing}
        renderItem={({ item }) => <Post item={item} />}
        onEndReached={onEndReached}
        onEndReachedThreshold={2}
        estimatedItemSize={350}
      />
    </Animated.View>
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

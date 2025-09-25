import { FontAwesome, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Linking,
  Pressable,
  Modal as RNModal,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import styles from './modalStyles';

interface Thread {
  id: string;
  text: string;
  hashtag?: string;
  location?: [number, number];
  imageUrls: string[];
  topic?: string;
}

export function ListFooter({
  canAddThread,
  addThread,
}: {
  canAddThread: boolean;
  addThread: () => void;
}) {
  return (
    <View style={styles.listFooter}>
      <View style={styles.listFooterAvatar}>
        <Image
          source={require('../assets/images/avatar.jpg')}
          style={styles.avatarSmall}
        />
      </View>
      <View>
        <Pressable onPress={addThread} style={styles.input}>
          <Text style={{ color: canAddThread ? '#999' : '#aaa' }}>
            Add to Thread
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// 고유 ID 생성 함수
const generateId = () => `thread_${Math.random().toString(36).substring(2, 9)}`;

export default function Modal() {
  // const router = useRouter();
  const colorScheme = useColorScheme();
  const [threads, setThreads] = useState<Thread[]>(() => [
    { id: generateId(), text: '', imageUrls: [] },
  ]);
  const insets = useSafeAreaInsets();
  const [replyOption, setReplyOption] = useState('Anyone');
  const replyOptions = ['Anyone', 'Profiles you follow', 'Mentioned only'];
  const [isPosting, setIsPosting] = useState(false);
  // const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  // const [isTopicDropdownVisible, setIsTopicDropdownVisible] = useState(false);
  const [isTopicDrawerVisible, setIsTopicDrawerVisible] = useState(false);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  // 드래그 애니메이션을 위한 shared values
  const translateY = useSharedValue(0);
  const sheetHeight = useSharedValue(1); // 0~1 사이의 값으로 높이 조절
  const topicOptions = useMemo(
    () => [
      '창업아이디어',
      '하이에나',
      '비행기표',
      'AI',
      '강의',
      '인프런',
      '운동하는직장인',
      'Threads birthday',
    ],
    []
  );

  const handleCancel = () => {
    router.back();
  };

  const handlePost = () => {
    console.log('handlePost', threads);
    const formData = new FormData();
    threads.forEach((thread, index) => {
      formData.append(`posts[${index}][id]`, thread.id);
      formData.append(`posts[${index}][content]`, thread.text);
      formData.append(`posts[${index}][userId]`, 'user0');
      formData.append(
        `posts[${index}][location]`,
        JSON.stringify(thread.location)
      );
      thread.imageUrls.forEach((imageUrl, imageIndex) => {
        formData.append(`posts[${index}][imageUrls][${imageIndex}]`, {
          uri: imageUrl,
          name: `image_${index}_${imageIndex}.png`,
          type: 'image/png',
        } as unknown as Blob);
      });
    });

    Toast.show({
      text1: 'Posting...',
      type: 'customToast',
      visibilityTime: 5000,
      position: 'bottom',
      bottomOffset: 20,
    });

    fetch('/posts', {
      method: 'POST',
      headers: {
        'content-type': 'multipart/form-data',
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('post result', data);
        router.replace(`/@${data[0].userId}/posts/${data[0].id}}`);
        Toast.hide();
        Toast.show({
          text1: 'Post posted',
          type: 'customToast',
          visibilityTime: 5000,
          position: 'bottom',
          bottomOffset: 20,
          onPress: () => {
            console.log('post pressed', data);
            router.replace(`/@${data[0].userId}/posts/${data[0].id}}`);
            Toast.hide();
          },
        });
      })
      .catch((error) => {
        console.error('post error', error);
        Toast.hide();
        Toast.show({
          text1: 'Post failed',
          type: 'customToast',
          visibilityTime: 5000,
          position: 'bottom',
          bottomOffset: 20,
        });
      });
  };

  const updateThreadText = useCallback((id: string, text: string) => {
    setThreads((prevThreads) =>
      prevThreads.map((thread) =>
        thread.id === id ? { ...thread, text } : thread
      )
    );
  }, []);

  const closeTopicDrawer = useCallback(() => {
    setIsTopicDrawerVisible(false);
    setSearchQuery('');
    // 애니메이션 값 초기화
    translateY.value = withSpring(0);
    sheetHeight.value = withSpring(1);
  }, [translateY, sheetHeight]);

  const panGesture = useMemo(() => {
    return Gesture.Pan()
      .onUpdate((event: any) => {
        // 드래그 중에 실시간으로 애니메이션 적용
        const progress = Math.min(event.translationY / 200, 1); // 최대 200px까지
        translateY.value = event.translationY;
        sheetHeight.value = 1 - progress * 0.3; // 최대 30%까지 높이 줄임
      })
      .onEnd((event: any) => {
        // 아래 방향으로 34px 이상 드래그하면 바텀시트 닫기
        if (event.translationY > 34) {
          runOnJS(closeTopicDrawer)();
        } else {
          // 드래그가 임계값 이하면 원래 위치로 복원
          translateY.value = withSpring(0);
          sheetHeight.value = withSpring(1);
        }
      });
  }, [closeTopicDrawer, translateY, sheetHeight]);

  // 바텀시트 애니메이션 스타일
  const animatedSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      flex: sheetHeight.value,
    };
  });

  const handleTopicSelect = useCallback(
    (topic: string) => {
      console.log('handleTopicSelect called:', topic);

      // 새로운 주제를 topicOptions에 추가 (아직 없는 경우)
      if (!topicOptions.includes(topic)) {
        // topicOptions는 상수이므로 실제로는 상태로 관리해야 하지만,
        // 여기서는 기존 옵션에 없는 경우에만 처리
        console.log('Adding new topic:', topic);
      }

      // 모든 스레드에 동일한 토픽 적용
      setCurrentTopic(topic);
      setThreads((prevThreads) => {
        const updatedThreads = prevThreads.map((thread) => ({
          ...thread,
          topic,
        }));
        console.log('Updated all threads with topic:', topic);
        return updatedThreads;
      });

      closeTopicDrawer();
    },
    [closeTopicDrawer, topicOptions]
  );

  const handleTopicRemove = useCallback(() => {
    console.log('handleTopicRemove called');

    // 모든 스레드에서 토픽 제거
    setCurrentTopic(null);
    setThreads((prevThreads) => {
      const updatedThreads = prevThreads.map((thread) => ({
        ...thread,
        topic: undefined,
      }));
      console.log('Removed topic from all threads');
      return updatedThreads;
    });

    closeTopicDrawer();
  }, [closeTopicDrawer]);

  const openTopicDrawer = useCallback(() => {
    console.log('openTopicDrawer called');
    setIsTopicDrawerVisible(true);
    // 애니메이션 값 초기화
    translateY.value = 0;
    sheetHeight.value = 1;
  }, [translateY, sheetHeight]);

  const canAddThread = useMemo(
    () =>
      // 마지막 요소 검증 (텍스트 또는 이미지 존재 여부)
      (threads.at(-1)?.text.trim().length ?? 0) > 0 ||
      (threads.at(-1)?.imageUrls.length ?? 0) > 0,
    [threads]
  );
  const canPost = useMemo(
    () =>
      threads.every(
        (thread) => thread.text.trim().length > 0 || thread.imageUrls.length > 0
      ),
    [threads]
  );

  const hasTopic = useMemo(() => {
    return currentTopic && currentTopic.trim().length > 0;
  }, [currentTopic]);

  const removeThread = useCallback((id: string) => {
    setThreads((prevThreads) =>
      prevThreads.filter((thread) => thread.id !== id)
    );
  }, []);

  const pickImage = async (id: string) => {
    let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log('pickImage', status);
    if (status !== 'granted') {
      Alert.alert(
        'Image permission not granted',
        'Please grant image permission to use this feature',
        [
          { text: 'Open settings', onPress: () => Linking.openSettings() },
          { text: 'Cancel' },
        ]
      );
      return;
    }
    // 권한 획득
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'livePhotos', 'videos'],
      allowsMultipleSelection: true,
      selectionLimit: 5,
    });
    console.log('Image result', result);
    if (!result.canceled) {
      setThreads((prevThreads) =>
        prevThreads.map((thread) =>
          thread.id === id
            ? {
                ...thread,
                imageUrls: thread.imageUrls.concat(
                  result.assets?.map((asset) => asset.uri) ?? []
                ),
              }
            : thread
        )
      );
    }
  };

  const takePhoto = async (id: string) => {
    let { status } = await ImagePicker.requestCameraPermissionsAsync();
    console.log('takePhoto', status);
    if (status !== 'granted') {
      Alert.alert(
        'Camera permission not granted',
        'Please grant camera permission to use this feature',
        [
          { text: 'Open settings', onPress: () => Linking.openSettings() },
          { text: 'Cancel' },
        ]
      );
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images', 'livePhotos', 'videos'],
      allowsMultipleSelection: true,
      selectionLimit: 5,
    });
    console.log('Photo result', result);
    // 사진 저장 권한 획득 시 사진 저장
    status = (await MediaLibrary.requestPermissionsAsync()).status;
    if (status === 'granted' && result.assets?.[0].uri) {
      MediaLibrary.saveToLibraryAsync(result.assets?.[0].uri);
    }
    // 촬영한 사진을 게시글에 추가
    if (!result.canceled) {
      setThreads((prevThreads) =>
        prevThreads.map((thread) =>
          thread.id === id
            ? {
                ...thread,
                imageUrls: thread.imageUrls.concat(
                  result.assets?.map((asset) => asset.uri) ?? []
                ),
              }
            : thread
        )
      );
    }
  };

  const removeImageFromThread = (id: string, uriToRemove: string) => {
    setThreads((prevThreads) =>
      prevThreads.map((thread) =>
        thread.id === id
          ? {
              ...thread,
              imageUrls: thread.imageUrls.filter((uri) => uri !== uriToRemove),
            }
          : thread
      )
    );
  };

  const getMyLocation = async (id: string) => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    console.log('getMyLocation', status);
    if (status !== 'granted') {
      Alert.alert(
        'Location permission not granted',
        'Please grant location permission to use this feature',
        [
          {
            text: 'Open settings',
            onPress: () => Linking.openSettings(),
          },
          {
            text: 'Cancel',
          },
        ]
      );
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    // const address = await Location.reverseGeocodeAsync({
    //   latitude: location.coords.latitude, // 37.53
    //   longitude: location.coords.longitude, // 127.02
    // });
    // console.log('address', address);

    setThreads((prevThreads) =>
      prevThreads.map((thread) =>
        thread.id === id
          ? {
              ...thread,
              location: [location.coords.latitude, location.coords.longitude],
            }
          : thread
      )
    );
  };

  const renderThreadItem = ({
    item,
    index,
  }: {
    item: Thread;
    index: number;
  }) => (
    <View style={styles.threadContainer}>
      <View style={styles.avatarContainer}>
        <Image
          source={require('../assets/images/avatar.jpg')}
          style={styles.avatar}
        />
        <View style={styles.threadLine} />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.userInfoContainer}>
          <View style={styles.topicContainer}>
            <Text
              style={[
                styles.username,
                colorScheme === 'dark'
                  ? styles.usernameDark
                  : styles.usernameLight,
              ]}
            >
              user0
            </Text>
            <Pressable onPress={openTopicDrawer}>
              {item.topic ? (
                <View style={styles.topicInputContainer}>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="#999"
                    style={styles.chevronIcon}
                  />
                  <Pressable onPress={openTopicDrawer}>
                    <Text style={styles.topicText}>{item.topic}</Text>
                  </Pressable>
                </View>
              ) : (
                index === 0 && (
                  <View style={styles.topicInputContainer}>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#999"
                      style={styles.chevronIcon}
                    />
                    <TextInput
                      style={[
                        styles.topicPlaceholder,
                        colorScheme === 'dark'
                          ? styles.inputDark
                          : styles.inputLight,
                      ]}
                      placeholder="Add to topic"
                      placeholderTextColor="#999"
                      onFocus={openTopicDrawer}
                      editable={false}
                    />
                  </View>
                )
              )}
            </Pressable>
          </View>
          {index > 0 && (
            <TouchableOpacity
              onPress={() => removeThread(item.id)}
              style={styles.removeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-outline" size={20} color="#8e8e93" />
            </TouchableOpacity>
          )}
        </View>

        <TextInput
          style={styles.input}
          placeholder={"What's new?"}
          placeholderTextColor="#999"
          value={item.text}
          onChangeText={(text) => updateThreadText(item.id, text)}
          multiline
        />
        {item.imageUrls && item.imageUrls.length > 0 && (
          <FlatList
            data={item.imageUrls}
            renderItem={({ item: uri, index: imgIndex }) => (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri }} style={styles.imagePreview} />
                <TouchableOpacity
                  onPress={() =>
                    !isPosting && removeImageFromThread(item.id, uri)
                  }
                  style={styles.removeImageButton}
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color="rgba(0,0,0,0.7)"
                  />
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(uri, imgIndex) =>
              `${item.id}-img-${imgIndex}-${uri}`
            }
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imageFlatList}
          />
        )}
        {item.location && (
          <View style={styles.locationContainer}>
            <Text style={styles.locationText}>
              {item.location[0]}, {item.location[1]}
            </Text>
          </View>
        )}
        <View style={styles.actionButtons}>
          <Pressable
            style={styles.actionButton}
            onPress={() => !isPosting && pickImage(item.id)}
          >
            <Ionicons name="image-outline" size={24} color="#777" />
          </Pressable>
          <Pressable
            style={styles.actionButton}
            onPress={() => !isPosting && takePhoto(item.id)}
          >
            <Ionicons name="camera-outline" size={24} color="#777" />
          </Pressable>
          <Pressable
            style={styles.actionButton}
            onPress={() => {
              getMyLocation(item.id);
            }}
          >
            <FontAwesome name="map-marker" size={24} color="#777" />
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View
        style={[
          styles.container,
          { paddingTop: insets.top },
          colorScheme === 'dark' ? styles.containerDark : styles.containerLight,
        ]}
      >
        <View
          style={[
            styles.header,
            colorScheme === 'dark' ? styles.headerDark : styles.headerLight,
          ]}
        >
          <Pressable onPress={handleCancel} disabled={isPosting}>
            <Text
              style={[
                styles.cancel,
                colorScheme === 'dark' ? styles.cancelDark : styles.cancelLight,
                isPosting && styles.disabledText,
              ]}
            >
              Cancel
            </Text>
          </Pressable>
          <Text
            style={[
              styles.title,
              colorScheme === 'dark' ? styles.titleDark : styles.titleLight,
            ]}
          >
            New thread
          </Text>
          <View style={styles.headerRightPlaceholder} />
        </View>

        <View style={{ flex: 1 }}>
          <FlatList
            data={threads}
            keyExtractor={(item) => item.id}
            renderItem={renderThreadItem}
            ListFooterComponent={
              <ListFooter
                canAddThread={canAddThread}
                addThread={() => {
                  if (canAddThread) {
                    setThreads((prevThreads) => [
                      ...prevThreads,
                      { id: generateId(), text: '', imageUrls: [] },
                    ]);
                  }
                }}
              />
            }
            style={[
              styles.list,
              colorScheme === 'dark' ? styles.listDark : styles.listLight,
            ]}
            contentContainerStyle={{
              backgroundColor: colorScheme === 'dark' ? '#101010' : 'white',
            }}
            keyboardShouldPersistTaps="handled"
          />

          <RNModal
            visible={isDropdownVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setIsDropdownVisible(false)}
          >
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setIsDropdownVisible(false)}
            >
              <View
                style={[
                  styles.dropdownContainer,
                  { bottom: insets.bottom + 30 },
                  colorScheme === 'dark'
                    ? styles.dropdownContainerDark
                    : styles.dropdownContainerLight,
                ]}
              >
                {replyOptions.map((option) => (
                  <Pressable
                    key={option}
                    style={[
                      styles.dropdownOption,
                      option === replyOption && styles.selectedOption,
                    ]}
                    onPress={() => {
                      setReplyOption(option);
                      setIsDropdownVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownOptionText,
                        option === replyOption && styles.selectedOptionText,
                        colorScheme === 'dark'
                          ? styles.dropdownOptionTextDark
                          : styles.dropdownOptionTextLight,
                      ]}
                    >
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Pressable>
          </RNModal>

          <View
            style={[
              styles.footer,
              { paddingBottom: insets.bottom + 10 },
              colorScheme === 'dark' ? styles.footerDark : styles.footerLight,
            ]}
          >
            <Pressable onPress={() => setIsDropdownVisible(true)}>
              <Text
                style={[
                  styles.footerText,
                  colorScheme === 'dark'
                    ? styles.footerTextDark
                    : styles.footerTextLight,
                ]}
              >
                {replyOption} can reply & quote
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.postButton,
                colorScheme === 'dark'
                  ? styles.postButtonDark
                  : styles.postButtonLight,
                !canPost &&
                  (colorScheme === 'dark'
                    ? styles.postButtonDisabledDark
                    : styles.postButtonDisabledLight),
              ]}
              disabled={!canPost}
              onPress={handlePost}
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
        </View>

        {/* Topic Selection Bottom Sheet */}
        {isTopicDrawerVisible && (
          <View style={styles.bottomSheetOverlay}>
            <Animated.View
              style={[
                styles.bottomSheetContainer,
                {
                  marginTop: insets.top,
                  paddingBottom: insets.bottom + 40,
                },
                colorScheme === 'dark'
                  ? styles.bottomSheetContainerDark
                  : styles.bottomSheetContainerLight,
                animatedSheetStyle,
              ]}
            >
              <GestureDetector gesture={panGesture}>
                <View
                  style={[
                    styles.bottomSheetHeader,
                    colorScheme === 'dark'
                      ? styles.bottomSheetHeaderDark
                      : styles.bottomSheetHeaderLight,
                  ]}
                >
                  <View style={styles.bottomSheetHeaderLine} />
                </View>
              </GestureDetector>

              {/* Search Bar */}
              <View
                style={[
                  styles.searchContainer,
                  colorScheme === 'dark'
                    ? styles.searchContainerDark
                    : styles.searchContainerLight,
                ]}
              >
                <View style={styles.searchInputContainer}>
                  <Ionicons
                    name="search"
                    size={20}
                    color="#999"
                    style={styles.searchIcon}
                  />
                  <TextInput
                    style={[
                      styles.searchInput,
                      colorScheme === 'dark'
                        ? styles.searchInputDark
                        : styles.searchInputLight,
                    ]}
                    placeholder="주제 검색"
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoFocus={true} // 자동 포커스 방지 (바텀시트 열릴 때)
                    keyboardType="default" // 기본 키보드 타입 (문자열)
                  />
                </View>
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={[
                    styles.removeSearchTextButton,
                    colorScheme === 'dark'
                      ? styles.removeSearchTextButtonDark
                      : styles.removeSearchTextButtonLight,
                  ]}
                >
                  <Ionicons name="close" size={16} color="#999" />
                </TouchableOpacity>
              </View>

              {/* Current Topic Display */}
              {hasTopic && (
                <View
                  style={[
                    styles.currentTopicContainer,
                    colorScheme === 'dark'
                      ? styles.currentTopicContainerDark
                      : styles.currentTopicContainerLight,
                  ]}
                >
                  <View style={styles.currentTopicChip}>
                    <Text style={styles.currentTopicText}>{currentTopic}</Text>
                    <TouchableOpacity
                      onPress={handleTopicRemove}
                      style={[
                        styles.removeTopicButton,
                        colorScheme === 'dark'
                          ? styles.removeTopicButtonDark
                          : styles.removeTopicButtonLight,
                      ]}
                    >
                      <Ionicons name="close" size={16} color="#ccc" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Topic Options List */}
              <FlatList
                data={(() => {
                  const filteredTopics = topicOptions.filter((topic) =>
                    topic.toLowerCase().includes(searchQuery.toLowerCase())
                  );

                  // 검색어가 있고, 정확히 일치하는 항목이 없는 경우 새로운 주제 추가 옵션 표시
                  if (
                    searchQuery.trim().length > 0 &&
                    !topicOptions.some(
                      (topic) =>
                        topic.toLowerCase() === searchQuery.toLowerCase()
                    )
                  ) {
                    return [...filteredTopics, searchQuery.trim()];
                  }

                  return filteredTopics;
                })()}
                renderItem={({ item: topic }) => {
                  const isNewTopic =
                    searchQuery.trim().length > 0 &&
                    topic === searchQuery.trim() &&
                    !topicOptions.some(
                      (option) => option.toLowerCase() === topic.toLowerCase()
                    );

                  return (
                    <TouchableOpacity
                      style={[
                        styles.topicOption,
                        colorScheme === 'dark'
                          ? styles.topicOptionDark
                          : styles.topicOptionLight,
                      ]}
                      onPress={() => handleTopicSelect(topic)}
                    >
                      <Text
                        style={[
                          styles.topicOptionText,
                          colorScheme === 'dark'
                            ? styles.topicOptionTextDark
                            : styles.topicOptionTextLight,
                        ]}
                      >
                        {topic}
                      </Text>
                      {isNewTopic && (
                        <Text
                          style={[
                            styles.newTopicText,
                            colorScheme === 'dark'
                              ? styles.newTopicTextDark
                              : styles.newTopicTextLight,
                          ]}
                        >
                          + 새로운 주제 태그하기
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                }}
                keyExtractor={(topic, index) => `topic-${index}`}
                style={[
                  styles.bottomSheetList,
                  colorScheme === 'dark'
                    ? styles.bottomSheetListDark
                    : styles.bottomSheetListLight,
                ]}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="always"
                keyboardDismissMode="interactive"
              />
            </Animated.View>
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

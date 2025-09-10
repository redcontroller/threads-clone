import { FontAwesome, Ionicons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
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
import styles from './modalStyles';

interface Thread {
  id: string;
  text: string;
  hashtag?: string;
  location?: [number, number];
  imageUris: string[];
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
  const [threads, setThreads] = useState<Thread[]>(() => [
    { id: generateId(), text: '', imageUris: [] },
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
    setIsPosting(true);
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
      (threads.at(-1)?.imageUris.length ?? 0) > 0,
    [threads]
  );
  const canPost = useMemo(
    () =>
      threads.every(
        (thread) => thread.text.trim().length > 0 || thread.imageUris.length > 0
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
                imageUris: thread.imageUris.concat(
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
                imageUris: thread.imageUris.concat(
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
              imageUris: thread.imageUris.filter((uri) => uri !== uriToRemove),
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
            <Text style={styles.username}>user0</Text>
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
                      style={styles.topicPlaceholder}
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
        {item.imageUris && item.imageUris.length > 0 && (
          <FlatList
            data={item.imageUris}
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
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={handleCancel} disabled={isPosting}>
            <Text style={[styles.cancel, isPosting && styles.disabledText]}>
              Cancel
            </Text>
          </Pressable>
          <Text style={styles.title}>New thread</Text>
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
                      { id: generateId(), text: '', imageUris: [] },
                    ]);
                  }
                }}
              />
            }
            style={styles.list}
            contentContainerStyle={{ paddingBottom: 100 }}
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
                      ]}
                    >
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Pressable>
          </RNModal>

          <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
            <Pressable onPress={() => setIsDropdownVisible(true)}>
              <Text style={styles.footerText}>
                {replyOption} can reply & quote
              </Text>
            </Pressable>
            <Pressable
              style={[styles.postButton, !canPost && styles.postButtonDisabled]}
              disabled={!canPost}
              onPress={handlePost}
            >
              <Text style={styles.postButtonText}>Post</Text>
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
                animatedSheetStyle,
              ]}
            >
              <GestureDetector gesture={panGesture}>
                <View style={styles.bottomSheetHeader}>
                  <View style={styles.bottomSheetHeaderLine} />
                </View>
              </GestureDetector>

              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                  <Ionicons
                    name="search"
                    size={20}
                    color="#999"
                    style={styles.searchIcon}
                  />
                  <TextInput
                    style={styles.searchInput}
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
                  style={styles.removeSearchTextButton}
                >
                  <Ionicons name="close" size={16} color="#999" />
                </TouchableOpacity>
              </View>

              {/* Current Topic Display */}
              {hasTopic && (
                <View style={styles.currentTopicContainer}>
                  <View style={styles.currentTopicChip}>
                    <Text style={styles.currentTopicText}>{currentTopic}</Text>
                    <TouchableOpacity
                      onPress={handleTopicRemove}
                      style={styles.removeTopicButton}
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
                      style={styles.topicOption}
                      onPress={() => handleTopicSelect(topic)}
                    >
                      <Text style={styles.topicOptionText}>{topic}</Text>
                      {isNewTopic && (
                        <Text style={styles.newTopicText}>
                          + 새로운 주제 태그하기
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                }}
                keyExtractor={(topic, index) => `topic-${index}`}
                style={styles.bottomSheetList}
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

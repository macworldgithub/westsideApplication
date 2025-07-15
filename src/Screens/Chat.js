// import React, { useState, useEffect, useRef } from 'react';
// import {
//   SafeAreaView,
//   FlatList,
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Image,
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
//   Linking,
// } from 'react-native';
// import { FontAwesome } from '@expo/vector-icons';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { jwtDecode } from 'jwt-decode';
// import io from 'socket.io-client';
// import axios from 'axios';
// import { launchImageLibrary } from 'react-native-image-picker';
// import * as Progress from 'react-native-progress';
// import Video from 'react-native-video';
// import NetInfo from '@react-native-community/netinfo';
// import { API_BASE_URL } from '../utils/config';
// import showToast from '../utils/Toast';

// export default function Chat() {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const flatListRef = useRef(null);
//   const { chatRoomId, roomName } = route.params || {};
//   console.log('Chat screen params:', { chatRoomId, roomName });

//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');
//   const [userId, setUserId] = useState(null);
//   const [socket, setSocket] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [weekOffset, setWeekOffset] = useState(0);
//   const [totalWeeks, setTotalWeeks] = useState(0);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [sentMessageIds, setSentMessageIds] = useState(new Set());
//   const [uploading, setUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);

//   // Initialize WebSocket and fetch messages
//   useEffect(() => {
//     const initialize = async () => {
//       if (!chatRoomId) {
//         showToast({
//           type: 'error',
//           title: 'Error',
//           message: 'Invalid chat room ID.',
//           onHide: () => navigation.goBack(),
//         });
//         return;
//       }

//       try {
//         const token = await AsyncStorage.getItem('jwt_token');
//         if (!token) {
//           showToast({
//             type: 'error',
//             title: 'Session Expired',
//             message: 'Please log in again.',
//             onHide: () => navigation.navigate('Login'),
//           });
//           return;
//         }
//         const decoded = jwtDecode(token);
//         if (!decoded._id) throw new Error('Invalid token');
//         setUserId(decoded._id);

//         // Initialize WebSocket
//         const newSocket = io(API_BASE_URL.replace('/api', ''), {
//           auth: { token },
//         });
//         setSocket(newSocket);

//         // Join chat room
//         newSocket.emit('join_chat', chatRoomId);
//         console.log('Joined chat room:', chatRoomId);

//         // Fetch initial messages (week 0)
//         await fetchMessages(0);
//       } catch (error) {
//         console.error('Error initializing chat:', error);
//         showToast({
//           type: 'error',
//           title: 'Error',
//           message: 'Failed to load chat messages.',
//         });
//       } finally {
//         setLoading(false);
//       }
//     };
//     initialize();

//     return () => {
//       if (socket) {
//         socket.emit('leave_chat', chatRoomId);
//         socket.disconnect();
//         console.log('WebSocket disconnected from chat:', chatRoomId);
//       }
//     };
//   }, [chatRoomId, navigation]);

//   // Scroll to bottom on initial load
//   useEffect(() => {
//     if (!loading && messages.length > 0) {
//       setTimeout(() => {
//         console.log('Initial scroll to bottom:', { messagesLength: messages.length });
//         flatListRef.current?.scrollToEnd({ animated: false });
//       }, 100);
//     }
//   }, [loading, messages]);

//   // Fetch messages for a specific week
//   const fetchMessages = async (week) => {
//     try {
//       setLoadingMore(true);
//       const token = await AsyncStorage.getItem('jwt_token');
//       const response = await axios.get(
//         `${API_BASE_URL}/chat/${chatRoomId}/messages?week=${week}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       console.log(`Messages response for week ${week}:`, JSON.stringify(response.data, null, 2));
//       setMessages((prev) => {
//         const existingIds = new Set(prev.map((msg) => msg._id));
//         const newMessages = response.data.messages.filter((msg) => !existingIds.has(msg._id));
//         return [...newMessages, ...prev]; // Prepend for chronological order
//       });
//       setTotalWeeks(response.data.totalWeeks || 0);
//       setWeekOffset(week);
//     } catch (error) {
//       console.error(`Error fetching messages for week ${week}:`, error);
//       showToast({
//         type: 'error',
//         title: 'Error',
//         message: 'Failed to load older messages.',
//       });
//     } finally {
//       setLoadingMore(false);
//     }
//   };

//   // Listen for new messages
//   useEffect(() => {
//     if (!socket) return;

//     socket.on('connect', () => {
//       console.log('WebSocket connected');
//     });

//     socket.on('new_message', (message) => {
//       console.log('Received new_message in Chat:', JSON.stringify(message, null, 2));
//       if (!message || !message.chatRoomId) {
//         console.error('Invalid message received:', message);
//         return;
//       }
//       setMessages((prev) => {
//         if (prev.some((msg) => msg._id === message._id)) {
//           console.log('Duplicate message ignored:', message._id);
//           return prev;
//         }
//         const tempMessage = prev.find(
//           (msg) =>
//             msg._id.startsWith('temp-') &&
//             msg.text === message.text &&
//             msg.chatRoomId === message.chatRoomId &&
//             JSON.stringify(msg.imageUrls) === JSON.stringify(message.imageUrls) &&
//             JSON.stringify(msg.videoUrls) === JSON.stringify(message.videoUrls) &&
//             msg.audioUrl === message.audioUrl
//         );
//         if (tempMessage) {
//           console.log('Replacing temp message:', tempMessage._id, 'with:', message._id);
//           setSentMessageIds((prevIds) => {
//             const newIds = new Set(prevIds);
//             newIds.delete(tempMessage._id);
//             return newIds;
//           });
//           return [...prev.filter((msg) => msg._id !== tempMessage._id), message];
//         }
//         return [...prev, message];
//       });
//     });

//     socket.on('error', (error) => {
//       showToast({
//         type: 'error',
//         title: 'Error',
//         message: error.message || 'Failed to send message.',
//       });
//     });

//     socket.on('connect_error', (error) => {
//       console.error('WebSocket connect error:', error);
//       showToast({
//         type: 'error',
//         title: 'Connection Error',
//         message: 'Failed to connect to chat server.',
//       });
//     });

//     return () => {
//       socket.off('connect');
//       socket.off('new_message');
//       socket.off('error');
//       socket.off('connect_error');
//     };
//   }, [socket]);

//   const pickImageOrVideo = async () => {
//     try {
//       const netInfo = await NetInfo.fetch();
//       if (!netInfo.isConnected) {
//         showToast({
//           type: 'error',
//           title: 'No Internet',
//           message: 'Please check your internet connection.',
//         });
//         return [];
//       }

//       const result = await launchImageLibrary({
//         mediaType: 'mixed',
//         selectionLimit: 0,
//       });
//       if (result.didCancel) {
//         console.log('Image/Video picking cancelled');
//         return [];
//       }
//       if (result.errorCode) {
//         throw new Error(result.errorMessage || 'Failed to pick media');
//       }
//       return result.assets.map((asset) => ({
//         uri: asset.uri,
//         name: asset.fileName || `media-${Date.now()}`,
//         type: asset.type,
//       }));
//     } catch (error) {
//       console.error('Error picking image/video:', error);
//       showToast({
//         type: 'error',
//         title: 'Error',
//         message: 'Failed to pick image or video.',
//       });
//       return [];
//     }
//   };

//   const uploadFiles = async (files) => {
//     try {
//       setUploading(true);
//       setUploadProgress(0);
//       const token = await AsyncStorage.getItem('jwt_token');

//       // Prepare request for presigned URLs
//       const images = files
//         .filter((file) => file.type.includes('image'))
//         .map((file) => ({ name: file.name, mimeType: file.type }));
//       const videos = files
//         .filter((file) => file.type.includes('video'))
//         .map((file) => ({ name: file.name, mimeType: file.type }));
//       const audio = files.find((file) => file.type.includes('audio'))
//         ? { name: files.find((file) => file.type.includes('audio')).name, mimeType: files.find((file) => file.type.includes('audio')).type }
//         : undefined;

//       const payload = {
//         chatRoomId,
//         sender: userId,
//         text: input.trim() || undefined,
//         images: images.length > 0 ? images : undefined,
//         videos: videos.length > 0 ? videos : undefined,
//         audio: audio,
//       };

//       // Get presigned URLs
//       const response = await axios.post(
//         `${API_BASE_URL}/message/presigned-urls`,
//         payload,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       const { imageUrls, videoUrls, audioUrl } = response.data;

//       // Upload files to S3 with progress tracking
//       const totalFiles = files.length;
//       let uploadedFiles = 0;

//       const uploadPromises = files.map(async (file, index) => {
//         let presignedUrlData;
//         if (file.type.includes('image')) {
//           presignedUrlData = imageUrls[index - files.filter((f, i) => i < index && f.type.includes('image')).length];
//         } else if (file.type.includes('video')) {
//           presignedUrlData = videoUrls[index - files.filter((f, i) => i < index && f.type.includes('video')).length];
//         } else if (file.type.includes('audio')) {
//           presignedUrlData = audioUrl;
//         }

//         const { url, key } = presignedUrlData;
//         const fileData = await fetch(file.uri).then((res) => res.blob());

//         await axios.put(url, fileData, {
//           headers: { 'Content-Type': file.type },
//           onUploadProgress: (progressEvent) => {
//             const progress = (progressEvent.loaded / progressEvent.total) * (1 / totalFiles);
//             setUploadProgress((prev) => Math.min(prev + progress / totalFiles, 1));
//           },
//         });

//         return { key, name: file.name };
//       });

//       const uploadedFilesData = await Promise.all(uploadPromises);
//       uploadedFiles = uploadedFilesData.length;
//       setUploadProgress(uploadedFiles / totalFiles);

//       // Prepare message payload
//       const messagePayload = {
//         chatRoomId,
//         sender: userId,
//         text: input.trim() || undefined,
//         imageUrls: uploadedFilesData.filter((_, i) => files[i].type.includes('image')).map((f) => f.key),
//         videoUrls: uploadedFilesData.filter((_, i) => files[i].type.includes('video')).map((f) => f.key),
//         audioUrl: uploadedFilesData.find((_, i) => files[i].type.includes('audio'))?.key,
//       };

//       // Send message via WebSocket
//       socket.emit('send_message', messagePayload);
//       const tempMessage = {
//         _id: `temp-${Date.now()}-${Math.random()}`,
//         chatRoomId,
//         sender: { _id: userId, name: 'You' },
//         text: input.trim() || undefined,
//         imageUrls: imageUrls?.map((u) => u.url) || [],
//         videoUrls: videoUrls?.map((u) => u.url) || [],
//         audioUrl: audioUrl?.url,
//         createdAt: new Date(),
//       };
//       setMessages((prev) => [...prev, tempMessage]);
//       setSentMessageIds((prev) => new Set(prev).add(tempMessage._id));
//       setInput('');
//     } catch (error) {
//       console.error('Error uploading files:', error);
//       showToast({
//         type: 'error',
//         title: 'Error',
//         message: 'Failed to upload files.',
//       });
//     } finally {
//       setUploading(false);
//       setUploadProgress(0);
//     }
//   };

//   const sendMessage = async () => {
//     if (!input.trim() && !uploading) {
//       const media = await pickImageOrVideo();
//       if (media.length > 0) {
//         await uploadFiles(media);
//       }
//       return;
//     }

//     try {
//       const token = await AsyncStorage.getItem('jwt_token');
//       const payload = {
//         chatRoomId,
//         sender: userId,
//         text: input.trim(),
//       };
//       socket.emit('send_message', payload);
//       const tempMessage = {
//         _id: `temp-${Date.now()}-${Math.random()}`,
//         chatRoomId,
//         sender: { _id: userId, name: 'You' },
//         text: input.trim(),
//         createdAt: new Date(),
//       };
//       setMessages((prev) => [...prev, tempMessage]);
//       setSentMessageIds((prev) => new Set(prev).add(tempMessage._id));
//       setInput('');
//     } catch (error) {
//       console.error('Error sending message:', error);
//       showToast({
//         type: 'error',
//         title: 'Error',
//         message: 'Failed to send message.',
//       });
//     }
//   };

//   const loadMoreMessages = () => {
//     if (weekOffset < totalWeeks - 1) {
//       console.log('Load more clicked, fetching week:', weekOffset + 1);
//       fetchMessages(weekOffset + 1);
//     }
//   };

//   const renderItem = ({ item }) => {
//     const isSentByUser = sentMessageIds.has(item._id) || item.sender?._id === userId || item.sender === userId;

//     return (
//       <View
//         className={`max-w-[70%] p-3 my-1 rounded-2xl ${
//           isSentByUser ? 'bg-[#2f2f2f] self-end' : 'bg-gray-700 self-start'
//         }`}
//       >
//         <Text className="text-gray-400 text-xs mb-1">
//           {isSentByUser ? 'You' : item.sender?.name || 'Unknown'}
//         </Text>
//         {item.text && (
//           <Text className="text-white">{item.text}</Text>
//         )}
//         {item.imageUrls?.map((url, index) => (
//           <Image
//             key={`image-${index}`}
//             source={{ uri: url }}
//             className="w-48 h-48 mt-2 rounded-lg"
//             resizeMode="cover"
//           />
//         ))}
//         {item.videoUrls?.map((url, index) => (
//           <TouchableOpacity
//             key={`video-${index}`}
//             onPress={() => Linking.openURL(url)}
//             className="mt-2"
//           >
//             <Video
//               source={{ uri: url }}
//               className="w-48 h-48 rounded-lg"
//               resizeMode="cover"
//               paused
//               posterResizeMode="cover"
//             />
//             <Text className="text-blue-400">Tap to play video</Text>
//           </TouchableOpacity>
//         ))}
//         {item.audioUrl && (
//           <TouchableOpacity
//             onPress={() => Linking.openURL(item.audioUrl)}
//             className="mt-2"
//           >
//             <Text className="text-blue-400">Play Audio</Text>
//           </TouchableOpacity>
//         )}
//         <Text className="text-gray-400 text-xs mt-1 self-end">
//           {new Date(item.createdAt).toLocaleTimeString([], {
//             hour: '2-digit',
//             minute: '2-digit',
//           })}
//         </Text>
//       </View>
//     );
//   };

//   if (loading) {
//     return (
//       <SafeAreaView className="flex-1 bg-black justify-center items-center">
//         <ActivityIndicator size="large" color="#ffffff" />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView className="flex-1 bg-black">
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         className="flex-1"
//         keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
//       >
//         <View className="px-4 pt-12 pb-2 bg-black border-b border-gray-600">
//           <View className="flex-row justify-between items-center">
//             <TouchableOpacity onPress={() => navigation.goBack()}>
//               <FontAwesome name="angle-left" size={24} color="white" />
//             </TouchableOpacity>
//             <Text className="text-white text-xl font-semibold">{roomName || 'Chat'}</Text>
//             <View className="w-6" />
//           </View>
//         </View>
//         <FlatList
//           ref={flatListRef}
//           data={messages}
//           renderItem={renderItem}
//           keyExtractor={(item) => item._id}
//           contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
//           ListHeaderComponent={
//             weekOffset < totalWeeks - 1 ? (
//               <TouchableOpacity
//                 onPress={loadMoreMessages}
//                 className="bg-[#2f2f2f] p-2 rounded-lg mb-4 items-center"
//                 disabled={loadingMore}
//               >
//                 {loadingMore ? (
//                   <ActivityIndicator size="small" color="#ffffff" />
//                 ) : (
//                   <Text className="text-white">Load More</Text>
//                 )}
//               </TouchableOpacity>
//             ) : null
//           }
//           ListEmptyComponent={
//             <Text className="text-gray-400 text-center mt-10">No messages yet</Text>
//           }
//         />
//         {uploading && (
//           <View className="absolute top-0 left-0 right-0 bg-black p-2">
//             <Progress.Bar
//               progress={uploadProgress}
//               width={null}
//               color="#ffffff"
//               borderColor="#888"
//             />
//             <Text className="text-white text-center mt-1">Uploading...</Text>
//           </View>
//         )}
//         <View className="absolute bottom-0 left-0 right-0 bg-black p-3 border-t border-gray-600">
//           <View className="flex-row items-center">
//             <TouchableOpacity
//               onPress={async () => {
//                 const media = await pickImageOrVideo();
//                 if (media.length > 0) {
//                   await uploadFiles(media);
//                 }
//               }}
//               className="bg-[#2f2f2f] p-3 rounded-full mr-2"
//               disabled={uploading}
//             >
//               <FontAwesome name="paperclip" size={20} color="white" />
//             </TouchableOpacity>
//             <TextInput
//               className="flex-1 border rounded-full px-4 py-2 mr-2 bg-[#2f2f2f] text-white border-gray-600"
//               placeholder="Type a message"
//               placeholderTextColor="#888"
//               value={input}
//               onChangeText={setInput}
//             />
//             <TouchableOpacity
//               onPress={sendMessage}
//               className="bg-[#2f2f2f] p-3 rounded-full"
//               disabled={uploading}
//             >
//               <FontAwesome name="paper-plane" size={20} color="white" />
//             </TouchableOpacity>
//           </View>
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }
import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  FlatList,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  StyleSheet,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import io from 'socket.io-client';
import axios from 'axios';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Progress from 'react-native-progress';
import Video from 'react-native-video';
import NetInfo from '@react-native-community/netinfo';
import RNFS from 'react-native-fs';
import { Audio } from 'expo-av';
import { Buffer } from 'buffer';
import { debounce } from 'lodash';
import { API_BASE_URL } from '../utils/config';
import showToast from '../utils/Toast';

export default function Chat() {
  const navigation = useNavigation();
  const route = useRoute();
  const flatListRef = useRef(null);
  const { chatRoomId, roomName } = route.params || {};
  console.log('Chat screen params:', { chatRoomId, roomName });

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [userId, setUserId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [playingVideoUrl, setPlayingVideoUrl] = useState(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [downloadingFileId, setDownloadingFileId] = useState(null);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioPlayback, setAudioPlayback] = useState({});
  const [audioProgress, setAudioProgress] = useState({});

  // Debounced setMessages to prevent rapid updates
  const updateMessages = debounce((newMessages) => {
    setMessages(newMessages);
  }, 100);

  // Initialize WebSocket and fetch messages
  useEffect(() => {
    const init = async () => {
      if (!chatRoomId) {
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Invalid chat room ID.',
          onHide: () => navigation.goBack(),
        });
        return;
      }

      try {
        const token = await AsyncStorage.getItem('jwt_token');
        if (!token) {
          showToast({
            type: 'error',
            title: 'Session Expired',
            message: 'Please log in again.',
            onHide: () => navigation.navigate('Login'),
          });
          return;
        }
        const decoded = jwtDecode(token);
        if (!decoded._id) throw new Error('Invalid token');
        setUserId(decoded._id);

        const newSocket = io(API_BASE_URL.replace('/api', ''), {
          auth: { token },
        });
        setSocket(newSocket);

        newSocket.emit('join_chat', chatRoomId);
        console.log('Joined chat room:', chatRoomId);
        await fetchMessages();
      } catch (error) {
        console.error('Error initializing chat:', error);
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load chat.',
        });
      } finally {
        setLoading(false);
      }
    };
    init();
    return () => {
      if (socket) {
        socket.emit('leave_chat', chatRoomId);
        socket.disconnect();
        console.log('WebSocket disconnected from chat:', chatRoomId);
      }
      // Cleanup audio playback
      Object.values(audioPlayback).forEach(async (sound) => {
        await sound.unloadAsync();
      });
    };
  }, [chatRoomId, navigation]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (!loading && messages.length > 0) {
      setTimeout(() => {
        console.log('Scrolling to bottom:', { messagesLength: messages.length });
        flatListRef.current?.scrollToIndex({
          index: messages.length - 1,
          animated: false,
          viewPosition: 0,
        });
      }, 500);
    }
  }, [loading, messages]);

  // Handle scrollToIndex errors
  const onScrollToIndexFailed = (info) => {
    console.warn('Scroll to index failed:', info);
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 100);
  };

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt_token');
      const res = await axios.get(`${API_BASE_URL}/chat/${chatRoomId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Fetched messages:', res.data.messages.length);
      updateMessages(res.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load messages.',
      });
    }
  };

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    socket.on('new_message', (message) => {
      console.log('Received new_message:', {
        messageId: message._id,
        tempId: message.tempId,
        senderId: message.sender?._id,
        userId,
        hasImageUrls: !!message.imageUrls?.length,
        hasVideoUrls: !!message.videoUrls?.length,
        hasFileUrls: !!message.fileUrls?.length,
        hasFileNames: !!message.fileNames?.length,
      });

      if (!message || !message._id || !message.chatRoomId) {
        console.error('Invalid message received:', message);
        return;
      }

      setMessages((prev) => {
        // Remove any existing message with the same _id or tempId
        const filteredMessages = prev.filter(
          (msg) =>
            msg._id !== message._id &&
            (!message.tempId || msg.tempId !== message.tempId)
        );

        console.log('Adding server-confirmed message:', message._id);
        return [...filteredMessages, message];
      });
    });

    socket.on('error', (error) => {
      showToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to send message.',
      });
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connect_error:', error);
      showToast({
        type: 'error',
        title: 'Connection Error',
        message: 'Failed to connect to chat server.',
      });
    });

    return () => {
      socket.off('connect');
      socket.off('new_message');
      socket.off('error');
      socket.off('connect_error');
    };
  }, [socket, userId]);

  // Pick multiple images or videos from gallery
  const pickImageOrVideo = async () => {
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        showToast({
          type: 'error',
          title: 'No Internet',
          message: 'Please check your internet connection.',
        });
        return [];
      }

      const result = await launchImageLibrary({
        mediaType: 'mixed',
        selectionLimit: 0,
      });
      if (result.didCancel) {
        console.log('Image/Video picking cancelled');
        return [];
      }
      if (result.errorCode) {
        throw new Error(result.errorMessage || 'Failed to pick media');
      }
      console.log('Selected files:', result.assets.length);
      return result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.fileName || `media-${Date.now()}`,
        type: asset.type,
      }));
    } catch (error) {
      console.error('Error picking image/video:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to pick image or video.',
      });
      return [];
    }
  };

  // Capture image or video using camera
  const captureImageOrVideo = async () => {
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        showToast({
          type: 'error',
          title: 'No Internet',
          message: 'Please check your internet connection.',
        });
        return [];
      }

      const result = await launchCamera({
        mediaType: 'mixed',
        videoQuality: 'medium',
      });
      if (result.didCancel) {
        console.log('Camera capture cancelled');
        return [];
      }
      if (result.errorCode) {
        throw new Error(result.errorMessage || 'Failed to capture media');
      }
      console.log('Captured files:', result.assets.length);
      return result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.fileName || `capture-${Date.now()}`,
        type: asset.type,
      }));
    } catch (error) {
      console.error('Error capturing image/video:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to capture image or video.',
      });
      return [];
    }
  };

  // Pick audio files
  const pickAudio = async () => {
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        showToast({
          type: 'error',
          title: 'No Internet',
          message: 'Please check your internet connection.',
        });
        return [];
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/mpeg', 'audio/wav', 'audio/mp4'],
        multiple: true,
        copyToCacheDirectory: true,
      });

      console.log('Audio picker response:', JSON.stringify(result, null, 2));

      if (result.canceled) {
        console.log('Audio picking cancelled');
        return [];
      }

      const files = result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.name || `audio-${Date.now()}.mp3`,
        type: asset.mimeType || 'audio/mpeg',
      }));

      console.log('Selected audio files:', files.map((f) => f.name));
      return files;
    } catch (error) {
      console.error('Error picking audio:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to pick audio file.',
      });
      return [];
    }
  };

  // Pick documents
  const pickDocument = async () => {
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        showToast({
          type: 'error',
          title: 'No Internet',
          message: 'Please check your internet connection.',
        });
        return [];
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        multiple: true,
        copyToCacheDirectory: true,
      });

      console.log('Document picker response:', JSON.stringify(result, null, 2));

      if (result.canceled) {
        console.log('Document picking cancelled');
        return [];
      }

      const files = result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.name || `document-${Date.now()}`,
        type: asset.mimeType || 'application/octet-stream',
      }));

      console.log('Selected document files:', files.map((f) => f.name));
      return files;
    } catch (error) {
      console.error('Error picking document:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to pick document.',
      });
      return [];
    }
  };

  // Start audio recording
  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        showToast({
          type: 'error',
          title: 'Permission Denied',
          message: 'Microphone permission is required to record audio.',
        });
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recording.startAsync();
      setRecording(recording);
      setIsRecording(true);
      console.log('Started recording');
    } catch (error) {
      console.error('Error starting recording:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to start recording.',
      });
    }
  };

  // Stop audio recording
  const stopRecording = async () => {
    try {
      if (!recording) return;
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);
      console.log('Stopped recording, URI:', uri);

      const files = [{
        uri,
        name: `recording-${Date.now()}.m4a`,
        type: 'audio/m4a',
      }];
      await uploadFiles(files);
    } catch (error) {
      console.error('Error stopping recording:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to stop recording.',
      });
    }
  };

  // Play audio
  const playAudio = async (url, messageId, index) => {
    try {
      // Pause any currently playing audio
      Object.entries(audioPlayback).forEach(async ([key, sound]) => {
        if (key !== `${messageId}-${index}`) {
          await sound.pauseAsync();
          await sound.setPositionAsync(0);
        }
      });

      let sound = audioPlayback[`${messageId}-${index}`];
      if (!sound) {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: url },
          { shouldPlay: false },
          (status) => {
            if (status.isLoaded) {
              setAudioProgress((prev) => ({
                ...prev,
                [`${messageId}-${index}`]: status.positionMillis / (status.durationMillis || 1),
              }));
              if (status.didJustFinish) {
                setAudioPlayback((prev) => {
                  const newPlayback = { ...prev };
                  delete newPlayback[`${messageId}-${index}`];
                  return newPlayback;
                });
                setAudioProgress((prev) => ({
                  ...prev,
                  [`${messageId}-${index}`]: 0,
                }));
              }
            }
          }
        );
        sound = newSound;
        setAudioPlayback((prev) => ({ ...prev, [`${messageId}-${index}`]: newSound }));
      }

      await sound.playAsync();
      console.log('Playing audio:', url);
    } catch (error) {
      console.error('Error playing audio:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to play audio.',
      });
    }
  };

  // Pause audio
  const pauseAudio = async (messageId, index) => {
    try {
      const sound = audioPlayback[`${messageId}-${index}`];
      if (sound) {
        await sound.pauseAsync();
        console.log('Paused audio for message:', messageId, 'index:', index);
      }
    } catch (error) {
      console.error('Error pausing audio:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to pause audio.',
      });
    }
  };

  // Convert array buffer to base64
  const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Handle file action (PDF or audio)
  const handleFileAction = async (url, fileName, messageId, index) => {
    try {
      setDownloadingFileId(`${messageId}-${index}`);
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        showToast({
          type: 'error',
          title: 'No Internet',
          message: 'Please check your internet connection.',
        });
        return;
      }

      const isAudio = fileName.match(/\.(mp3|wav|m4a|mp4)$/i) || url.match(/\.mp3|\.wav|\.m4a|\.mp4/i);
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      console.log('Processing file:', { url, filePath, action: isAudio ? 'play audio' : 'open document' });

      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const base64Data = arrayBufferToBase64(response.data);
      await FileSystem.writeAsStringAsync(filePath, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (isAudio) {
        await playAudio(filePath, messageId, index);
      } else {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(filePath, {
            mimeType: fileName.endsWith('.pdf') ? 'application/pdf' : 'application/msword',
            dialogTitle: `Open ${fileName}`,
          });
          console.log('Document opened:', filePath);
        } else {
          showToast({
            type: 'success',
            title: 'Success',
            message: `Document saved to ${fileName}`,
          });
        }
      }
    } catch (error) {
      console.error('File action error:', error);
      let errorMessage = `Failed to ${fileName.match(/\.(mp3|wav|m4a|mp4)$/i) ? 'play audio' : 'open document'}.`;
      if (error.response) {
        try {
          const text = new TextDecoder('utf-8').decode(new Uint8Array(error.response.data));
          const json = JSON.parse(text);
          errorMessage = json.message || errorMessage;
        } catch (e) {
          // Fallback to default message
        }
      }
      showToast({
        type: 'error',
        title: 'Error',
        message: errorMessage,
      });
    } finally {
      setDownloadingFileId(null);
    }
  };

  // Upload files as Base64
  const uploadFiles = async (files) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      const token = await AsyncStorage.getItem('jwt_token');
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      console.log('Uploading files:', files.map((f) => f.name));

      const images = files.filter((f) => f.type.includes('image'));
      const videos = files.filter((f) => f.type.includes('video'));
      const documents = files.filter((f) => f.type.includes('pdf') || f.type.includes('msword') || f.type.includes('officedocument') || f.type.includes('audio'));

      const presignPayload = {
        chatRoomId,
        sender: userId,
        images: images.map((i) => ({ name: i.name, mimeType: i.type })),
        videos: videos.map((v) => ({ name: v.name, mimeType: v.type })),
        files: documents.map((d) => ({ name: d.name, mimeType: d.type })),
        tempId,
      };
      console.log('Presigned URL request payload:', JSON.stringify(presignPayload, null, 2));

      const presignRes = await axios.post(
        `${API_BASE_URL}/message/presigned-urls`,
        presignPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { imageUrls, videoUrls, fileUrls } = presignRes.data;
      console.log('Presigned URLs:', { imageUrls, videoUrls, fileUrls });

      if (documents.length > 0 && (!fileUrls || fileUrls.length === 0)) {
        console.warn('No presigned URLs for files:', documents.map((d) => d.name));
        showToast({
          type: 'error',
          title: 'Upload Error',
          message: 'Server did not provide URLs for file uploads.',
        });
        return;
      }

      const uploaded = [];
      const totalFiles = files.length;
      let processedFiles = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Processing file: ${file.name} (${file.type})`);
        let presignedUrlData;
        if (file.type.includes('image')) {
          presignedUrlData = imageUrls.shift();
        } else if (file.type.includes('video')) {
          presignedUrlData = videoUrls.shift();
        } else {
          presignedUrlData = fileUrls.shift();
        }
        if (!presignedUrlData) {
          console.warn(`Skipping file due to missing presigned URL: ${file.name}`);
          continue;
        }

        const { url, key } = presignedUrlData;
        const base64 = await RNFS.readFile(file.uri, 'base64');
        console.log(`Base64 encoded for ${file.name}, length: ${base64.length}`);
        const buffer = Buffer.from(base64, 'base64');

        await axios.put(url, buffer, {
          headers: {
            'Content-Type': file.type,
            'Content-Encoding': 'base64',
          },
          onUploadProgress: (progressEvent) => {
            const progress = (progressEvent.loaded / progressEvent.total) * (1 / totalFiles);
            setUploadProgress((prev) => Math.min(prev + progress, 1));
            console.log(`Progress [${file.name}]: ${(progress * 100).toFixed(2)}%`);
          },
        });
        console.log(`Uploaded ${file.name} to S3: ${key}`);
        uploaded.push({ key, name: file.name });
        processedFiles += 1;
        setUploadProgress(processedFiles / totalFiles);
      }

      if (uploaded.length === 0) {
        console.warn('No files uploaded successfully');
        showToast({
          type: 'error',
          title: 'Upload Error',
          message: 'No files were uploaded due to missing server URLs.',
        });
        return;
      }

      const payload = {
        chatRoomId,
        sender: userId,
        text: input.trim() || undefined,
        imageUrls: uploaded.filter((_, i) => files[i].type.includes('image')).map((f) => f.key),
        videoUrls: uploaded.filter((_, i) => files[i].type.includes('video')).map((f) => f.key),
        fileUrls: uploaded.filter((_, i) => !files[i].type.includes('image') && !files[i].type.includes('video')).map((f) => f.key),
        fileNames: uploaded.filter((_, i) => !files[i].type.includes('image') && !files[i].type.includes('video')).map((f) => f.name),
        tempId,
      };

      console.log('Emitting send_message with payload:', JSON.stringify(payload, null, 2));
      socket.emit('send_message', payload);
      setInput('');
    } catch (error) {
      console.error('Error uploading files:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to upload files.',
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() && !uploading) {
      const files = await pickImageOrVideo();
      if (files.length > 0) await uploadFiles(files);
      return;
    }
    if (!input.trim()) return;

    try {
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      const payload = {
        chatRoomId,
        sender: userId,
        text: input.trim(),
        tempId,
      };
      console.log('Sending text message:', { tempId });
      socket.emit('send_message', payload);
      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to send message.',
      });
    }
  };

  const renderItem = ({ item }) => {
    const isSentByUser = item.sender?._id === userId || item.sender === userId;

    return (
      <View
        style={{
          alignSelf: isSentByUser ? 'flex-end' : 'flex-start',
          backgroundColor: isSentByUser ? '#2f2f2f' : '#444',
          borderRadius: 12,
          padding: 8,
          marginBottom: 8,
          maxWidth: '75%',
        }}
      >
        <Text style={{ color: '#ccc', fontSize: 12 }}>
          {isSentByUser ? 'You' : item.sender?.name || 'Unknown'}
        </Text>
        {item.text && <Text style={{ color: '#fff' }}>{item.text}</Text>}
        {(item.imageUrls || []).map((url, i) => (
          <TouchableOpacity
            key={`image-${i}`}
            onPress={() => {
              console.log('Opening full-screen image:', url);
              setSelectedImageUrl(url);
            }}
            style={{ marginTop: 6 }}
          >
            <Image
              source={{ uri: url }}
              style={{ width: 200, height: 200, borderRadius: 8 }}
              resizeMode="cover"
            />
            <Text style={{ color: '#ccc', fontSize: 10 }}>Tap to view full image</Text>
          </TouchableOpacity>
        ))}
        {(item.videoUrls || []).map((url, i) => (
          <TouchableOpacity
            key={`video-${i}`}
            onPress={() => setPlayingVideoUrl(url)}
            style={{ marginTop: 6 }}
          >
            <Video
              source={{ uri: url }}
              paused={playingVideoUrl !== url}
              resizeMode="contain"
              controls
              style={{ width: 250, height: 200, borderRadius: 8 }}
              onFullscreenPlayerDidDismiss={() => setPlayingVideoUrl(null)}
              controlTimeout={1500}
            />
            <Text style={{ color: '#ccc', fontSize: 10 }}>Tap to play video</Text>
          </TouchableOpacity>
        ))}
        {(item.fileUrls || []).map((url, i) => {
          const fileName = item.fileNames?.[i] || `document-${i + 1}`;
          const isAudio = fileName.match(/\.(mp3|wav|m4a|mp4)$/i) || url.match(/\.mp3|\.wav|\.m4a|\.mp4/i);
          return (
            <TouchableOpacity
              key={`file-${i}`}
              onPress={() => handleFileAction(url, fileName, item._id, i)}
              disabled={downloadingFileId === `${item._id}-${i}`}
              style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center' }}
            >
              {isAudio ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity
                    onPress={() => (audioPlayback[`${item._id}-${i}`] ? pauseAudio(item._id, i) : playAudio(url, item._id, i))}
                    style={{ marginRight: 8 }}
                    disabled={downloadingFileId === `${item._id}-${i}`}
                  >
                    <FontAwesome
                      name={audioPlayback[`${item._id}-${i}`] ? 'pause' : 'play'}
                      size={24}
                      color="#fff"
                    />
                  </TouchableOpacity>
                  <Progress.Bar
                    progress={audioProgress[`${item._id}-${i}`] || 0}
                    width={200}
                    color="#1e90ff"
                    borderColor="#555"
                  />
                </View>
              ) : (
                <>
                  {downloadingFileId === `${item._id}-${i}` ? (
                    <ActivityIndicator size="small" color="#1e90ff" style={{ marginRight: 8 }} />
                  ) : (
                    <FontAwesome name="file-pdf-o" size={20} color="#1e90ff" style={{ marginRight: 8 }} />
                  )}
                  <Text style={{ color: '#1e90ff' }}>
                    {item.fileNames?.[i] || `Document ${i + 1}`}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          );
        })}
        <Text style={{ color: '#ccc', fontSize: 10, alignSelf: 'flex-end', marginTop: 4 }}>
          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
        onScrollToIndexFailed={onScrollToIndexFailed}
      />
      {uploading && (
        <View style={{ position: 'absolute', top: 0, width: '100%', padding: 10, backgroundColor: '#000' }}>
          <Progress.Bar progress={uploadProgress} width={null} color="#fff" borderColor="#555" />
          <Text style={{ color: '#fff', textAlign: 'center', marginTop: 4 }}>Uploading...</Text>
        </View>
      )}
      <Modal
        visible={!!selectedImageUrl}
        transparent={false}
        animationType="fade"
        onRequestClose={() => {
          console.log('Closing full-screen image');
          setSelectedImageUrl(null);
        }}
      >
        <View style={styles.fullScreenImageContainer}>
          <Image
            source={{ uri: selectedImageUrl }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              console.log('Closing full-screen image');
              setSelectedImageUrl(null);
            }}
          >
            <FontAwesome name="times" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10, backgroundColor: '#000' }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={async () => {
              const files = await pickImageOrVideo();
              if (files.length > 0) await uploadFiles(files);
            }}
            style={{ marginRight: 8 }}
            disabled={uploading || isRecording}
          >
            <FontAwesome name="paperclip" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              const files = await captureImageOrVideo();
              if (files.length > 0) await uploadFiles(files);
            }}
            style={{ marginRight: 8 }}
            disabled={uploading || isRecording}
          >
            <FontAwesome name="camera" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              const files = await pickDocument();
              if (files.length > 0) await uploadFiles(files);
            }}
            style={{ marginRight: 8 }}
            disabled={uploading || isRecording}
          >
            <FontAwesome name="file" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              const files = await pickAudio();
              if (files.length > 0) await uploadFiles(files);
            }}
            style={{ marginRight: 8 }}
            disabled={uploading || isRecording}
          >
            <FontAwesome name="music" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={isRecording ? stopRecording : startRecording}
            style={{ marginRight: 8 }}
            disabled={uploading}
          >
            <FontAwesome name={isRecording ? 'stop' : 'microphone'} size={20} color={isRecording ? 'red' : 'white'} />
          </TouchableOpacity>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type a message"
            placeholderTextColor="#888"
            style={{
              flex: 1,
              color: 'white',
              borderWidth: 1,
              borderColor: '#555',
              borderRadius: 20,
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}
            editable={!uploading && !isRecording}
          />
          <TouchableOpacity onPress={sendMessage} style={{ marginLeft: 8 }} disabled={uploading || isRecording}>
            <FontAwesome name="paper-plane" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fullScreenImageContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 10,
  },
});
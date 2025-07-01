// import React, { useState } from "react";
// import {
//   SafeAreaView,
//   FlatList,
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
// } from "react-native";

// const initialMessages = [
//   { id: "1", text: "Hello!", sender: "other" },
//   { id: "2", text: "Hi, how can I help you today?", sender: "me" },
// ];

// export default function Chat() {
//   const [messages, setMessages] = useState(initialMessages);
//   const [input, setInput] = useState("");

//   const sendMessage = () => {
//     if (!input.trim()) return;
//     const newMsg = {
//       id: Date.now().toString(),
//       text: input.trim(),
//       sender: "me",
//     };
//     setMessages((prev) => [...prev, newMsg]);
//     setInput("");
//   };

//   const renderItem = ({ item }) => (
//     <View
//       className={`max-w-3/4 p-2 my-1 rounded-lg ${
//         item.sender === "me" ? "bg-blue-500 self-end" : "bg-gray-200 self-start"
//       }`}
//     >
//       <Text className={`${item.sender === "me" ? "text-white" : "text-black"}`}>
//         {item.text}
//       </Text>
//     </View>
//   );

//   return (
//     <SafeAreaView className="flex-1 bg-white">
//       <FlatList
//         data={messages}
//         renderItem={renderItem}
//         keyExtractor={(item) => item.id}
//         contentContainerStyle={{ padding: 12 }}
//       />

//       <View className="flex-row items-center p-2 border-t border-gray-200 mb-44">
//         <TextInput
//           className="flex-1 border rounded-full px-4 py-2 mr-2 bg-gray-100"
//           placeholder="Type a message"
//           value={input}
//           onChangeText={setInput}
//         />
//         <TouchableOpacity
//           onPress={sendMessage}
//           className="bg-blue-500 p-3 rounded-full"
//         >
//           <Text className="text-white font-medium">Send</Text>
//         </TouchableOpacity>
//       </View>
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
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import io from 'socket.io-client';
import axios from 'axios';
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
  const [weekOffset, setWeekOffset] = useState(0);
  const [totalWeeks, setTotalWeeks] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sentMessageIds, setSentMessageIds] = useState(new Set());

  // Initialize WebSocket and fetch messages
  useEffect(() => {
    const initialize = async () => {
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

        // Initialize WebSocket
        const newSocket = io(API_BASE_URL.replace('/api', ''), {
          auth: { token },
        });
        setSocket(newSocket);

        // Join chat room
        newSocket.emit('join_chat', chatRoomId);
        console.log('Joined chat room:', chatRoomId);

        // Fetch initial messages (week 0)
        await fetchMessages(0);
      } catch (error) {
        console.error('Error initializing chat:', error);
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load chat messages.',
        });
      } finally {
        setLoading(false);
      }
    };
    initialize();

    return () => {
      if (socket) {
        socket.emit('leave_chat', chatRoomId);
        socket.disconnect();
        console.log('WebSocket disconnected from chat:', chatRoomId);
      }
    };
  }, [chatRoomId, navigation]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (!loading && messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: false });
    }
  }, [loading, messages]);

  // Fetch messages for a specific week
  const fetchMessages = async (week) => {
    try {
      setLoadingMore(true);
      const token = await AsyncStorage.getItem('jwt_token');
      const response = await axios.get(
        `${API_BASE_URL}/chat/${chatRoomId}/messages?week=${week}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(`Messages response for week ${week}:`, JSON.stringify(response.data, null, 2));
      setMessages((prev) => {
        const existingIds = new Set(prev.map((msg) => msg._id));
        const newMessages = response.data.messages.filter((msg) => !existingIds.has(msg._id));
        return [...newMessages, ...prev];
      });
      setTotalWeeks(response.data.totalWeeks || 0);
      setWeekOffset(week);
    } catch (error) {
      console.error(`Error fetching messages for week ${week}:`, error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load older messages.',
      });
    } finally {
      setLoadingMore(false);
    }
  };

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    socket.on('new_message', (message) => {
      console.log('Received new_message in Chat:', JSON.stringify(message, null, 2));
      if (!message || !message.chatRoomId) {
        console.error('Invalid message received:', message);
        return;
      }
      setMessages((prev) => {
        if (prev.some((msg) => msg._id === message._id)) {
          console.log('Duplicate message ignored:', message._id);
          return prev;
        }
        const tempMessage = prev.find(
          (msg) =>
            msg._id.startsWith('temp-') &&
            msg.text === message.text &&
            msg.chatRoomId === message.chatRoomId
        );
        if (tempMessage) {
          console.log('Replacing temp message:', tempMessage._id, 'with:', message._id);
          setSentMessageIds((prevIds) => {
            const newIds = new Set(prevIds);
            newIds.delete(tempMessage._id);
            return newIds;
          });
          return [...prev.filter((msg) => msg._id !== tempMessage._id), message];
        }
        return [...prev, message];
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
      console.error('WebSocket connect error:', error);
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
  }, [socket]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    try {
      const token = await AsyncStorage.getItem('jwt_token');
      const payload = {
        chatRoomId,
        sender: userId,
        text: input.trim(),
      };
      socket.emit('send_message', payload);
      const tempMessage = {
        _id: `temp-${Date.now()}-${Math.random()}`,
        chatRoomId,
        sender: { _id: userId, name: 'You' },
        text: input.trim(),
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, tempMessage]);
      setSentMessageIds((prev) => new Set(prev).add(tempMessage._id));
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

  const loadMoreMessages = () => {
    if (weekOffset < totalWeeks - 1) {
      console.log('Load more clicked, fetching week:', weekOffset + 1);
      fetchMessages(weekOffset + 1);
    }
  };

  const renderItem = ({ item }) => {
    const isSentByUser = sentMessageIds.has(item._id) || item.sender?._id === userId || item.sender === userId;

    return (
      <View
        className={`max-w-[70%] p-3 my-1 rounded-2xl ${
          isSentByUser ? 'bg-[#2f2f2f] self-end' : 'bg-gray-700 self-start'
        }`}
      >
        <Text className="text-gray-400 text-xs mb-1">
          {isSentByUser ? 'You' : item.sender?.name || 'Unknown'}
        </Text>
        {item.text && (
          <Text className="text-white">{item.text}</Text>
        )}
        {item.imageUrls?.map((url, index) => (
          <Image
            key={`image-${index}`}
            source={{ uri: url }}
            className="w-48 h-48 mt-2 rounded-lg"
            resizeMode="cover"
          />
        ))}
        {item.videoUrls?.map((url, index) => (
          <Text key={`video-${index}`} className="text-blue-400 mt-2">
            Video: {url}
          </Text>
        ))}
        {item.fileUrls?.map((url, index) => (
          <Text key={`file-${index}`} className="text-blue-400 mt-2">
            File: {item.fileNames?.[index] || url}
          </Text>
        ))}
        {item.audioUrl && (
          <Text className="text-blue-400 mt-2">Audio: {item.audioUrl}</Text>
        )}
        <Text className="text-gray-400 text-xs mt-1 self-end">
          {new Date(item.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <View className="px-4 pt-12 pb-2 bg-black border-b border-gray-600">
          <View className="flex-row justify-between items-center">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <FontAwesome name="angle-left" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-semibold">{roomName || 'Chat'}</Text>
            <View className="w-6" />
          </View>
        </View>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
          ListHeaderComponent={
            weekOffset < totalWeeks - 1 ? (
              <TouchableOpacity
                onPress={loadMoreMessages}
                className="bg-[#2f2f2f] p-2 rounded-lg mb-4 items-center"
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-white">Load More</Text>
                )}
              </TouchableOpacity>
            ) : null
          }
          ListEmptyComponent={
            <Text className="text-gray-400 text-center mt-10">No messages yet</Text>
          }
        />
        <View className="absolute bottom-0 left-0 right-0 bg-black p-3 border-t border-gray-600">
          <View className="flex-row items-center">
            <TextInput
              className="flex-1 border rounded-full px-4 py-2 mr-2 bg-[#2f2f2f] text-white border-gray-600"
              placeholder="Type a message"
              placeholderTextColor="#888"
              value={input}
              onChangeText={setInput}
            />
            <TouchableOpacity
              onPress={sendMessage}
              className="bg-[#2f2f2f] p-3 rounded-full"
            >
              <FontAwesome name="paper-plane" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
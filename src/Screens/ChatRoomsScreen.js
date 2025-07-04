import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import io from 'socket.io-client';
import { API_BASE_URL } from '../utils/config';
import showToast from '../utils/Toast';

export default function ChatRoomsScreen() {
  const navigation = useNavigation();
  const [userId, setUserId] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  // Fetch user details and initialize WebSocket
  useEffect(() => {
    const initialize = async () => {
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

        // Fetch chat rooms
        const response = await axios.get(
          `${API_BASE_URL}/chat/chat-rooms/${decoded._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Chat rooms response:', JSON.stringify(response.data, null, 2));
        const sortedRooms = response.data.sort((a, b) =>
          b.lastMessage?.createdAt
            ? new Date(b.lastMessage.createdAt) - new Date(a.lastMessage?.createdAt || a.createdAt)
            : new Date(b.createdAt) - new Date(a.createdAt)
        );
        setChatRooms(sortedRooms);

        // Join all user chat rooms
        sortedRooms.forEach((room) => {
          newSocket.emit('join_chat', room._id);
          console.log('Joined room:', room._id);
        });
      } catch (error) {
        console.error('Error fetching chat rooms:', error);
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load chat rooms.',
        });
      } finally {
        setLoading(false);
      }
    };
    initialize();

    return () => {
      if (socket) {
        socket.disconnect();
        console.log('WebSocket disconnected');
      }
    };
  }, [navigation]);

  // Listen for new messages
  useEffect(() => {
    if (!socket || !userId) return;

    socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    socket.on('new_message', (message) => {
      console.log('Received new_message:', JSON.stringify(message, null, 2));
      if (!message || !message.chatRoomId) {
        console.error('Invalid message received:', message);
        return;
      }
      setChatRooms((prev) => {
        const updatedRooms = [...prev];
        const roomIndex = updatedRooms.findIndex(
          (room) => room._id === message.chatRoomId
        );
        if (roomIndex !== -1) {
          console.log('Updating room:', message.chatRoomId);
          updatedRooms[roomIndex] = {
            ...updatedRooms[roomIndex],
            lastMessage: {
              ...message,
              createdAt: new Date(message.createdAt), // Ensure date is parsed
            },
          };
          const [room] = updatedRooms.splice(roomIndex, 1);
          updatedRooms.unshift(room);
        } else {
          console.warn('Room not found for message:', message.chatRoomId);
        }
        return updatedRooms;
      });
    });

    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'WebSocket error.',
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
  }, [socket, userId]);

  const renderChatRoom = ({ item: room }) => (
    <TouchableOpacity
      className="bg-[#2f2f2f] p-4 rounded-xl mb-2 flex-row items-center"
      activeOpacity={0.7}
      style={{ zIndex: 1 }}
      onPress={() => {
        console.log('Clicked chat room:', { chatRoomId: room._id, roomName: room.name });
        try {
          navigation.getParent().navigate('Chat', {
            chatRoomId: room._id,
            roomName: room.name || 'Chat Room',
          });
        } catch (error) {
          console.error('Navigation error:', error);
          showToast({
            type: 'error',
            title: 'Navigation Error',
            message: 'Failed to open chat.',
          });
        }
      }}
    >
      <View className="w-12 h-12 rounded-full bg-gray-500 justify-center items-center mr-4">
        <FontAwesome name="comments" size={24} color="white" />
      </View>
      <View className="flex-1">
        <Text className="text-white text-base font-semibold">
          {room.name || 'Chat Room'}
        </Text>
        <Text className="text-gray-400 text-sm">
          {room.lastMessage
            ? room.lastMessage.text || 'Media message'
            : 'No messages yet'}
        </Text>
      </View>
      <Text className="text-gray-400 text-xs">
        {room.lastMessage?.createdAt
          ? new Date(room.lastMessage.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
          : new Date(room.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="px-4 pt-12">
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <FontAwesome name="angle-left" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-semibold">Chat Rooms</Text>
          <View className="w-6" />
        </View>
        <FlatList
          data={chatRooms}
          renderItem={renderChatRoom}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={
            <Text className="text-white text-center mt-10">No chat rooms found.</Text>
          }
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>
    </SafeAreaView>
  );
}
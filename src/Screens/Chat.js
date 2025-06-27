import React, { useState } from "react";
import {
  SafeAreaView,
  FlatList,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";

const initialMessages = [
  { id: "1", text: "Hello!", sender: "other" },
  { id: "2", text: "Hi, how can I help you today?", sender: "me" },
];

export default function Chat() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: "me",
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
  };

  const renderItem = ({ item }) => (
    <View
      className={`max-w-3/4 p-2 my-1 rounded-lg ${
        item.sender === "me" ? "bg-blue-500 self-end" : "bg-gray-200 self-start"
      }`}
    >
      <Text className={`${item.sender === "me" ? "text-white" : "text-black"}`}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12 }}
      />

      <View className="flex-row items-center p-2 border-t border-gray-200 mb-44">
        <TextInput
          className="flex-1 border rounded-full px-4 py-2 mr-2 bg-gray-100"
          placeholder="Type a message"
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity
          onPress={sendMessage}
          className="bg-blue-500 p-3 rounded-full"
        >
          <Text className="text-white font-medium">Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
// import React, { useState, useEffect } from 'react';
// import {
//   SafeAreaView,
//   FlatList,
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Image,
// } from 'react-native';
// import { FontAwesome } from '@expo/vector-icons';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { jwtDecode } from 'jwt-decode';
// import io from 'socket.io-client';
// import axios from 'axios';
// import { API_BASE_URL } from '../utils/config';
// import showToast from '../utils/Toast';

// export default function Chat() {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const { chatRoomId, roomName } = route.params;
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');
//   const [userId, setUserId] = useState(null);
//   const [socket, setSocket] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Initialize WebSocket and fetch messages
//   useEffect(() => {
//     const initialize = async () => {
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

//         // Fetch existing messages
//         const response = await axios.get(
//           `${API_BASE_URL}/chat/${chatRoomId}/messages?week=0`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         setMessages(response.data.messages);
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
//       }
//     };
//   }, [chatRoomId, navigation]);

//   // Listen for new messages
//   useEffect(() => {
//     if (!socket) return;

//     socket.on('new_message', (message) => {
//       setMessages((prev) => [...prev, message]);
//     });

//     socket.on('error', (error) => {
//       showToast({
//         type: 'error',
//         title: 'Error',
//         message: error.message || 'Failed to send message.',
//       });
//     });

//     return () => {
//       socket.off('new_message');
//       socket.off('error');
//     };
//   }, [socket]);

//   const sendMessage = async () => {
//     if (!input.trim()) return;

//     try {
//       const token = await AsyncStorage.getItem('jwt_token');
//       const payload = {
//         chatRoomId,
//         sender: userId,
//         text: input.trim(),
//       };
//       socket.emit('send_message', payload);
//       setInput('');
//     } catch (error) {
//       showToast({
//         type: 'error',
//         title: 'Error',
//         message: 'Failed to send message.',
//       });
//     }
//   };

//   const renderItem = ({ item }) => (
//     <View
//       className={`max-w-3/4 p-2 my-1 rounded-lg ${
//         item.sender._id === userId
//           ? 'bg-blue-500 self-end'
//           : 'bg-gray-200 self-start'
//       }`}
//     >
//       <Text className="text-gray-600 text-xs">{item.sender.name}</Text>
//       {item.text && (
//         <Text className={`${item.sender._id === userId ? 'text-white' : 'text-black'}`}>
//           {item.text}
//         </Text>
//       )}
//       {item.imageUrls?.map((url, index) => (
//         <Image
//           key={`image-${index}`}
//           source={{ uri: url }}
//           className="w-40 h-40 mt-2 rounded-lg"
//           resizeMode="cover"
//         />
//       ))}
//       {item.videoUrls?.map((url, index) => (
//         <Text key={`video-${index}`} className="text-blue-500 mt-2">
//           Video: {url}
//         </Text>
//       ))}
//       {item.fileUrls?.map((url, index) => (
//         <Text key={`file-${index}`} className="text-blue-500 mt-2">
//           File: {item.fileNames?.[index] || url}
//         </Text>
//       ))}
//       {item.audioUrl && (
//         <Text className="text-blue-500 mt-2">Audio: {item.audioUrl}</Text>
//       )}
//     </View>
//   );

//   if (loading) {
//     return (
//       <SafeAreaView className="flex-1 bg-black justify-center items-center">
//         <ActivityIndicator size="large" color="#ffffff" />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView className="flex-1 bg-black">
//       <View className="px-4 pt-12">
//         <View className="flex-row justify-between items-center mb-6">
//           <TouchableOpacity onPress={() => navigation.goBack()}>
//             <FontAwesome name="angle-left" size={24} color="white" />
//           </TouchableOpacity>
//           <Text className="text-white text-xl font-semibold">{roomName}</Text>
//           <View className="w-6" />
//         </View>
//         <FlatList
//           data={messages}
//           renderItem={renderItem}
//           keyExtractor={(item) => item._id}
//           contentContainerStyle={{ padding: 12 }}
//         />
//         <View className="flex-row items-center p-2 border-t border-gray-600">
//           <TextInput
//             className="flex-1 border rounded-full px-4 py-2 mr-2 bg-gray-800 text-white"
//             placeholder="Type a message"
//             placeholderTextColor="#888"
//             value={input}
//             onChangeText={setInput}
//           />
//           <TouchableOpacity
//             onPress={sendMessage}
//             className="bg-blue-500 p-3 rounded-full"
//           >
//             <Text className="text-white font-medium">Send</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// }
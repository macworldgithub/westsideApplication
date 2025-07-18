
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
// } from 'react-native';
// import { FontAwesome } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { jwtDecode } from 'jwt-decode';
// import io from 'socket.io-client';
// import { API_BASE_URL } from '../utils/config';
// import showToast from '../utils/Toast';

// export default function Login({ onLogin }) {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [rememberMe, setRememberMe] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const navigation = useNavigation();

//   const handleSignIn = async () => {
//     if (!email.trim() || !password.trim()) {
//       showToast({
//         type: 'error',
//         title: 'Missing Fields',
//         message: 'Please enter both Email and Password.',
//       });    
//       return;
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       showToast({
//         type: 'error',
//         title: 'Error',
//         message: 'Please enter a valid email address.',
//       });    
//       return;
//     }

//     try {
//       const response = await axios.post(`${API_BASE_URL}/auth/login`, {
//         email,
//         password,
//       });
      
//       const { token, name } = response.data.credentials;

//       await AsyncStorage.setItem('jwt_token', token);
//       await AsyncStorage.setItem('user_name', name);

//       const decoded = jwtDecode(token);
//       const userId = decoded._id;
//       const socket = io(API_BASE_URL.replace('/api', ''), {
//         auth: { token },
//       });

//       try {
//         const chatRoomsResponse = await axios.get(
//           `${API_BASE_URL}/chat/chat-rooms/${userId}`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         const chatRooms = chatRoomsResponse.data;
//         chatRooms.forEach((room) => {
//           socket.emit('join_chat', room._id);
//         });
//       } catch (error) {
//         console.error('Error joining chat rooms:', error);
//         showToast({
//           type: 'error',
//           title: 'Error',
//           message: 'Failed to join chat rooms.',
//         });
//       }

//       if (onLogin) {
//         onLogin(token);
//       }

//       showToast({
//         type: 'success',
//         title: 'Success',
//         message: 'Logged in successfully!',
//       });    
//     } catch (error) {
//       const errorMessage =
//         error.response?.data?.message || 'Invalid credentials. Please try again.';
//       showToast({
//         type: 'error',
//         title: 'Login Failed',
//         message: errorMessage,
//       });    
//     }
//   };

//   const handleForgotPassword = () => {
//     navigation.navigate('ForgotPassword');
//   };

//   return (
//     <View className="flex-1 bg-black justify-center px-6 -mt-32">
//       <Text className="text-white text-4xl font-bold text-center mb-20">Sign In</Text>

//       <View className="flex-row items-center bg-black border border-gray-600 rounded-md px-3 py-2 mb-4">
//         <FontAwesome name="envelope" size={20} color="white" style={{ marginRight: 8 }} />
//         <TextInput
//           className="flex-1 text-white"
//           placeholder="Enter email"
//           placeholderTextColor="#888"
//           value={email}
//           onChangeText={setEmail}
//           keyboardType="email-address"
//           autoCapitalize="none"
//         />
//       </View>

//       <View className="flex-row items-center bg-black border border-gray-600 rounded-md px-3 py-2 mb-4">
//         <FontAwesome name="lock" size={20} color="white" style={{ marginRight: 8 }} />
//         <TextInput
//           className="flex-1 text-white"
//           placeholder="Password"
//           placeholderTextColor="#888"
//           secureTextEntry={!showPassword}
//           value={password}
//           onChangeText={setPassword}
//         />
//         <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
//           <FontAwesome
//             name={showPassword ? 'eye-slash' : 'eye'}
//             size={20}
//             color="white"
//           />
//         </TouchableOpacity>
//       </View>

//       <View className="flex-row justify-between items-center mb-6">
//         <TouchableOpacity
//           className="flex-row items-center"
//           onPress={() => setRememberMe(!rememberMe)}
//         >
//           <FontAwesome
//             name={rememberMe ? 'check-square' : 'square-o'}
//             size={20}
//             color="white"
//           />
//           <Text className="text-white ml-2">Remember me</Text>
//         </TouchableOpacity>

//         <TouchableOpacity onPress={handleForgotPassword}>
//           <Text className="text-white font-semibold">Forgot Password</Text>
//         </TouchableOpacity>
//       </View>

//       <TouchableOpacity
//         className="bg-[#666666] py-3 rounded-md"
//         onPress={handleSignIn}
//       >
//         <Text className="text-white text-center text-lg font-semibold">Sign In</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import io from 'socket.io-client';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, getToken, deleteToken } from '@react-native-firebase/messaging';
import { API_BASE_URL } from '../utils/config';
import showToast from '../utils/Toast';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();

  const sendFcmTokenToBackend = async (fcmToken, jwtToken) => {
    try {
      await axios.post(
        `${API_BASE_URL}/notifications/register-token`,
        { fcmToken },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      console.log('FCM token sent to backend successfully');
    } catch (error) {
      console.error('Error sending FCM token to backend:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to register FCM token.',
      });
    }
  };

  const handleFcmToken = async (jwtToken) => {
    try {
      const app = getApp();
      const messaging = getMessaging(app);

      // Delete the existing token
      const currentToken = await getToken(messaging);
      if (currentToken) {
        await deleteToken(messaging);
        console.log('🗑️ Old FCM token deleted');
      }

      // Get new token
      const newToken = await getToken(messaging, true); // `true` forces refresh
      console.log('🔥 New FCM Token:', newToken);
      await sendFcmTokenToBackend(newToken, jwtToken);
    } catch (error) {
      console.error('❌ Error handling FCM token:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to handle FCM token.',
      });
    }
  };

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      showToast({
        type: 'error',
        title: 'Missing Fields',
        message: 'Please enter both Email and Password.',
      });    
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Please enter a valid email address.',
      });    
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });
      
      const { token, name } = response.data.credentials;

      await AsyncStorage.setItem('jwt_token', token);
      await AsyncStorage.setItem('user_name', name);

      // Handle FCM token deletion and generation
      await handleFcmToken(token);

      const decoded = jwtDecode(token);
      const userId = decoded._id;
      const socket = io(API_BASE_URL.replace('/api', ''), {
        auth: { token },
      });

      try {
        const chatRoomsResponse = await axios.get(
          `${API_BASE_URL}/chat/chat-rooms/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const chatRooms = chatRoomsResponse.data;
        chatRooms.forEach((room) => {
          socket.emit('join_chat', room._id);
        });
      } catch (error) {
        console.error('Error joining chat rooms:', error);
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to join chat rooms.',
        });
      }

      if (onLogin) {
        onLogin(token);
      }

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Logged in successfully!',
      });    
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Invalid credentials. Please try again.';
      showToast({
        type: 'error',
        title: 'Login Failed',
        message: errorMessage,
      });    
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <View className="flex-1 bg-black justify-center px-6 -mt-32">
      <Text className="text-white text-4xl font-bold text-center mb-20">Sign In</Text>

      <View className="flex-row items-center bg-black border border-gray-600 rounded-md px-3 py-2 mb-4">
        <FontAwesome name="envelope" size={20} color="white" style={{ marginRight: 8 }} />
        <TextInput
          className="flex-1 text-white"
          placeholder="Enter email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View className="flex-row items-center bg-black border border-gray-600 rounded-md px-3 py-2 mb-4">
        <FontAwesome name="lock" size={20} color="white" style={{ marginRight: 8 }} />
        <TextInput
          className="flex-1 text-white"
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <FontAwesome
            name={showPassword ? 'eye-slash' : 'eye'}
            size={20}
            color="white"
          />
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-between items-center mb-6">
        <TouchableOpacity
          className="flex-row items-center"
          onPress={() => setRememberMe(!rememberMe)}
        >
          <FontAwesome
            name={rememberMe ? 'check-square' : 'square-o'}
            size={20}
            color="white"
          />
          <Text className="text-white ml-2">Remember me</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleForgotPassword}>
          <Text className="text-white font-semibold">Forgot Password</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className="bg-[#666666] py-3 rounded-md"
        onPress={handleSignIn}
      >
        <Text className="text-white text-center text-lg font-semibold">Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}
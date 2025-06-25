import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../utils/config';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();

  const handleSignIn = async () => {
    // Validate inputs
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter both Email and Password.');
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    try {
      // Make login request to backend using API_BASE_URL
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });
      console.log(response);
      // Extract token and name from response
      console.log(response.data);      
      const { token, name } = response.data.credentials;

      // Store token and name in AsyncStorage
      await AsyncStorage.setItem('jwt_token', token);
      await AsyncStorage.setItem('user_name', name);

      // Call onLogin callback with token
      if (onLogin) {
        onLogin(token);
      }

      // Show success message
      Alert.alert('Success', 'Logged in successfully!');
    } catch (error) {
      // Handle errors
      const errorMessage =
        error.response?.data?.message || 'Invalid credentials. Please try again.';
      Alert.alert('Login Failed', errorMessage);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <View className="flex-1 bg-black justify-center px-6 -mt-32">
      <Text className="text-white text-4xl font-bold text-center mb-20">Sign In</Text>

      {/* Email input */}
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

      {/* Password input */}
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

      {/* Remember me + Forgot Password */}
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

      {/* Sign In button */}
      <TouchableOpacity
        className="bg-[#666666] py-3 rounded-md"
        onPress={handleSignIn}
      >
        <Text className="text-white text-center text-lg font-semibold">Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}
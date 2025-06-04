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

export default function Login({ onLogin }) {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();

  const handleSignIn = () => {
    console.log('Email or Phone:', emailOrPhone);
    console.log('Password:', password);
    console.log('Remember Me:', rememberMe);

    // ✅ Only navigate if credentials are provided
    if (emailOrPhone.trim() !== '' && password.trim() !== '') {
      if (onLogin) {
        onLogin('dummy-token');
      }

     // navigation.navigate('RegisteredCars');
    } else {
      Alert.alert('Missing Fields', 'Please enter both Email/Phone and Password.');
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword'); 
  };

  return (
    <View className="flex-1 bg-black justify-center px-6 -mt-32">
      <Text className="text-white text-4xl font-bold text-center mb-20">Sign In</Text>

      {/* Email or phone input */}
      <View className="flex-row items-center bg-black border border-gray-600 rounded-md px-3 py-2 mb-4">
        <FontAwesome name="envelope" size={20} color="white" style={{ marginRight: 8 }} />
        <TextInput
          className="flex-1 text-white"
          placeholder="Enter email or phone number"
          placeholderTextColor="#888"
          value={emailOrPhone}
          onChangeText={setEmailOrPhone}
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

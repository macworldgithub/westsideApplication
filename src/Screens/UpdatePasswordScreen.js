import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { API_BASE_URL } from '../utils/config';
import showToast from '../utils/Toast';

export default function UpdatePasswordScreen() {
  const navigation = useNavigation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdatePassword = async () => {
    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast({
            type: 'error', 
            title: 'Error',
            message: `All fields are required.`
          });
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast({
            type: 'error', 
            title: 'Error',
            message: `New password and confirm password do not match.`
          });
      return;
    }

    if (newPassword.length < 6) {
      showToast({
            type: 'error', 
            title: 'Error',
            message: `New password must be at least 6 characters long.`
          });
      return;
    }

    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('jwt_token');
      if (!token) {
        showToast({
            type: 'error',
            title: 'Error',
            message: 'Please log in again.',
            onHide: () => navigation.navigate('Login'), // Navigate after toast
        });
        return;
      }

      const decoded = jwtDecode(token);
      if (!decoded._id) {
        throw new Error('Invalid token');
      }
      const userId = decoded._id;

      const response = await axios.patch(
        `${API_BASE_URL}/user/${userId}/update/${userId}`,
        {
          currentPassword,
          password: newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

     
      showToast({
            type: 'success',
            title: 'Success',
            message: 'Password updated successfully.',
            onHide: () => navigation.navigate('AccountSecurity'), 
            });
    } catch (error) {
      console.error('Update Password Error:', error);
      let errorMessage = 'Failed to update password.';
      if (error.response) {
        const { status, data } = error.response;
        if (status === 403) {
          errorMessage = data.message || 'Current password is incorrect.';
        } else if (status === 404) {
          errorMessage = data.message || 'User not found.';
        } else if (status === 400) {
          errorMessage = data.message || 'Invalid request.';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
       showToast({
            type: 'error', 
            title: 'Error',
            message: errorMessage
          });
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#202020]">
      <View className="px-5 pt-12">
        {/* Header */}
        <View className="flex-row items-center mb-8">
          <TouchableOpacity onPress={() => navigation.navigate('AccountSecurity')}>
            <FontAwesome name="angle-left" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white font-semibold text-lg ml-7">Update Password</Text>
        </View>

        {/* Form */}
        <View className="mb-6">
          <Text className="text-white text-base mb-2">Current Password</Text>
          <TextInput
            className="bg-black text-white p-4 rounded-xl"
            placeholder="Enter current password"
            placeholderTextColor="#999"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
        </View>

        <View className="mb-6">
          <Text className="text-white text-base mb-2">New Password</Text>
          <TextInput
            className="bg-black text-white p-4 rounded-xl"
            placeholder="Enter new password"
            placeholderTextColor="#999"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
        </View>

        <View className="mb-8">
          <Text className="text-white text-base mb-2">Confirm New Password</Text>
          <TextInput
            className="bg-black text-white p-4 rounded-xl"
            placeholder="Confirm new password"
            placeholderTextColor="#999"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className="bg-white py-4 rounded-xl items-center"
          onPress={handleUpdatePassword}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-black font-semibold text-base">Update Password</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
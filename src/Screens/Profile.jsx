import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { FontAwesome, Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

export default function Profile({ onLogout }) {
  const [user, setUser] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  // Fetch user details from AsyncStorage and JWT
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('jwt_token');
        const name = await AsyncStorage.getItem('user_name');
        if (!token) {
          setLoading(false);
          return;
        }

        // Decode JWT to get email
        const decoded = jwtDecode(token);
        console.log(decoded); // For debugging
        setUser({
          name: name || 'Unknown User',
          email: decoded.email || 'No email provided',
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to load user profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      // Clear JWT token and name from AsyncStorage
      await AsyncStorage.multiRemove(['jwt_token', 'user_name']);
      
      // Notify parent (App.js) to update userToken
      if (onLogout) {
        onLogout(null);
      }
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#191919] justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#191919]">
      {/* Header Row */}
      <View className="flex-row justify-between items-center px-4 mt-10">
        <Text className="text-white text-xl font-semibold">Profile</Text>
        <TouchableOpacity
          className="bg-[#2f2f2f] px-6 py-3 rounded-lg"
          onPress={handleLogout}
        >
          <Text className="text-white text-sm">Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ alignItems: "center", paddingVertical: 30 }}>
        {/* Avatar Circle */}
        <View className="w-24 h-24 rounded-full bg-black justify-center items-center mb-5 mt-4">
          <FontAwesome name="user" size={40} color="white" />
        </View>

        {/* User Info */}
        <Text className="text-white text-lg font-semibold">{user.name}</Text>
        <Text className="text-gray-400 mb-14">{user.email}</Text>

        {/* Menu Options */}
        <View className="w-[90%]">
          <MenuItem 
            icon={<FontAwesome name="user" size={24} color="white"/>} 
            title="Edit Profile" 
            onPress={() => navigation.navigate('EditProfile')} 
          />
          <View className="h-6" />
          <MenuItem 
            icon={<Feather name="shield" size={24} color="white" />} 
            title="Account Security" 
            onPress={() => navigation.navigate('AccountSecurity')} 
          />
          <View className="h-6" />
          <MenuItem 
            icon={<Ionicons name="settings-outline" size={24} color="white" />} 
            title="General Settings" 
            onPress={() => navigation.navigate('GeneralSetting')} 
          />
          <View className="h-6" />
          <MenuItem 
            icon={<Ionicons name="help-circle-outline" size={24} color="white" />} 
            title="Help Centre" 
            onPress={() => navigation.navigate('LanguageSetting')} 
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const MenuItem = ({ icon, title, onPress }) => (
  <TouchableOpacity className="bg-[#000000] flex-row items-center justify-between px-5 py-5 rounded-2xl" onPress={onPress}>
    <View className="flex-row items-center space-x-5">
      {icon}
      <Text className="text-white text-base font-medium ml-4">{title}</Text>
    </View>
    <FontAwesome name="angle-right" size={20} color="white" />
  </TouchableOpacity>
);
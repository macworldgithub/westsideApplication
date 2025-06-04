import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { FontAwesome, Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';

export default function Profile() {
  const user = {
    name: "Paul Walker",
    email: "Paulwalker@gmail.com",
  };

  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-[#191919]">
      {/* Header Row */}
      <View className="flex-row justify-between items-center px-4 mt-10">
        <Text className="text-white text-xl font-semibold">Profile</Text>
        <TouchableOpacity
          className="bg-[#2f2f2f] px-6 py-3 rounded-lg"
          onPress={() => navigation.navigate('Login')} // ✅ Navigate to Login
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

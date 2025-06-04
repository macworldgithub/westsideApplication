import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function AccountSecurityScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-[#202020]">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 45 }}>
        
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <FontAwesome name="angle-left" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white font-semibold text-lg ml-7">Account Security</Text>
        </View>

        {/* Update Password Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('UpdatePassword')}
          className="bg-black px-6 py-4 rounded-xl flex-row items-center justify-between"
        >
          <Text className="text-white text-base">Update Password</Text>
          <FontAwesome name="angle-right" size={30} color="white" />
        </TouchableOpacity>
        
      </ScrollView>
    </SafeAreaView>
  );
}

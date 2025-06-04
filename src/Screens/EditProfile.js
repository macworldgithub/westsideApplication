import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function EditProfile() {
  const [avatar, setAvatar] = useState(null);
  const navigation = useNavigation();

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.granted === false) {
      alert("Camera access is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 0.5 });
    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#191919]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20 }}>
          {/* Header */}
          <View>
            <TouchableOpacity
              onPress={() => navigation.navigate("Profile")}
              className="flex-row items-center py-12"
            >
              <FontAwesome name="angle-left" size={24} color="white" />
              <Text className="text-white text-lg ml-4 font-semibold">
                Edit Profile
              </Text>
            </TouchableOpacity>
          </View>

          {/* Avatar with Camera Icon */}
          <View className="items-center my-6">
            <View className="w-28 h-28 rounded-full bg-[#3a3a3a] justify-center items-center relative">
              {avatar ? (
                <Image
                  source={{ uri: avatar }}
                  className="w-full h-full rounded-full"
                />
              ) : (
                <FontAwesome name="user" size={40} color="white" />
              )}

              {/* Camera Icon (Original Style) */}
              <TouchableOpacity
                onPress={openCamera}
                className="absolute bottom-0 right-0 bg-black p-2 rounded-full border border-white"
              >
                <FontAwesome name="camera" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Inputs */}
          <View className="space-y-8">
            {/* Full Name */}
            <View>
              <Text className="text-white mb-2 text-base">Full name</Text>
              <TextInput
                placeholder="Paul Walker"
                placeholderTextColor="#ccc"
                className="bg-black text-white px-5 py-4 rounded-xl text-lg"
              />
            </View>

            {/* Email */}
            <View>
              <Text className="text-white mb-2 text-base">Email</Text>
              <TextInput
                placeholder="Paulwalker@gmail.com"
                placeholderTextColor="#ccc"
                editable={false}
                className="bg-black text-white px-5 py-4 rounded-xl text-lg opacity-50"
              />
            </View>

            {/* Phone Number */}
            <View>
              <Text className="text-white mb-2 text-base">Phone number</Text>
              <View className="flex-row items-center bg-black rounded-xl px-5 py-4">
                <Image
                  source={{
                    uri: "https://flagcdn.com/w40/id.png",
                  }}
                  className="w-4 h-4 mr-3"
                />
                <TextInput
                  placeholder="123456789"
                  placeholderTextColor="#ccc"
                  keyboardType="phone-pad"
                  className="flex-1 text-white text-lg"
                />
              </View>
            </View>
          </View>

          {/* Save Button */}
          <View className="px-5 pt-12 pb-48">
            <TouchableOpacity className="bg-black py-4 rounded-xl items-center border border-gray-600">
              <Text className="text-white text-base font-semibold">
                Save Changes
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

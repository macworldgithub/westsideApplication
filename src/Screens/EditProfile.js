import React, { useState, useEffect } from "react";
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
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { API_BASE_URL } from "../utils/config";
import showToast from '../utils/Toast';

export default function EditProfile() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    currentPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("jwt_token");
        const name = await AsyncStorage.getItem("user_name");
        if (!token) {
           showToast({
             type: 'error',
            title: 'Error',
            message: 'Please log in again.',
          }); 
          navigation.navigate("Login");
          return;
        }

        const decoded = jwtDecode(token);
        setFormData({
          name: name || "",
          email: decoded.email || "",
          mobile: "", // Mobile not in JWT, left empty for user input
          currentPassword: "",
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        showToast({
             type: 'error',
            title: 'Error',
            message: 'Failed to load profile data.',
          }); 
        
      }
    };

    fetchUserData();
  }, [navigation]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle form submission
  const handleSaveChanges = async () => {
    if (!formData.name.trim()) {
      showToast({
             type: 'error',
            title: 'Missing Field',
            message: 'Please enter your full name.',
          }); 
      
      return;
    }
    if (!formData.currentPassword.trim()) {
      showToast({
             type: 'error',
            title: 'Missing Field',
            message: 'Please enter your current password.',
          }); 
      
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("jwt_token");
      const decoded = jwtDecode(token);
      const userId = decoded._id;

      // Prepare request body (exclude email for non-admins)
      const requestBody = {
        name: formData.name,
        mobile: formData.mobile.trim() || undefined,
        currentPassword: formData.currentPassword,
      };

      // Send PATCH request to update user
      const response = await axios.patch(
        `${API_BASE_URL}/user/${userId}/update/${userId}`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update name in AsyncStorage
      await AsyncStorage.setItem("user_name", response.data.name);

      showToast({
             type: 'success',
            title: 'Success',
            message: 'Profile updated successfully!',
          }); 
      navigation.navigate("Profile");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update profile. Please try again.";
      showToast({
             type: 'error',
            title: 'Error',
            message: errorMessage,
          }); 
    } finally {
      setLoading(false);
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

          {/* Avatar Placeholder (No Image Integration) */}
          <View className="items-center my-6">
            <View className="w-28 h-28 rounded-full bg-[#3a3a3a] justify-center items-center relative">
              <FontAwesome name="user" size={40} color="white" />
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
                value={formData.name}
                onChangeText={(text) => handleInputChange("name", text)}
              />
            </View>

            {/* Email (Disabled) */}
            <View>
              <Text className="text-white mb-2 text-base">Email</Text>
              <TextInput
                placeholder="Paulwalker@gmail.com"
                placeholderTextColor="#ccc"
                editable={false}
                className="bg-black text-white px-5 py-4 rounded-xl text-lg opacity-50"
                value={formData.email}
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
                  value={formData.mobile}
                  onChangeText={(text) => handleInputChange("mobile", text)}
                />
              </View>
            </View>

            {/* Current Password */}
            <View>
              <Text className="text-white mb-2 text-base">Current Password</Text>
              <TextInput
                placeholder="Enter current password"
                placeholderTextColor="#ccc"
                secureTextEntry
                className="bg-black text-white px-5 py-4 rounded-xl text-lg"
                value={formData.currentPassword}
                onChangeText={(text) => handleInputChange("currentPassword", text)}
              />
            </View>
          </View>

          {/* Save Button */}
          <View className="px-5 pt-12 pb-48">
            <TouchableOpacity
              className="bg-black py-4 rounded-xl items-center border border-gray-600"
              onPress={handleSaveChanges}
              disabled={loading}
            >
              <Text className="text-white text-base font-semibold">
                {loading ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
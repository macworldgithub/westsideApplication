import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from "../utils/config";
import showToast from '../utils/Toast';

const NewCarRegistration = () => {
  const navigation = useNavigation();

  const [form, setForm] = useState({
    driverName: "",
    carPlate: "",
    carName: "",
    carModel: "",
    carYear: "",
    chassisNumber: "",
    note: "",
    imageUri: null,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== "granted" || libraryStatus !== "granted") {
      Alert.alert(
        "Permissions Required",
        "Please enable camera and media library permissions in your device settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ]
      );
      return false;
    }
    return true;
  };

  const handleImagePick = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });

    if (!result.canceled && result.assets.length > 0) {
      handleChange("imageUri", result.assets[0].uri);
    }
  };

  const handleCaptureImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });

    if (!result.canceled && result.assets.length > 0) {
      handleChange("imageUri", result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    const { carPlate, carName, carModel, carYear, chassisNumber, imageUri } =
      form;

    // Validate required fields
    if (
      !carPlate.trim() ||
      !carName.trim() ||
      !carModel.trim() ||
      !carYear.trim() ||
      !chassisNumber.trim()
    ) {
      showToast({
          type: 'error',
          title: 'Missing Fields',
          message: 'Please fill in all required fields.'
      });
      return;
    }

    // Validate carYear as a number
    const yearNum = parseInt(carYear);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear()) {
      showToast({
          type: 'error',
          title: 'Invalid Year',
          message: 'Please enter a valid car year.'
      });
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("jwt_token");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const formData = new FormData();
      formData.append("plate", carPlate);
      formData.append("variant", carName);
      formData.append("model", carModel);
      formData.append("year", yearNum.toString());
      formData.append("chassisNumber", chassisNumber);

      if (imageUri) {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const fileName = imageUri.split("/").pop() || "car_image.jpg";
        formData.append("image", {
          uri: imageUri,
          type: blob.type || "image/jpeg",
          name: fileName,
        });
      }

      const response = await axios.post(
        `${API_BASE_URL}/vehicle/registration`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      showToast({
          type: 'success',
          title: 'Success',
          message: 'Car registered successfully!',
        });

      navigation.goBack();

    } catch (error) {
      console.error("Error registering car:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to register car. Please try again.";
      showToast({
          type: 'error',
          title: 'Error',
          message: errorMessage
      });
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-black px-4 pt-10 pb-6"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Header */}
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Image
            source={require("../../assets/back.png")}
            style={{ width: 24, height: 24 }}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text className="text-white text-xl font-semibold">
          New Car Registration
        </Text>
      </View>

      {/* Input Fields */}
      {[
        { label: "Driver Name", key: "driverName" },
        { label: "Car Plate", key: "carPlate", required: true },
        { label: "Car Name (Variant)", key: "carName", required: true },
        { label: "Car Model", key: "carModel", required: true },
        { label: "Car Year", key: "carYear", required: true },
        { label: "Chassis Number", key: "chassisNumber", required: true },
      ].map((field) => (
        <View key={field.key} className="mb-4">
          <Text className="text-white mb-1">
            {field.label}
            {field.required && <Text className="text-red-500"> *</Text>}
          </Text>
          <TextInput
            className="bg-white text-black rounded-xl px-4 py-2"
            placeholder={field.label}
            placeholderTextColor="#999"
            value={form[field.key]}
            onChangeText={(text) => handleChange(field.key, text)}
            keyboardType={
              field.key === "carYear" ? "numeric" : "default"
            }
          />
        </View>
      ))}

      {/* Note */}
      <View className="mb-4">
        <Text className="text-white mb-1">Note:</Text>
        <View className="bg-white rounded-xl px-4 pt-2 pb-2">
          <TextInput
            className="text-black h-24"
            multiline
            textAlignVertical="top"
            numberOfLines={4}
            placeholder="Note......"
            placeholderTextColor="#999"
            value={form.note}
            onChangeText={(text) => handleChange("note", text)}
          />
        </View>
      </View>

      {/* Image Upload */}
      <View className="mb-6">
        <Text className="text-white mb-2">Image Upload</Text>
        <View className="flex-row space-x-4">
          <TouchableOpacity
            onPress={handleImagePick}
            className="flex-1 bg-gray-200 rounded-xl py-6 items-center justify-center"
            disabled={loading}
          >
            <MaterialCommunityIcons name="upload" size={28} color="black" />
            <Text className="text-black font-semibold mt-1 text-sm">
              Upload
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCaptureImage}
            className="flex-1 bg-gray-200 rounded-xl py-6 items-center justify-center"
            disabled={loading}
          >
            <MaterialCommunityIcons name="camera" size={28} color="black" />
            <Text className="text-black font-semibold mt-1 text-sm">
              Capture
            </Text>
          </TouchableOpacity>
        </View>

        {form.imageUri && (
          <View className="relative mt-4">
            <Image
              source={{ uri: form.imageUri }}
              className="w-full h-72 rounded-xl"
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={() => handleChange("imageUri", null)}
              className="absolute top-2 right-2 bg-red-600 p-2 rounded-full"
              disabled={loading}
            >
              <MaterialCommunityIcons name="delete" size={20} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Submit */}
      <TouchableOpacity
        className={`bg-black py-3 rounded-xl items-center border border-white ${
          loading ? "opacity-50" : ""
        }`}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text className="text-white font-bold">
          {loading ? "Saving..." : "Save"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default NewCarRegistration;
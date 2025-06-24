import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {jwtDecode} from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from "../utils/config";
import Icon from "react-native-vector-icons/Feather";

const NewWorkOrderScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { carId } = route.params || {};

  const [form, setForm] = useState({
    car: carId || "",
    ownerName: "",
    headMechanic: "",
    orderCreatorName: "",
    ownerEmail: "",
    phoneNumber: "",
    startDate: "",
    finishDate: "",
    address: "",
    createdBy: "",
  });
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  // Fetch user ID from JWT token
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = await AsyncStorage.getItem("jwt_token");
        if (!token) {
          console.warn("No token found in AsyncStorage");
          alert("Please log in again.");
          navigation.navigate("Login");
          return;
        }
        const decoded = jwtDecode(token);
        if (!decoded._id) {
          throw new Error("Invalid token payload: missing _id");
        }
        setUserId(decoded._id);
        setForm((prev) => ({ ...prev, createdBy: decoded._id }));
      } catch (error) {
        console.error("Error decoding token:", error);
        alert("Failed to authenticate. Please log in again.");
        navigation.navigate("Login");
      }
    };
    fetchUserDetails();
  }, [navigation]);

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async () => {
    if (!carId) {
      alert("No car selected. Please select a car.");
      return;
    }
    if (!userId) {
      alert("User not authenticated. Please log in again.");
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("jwt_token");
      const response = await axios.post(
        `${API_BASE_URL}/workorder/create-work-order`,
        {
          car: form.car,
          ownerName: form.ownerName,
          headMechanic: form.headMechanic,
          orderCreatorName: form.orderCreatorName,
          ownerEmail: form.ownerEmail,
          phoneNumber: form.phoneNumber,
          startDate: form.startDate,
          finishDate: form.finishDate,
          address: form.address,
          createdBy: form.createdBy,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Work order created:", response.data);
      alert("Work order created successfully!");
      navigation.navigate("RegisteredCars"); // Navigate back to refresh the list
    } catch (error) {
      console.error("Error creating work order:", error.response?.data || error);
      alert(
        `Failed to create work order: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "ownerName", label: "Owner Name", placeholder: "Enter owner name" },
    {
      key: "headMechanic",
      label: "Head Mechanic Name",
      placeholder: "Enter head mechanic name",
    },
    {
      key: "orderCreatorName",
      label: "Order Creator Name",
      placeholder: "Enter order creator name",
    },
    { key: "ownerEmail", label: "Email", placeholder: "Enter email" },
    { key: "phoneNumber", label: "Phone No.", placeholder: "Enter phone number" },
    { key: "startDate", label: "Start Date", placeholder: "YYYY-MM-DD" },
    {
      key: "finishDate",
      label: "Work Finish Date",
      placeholder: "YYYY-MM-DD",
    },
    { key: "address", label: "Address", placeholder: "Enter address" },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-black"
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 60,
          paddingBottom: 40,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => navigation.navigate("RegisteredCars")}>
            <Icon name="arrow-left" size={24} color="white" className="mr-4" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-semibold">
            New Work Order
          </Text>
        </View>

        {/* Input Fields */}
        {fields.map((field, index) => (
          <View key={index} className="mb-4">
            <Text className="text-white mb-1">{field.label}</Text>
            <TextInput
              className="bg-neutral-900 text-white border border-gray-700 rounded-lg px-4 py-3"
              placeholder={field.placeholder}
              placeholderTextColor="#999"
              value={form[field.key]}
              onChangeText={(text) => handleChange(field.key, text)}
              keyboardType={
                field.key === "ownerEmail"
                  ? "email-address"
                  : field.key === "phoneNumber"
                  ? "phone-pad"
                  : "default"
              }
              autoCapitalize={
                field.key === "ownerEmail" || field.key === "phoneNumber"
                  ? "none"
                  : "words"
              }
            />
          </View>
        ))}

        {/* Save Button */}
        <TouchableOpacity
          className={`bg-black py-3 rounded-xl items-center border border-gray-600 ${
            loading ? "opacity-50" : ""
          }`}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text className="text-white font-bold">Save</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default NewWorkOrderScreen;
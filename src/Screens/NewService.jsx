import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Feather";
import EditPicModal from "./EditPicModal";

const NewServiceScreen = () => {
  const navigation = useNavigation();

  const [form, setForm] = useState({
    mechanicName: "",
    partName: "",
    price: "",
    finishDate: "",
    notes: "",
    beforeImageUri: Image.resolveAssetSource(require("../../assets/Car.png")).uri,
    afterImageUri: Image.resolveAssetSource(require("../../assets/Car.png")).uri,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [imageType, setImageType] = useState(""); // Track which image is being edited

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = () => {
    console.log("Form Data:", form);
    // Add API call or navigation logic here
  };

  const handleImageSelected = (image) => {
    if (image && image.uri) {
      setForm((prev) => ({ ...prev, [`${imageType}ImageUri`]: image.uri }));
    }
    setModalVisible(false);
  };

  const openImageModal = (type) => {
    setImageType(type);
    setModalVisible(true);
  };

  const fields = [
    {
      key: "mechanicName",
      label: "Mechanic Name",
      placeholder: "Enter mechanic name",
    },
    {
      key: "partName",
      label: "Part Name",
      placeholder: "Enter part name",
    },
    { key: "price", label: "Price", placeholder: "Enter price" },
    {
      key: "finishDate",
      label: "Work Finish Date",
      placeholder: "DD-MM-YYYY",
    },
    { key: "notes", label: "Notes", placeholder: "Enter notes" },
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
          <TouchableOpacity onPress={() => navigation.navigate("ViewServices")}>
            <Image
              source={require("../../assets/back.png")}
              className="w-6 h-6 mr-4"
            />
          </TouchableOpacity>
          <Text className="text-white text-xl font-semibold">
            New Service
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
            />
          </View>
        ))}

        {/* Before Image Upload */}
        <View className="mt-2 mb-6">
          <Text className="text-white mb-2">Before Image Upload</Text>
          {form.beforeImageUri ? (
            <View className="relative">
              <Image
                source={{ uri: form.beforeImageUri }}
                className="w-full h-48 rounded-lg"
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => openImageModal("before")}
                className="absolute top-2 right-2 bg-black/70 p-2 rounded-full"
              >
                <Icon name="edit-2" size={18} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  setForm((prev) => ({ ...prev, beforeImageUri: null }))
                }
                className="absolute top-2 left-2 bg-black/70 p-2 rounded-full"
              >
                <Icon name="trash-2" size={18} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => openImageModal("before")}
              className="border border-dashed border-gray-600 rounded-lg h-48 items-center justify-center"
            >
              <Icon name="plus" size={28} color="gray" />
              <Text className="text-gray-400 mt-2">Add Before Image</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* After Image Upload */}
        <View className="mt-2 mb-6">
          <Text className="text-white mb-2">After Image Upload</Text>
          {form.afterImageUri ? (
            <View className="relative">
              <Image
                source={{ uri: form.afterImageUri }}
                className="w-full h-48 rounded-lg"
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => openImageModal("after")}
                className="absolute top-2 right-2 bg-black/70 p-2 rounded-full"
              >
                <Icon name="edit-2" size={18} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  setForm((prev) => ({ ...prev, afterImageUri: null }))
                }
                className="absolute top-2 left-2 bg-black/70 p-2 rounded-full"
              >
                <Icon name="trash-2" size={18} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => openImageModal("after")}
              className="border border-dashed border-gray-600 rounded-lg h-48 items-center justify-center"
            >
              <Icon name="plus" size={28} color="gray" />
              <Text className="text-gray-400 mt-2">Add After Image</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          className="bg-black py-3 rounded-xl items-center border border-gray-600"
          onPress={handleSubmit}
        >
          <Text className="text-white font-bold">Save</Text>
        </TouchableOpacity>
      </ScrollView>

      <EditPicModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onImageSelected={handleImageSelected}
      />
    </KeyboardAvoidingView>
  );
};

export default NewServiceScreen;
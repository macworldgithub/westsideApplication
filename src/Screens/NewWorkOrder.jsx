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

const NewWorkOrderScreen = () => {
  const navigation = useNavigation();

  const [form, setForm] = useState({
    ownerName: "",
    headMechanicName: "",
    orderCreatorName: "",
    email: "",
    phone: "",
    startDate: "",
    finishDate: "",
    address: "",
    status: "In Progress",
    imageUri: Image.resolveAssetSource(require("../../assets/Car.png")).uri,
  });

  const [modalVisible, setModalVisible] = useState(false);

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = () => {
    console.log("Form Data:", form);
    // Add API call or navigation logic here
  };

  const handleImageSelected = (image) => {
    if (image && image.uri) {
      setForm((prev) => ({ ...prev, imageUri: image.uri }));
    }
  };

  const fields = [
    { key: "ownerName", label: "Owner Name", placeholder: "Enter owner name" },
    {
      key: "headMechanicName",
      label: "Head Mechanic Name",
      placeholder: "Enter head mechanic name",
    },
    {
      key: "orderCreatorName",
      label: "Order Creator Name",
      placeholder: "Enter order creator name",
    },
    { key: "email", label: "Email", placeholder: "Enter email" },
    { key: "phone", label: "Phone No.", placeholder: "Enter phone number" },
    { key: "startDate", label: "Start Date", placeholder: "DD-MM-YYYY" },
    {
      key: "finishDate",
      label: "Work Finish Date",
      placeholder: "DD-MM-YYYY",
    },
    { key: "address", label: "Address", placeholder: "Enter address" },
    { key: "status", label: "Status", placeholder: "Enter status" },
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
          <TouchableOpacity onPress={() => navigation.navigate("WorkOrder")}>
            <Image
              source={require("../../assets/back.png")}
              className="w-6 h-6 mr-4"
            />
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
            />
          </View>
        ))}

        {/* Image Upload Section */}
        <View className="mt-2 mb-6">
          <Text className="text-white mb-2">Image Upload</Text>

          {form.imageUri ? (
            <View className="relative">
              <Image
                source={{ uri: form.imageUri }}
                className="w-full h-48 rounded-lg"
                resizeMode="cover"
              />

              {/* Edit Button */}
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                className="absolute top-2 right-2 bg-black/70 p-2 rounded-full"
              >
                <Icon name="edit-2" size={18} color="white" />
              </TouchableOpacity>

              {/* Delete Button */}
              <TouchableOpacity
                onPress={() =>
                  setForm((prev) => ({ ...prev, imageUri: null }))
                }
                className="absolute top-2 left-2 bg-black/70 p-2 rounded-full"
              >
                <Icon name="trash-2" size={18} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              className="border border-dashed border-gray-600 rounded-lg h-48 items-center justify-center"
            >
              <Icon name="plus" size={28} color="gray" />
              <Text className="text-gray-400 mt-2">Add Image</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          className="bg-black py-3 rounded-xl items-center border border-gray-600"
          onPress={handleSubmit}
        >
          <Text className="text-white font-bold">Save</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Image Picker Modal */}
      <EditPicModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onImageSelected={handleImageSelected}
      />
    </KeyboardAvoidingView>
  );
};

export default NewWorkOrderScreen;

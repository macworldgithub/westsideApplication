import React from 'react';
import { Modal, TouchableOpacity, Text, View, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const EditPicModal = ({ visible, onClose, onImageSelected }) => {
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      // Alert.alert('Permission Denied', 'Camera access is required to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      onImageSelected(result.assets[0]);
      onClose();
    }
  };

  const handleChooseFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      // Alert.alert('Permission Denied', 'Library access is required to select a photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      onImageSelected(result.assets[0]);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-2xl px-6 pt-6 pb-8">
          <TouchableOpacity className="absolute top-4 right-4 z-10" onPress={onClose}>
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>

          <Text className="text-center text-lg font-semibold mb-6">
            Edit Profile Photo
          </Text>

          <TouchableOpacity
            className="py-3 border-b border-gray-200"
            onPress={handleTakePhoto}
          >
            <Text className="text-center text-base text-blue-600">
              Take a New Photo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="py-3 mt-1"
            onPress={handleChooseFromLibrary}
          >
            <Text className="text-center text-base text-blue-600">
              Choose from Your Photo Library
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default EditPicModal;

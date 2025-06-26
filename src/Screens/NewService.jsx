import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { API_BASE_URL } from '../utils/config';
import EditPicModal from './EditPicModal';
import showToast from '../utils/Toast';

const NewServiceScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { workOrderId } = route.params || {};

  const [form, setForm] = useState({
    mechanicName: '',
    partName: '',
    price: '',
    finishDate: '',
    notes: '',
    beforeImageUri: null,
    afterImageUri: null,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [imageType, setImageType] = useState('');
  const [userRole, setUserRole] = useState(null);

  // Fetch user role
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('jwt_token');
        if (!token) {
          showToast({
            type: 'error', 
            title: 'Session Expired',
            message: 'Please log in again.',
            onHide: () => navigation.navigate('Login'), 
          });
          return;
        }
        const decoded = jwtDecode(token);
        if (!decoded.role) {
          throw new Error('Invalid token payload: missing role');
        }
        setUserRole(decoded.role);
      } catch (error) {
        console.error('Error decoding token:', error);
        showToast({
            type: 'error', 
            title: 'Error',
            message: 'Failed to authenticate. Please log in again.',
            onHide: () => navigation.navigate('Login'), 
          });
      }
    };
    fetchUserDetails();
  }, [navigation]);

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
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

  const handleSubmit = async () => {
    if (!workOrderId) {
      showToast({
                type: 'error',
                title: 'Error',
                message: 'Work Order ID is missing.',
              
              });
      return;
    }

    // Validate required fields
    if (!form.mechanicName || !form.partName || !form.price || !form.finishDate) {
      showToast({
                type: 'error',
                title: 'Missing Fields',
                message: 'Please fill all required fields.',
              
              });
      return;
    }

    // Validate date format (DD-MM-YYYY)
    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (!dateRegex.test(form.finishDate)) {
      showToast({
                type: 'error',
                title: 'Error',
                message: 'Finish date must be in DD-MM-YYYY format.',
              
              });
      return;
    }

    // Convert DD-MM-YYYY to ISO format (YYYY-MM-DD)
    const [day, month, year] = form.finishDate.split('-');
    const isoDate = `${year}-${month}-${day}T00:00:00Z`;

    try {
      const token = await AsyncStorage.getItem('jwt_token');
      const formData = new FormData();
      formData.append('workOrder', workOrderId);
      formData.append('mechanicName', form.mechanicName);
      formData.append('partName', form.partName);
      formData.append('price', form.price);
      formData.append('finishDate', isoDate);
      if (form.notes) formData.append('notes', form.notes);

      if (form.beforeImageUri) {
        formData.append('images', {
          uri: form.beforeImageUri,
          type: 'image/jpeg',
          name: `before_${Date.now()}.jpg`,
        });
      }
      if (form.afterImageUri) {
        formData.append('images', {
          uri: form.afterImageUri,
          type: 'image/jpeg',
          name: `after_${Date.now()}.jpg`,
        });
      }

      console.log('Submitting repair:', formData);
      const response = await axios.post(`${API_BASE_URL}/repairs`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Repair created:', response.data);
      showToast({
            type: 'success',
            title: 'Success',
            message: 'Repair created successfully.',
            onHide: () => navigation.navigate('ViewServices', { workOrderId })
          });
    } catch (error) {
      console.error('Error creating repair:', error.response?.data || error);
      showToast({
                type: 'error',
                title: 'Error',
                message: error.response?.data?.message || 'Failed to create repair.',
              
              });
    }
  };

  const fields = [
    { key: 'mechanicName', label: 'Mechanic Name', placeholder: 'Enter mechanic name' },
    { key: 'partName', label: 'Part Name', placeholder: 'Enter part name' },
    { key: 'price', label: 'Price', placeholder: 'Enter price' },
    { key: 'finishDate', label: 'Work Finish Date', placeholder: 'DD-MM-YYYY' },
    { key: 'notes', label: 'Notes', placeholder: 'Enter notes' },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
          <TouchableOpacity onPress={() => navigation.navigate('ViewServices', { workOrderId })}>
            <Image source={require('../../assets/back.png')} className="w-6 h-6 mr-4" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-semibold">New Service</Text>
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
              keyboardType={field.key === 'price' ? 'numeric' : 'default'}
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
                onPress={() => openImageModal('before')}
                className="absolute top-2 right-2 bg-black/70 p-2 rounded-full"
              >
                <Icon name="edit-2" size={18} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setForm((prev) => ({ ...prev, beforeImageUri: null }))}
                className="absolute top-2 left-2 bg-black/70 p-2 rounded-full"
              >
                <Icon name="trash-2" size={18} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => openImageModal('before')}
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
                onPress={() => openImageModal('after')}
                className="absolute top-2 right-2 bg-black/70 p-2 rounded-full"
              >
                <Icon name="edit-2" size={18} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setForm((prev) => ({ ...prev, afterImageUri: null }))}
                className="absolute top-2 left-2 bg-black/70 p-2 rounded-full"
              >
                <Icon name="trash-2" size={18} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => openImageModal('after')}
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
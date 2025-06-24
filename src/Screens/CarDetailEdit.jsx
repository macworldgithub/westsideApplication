import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation, useRoute } from '@react-navigation/native';
import EditPhotoModal from './EditPicModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import FormData from 'form-data';
import { API_BASE_URL } from '../utils/config';
import {jwtDecode} from 'jwt-decode';

const EditCarDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { car } = route.params || {};

  const [form, setForm] = useState({
    plate: '',
    variant: '',
    model: '',
    year: '',
    imageUri: '',
    chassisNumber: '',
  });
  const [isModalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  // Initialize form with car data and fetch user ID
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('jwt_token');
        if (!token) {
          console.warn('No token found in AsyncStorage');
          alert('Please log in again.');
          navigation.navigate('Login');
          return;
        }
        const decoded = jwtDecode(token);
        if (!decoded._id) {
          throw new Error('Invalid token payload: missing _id');
        }
        setUserId(decoded._id);
      } catch (error) {
        console.error('Error decoding token:', error);
        alert('Failed to authenticate. Please log in again.');
        navigation.navigate('Login');
      }
    };
    fetchUserDetails();

    if (car) {
      setForm({
        plate: car.plate || '',
        variant: car.variant || '',
        model: car.model || '',
        year: car.year ? String(car.year) : '', // Convert number to string for TextInput
        imageUri: car.image ,
        chassisNumber: car.chassisNumber || '',
      });
    }
  }, [car, navigation]);

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleImageSelected = async (image) => {
    if (!image?.uri) {
      setModalVisible(false);
      return;
    }

    if (!form.chassisNumber) {
      alert('Chassis number is required for image upload.');
      setModalVisible(false);
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('jwt_token');
      const formData = new FormData();

      // Convert image URI to Blob for FormData
      const response = await fetch(image.uri);
      const blob = await response.blob();
      formData.append('image', {
        uri: image.uri,
        type: blob.type || 'image/jpeg',
        name: 'car-image.jpg',
      });
      formData.append('chassisNumber', form.chassisNumber);

      const result = await axios.put(
        `${API_BASE_URL}/vehicle/upload-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      setForm(prev => ({ ...prev, imageUri: result.data.image }));
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error.response?.data || error);
      alert(`Failed to upload image: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
      setModalVisible(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.chassisNumber) {
      alert('Chassis number is required.');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('jwt_token');
      const updateData = {
        plate: form.plate,
        variant: form.variant,
        model: form.model,
        year: form.year ? parseInt(form.year) : undefined, // Convert string to number
        image: form.imageUri !== Image.resolveAssetSource(require('../../assets/Car.png')).uri ? form.imageUri : undefined,
      };

      const response = await axios.put(
        `${API_BASE_URL}/vehicle/update-by-chassis/${form.chassisNumber}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log('Car updated:', response.data);
      alert('Car details updated successfully!');
      navigation.navigate('RegisteredCars'); // Navigate back to refresh list
    } catch (error) {
      console.error('Error updating car:', error.response?.data || error);
      alert(`Failed to update car: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-black px-4 pt-12"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Header */}
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => navigation.navigate('RegisteredCars')}>
          <Icon name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-semibold ml-3">Edit Car Detail</Text>
      </View>

      {/* Car Image */}
      <Text className="text-white mb-2">Image Upload</Text>
      <View className="relative mb-6">
        <Image
          source={{ uri: form.imageUri }}
          className="w-full h-48 rounded-2xl"
          resizeMode="cover"
        />
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="absolute top-2 right-2 bg-black/70 p-2 rounded-full"
          disabled={loading}
        >
          <Icon name="edit-2" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Custom Modal */}
      <EditPhotoModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onImageSelected={handleImageSelected}
      />

      {/* Input Fields */}
      {[
        { label: 'Plate', key: 'plate' },
        { label: 'Variant', key: 'variant' },
        { label: 'Model', key: 'model' },
        { label: 'Year', key: 'year' },
        { label: 'Chassis Number', key: 'chassisNumber', editable: false },
      ].map(field => (
        <View key={field.key} className="mb-4">
          <Text className="text-white mb-1">{field.label}</Text>
          <View className="flex-row items-center bg-black border border-gray-500 rounded-xl px-3 py-2">
            <TextInput
              className="flex-1 text-white"
              placeholder={field.label}
              placeholderTextColor="#777"
              value={form[field.key]}
              onChangeText={text => handleChange(field.key, text)}
              editable={!field.editable}
              keyboardType={field.key === 'year' ? 'numeric' : 'default'}
            />
            {!field.editable && <Icon name="lock" size={16} color="#aaa" />}
            {field.editable !== false && <Icon name="edit-2" size={16} color="#aaa" />}
          </View>
          {/* Update Button After Chassis Number */}
          {field.key === 'chassisNumber' && (
            <TouchableOpacity
              className={`bg-white py-2 rounded-xl items-center mt-2 ${loading ? 'opacity-50' : ''}`}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <Text className="text-black font-bold text-base">Update</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      ))}

      {/* Existing Update Button */}
      <TouchableOpacity
        className={`bg-blue-600 py-3 rounded-xl items-center mb-20 mt-4 ${loading ? 'opacity-50' : ''}`}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text className="text-white font-bold text-base">Update</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default EditCarDetail;
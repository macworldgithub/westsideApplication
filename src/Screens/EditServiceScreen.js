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
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { API_BASE_URL } from '../utils/config';
import EditPicModal from './EditPicModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator } from 'react-native-paper';
import showToast from '../utils/Toast';

const EditServiceScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { repairId, workOrderId } = route.params || {};

  const [form, setForm] = useState({
    mechanicName: '',
    partName: '',
    price: '',
    finishDate: '',
    notes: '',
    beforeImageUri: null,
    afterImageUri: null,
    submitted: false,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [imageType, setImageType] = useState('');
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user details and repair data
  useEffect(() => {
    const fetchData = async () => {
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
        if (!decoded._id || !decoded.role) {
          throw new Error('Invalid token payload: missing _id or role');
        }
        setUserId(decoded._id);
        setUserRole(decoded.role);

        // Fetch repair details
        const response = await axios.get(`${API_BASE_URL}/repairs/get-single-repair-by-id/${repairId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const repair = response.data;
        if (!repair) throw new Error('Repair not found');

        setForm({
          mechanicName: repair.mechanicName || '',
          partName: repair.partName || '',
          price: repair.price ? repair.price.toString() : '',
          finishDate: repair.finishDate
            ? (() => {
                const date = new Date(repair.finishDate);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}-${month}-${year}`;
              })()
            : '',
          notes: repair.notes || '',
          beforeImageUri: repair.beforeImageUrl || null,
          afterImageUri: repair.afterImageUrl || null,
          submitted: repair.submitted || false,
        });
      } catch (error) {
        console.error('Error fetching repair:', error.response?.data || error);
        showToast({
             type: 'error',
            title: 'Error',
            message:  error.response?.data?.message || 'Failed to fetch repair.',
          }); 
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigation, repairId]);

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
    if (form.submitted && userRole === 'technician') {
      showToast({
             type: 'error',
            title: 'Error',
            message: `Cannot edit images for submitted repairs.`,
          }); 
      return;
    }
    setImageType(type);
    setModalVisible(true);
  };

  const handleDeleteImage = async (type) => {
    if (form.submitted && userRole === 'technician') {
      showToast({
             type: 'error',
            title: 'Error',
            message: `Cannot deleted images for submitted repairs.`,
          }); 
      return;
    }
    try {
      const token = await AsyncStorage.getItem('jwt_token');
      await axios.delete(`${API_BASE_URL}/repairs/delete-image/${repairId}/${type}/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm((prev) => ({ ...prev, [`${type}ImageUri`]: null }));
      showToast({
             type: 'success',
            title: 'Success',
            message: `${type.charAt(0).toUpperCase() + type.slice(1)} image deleted.`,
          }); 
    } catch (error) {
      console.error('Error deleting image:', error.response?.data || error);
      showToast({
             type: 'error',
            title: 'Error',
            message:  error.response?.data?.message || 'Failed to delete image.',
          }); 
    }
  };

  const handleToggleSubmit = () => {
    if (!form.submitted) {
      Alert.alert(
        'Confirm Submission',
        'Once submitted and updated, this repair cannot be edited by technicians. Proceed?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Yes',
            onPress: () => setForm((prev) => ({ ...prev, submitted: true })),
          },
        ],
      );
    } else {
      setForm((prev) => ({ ...prev, submitted: false }));
    }
  };

  const handleSubmit = async () => {
    if (!workOrderId || !repairId || !userId) {
      showToast({
             type: 'error',
            title: 'Missing Parameters',
            message: `Missing required parameters.`,
          }); 
      
      return;
    }

    if (!form.mechanicName || !form.partName || !form.price || !form.finishDate) {
      showToast({
             type: 'error',
            title: 'Missing Fields',
            message: `Please fill all required fields.`,
          }); 
      return;
    }

    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (!dateRegex.test(form.finishDate)) {
      showToast({
             type: 'error',
            title: 'Error',
            message: `Finish date must be in DD-MM-YYYY format.`,
          }); 
      return;
    }

    const [day, month, year] = form.finishDate.split('-');
    const isoDate = `${year}-${month}-${day}T00:00:00Z`;

    try {
      const token = await AsyncStorage.getItem('jwt_token');
      const updateData = {
        mechanicName: form.mechanicName,
        partName: form.partName,
        price: parseFloat(form.price),
        finishDate: isoDate,
        notes: form.notes || undefined,
        submitted: form.submitted,
      };

      // Handle image uploads and capture signed URLs
      for (const type of ['before', 'after']) {
        if (form[`${type}ImageUri`] && form[`${type}ImageUri`].startsWith('file://')) {
          const formData = new FormData();
          formData.append('file', {
            uri: form[`${type}ImageUri`],
            type: 'image/jpeg',
            name: `${type}_${Date.now()}.jpg`,
          });
          const uploadResponse = await axios.put(
            `${API_BASE_URL}/repairs/upload-image/${repairId}/${type}/${userId}`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
              },
            },
          );
          // Update form state with signed URL and add to updateData
          const signedUrl = uploadResponse.data; // Assuming endpoint returns the signed URL
          setForm((prev) => ({ ...prev, [`${type}ImageUri`]: signedUrl }));
          updateData[`${type}ImageUri`] = signedUrl;
        }
      }

      // Update repair
      const response = await axios.put(
        `${API_BASE_URL}/repairs/${repairId}?userId=${userId}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      console.log('Repair updated:', response.data);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Repair updated successfully.',
      });

      // Navigate after showing the toast
      navigation.navigate('ViewServices', { workOrderId });
    } catch (error) {
      console.error('Error updating repair:', error.response?.data || error);
      showToast({
             type: 'error',
            title: 'Error',
            message:  error.response?.data?.message || 'Failed to update repair.',
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

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </SafeAreaView>
    );
  }

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
          <Text className="text-white text-xl font-semibold">Edit Service</Text>
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
              editable={!(form.submitted && userRole === 'technician')}
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
                disabled={form.submitted && userRole === 'technician'}
              >
                <Icon name="edit-2" size={18} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteImage('before')}
                className="absolute top-2 left-2 bg-black/70 p-2 rounded-full"
                disabled={form.submitted && userRole === 'technician'}
              >
                <Icon name="trash-2" size={18} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => openImageModal('before')}
              className="border border-dashed border-gray-600 rounded-lg h-48 items-center justify-center"
              disabled={form.submitted && userRole === 'technician'}
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
                disabled={form.submitted && userRole === 'technician'}
              >
                <Icon name="edit-2" size={18} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteImage('after')}
                className="absolute top-2 left-2 bg-black/70 p-2 rounded-full"
                disabled={form.submitted && userRole === 'technician'}
              >
                <Icon name="trash-2" size={18} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => openImageModal('after')}
              className="border border-dashed border-gray-600 rounded-lg h-48 items-center justify-center"
              disabled={form.submitted && userRole === 'technician'}
            >
              <Icon name="plus" size={28} color="gray" />
              <Text className="text-gray-400 mt-2">Add After Image</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Submit Button */}
          <View className="mb-4">
            <Text className="text-white mb-1">Submission Status</Text>
            <TouchableOpacity
              className="bg-red-600 py-3 rounded-xl items-center"
              onPress={handleToggleSubmit}
            >
              <Text className="text-white font-bold">
                {form.submitted ? 'Revert Submission' : 'Mark as Submitted'}
              </Text>
            </TouchableOpacity>
          </View>

        {/* Update Button */}
        <TouchableOpacity
          className="bg-black py-3 rounded-xl items-center border border-gray-600"
          onPress={handleSubmit}
        >
          <Text className="text-white font-bold">Update</Text>
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

export default EditServiceScreen;
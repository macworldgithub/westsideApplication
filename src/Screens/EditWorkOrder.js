import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { API_BASE_URL } from '../utils/config';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const EditWorkOrder = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { workOrderId } = route.params || {};

  const [form, setForm] = useState({
    ownerName: '',
    headMechanic: '',
    phoneNumber: '',
    startDate: '',
    finishDate: '',
    address: '',
    status: 'in_progress',
  });
  const [userId, setUserId] = useState(null);
  const [userRole, setLabel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [carId, setCarId] = useState(null);

  // Fetch user details and work order data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('jwt_token');
        if (!token) {
          Alert.alert('Session Expired', 'Please log in again.', [
            { text: 'OK', onPress: () => navigation.navigate('Login') },
          ]);
          return;
        }
        const decoded = jwtDecode(token);
        if (!decoded._id || !decoded.role) {
          throw new Error('Invalid token payload: missing _id or role');
        }
        setUserId(decoded._id);
        setLabel(decoded.role);

        // Fetch work order details
        const response = await axios.get(
          `${API_BASE_URL}/workorder/get-single-workorder/${workOrderId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { userId: decoded._id },
          }
        );
        const workOrder = response.data;
        setCarId(workOrder.car._id || workOrder.car);

        // Format dates to DD-MM-YYYY
        const formatDateToDDMMYYYY = (dateString) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
          const year = date.getFullYear();
          return `${day}-${month}-${year}`;
        };

        setForm({
          ownerName: String(workOrder.ownerName || ''),
          headMechanic: String(workOrder.headMechanic || ''),
          phoneNumber: String(workOrder.phoneNumber || ''),
          startDate: formatDateToDDMMYYYY(workOrder.startDate),
          finishDate: formatDateToDDMMYYYY(workOrder.finishDate),
          address: String(workOrder.address || ''),
          status: String(workOrder.status || 'in_progress'),
        });
      } catch (error) {
        console.error('Error fetching work order:', error.response?.data || error);
        Alert.alert('Error', error.response?.data?.message || 'Failed to fetch work order details.');
      } finally {
        setLoading(false);
      }
    };
    if (workOrderId) {
      fetchData();
    } else {
      setLoading(false);
      Alert.alert('Error', 'No work order ID provided.');
    }
  }, [navigation, workOrderId]);

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async () => {
    if (!workOrderId || !userId) {
      Alert.alert('Error', 'Missing required parameters.');
      return;
    }

    // Validate required fields
    if (!form.ownerName || !form.headMechanic || !form.phoneNumber || !form.startDate || !form.finishDate) {
      Alert.alert('Error', 'Please fill all required fields.');
      return;
    }

    // Validate date format (DD-MM-YYYY)
    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (!dateRegex.test(form.startDate) || !dateRegex.test(form.finishDate)) {
      Alert.alert('Error', 'Dates must be in DD-MM-YYYY format.');
      return;
    }

    // Convert dates to ISO format
    const [startDay, startMonth, startYear] = form.startDate.split('-');
    const [finishDay, finishMonth, finishYear] = form.finishDate.split('-');
    const isoStartDate = `${startYear}-${startMonth}-${startDay}T00:00:00Z`;
    const isoFinishDate = `${finishYear}-${finishMonth}-${finishDay}T00:00:00Z`;

    try {
      const token = await AsyncStorage.getItem('jwt_token');
      const updateData = {
        ownerName: form.ownerName,
        headMechanic: form.headMechanic,
        phoneNumber: form.phoneNumber,
        startDate: isoStartDate,
        finishDate: isoFinishDate,
        address: form.address || undefined,
        status: form.status,
      };

      // Update work order
      const response = await axios.put(
        `${API_BASE_URL}/workorder/${workOrderId}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('Work order updated:', response.data);
      Alert.alert('Success', 'Work order updated successfully.', [
        { text: 'OK', onPress: () => navigation.navigate('CarOrderDetails', { workOrderId }) },
      ]);
    } catch (error) {
      console.error('Error updating work order:', error.response?.data || error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update work order.');
    }
  };

  const fields = [
    { key: 'ownerName', label: 'Owner Name', placeholder: 'Enter owner name' },
    { key: 'headMechanic', label: 'Head Mechanic', placeholder: 'Enter head mechanic name' },
    { key: 'phoneNumber', label: 'Phone Number', placeholder: 'Enter phone number' },
    { key: 'startDate', label: 'Start Date', placeholder: 'DD-MM-YYYY' },
    { key: 'finishDate', label: 'Finish Date', placeholder: 'DD-MM-YYYY' },
    { key: 'address', label: 'Address', placeholder: 'Enter address (optional)' },
  ];

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 40,
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity
              onPress={() => navigation.navigate('CarOrderDetails', { workOrderId })}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold ml-4">Edit Work Order</Text>
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
                keyboardType={field.key === 'phoneNumber' ? 'phone-pad' : 'default'}
              />
            </View>
          ))}

          {/* Status Toggle */}
          {(userRole === 'shopManager' || userRole === 'systemAdministrator') && (
            <View className="mb-4">
              <Text className="text-white mb-1">Status</Text>
              <View className="flex-row space-x-4">
                <TouchableOpacity
                  className={`flex-1 bg-neutral-900 border ${form.status === 'in_progress' ? 'border-green-500' : 'border-gray-700'} rounded-lg px-4 py-3 items-center`}
                  onPress={() => handleChange('status', 'in_progress')}
                >
                  <Text className="text-white">In Progress</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 bg-neutral-900 border ${form.status === 'completed' ? 'border-green-500' : 'border-gray-700'} rounded-lg px-4 py-3 items-center`}
                  onPress={() => handleChange('status', 'completed')}
                >
                  <Text className="text-white">Completed</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            className="bg-neutral-900 py-3 rounded-xl items-center border border-gray-600 mt-6"
            onPress={handleSubmit}
          >
            <Text className="text-white font-bold">Update Work Order</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditWorkOrder;
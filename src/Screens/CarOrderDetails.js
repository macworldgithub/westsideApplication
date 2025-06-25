import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { API_BASE_URL } from '../utils/config';

const CarOrderDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { workOrderId } = route.params || {};

  const [workOrder, setWorkOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);

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
        setUserRole(decoded.role);

        // Fetch work order details
        const response = await axios.get(
          `${API_BASE_URL}/workorder/get-single-workorder/${workOrderId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { userId: decoded._id },
          }
        );
        setWorkOrder(response.data);
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

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </SafeAreaView>
    );
  }

  if (!workOrder) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <Text className="text-white text-lg">No work order data available.</Text>
      </SafeAreaView>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView className="px-4 pt-4">
        {/* Header with Back Arrow */}
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => navigation.navigate('WorkOrder', { carId: workOrder.car })}>
            <Image source={require('../../assets/back.png')} className="w-6 h-6" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold ml-4">Car Order Details</Text>
        </View>

        {/* Image */}
        <View className="rounded-xl overflow-hidden mb-4 w-full h-56">
          <Image
            source={require('../../assets/CarPic.png')}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        {/* Carousel Dots */}
        <View className="flex-row justify-center space-x-1 mb-4">
          {[...Array(5)].map((_, index) => (
            <View
              key={index}
              className={`w-1.5 h-1.5 rounded-full ${index === 2 ? 'bg-white' : 'bg-gray-600'}`}
            />
          ))}
        </View>

        {/* Title & Price */}
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-white text-lg font-semibold">Car ID:{workOrder.car || 'Unknown Make'}</Text>
          
        </View>

        {/* Details */}
        <View className="space-y-1">
          <Text className="text-white text-base">Order No: {workOrder._id}</Text>
          <Text className="text-white text-base">Owner Name: {workOrder.ownerName || 'Unknown'}</Text>
          <Text className="text-white text-base">Head Mechanic: {workOrder.headMechanic || 'Unassigned'}</Text>

          {/* Phone Row */}
          <View className="flex-row items-center justify-between">
            <Text className="text-white text-base">
              Phone No: {workOrder.phoneNumber || 'N/A'}
            </Text>
            <View className="flex-row space-x-4">
              <MaterialCommunityIcons name="phone-outline" color="#fff" size={20} />
              <MaterialCommunityIcons name="message-outline" color="#fff" size={20} />
            </View>
          </View>

          <Text className="text-white text-base">Start Date: {formatDate(workOrder.startDate)}</Text>
          <Text className="text-white text-base">Finish Date: {formatDate(workOrder.finishDate)}</Text>
          <Text className="text-white text-base">
            Status: {workOrder.status === 'in_progress' ? 'In Progress' : 'Completed'}
          </Text>
        </View>

        {/* Edit Button for non-technicians */}
        {(userRole === 'systemAdministrator' || userRole === 'shopManager') && (
          <TouchableOpacity
            className="bg-neutral-900 mt-6 py-3 rounded-xl shadow-xl shadow-slate-300 mx-auto w-40"
            onPress={() => navigation.navigate('EditWorkOrder', { workOrderId: workOrder._id })}
          >
            <Text className="text-white text-center text-base font-semibold">Edit</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default CarOrderDetails;
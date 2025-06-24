
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { API_BASE_URL } from '../utils/config';
import Search from '../Components/Search';

const getStatusColor = (status) => {
  switch (status) {
    case 'Inprogress':
      return 'bg-green-300';
    case 'Completed':
      return 'bg-green-500';
    default:
      return 'bg-gray-300';
  }
};

export default function WorkOrdersScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { carId } = route.params || {};

  const [workOrders, setWorkOrders] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Fetch user details from JWT token
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('jwt_token');
        if (!token) {
          console.warn('No token found in AsyncStorage');
          Alert.alert('Session Expired', 'Please log in again.', [
            { text: 'OK', onPress: () => navigation.navigate('Login') },
          ]);
          return;
        }
        console.log('JWT Token:', token);
        const decoded = jwtDecode(token);
        if (!decoded._id || !decoded.role) {
          throw new Error('Invalid token payload: missing _id or role');
        }
        setUserId(decoded._id);
        setUserRole(decoded.role);
        console.log('Decoded JWT:', decoded);
      } catch (error) {
        console.error('Error decoding token:', error);
        Alert.alert('Error', 'Failed to authenticate. Please log in again.', [
          { text: 'OK', onPress: () => navigation.navigate('Login') },
        ]);
      }
    };
    fetchUserDetails();
  }, [navigation]);

  // Fetch work orders from backend
  const fetchWorkOrders = useCallback(async () => {
    if (!userId || !userRole || !carId) return;

    try {
      const token = await AsyncStorage.getItem('jwt_token');
      const params = {
        userId,
        search: searchQuery.trim() || undefined,
        page,
        limit: 10,
      };
      console.log('Fetching work orders with params:', { carId, ...params });
      const response = await axios.get(
        `${API_BASE_URL}/workorder/get-work-order-by-carId-with-permission/${carId}/search`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params,
        },
      );
      const { data, total } = response.data;
      const formattedOrders = data.map((order) => ({
        id: order._id,
        owner: order.ownerName || 'Unknown',
        mechanic: order.headMechanic || 'Unassigned',
        status: order.status === 'in_progress' ? 'Inprogress' : 'Completed',
        car: order.car,
      }));
      setWorkOrders(formattedOrders);
      setTotalPages(Math.ceil(total / 10));
      console.log('API Response:', { data, total, searchQuery });
    } catch (error) {
      console.error('Error fetching work orders:', error.response?.data || error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to fetch work orders. Please try again.');
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, [userId, userRole, carId, page, searchQuery]);

  // Trigger fetchWorkOrders on mount and when screen is focused
  useEffect(() => {
    fetchWorkOrders();
    const focusListener = navigation.addListener('focus', fetchWorkOrders);
    return () => focusListener();
  }, [navigation, fetchWorkOrders]);

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchWorkOrders();
  }, [fetchWorkOrders]);

  // Handle search input
  const handleSearch = useCallback((text) => {
    console.log('Search input:', text);
    setSearchQuery(text);
    setPage(1); // Reset to first page on new search
  }, []);

  if (initialLoading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black px-4 pt-16">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-8">
        <View className="flex-row items-center space-x-2">
          <TouchableOpacity onPress={() => navigation.navigate('RegisteredCars')}>
            <Image source={require('../../assets/back.png')} className="w-6 h-6" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-semibold ml-4">Work Orders</Text>
        </View>
        {(userRole === 'shopManager' || userRole === 'systemAdministrator') && (
          <TouchableOpacity
            className="bg-gray-200 px-4 py-1 rounded-md"
            onPress={() => navigation.navigate('NewWorkOrder', { carId })}
          >
            <Text className="text-black text-sm">+ New Order</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search */}
      <View className="mb-4">
        <Search onSearch={handleSearch} />
      </View>

      {/* Role-based conditional rendering */}
      {userRole === 'systemAdministrator' && (
        <Text className="text-white text-center mb-4">
          Admin: You can manage all work orders and settings.
        </Text>
      )}
      {userRole === 'technician' && (
        <Text className="text-white text-center mb-4">
          Technician: You can view and update work order details.
        </Text>
      )}
      {userRole === 'shopManager' && (
        <Text className="text-white text-center mb-4">
          Shop Manager: You can manage work orders and assignments.
        </Text>
      )}

      {/* Order Cards */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" />
        }
      >
        {workOrders.length === 0 ? (
          <Text className="text-white text-center">No work orders found.</Text>
        ) : (
          workOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              onPress={() => navigation.navigate('ViewServices', { workOrderId: order.id })}
              className="flex-row items-center bg-white p-3 rounded-xl mb-4"
            >
              {/* Image */}
              <View className="w-12 h-12 mr-3 bg-gray-200 rounded-xl items-center justify-center overflow-hidden">
                <Image
                  source={require('../../assets/clipboard.png')}
                  className="w-full h-full resize-contain"
                />
              </View>

              {/* Order Info */}
              <View className="flex-1">
                <Text className="text-black font-semibold">Order No: {order.id}</Text>
                <Text className="text-black text-sm">Owner Name: {order.owner}</Text>
                <Text className="text-black text-sm">Head Mechanic: {order.mechanic}</Text>
              </View>

              {/* Buttons Section */}
              <View className="items-center space-y-1.5">
                <Text className="text-black text-xs mb-1">Status</Text>
                <TouchableOpacity
                  className={`rounded-full mb-1 items-center justify-center ${getStatusColor(order.status)}`}
                  style={{ width: 80, height: 20 }}
                >
                  <Text className="text-xs text-black">{order.status}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-black rounded-full mb-1 items-center justify-center"
                  style={{ width: 80, height: 20 }}
                  onPress={() => navigation.navigate('ReportScreen', { workOrderId: order.id })}
                >
                  <Text className="text-white text-xs">Report</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-black rounded-full items-center justify-center"
                  style={{ width: 80, height: 20 }}
                  onPress={() => navigation.navigate('CarOrderDetails', { workOrderId: order.id })}
                >
                  <Text className="text-white text-xs">View</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Pagination Controls */}
      <View className="flex-row justify-between mt-4">
        <TouchableOpacity
          className="bg-[#666666] px-4 py-2 rounded-md"
          disabled={page === 1}
          onPress={() => setPage((prev) => Math.max(prev - 1, 1))}
        >
          <Text className="text-white">Previous</Text>
        </TouchableOpacity>
        <Text className="text-white">Page {page} of {totalPages}</Text>
        <TouchableOpacity
          className="bg-[#666666] px-4 py-2 rounded-md"
          disabled={page === totalPages}
          onPress={() => setPage((prev) => prev + 1)}
        >
          <Text className="text-white">Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
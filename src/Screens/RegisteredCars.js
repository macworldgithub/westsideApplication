import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import {jwtDecode} from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../utils/config';
import Button from '../Components/Button';
import Search from '../Components/Search';

const RegisteredCars = ({ navigation }) => {
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [cars, setCars] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('ongoing');

  // Fetch user details from JWT token
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
        alert('Failed to authenticate. Please log in again.');
        navigation.navigate('Login');
      }
    };
    fetchUserDetails();
  }, [navigation]);

  // Fetch cars from backend
  const fetchCars = useCallback(async () => {
    if (!userId || !userRole) return;

    try {
      const token = await AsyncStorage.getItem('jwt_token');
      const params = {
        page,
        limit: 10,
        search: searchQuery.trim() || undefined,
      };
      console.log('Fetching cars with params:', { userId, ...params });
      const response = await axios.get(
        `${API_BASE_URL}/vehicle/cars-by-user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params,
        }
      );
      const { data, total } = response.data;
      setCars(data);
      setTotalPages(Math.ceil(total / 10));
      console.log('API Response:', { data, total, searchQuery });
    } catch (error) {
      console.error('Error fetching cars:', error.response?.data || error);
      alert(`Failed to fetch cars: ${error.response?.data?.message || error.message}`);
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, [userId, userRole, page, searchQuery]);

  // Trigger fetchCars on mount and when screen is focused
  useEffect(() => {
    fetchCars();
    const focusListener = navigation.addListener('focus', fetchCars);
    return () => focusListener();
  }, [navigation, fetchCars]);

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1); // Reset to first page on refresh
    fetchCars();
  }, [fetchCars]);

  // Handle search input
  const handleSearch = (text) => {
    console.log('Search input:', text);
    setSearchQuery(text);
    setPage(1); // Reset to first page on new search
  };

  // Handle filter tab change
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1); // Reset to first page on filter change
    // TODO: Implement backend filter for ongoing/next5days
  };

  // Navigation to EditCarDetail
  const handleEditCar = (car) => {
    navigation.navigate('EditCarDetail', { car });
  };

  // Navigation to WorkOrder
  const handleWorkOrder = (car) => {
    navigation.navigate('WorkOrder', { carId: car._id });
  };

  if (initialLoading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black px-4 pt-12">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-8">
        <Text className="text-white text-xl font-semibold">Registered Cars</Text>
        <Button navigation={navigation} />
      </View>

      {/* Search */}
      <View className="mb-4">
        <Search onSearch={handleSearch} />
      </View>

     
      {/* Role-based conditional rendering */}
      {userRole === 'systemAdministrator' && (
        <Text className="text-white text-center mb-4">
          Admin: You can manage all cars and settings.
        </Text>
      )}
      {userRole === 'technician' && (
        <Text className="text-white text-center mb-4">
          Technician: You can view and update car repair details.
        </Text>
      )}
      {userRole === 'shopManager' && (
        <Text className="text-white text-center mb-4">
          Shop Manager: You can manage inventory and work orders.
        </Text>
      )}

      {/* Car Cards */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" />
        }
      >
        {cars.length === 0 ? (
          <Text className="text-white text-center">No cars found.</Text>
        ) : (
          cars.map((car) => (
            <View
              key={car._id}
              className="flex-row bg-white rounded-xl p-3 mb-4"
            >
              <Image
                source={car.image ? { uri: car.image } : require('../../assets/Car.png')}
                className="w-20 h-20 rounded-lg"
                resizeMode="cover"
              />
              <View className="flex-1 ml-3 justify-between">
                <Text className="text-black text-base font-bold">{car.plate}</Text>
                
                <Text className="text-gray-400 text-xs">{car.model}</Text>
                <Text className="text-gray-400 text-xs">{car.variant}</Text>
                <Text className="text-gray-400 text-xs">{car.year}</Text>
                <Text className="text-gray-400 text-xs">{car.chassisNumber}</Text>
              </View>
              <View className="justify-between ml-2">
                {userRole !== 'technician' && (
                  <TouchableOpacity
                    className="bg-gray-300 px-2 py-1 rounded-full"
                    onPress={() => handleEditCar(car)}
                  >
                    <Text className="text-black text-xs text-center">Edit</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  className="bg-gray-300 px-4 py-1 rounded-full mb-9"
                  onPress={() => handleWorkOrder(car)}
                >
                  <Text className="text-black text-xs text-center">Work Order</Text>
                </TouchableOpacity>
              </View>
            </View>
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
};

export default RegisteredCars;
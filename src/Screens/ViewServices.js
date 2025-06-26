
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { API_BASE_URL } from '../utils/config';
import Search from '../Components/Search';
import ServiceCard from '../Components/ServiceCard';
import showToast from '../utils/Toast';

export default function ViewServices() {
  const navigation = useNavigation();
  const route = useRoute();
  const { workOrderId } = route.params || {};

  const [repairs, setRepairs] = useState([]);
  const [filteredRepairs, setFilteredRepairs] = useState([]); // New state for filtered repairs
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
        if (!decoded._id || !decoded.role) throw new Error('Invalid token payload');
        setUserId(decoded._id);
        setUserRole(decoded.role);
      } catch (error) {
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

  const fetchRepairs = useCallback(async (isLoadMore = false) => {
    if (!userId || !userRole || !workOrderId) return;

    try {
      const token = await AsyncStorage.getItem('jwt_token');
      const params = {
        userId,
        page,
        limit: 10,
      };

      if (isLoadMore) setLoadingMore(true);
      else setInitialLoading(true);

      const response = await axios.get(
        `${API_BASE_URL}/repairs/${workOrderId}/allowed`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params,
        },
      );

      const { repairs: fetched, total } = response.data;
      setTotalPages(Math.ceil(total / 10));

      setRepairs((prev) => {
        const existingIds = new Set(prev.map((r) => r._id));
        const newRepairs = fetched.filter((r) => !existingIds.has(r._id));
        return isLoadMore ? [...prev, ...newRepairs] : fetched;
      });
    } catch (error) {
      showToast({
                    type: 'error', 
                    title: 'Error',
                    message:  error.response?.data?.message || 'Failed to fetch repairs.'
                  });
      
    } finally {
      setInitialLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [userId, userRole, workOrderId, page]);

  useEffect(() => {
    if (userId && userRole && workOrderId) {
      fetchRepairs(page > 1);
    }
  }, [userId, userRole, workOrderId, page, fetchRepairs]);

  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredRepairs(repairs); // Show all repairs if no query
      return;
    }
    const filtered = repairs.filter(
      (repair) =>
        repair.mechanicName?.toLowerCase().includes(query) ||
        repair.partName?.toLowerCase().includes(query)
    );
    setFilteredRepairs(filtered);
  }, [searchQuery, repairs]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setSearchQuery(''); // Clear search query on refresh
    setPage(1);
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const loadMore = () => {
    if (page < totalPages && !loadingMore) {
      setPage((prev) => prev + 1);
    }
  };

  const renderRepair = ({ item: repair }) => (
    <ServiceCard
      key={repair._id}
      id={repair._id}
      partName={repair.partName}
      price={repair.price.toString()}
      date={new Date(repair.finishDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })}
      mechanic={repair.mechanicName}
      notes={repair.notes || ''}
      submitted={repair.submitted}
      beforeImageUrl={repair.beforeImageUri}
      afterImageUrl={repair.afterImageUri}
      onPress={() => {
        if (
          (userRole === 'technician' || userRole === 'shopManager') &&
          repair.submitted
        ) {
          showToast({
                type: 'error',
                title: 'Cannot Edit',
                message: 'You cannot edit this service as it is submitted.',
              });
        } else {
          navigation.navigate('EditServiceScreen', {
            repairId: repair._id,
            workOrderId,
          });
        }
      }}
    />
  );

  if (initialLoading) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black pt-16">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 pt-4 mb-2">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require('../../assets/back.png')} className="w-6 h-6" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-semibold">View Services</Text>
        {(userRole === 'shopManager' || userRole === 'systemAdministrator') && (
          <TouchableOpacity
            className="bg-gray-200 px-4 py-1 rounded-md"
            onPress={() => navigation.navigate('NewService', { workOrderId })}
          >
            <Text className="text-black text-sm">+ New Service</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search */}
      <View className="px-4 mb-4">
        <Search onSearch={handleSearch} />
      </View>

      {/* Role-based conditional rendering */}
      {userRole === 'systemAdministrator' && (
        <Text className="text-white text-center mb-4">
          Admin: You can manage all repairs and settings.
        </Text>
      )}
      {userRole === 'technician' && (
        <Text className="text-white text-center mb-4">
          Technician: You can view and update repair details (if not submitted).
        </Text>
      )}
      {userRole === 'shopManager' && (
        <Text className="text-white text-center mb-4">
          Shop Manager: You can manage repairs and assignments.
        </Text>
      )}

      {/* Paginated List */}
      <FlatList
        data={filteredRepairs} // Use filteredRepairs instead of filtered repairs inline
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={renderRepair}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" />}
        ListEmptyComponent={<Text className="text-white text-center">No repairs found.</Text>}
        ListFooterComponent={loadingMore && <ActivityIndicator size="small" color="#ffffff" style={{ marginVertical: 10 }} />}
        contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 16 }}
      />
    </SafeAreaView>
  );
}
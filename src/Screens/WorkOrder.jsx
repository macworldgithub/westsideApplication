
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { API_BASE_URL } from '../utils/config';
import Search from '../Components/Search';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import showToast from '../utils/Toast';

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
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [downloadingReportId, setDownloadingReportId] = useState(null);
  const [startDate, setStartDate] = useState(null); // New state for startDate
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false); // Control date picker visibility

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
        if (!decoded._id || !decoded.role) throw new Error('Invalid token');
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

  const fetchWorkOrders = useCallback(
    async (isLoadMore = false) => {
      if (!userId || !userRole || !carId) return;
      try {
        const token = await AsyncStorage.getItem('jwt_token');
        const params = {
          userId,
          page,
          limit: 10,
          ...(startDate && { startDate: startDate.toISOString().split('T')[0] }), // Add startDate to params
        };
        if (isLoadMore) setLoadingMore(true);
        else setInitialLoading(true);

        const response = await axios.get(
          `${API_BASE_URL}/workorder/get-work-order-by-carId-with-permission/${carId}/search`,
          { headers: { Authorization: `Bearer ${token}` }, params }
        );

        const { data, total } = response.data;
        const formattedOrders = data.map((order) => ({
          id: order._id,
          owner: order.ownerName || 'Unknown',
          mechanic: order.headMechanic || 'Unassigned',
          status: order.status === 'in_progress' ? 'Inprogress' : 'Completed',
          car: order.car,
        }));

        setTotalPages(Math.ceil(total / 10));
        setWorkOrders((prev) => {
          const updated = isLoadMore
            ? [
                ...prev,
                ...formattedOrders.filter((o) => !prev.some((p) => p.id === o.id)),
              ]
            : formattedOrders;
          return updated;
        });
      } catch (error) {
        showToast({
          type: 'error',
          title: 'Error',
          message: error.response?.data?.message || 'Failed to fetch work orders.',
        });
      } finally {
        setInitialLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [userId, userRole, carId, page, startDate] // Add startDate to dependencies
  );

  useEffect(() => {
    if (userId && userRole && carId) {
      fetchWorkOrders(page > 1);
    }
  }, [userId, userRole, carId, page, startDate]); // Add startDate to dependencies

  useEffect(() => {
    const focusListener = navigation.addListener('focus', () => {
      if (userId && userRole && carId) {
        setPage(1);
        fetchWorkOrders();
      }
    });
    return () => focusListener();
  }, [navigation, userId, userRole, carId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setSearchQuery('');
    setStartDate(null); // Reset startDate on refresh
    setPage(1);

    if (page === 1) {
      fetchWorkOrders(false);
    }
  }, [page, fetchWorkOrders]);

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredOrders(workOrders);
      return;
    }
    const filtered = workOrders.filter(
      (order) =>
        order.owner.toLowerCase().includes(query) ||
        order.mechanic.toLowerCase().includes(query) ||
        order.status.toLowerCase().includes(query) ||
        order.id.toLowerCase().includes(query)
    );
    setFilteredOrders(filtered);
  }, [searchQuery, workOrders]);

  const loadMoreOrders = () => {
    if (page < totalPages && !loadingMore) {
      setPage((prev) => prev + 1);
    }
  };

  const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const handleDownloadReport = async (workOrderId) => {
    try {
      setDownloadingReportId(workOrderId);
      const token = await AsyncStorage.getItem('jwt_token');
      if (!token) {
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to authenticate. Please log in again.',
          onHide: () => navigation.navigate('Login'),
        });
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/report/get-report-workorder/${workOrderId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'arraybuffer',
        }
      );

      const filePath = `${FileSystem.documentDirectory}repair_report_${workOrderId}.pdf`;
      const base64Data = arrayBufferToBase64(response.data);
      await FileSystem.writeAsStringAsync(filePath, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/pdf',
          dialogTitle: 'Open or Save Repair Report',
        });
      } else {
        showToast({
          type: 'success',
          title: 'Success',
          message: `PDF saved to ${filePath}`,
        });
      }
    } catch (error) {
      console.error('Download Error:', error);
      let errorMessage = 'Failed to download report.';
      if (error.response) {
        try {
          const text = new TextDecoder('utf-8').decode(
            new Uint8Array(error.response.data)
          );
          const json = JSON.parse(text);
          errorMessage = json.message || errorMessage;
        } catch (e) {
          // Fallback to default message if parsing fails
        }
      }
      showToast({
        type: 'error',
        title: 'Error',
        message: errorMessage,
      });
    } finally {
      setDownloadingReportId(null);
    }
  };

  // Date picker handlers
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirmDate = (date) => {
    setStartDate(date);
    setPage(1); // Reset to first page when date changes
    hideDatePicker();
  };

  const clearDateFilter = () => {
    setStartDate(null);
    setPage(1); // Reset to first page when clearing date
  };

  const renderOrder = ({ item: order }) => (
    <TouchableOpacity
      key={order.id}
      onPress={() =>
        navigation.navigate('ViewServices', { workOrderId: order.id })
      }
      className="flex-row items-center bg-white p-3 rounded-xl mb-4"
    >
      <View className="w-12 h-12 mr-3 bg-gray-200 rounded-xl items-center justify-center overflow-hidden">
        <Image
          source={require('../../assets/clipboard.png')}
          className="w-full h-full resize-contain"
        />
      </View>
      <View className="flex-1">
        <Text className="text-black font-semibold">Order No: {order.id}</Text>
        <Text className="text-black text-sm">Owner Name: {order.owner}</Text>
        <Text className="text-black text-sm">Head Mechanic: {order.mechanic}</Text>
      </View>
      <View className="items-center">
        <Text className="text-black text-xs mb-1">Status</Text>
        <TouchableOpacity
          className={`rounded-full mb-1 ${getStatusColor(order.status)}`}
          style={{ width: 80, height: 20 }}
        >
          <Text className="text-xs text-black text-center">{order.status}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-black rounded-full mb-1"
          style={{ width: 80, height: 20 }}
          onPress={() => handleDownloadReport(order.id)}
          disabled={downloadingReportId === order.id}
        >
          {downloadingReportId === order.id ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text className="text-white text-xs text-center">Report</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-black rounded-full"
          style={{ width: 80, height: 20 }}
          onPress={() =>
            navigation.navigate('CarOrderDetails', { workOrderId: order.id })
          }
        >
          <Text className="text-white text-xs text-center">View</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (initialLoading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black px-4 pt-16">
      <View className="flex-row items-center justify-between mb-8">
        <TouchableOpacity onPress={() => navigation.navigate('RegisteredCars')}>
          <Image source={require('../../assets/back.png')} className="w-6 h-6" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-semibold ml-4">
          Work Orders
        </Text>
        {(userRole === 'shopManager' || userRole === 'systemAdministrator') && (
          <TouchableOpacity
            className="bg-gray-200 px-4 py-/process/sha1sum /home/user/grok3/requirements.txt1 rounded-md"
            onPress={() => navigation.navigate('NewWorkOrder', { carId })}
          >
            <Text className="text-black text-sm">+ New Order</Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="mb-4">
        <Search onSearch={handleSearch} />
      </View>

      {/* Date Filter UI */}
      <View className="flex-row items-center justify-between mb-4">
        <TouchableOpacity
          className="bg-gray-200 px-4 py-2 rounded-md"
          onPress={showDatePicker}
        >
          <Text className="text-black text-sm">
            {startDate
              ? `From: ${startDate.toISOString().split('T')[0]}`
              : 'Select Start Date'}
          </Text>
        </TouchableOpacity>
        {startDate && (
          <TouchableOpacity
            className="bg-red-500 px-4 py-2 rounded-md"
            onPress={clearDateFilter}
          >
            <Text className="text-white text-sm">Clear Date</Text>
          </TouchableOpacity>
        )}
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
        maximumDate={new Date()} // Prevent future dates
      />

      <FlatList
        data={filteredOrders}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={renderOrder}
        onEndReached={loadMoreOrders}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ffffff"
          />
        }
        ListEmptyComponent={
          <Text className="text-white text-center">No work orders found.</Text>
        }
        ListFooterComponent={
          loadingMore && (
            <ActivityIndicator
              size="small"
              color="#ffffff"
              style={{ marginVertical: 10 }}
            />
          )
        }
      />
    </View>
  );
}
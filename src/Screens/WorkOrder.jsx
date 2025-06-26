// import React, { useState, useEffect, useCallback } from 'react';
// import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, RefreshControl } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';
// import { jwtDecode } from 'jwt-decode';
// import { API_BASE_URL } from '../utils/config';
// import Search from '../Components/Search';

// const getStatusColor = (status) => {
//   switch (status) {
//     case 'Inprogress':
//       return 'bg-green-300';
//     case 'Completed':
//       return 'bg-green-500';
//     default:
//       return 'bg-gray-300';
//   }
// };

// export default function WorkOrdersScreen() {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const { carId } = route.params || {};

//   const [workOrders, setWorkOrders] = useState([]);
//   const [initialLoading, setInitialLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [userId, setUserId] = useState(null);
//   const [userRole, setUserRole] = useState(null);

//   // Fetch user details from JWT token
//   useEffect(() => {
//     const fetchUserDetails = async () => {
//       try {
//         const token = await AsyncStorage.getItem('jwt_token');
//         if (!token) {
//           console.warn('No token found in AsyncStorage');
//           Alert.alert('Session Expired', 'Please log in again.', [
//             { text: 'OK', onPress: () => navigation.navigate('Login') },
//           ]);
//           return;
//         }
//         console.log('JWT Token:', token);
//         const decoded = jwtDecode(token);
//         if (!decoded._id || !decoded.role) {
//           throw new Error('Invalid token payload: missing _id or role');
//         }
//         setUserId(decoded._id);
//         setUserRole(decoded.role);
//         console.log('Decoded JWT:', decoded);
//       } catch (error) {
//         console.error('Error decoding token:', error);
//         Alert.alert('Error', 'Failed to authenticate. Please log in again.', [
//           { text: 'OK', onPress: () => navigation.navigate('Login') },
//         ]);
//       }
//     };
//     fetchUserDetails();
//   }, [navigation]);

//   // Fetch work orders from backend
//   const fetchWorkOrders = useCallback(async () => {
//     if (!userId || !userRole || !carId) return;

//     try {
//       const token = await AsyncStorage.getItem('jwt_token');
//       const params = {
//         userId,
//         search: searchQuery.trim() || undefined,
//         page,
//         limit: 10,
//       };
//       console.log('Fetching work orders with params:', { carId, ...params });
//       const response = await axios.get(
//         `${API_BASE_URL}/workorder/get-work-order-by-carId-with-permission/${carId}/search`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           params,
//         },
//       );
//       const { data, total } = response.data;
//       const formattedOrders = data.map((order) => ({
//         id: order._id,
//         owner: order.ownerName || 'Unknown',
//         mechanic: order.headMechanic || 'Unassigned',
//         status: order.status === 'in_progress' ? 'Inprogress' : 'Completed',
//         car: order.car,
//       }));
//       setWorkOrders(formattedOrders);
//       setTotalPages(Math.ceil(total / 10));
//       console.log('API Response:', { data, total, searchQuery });
//     } catch (error) {
//       console.error('Error fetching work orders:', error.response?.data || error);
//       Alert.alert('Error', error.response?.data?.message || 'Failed to fetch work orders. Please try again.');
//     } finally {
//       setInitialLoading(false);
//       setRefreshing(false);
//     }
//   }, [userId, userRole, carId, page, searchQuery]);

//   // Trigger fetchWorkOrders on mount and when screen is focused
//   useEffect(() => {
//     fetchWorkOrders();
//     const focusListener = navigation.addListener('focus', fetchWorkOrders);
//     return () => focusListener();
//   }, [navigation, fetchWorkOrders]);

//   // Handle pull-to-refresh
//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     setPage(1);
//     fetchWorkOrders();
//   }, [fetchWorkOrders]);

//   // Handle search input
//   const handleSearch = useCallback((text) => {
//     console.log('Search input:', text);
//     setSearchQuery(text);
//     setPage(1); // Reset to first page on new search
//   }, []);

//   if (initialLoading) {
//     return (
//       <View className="flex-1 bg-black justify-center items-center">
//         <ActivityIndicator size="large" color="#ffffff" />
//       </View>
//     );
//   }

//   return (
//     <View className="flex-1 bg-black px-4 pt-16">
//       {/* Header */}
//       <View className="flex-row items-center justify-between mb-8">
//         <View className="flex-row items-center space-x-2">
//           <TouchableOpacity onPress={() => navigation.navigate('RegisteredCars')}>
//             <Image source={require('../../assets/back.png')} className="w-6 h-6" />
//           </TouchableOpacity>
//           <Text className="text-white text-lg font-semibold ml-4">Work Orders</Text>
//         </View>
//         {/* Show New Order button only for shopManager or systemAdministrator */}
//         {(userRole === 'shopManager' || userRole === 'systemAdministrator') && (
//           <TouchableOpacity
//             className="bg-gray-200 px-4 py-1 rounded-md"
//             onPress={() => navigation.navigate('NewWorkOrder', { carId })}
//           >
//             <Text className="text-black text-sm">+ New Order</Text>
//           </TouchableOpacity>
//         )}
//       </View>

//       {/* Search */}
//       <View className="mb-4">
//         <Search onSearch={handleSearch} />
//       </View>

//       {/* Role-based conditional rendering */}
//       {userRole === 'systemAdministrator' && (
//         <Text className="text-white text-center mb-4">
//           Admin: You can manage all work orders and settings.
//         </Text>
//       )}
//       {userRole === 'technician' && (
//         <Text className="text-white text-center mb-4">
//           Technician: You can view work order details.
//         </Text>
//       )}
//       {userRole === 'shopManager' && (
//         <Text className="text-white text-center mb-4">
//           Shop Manager: You can manage work orders and assignments.
//         </Text>
//       )}

//       {/* Order Cards */}
//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" />
//         }
//       >
//         {workOrders.length === 0 ? (
//           <Text className="text-white text-center">No work orders found.</Text>
//         ) : (
//           workOrders.map((order) => (
//             <TouchableOpacity
//               key={order.id}
//               onPress={() => navigation.navigate('ViewServices', { workOrderId: order.id })}
//               className="flex-row items-center bg-white p-3 rounded-xl mb-4"
//             >
//               {/* Image */}
//               <View className="w-12 h-12 mr-3 bg-gray-200 rounded-xl items-center justify-center overflow-hidden">
//                 <Image
//                   source={require('../../assets/clipboard.png')}
//                   className="w-full h-full resize-contain"
//                 />
//               </View>

//               {/* Order Info */}
//               <View className="flex-1">
//                 <Text className="text-black font-semibold">Order No: {order.id}</Text>
//                 <Text className="text-black text-sm">Owner Name: {order.owner}</Text>
//                 <Text className="text-black text-sm">Head Mechanic: {order.mechanic}</Text>
//               </View>

//               {/* Buttons Section */}
//               <View className="items-center space-y-1.5">
//                 <Text className="text-black text-xs mb-1">Status</Text>
//                 <TouchableOpacity
//                   className={`rounded-full mb-1 items-center justify-center ${getStatusColor(order.status)}`}
//                   style={{ width: 80, height: 20 }}
//                 >
//                   <Text className="text-xs text-black">{order.status}</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   className="bg-black rounded-full mb-1 items-center justify-center"
//                   style={{ width: 80, height: 20 }}
//                   onPress={() => navigation.navigate('ReportScreen', { workOrderId: report.id })}
//                 >
//                   <Text className="text-white text-xs">Report</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   className="bg-black rounded-full items-center justify-center"
//                   style={{ width: 80, height: 20 }}
//                   onPress={() => navigation.navigate('CarOrderDetails', { workOrderId: order.id })}
//                 >
//                   <Text className="text-white text-xs">View</Text>
//                 </TouchableOpacity>
//               </View>
//             </TouchableOpacity>
//           ))
//         )}
//       </ScrollView>

//       {/* Pagination Controls */}
//       <View className="flex-row justify-between mt-4">
//         <TouchableOpacity
//           className="bg-[#666666] px-4 py-2 rounded-md"
//           disabled={page === 1}
//           onPress={() => setPage((prev) => Math.max(prev - 1, 1))}
//         >
//           <Text className="text-white">Previous</Text>
//         </TouchableOpacity>
//         <Text className="text-white">Page {page} of {totalPages}</Text>
//         <TouchableOpacity
//           className="bg-[#666666] px-4 py-2 rounded-md"
//           disabled={page === totalPages}
//           onPress={() => setPage((prev) => prev + 1)}
//         >
//           <Text className="text-white">Next</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }
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

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('jwt_token');
        if (!token) {
          showToast({
              type: 'error', 
              title: 'Session Expired',
              message: 'Please log in again.',
              onHide: () => navigation.navigate('Login')
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
              message:  error.response?.data?.message || 'Failed to fetch work orders.'
            });
      } finally {
        setInitialLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [userId, userRole, carId, page]
  );

  useEffect(() => {
    if (userId && userRole && carId) {
      fetchWorkOrders(page > 1);
    }
  }, [userId, userRole, carId, page]);

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
              message:  `PDF saved to ${filePath}`
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
              message:  errorMessage
            });
    } finally {
      setDownloadingReportId(null);
    }
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
            className="bg-gray-200 px-4 py-1 rounded-md"
            onPress={() => navigation.navigate('NewWorkOrder', { carId })}
          >
            <Text className="text-black text-sm">+ New Order</Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="mb-4">
        <Search onSearch={handleSearch} />
      </View>

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
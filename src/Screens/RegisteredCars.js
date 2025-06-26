// import React, { useState, useEffect, useCallback } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   ActivityIndicator,
//   RefreshControl,
// } from 'react-native';
// import { FontAwesome } from '@expo/vector-icons';
// import {jwtDecode} from 'jwt-decode';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';
// import { API_BASE_URL } from '../utils/config';
// import Button from '../Components/Button';
// import Search from '../Components/Search';

// const RegisteredCars = ({ navigation }) => {
//   const [userRole, setUserRole] = useState(null);
//   const [userId, setUserId] = useState(null);
//   const [cars, setCars] = useState([]);
//   const [initialLoading, setInitialLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [filter, setFilter] = useState('ongoing');

//   // Fetch user details from JWT token
//   useEffect(() => {
//     const fetchUserDetails = async () => {
//       try {
//         const token = await AsyncStorage.getItem('jwt_token');
//         if (!token) {
//           console.warn('No token found in AsyncStorage');
//           alert('Please log in again.');
//           navigation.navigate('Login');
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
//         alert('Failed to authenticate. Please log in again.');
//         navigation.navigate('Login');
//       }
//     };
//     fetchUserDetails();
//   }, [navigation]);

//   // Fetch cars from backend
//   const fetchCars = useCallback(async () => {
//     if (!userId || !userRole) return;

//     try {
//       const token = await AsyncStorage.getItem('jwt_token');
//       const params = {
//         page,
//         limit: 10,
//         search: searchQuery.trim() || undefined,
//       };
//       console.log('Fetching cars with params:', { userId, ...params });
//       const response = await axios.get(
//         `${API_BASE_URL}/vehicle/cars-by-user/${userId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           params,
//         }
//       );
//       const { data, total } = response.data;
//       setCars(data);
//       setTotalPages(Math.ceil(total / 10));
//       console.log('API Response:', { data, total, searchQuery });
//     } catch (error) {
//       console.error('Error fetching cars:', error.response?.data || error);
//       alert(`Failed to fetch cars: ${error.response?.data?.message || error.message}`);
//     } finally {
//       setInitialLoading(false);
//       setRefreshing(false);
//     }
//   }, [userId, userRole, page, searchQuery]);

//   // Trigger fetchCars on mount and when screen is focused
//   useEffect(() => {
//     fetchCars();
//     const focusListener = navigation.addListener('focus', fetchCars);
//     return () => focusListener();
//   }, [navigation, fetchCars]);

//   // Handle pull-to-refresh
//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     setPage(1); // Reset to first page on refresh
//     fetchCars();
//   }, [fetchCars]);

//   // Handle search input
//   const handleSearch = (text) => {
//     console.log('Search input:', text);
//     setSearchQuery(text);
//     setPage(1); // Reset to first page on new search
//   };

//   // Handle filter tab change
//   const handleFilterChange = (newFilter) => {
//     setFilter(newFilter);
//     setPage(1); // Reset to first page on filter change
//     // TODO: Implement backend filter for ongoing/next5days
//   };

//   // Navigation to EditCarDetail
//   const handleEditCar = (car) => {
//     navigation.navigate('EditCarDetail', { car });
//   };

//   // Navigation to WorkOrder
//   const handleWorkOrder = (car) => {
//     navigation.navigate('WorkOrder', { carId: car._id });
//   };

//   if (initialLoading) {
//     return (
//       <View className="flex-1 bg-black justify-center items-center">
//         <ActivityIndicator size="large" color="#ffffff" />
//       </View>
//     );
//   }

//   return (
//     <View className="flex-1 bg-black px-4 pt-12">
//       {/* Header */}
//       <View className="flex-row justify-between items-center mb-8">
//         <Text className="text-white text-xl font-semibold">Registered Cars</Text>
//         {/* Show Button only for non-technicians */}
//         {userRole !== 'technician' && <Button navigation={navigation} />}
//       </View>

//       {/* Search */}
//       <View className="mb-4">
//         <Search onSearch={handleSearch} />
//       </View>

//       {/* Role-based conditional rendering */}
//       {userRole === 'systemAdministrator' && (
//         <Text className="text-white text-center mb-4">
//           Admin: You can manage all cars and settings.
//         </Text>
//       )}
//       {userRole === 'technician' && (
//         <Text className="text-white text-center mb-4">
//           Technician: You can view car repair details.
//         </Text>
//       )}
//       {userRole === 'shopManager' && (
//         <Text className="text-white text-center mb-4">
//           Shop Manager: You can manage inventory and work orders.
//         </Text>
//       )}

//       {/* Car Cards */}
//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" />
//         }
//       >
//         {cars.length === 0 ? (
//           <Text className="text-white text-center">No cars found.</Text>
//         ) : (
//           cars.map((car) => (
//             <View
//               key={car._id}
//               className="flex-row bg-white rounded-xl p-3 mb-4"
//             >
//               <Image
//                 source={car.image ? { uri: car.image } : require('../../assets/Car.png')}
//                 className="w-20 h-20 rounded-lg"
//                 resizeMode="cover"
//               />
//               <View className="flex-1 ml-3 justify-between">
//                 <Text className="text-black text-base font-bold">{car.plate}</Text>
                
//                 <Text className="text-gray-400 text-xs">{car.model}</Text>
//                 <Text className="text-gray-400 text-xs">{car.variant}</Text>
//                 <Text className="text-gray-400 text-xs">{car.year}</Text>
//                 <Text className="text-gray-400 text-xs">{car.chassisNumber}</Text>
//               </View>
//               <View className="justify-between ml-2">
//                 {/* Explicitly exclude Edit button for technicians */}
//                 {(userRole === 'systemAdministrator' || userRole === 'shopManager') && (
//                   <TouchableOpacity
//                     className="bg-gray-300 px-2 py-1 rounded-full"
//                     onPress={() => handleEditCar(car)}
//                   >
//                     <Text className="text-black text-xs text-center">Edit</Text>
//                   </TouchableOpacity>
//                 )}
//                 <TouchableOpacity
//                   className="bg-gray-300 px-4 py-1 rounded-full mb-9"
//                   onPress={() => handleWorkOrder(car)}
//                 >
//                   <Text className="text-black text-xs text-center">Work Order</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
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
// };

// export default RegisteredCars;


import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

import { jwtDecode } from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../utils/config';
import Button from '../Components/Button';
import Search from '../Components/Search';
import showToast from '../utils/Toast';

const RegisteredCars = ({ navigation }) => {
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch user details
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

  // Fetch cars from backend
  const fetchCars = useCallback(async (isLoadMore = false) => {
    if (!userId || !userRole) return;

    try {
      const token = await AsyncStorage.getItem('jwt_token');
      const params = {
        page,
        limit: 10,
        search: '', // always fetch all and filter on client side
      };

      if (isLoadMore) setLoadingMore(true);
      else setInitialLoading(true);

      const response = await axios.get(`${API_BASE_URL}/vehicle/cars-by-user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      const { data, total } = response.data;
      console.log(data)
      console.log(total)

      setTotalPages(Math.ceil(total / 10));

      const updatedList = isLoadMore
        ? [...cars, ...data.filter(car => !cars.some(existing => existing._id === car._id))]
        : data;

      setCars(updatedList);
    } catch (error) {
      showToast({
            type: 'error', 
            title: 'Error',
            message: `Failed to fetch cars: ${error.response?.data?.message || error.message}`
          });
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [userId, userRole, page,searchQuery]);

  // Refresh or search
  useEffect(() => {
    fetchCars(page > 1);
  }, [userId, userRole, page]);

  useEffect(() => {
    const focusListener = navigation.addListener('focus', () => {
      if (userId && userRole) {
        setPage(1);
        fetchCars();
      }
    });
    return () => focusListener();
  }, [navigation, userId, userRole]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setSearchQuery('')
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  // Filter logic (client-side)
  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredCars(cars);
      return;
    }
    const filtered = cars.filter(car =>
      car.plate?.toLowerCase().includes(query) ||
      car.model?.toLowerCase().includes(query) ||
      car.variant?.toLowerCase().includes(query) ||
      car.year?.toString().includes(query) ||
      car.chassisNumber?.toLowerCase().includes(query)
    );
    setFilteredCars(filtered);
  }, [searchQuery, cars]);

  const handleEditCar = (car) => navigation.navigate('EditCarDetail', { car });
  const handleWorkOrder = (car) => navigation.navigate('WorkOrder', { carId: car._id });
  const loadMoreCars = () => {
    if (page < totalPages && !loadingMore) {
      setPage(prev => prev + 1);
    }
  };

  const renderCar = ({ item: car }) => (
    <View className="flex-row bg-white rounded-xl p-3 mb-4">
      {car.image ? (
          <Image
            source={{ uri: car.image }}
            className="w-20 h-20 rounded-lg"
            resizeMode="cover"
          />
        ) : (
          <View className="w-20 h-20 rounded-lg bg-gray-200 items-center justify-center">
            <Icon name="image" size={30} color="#888" />
          </View>
        )}
      <View className="flex-1 ml-3 justify-between">
        <Text className="text-black text-base font-bold">{car.plate}</Text>
        <Text className="text-gray-400 text-xs">{car.model}</Text>
        <Text className="text-gray-400 text-xs">{car.variant}</Text>
        <Text className="text-gray-400 text-xs">{car.year}</Text>
        <Text className="text-gray-400 text-xs">{car.chassisNumber}</Text>
      </View>
      <View className="justify-between ml-2">
        {(userRole === 'systemAdministrator' || userRole === 'shopManager') && (
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
  );

  if (initialLoading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black px-4 pt-12">
      <View className="flex-row justify-between items-center mb-8">
        <Text className="text-white text-xl font-semibold">Registered Cars</Text>
        {userRole !== 'technician' && <Button navigation={navigation} />}
      </View>

      <View className="mb-4">
        <Search onSearch={handleSearch} />
      </View>

      {userRole === 'systemAdministrator' && (
        <Text className="text-white text-center mb-4">Admin: You can manage all cars and settings.</Text>
      )}
      {userRole === 'technician' && (
        <Text className="text-white text-center mb-4">Technician: You can view car repair details.</Text>
      )}
      {userRole === 'shopManager' && (
        <Text className="text-white text-center mb-4">Shop Manager: You can manage inventory and work orders.</Text>
      )}

      <FlatList
        data={filteredCars}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={renderCar}
        onEndReached={loadMoreCars}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" />
        }
        ListEmptyComponent={
          <Text className="text-white text-center mt-10">No cars found.</Text>
        }
        ListFooterComponent={
          loadingMore && (
            <ActivityIndicator size="small" color="#ffffff" style={{ marginVertical: 10 }} />
          )
        }
      />
    </View>
  );
};

export default RegisteredCars;

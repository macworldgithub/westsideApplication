import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const CarOrderDetails = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView className="px-4 pt-4">

        {/* Header with Back Arrow */}
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => navigation.navigate('NewWorkOrder')}>
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
          <Text className="text-white text-lg font-semibold">BMW</Text>
          <Text className="text-white text-lg font-semibold">$26.32</Text>
        </View>

        {/* Details */}
        <View className="space-y-1">
          <Text className="text-white text-base">Order No: 0124568</Text>
          <Text className="text-white text-base">Owner Name: Paul</Text>
          <Text className="text-white text-base">Head Mechanic: Walker</Text>

          {/* Phone Row */}
          <View className="flex-row items-center justify-between">
            <Text className="text-white text-base">Phone No: +92-12345678</Text>
            <View className="flex-row space-x-4">
              <MaterialCommunityIcons name="phone-outline" color="#fff" size={20} />
              <MaterialCommunityIcons name="message-outline" color="#fff" size={20} />
            </View>
          </View>

          <Text className="text-white text-base">Start Date: 05-11-2023</Text>
          <Text className="text-white text-base">Finish Date: 05-11-2023</Text>
          <Text className="text-white text-base">Status: In Progress</Text>
        </View>

        {/* Edit Button */}
        <TouchableOpacity className="bg-neutral-900 mt-6 py-3 rounded-xl shadow-xl shadow-slate-300 mx-auto w-40">
          <Text className="text-white text-center text-base font-semibold">Edit</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CarOrderDetails;
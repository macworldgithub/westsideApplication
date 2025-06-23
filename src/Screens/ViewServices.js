import React from 'react';
import { View, Text, ScrollView,TouchableOpacity,Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Search from '../Components/Search';
import Button from '../Components/Button';
import ServiceCard from '../Components/ServiceCard';
import { useNavigation } from '@react-navigation/native';
const ViewServices = () => {
    const navigation = useNavigation();
  
  return (
    <SafeAreaView className="flex-1 bg-black pt-16">
      {/* Header inside SafeArea */}
      <SafeAreaView>
        <View className="flex-row justify-between items-center px-4 pt-4 mb-2">
           <TouchableOpacity onPress={() => navigation.navigate('WorkOrder')}>
              <Image source={require('../../assets/back.png')} className="w-6 h-6" /> 
          </TouchableOpacity>
          <Text className="text-white text-lg font-semibold">View Services</Text>
          <TouchableOpacity
                    className="bg-gray-200 px-4 py-1 rounded-md"
                    onPress={() => navigation.navigate('NewService')}
          >
            <Text className="text-black text-sm">+ New Service</Text>
          </TouchableOpacity>
        </View>
        
      </SafeAreaView>

      {/* Scrollable content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View className="px-4 ">
          <Search />
        </View>

        {/* Service Cards */}
        <View className="space-y-4 px-4 mt-2">
          <ServiceCard
            id="0215648"
            partName="Brakes"
            price="12"
            date="5-11-2023"
            mechanic="Walker"
            notes="Lorem ipsum Lorem ipsum Lorem ipsumLorem ipsu"
          />
          <ServiceCard
            id="0215648"
            partName="Brakes"
            price="12"
            date="5-11-2023"
            mechanic="Walker"
            notes="Lorem ipsum Lorem ipsum Lorem ipsumLorem ipsu"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ViewServices;

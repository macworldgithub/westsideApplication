import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Search from '../Components/Search';
import Button from '../Components/Button';
import ServiceCard from '../Components/ServiceCard';

const ViewServices = () => {
  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header inside SafeArea */}
      <SafeAreaView>
        <View className="flex-row justify-between items-center px-4 pt-4 mb-2">
          <Text className="text-white text-lg font-semibold">View Services</Text>
          <Button title="+ New Services" />
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

import React from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ImageWithButtons = () => {
  const navigation = useNavigation();

  return (
    <View className="flex-row items-center bg-gray-200 p-4 rounded-xl mb-4">
      <Image
        source={require('../assets/Car.png')}
        className="w-20 h-20 rounded-full mr-4"
      />
      <View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          className="bg-gray-500 py-1 px-4 rounded-full mb-2"
        >
          <Text className="text-white text-center">Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('WorkOrder')}
          className="bg-gray-500 py-1 px-4 rounded-full"
        >
          <Text className="text-white text-center">WorkOrder</Text>
        </TouchableOpacity>
      
      </View>
    </View>
  );
};

export default ImageWithButtons;

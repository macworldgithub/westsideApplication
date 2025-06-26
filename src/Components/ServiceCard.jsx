import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const ServiceCard = ({
  id,
  partName,
  price,
  date,
  mechanic,
  notes,
  submitted,
  beforeImageUrl,
  afterImageUrl,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-xl p-4 mb-4 mx-2 shadow-sm"
    >
      {/* ID and Price */}
      <View className="flex-row justify-between mb-1">
        <Text className="text-black font-semibold">Id: {id}</Text>
        <Text className="text-black font-bold">Price: ${price}</Text>
      </View>

      {/* Details */}
      <Text className="text-black">Part Name: {partName}</Text>
      <Text className="text-black">Finish Date: {date}</Text>
      <Text className="text-black">Mechanic Name: {mechanic}</Text>
      <Text className="text-black">Notes: {notes}</Text>
      <Text className="text-black">Status: {submitted ? 'Submitted' : 'Not Submitted'}</Text>

      {/* Before/After Section */}
      <View className="flex-row justify-start mt-3">
        {/* Before Section */}
        <View className="items-start mr-2">
          <Text className="text-black text-sm mb-1">Before</Text>
          {beforeImageUrl ? (
            <Image
              source={{ uri: beforeImageUrl }}
              className="w-20 h-20 rounded"
              resizeMode="cover"
            />
          ) : (
            <View className="w-20 h-20 rounded-lg bg-gray-200 items-center justify-center">
                  <Icon name="image" size={30} color="#888" />
            </View>
          )}
        </View>

        {/* After Section */}
        <View className="items-start">
          <Text className="text-black text-sm mb-1">After</Text>
          {afterImageUrl ? (
            <Image
              source={{ uri: afterImageUrl }}
              className="w-20 h-20 rounded"
              resizeMode="cover"
            />
          ) : (
            <View className="w-20 h-20 rounded-lg bg-gray-200 items-center justify-center">
                  <Icon name="image" size={30} color="#888" />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ServiceCard;
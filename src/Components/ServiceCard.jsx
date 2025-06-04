import React from 'react';
import { View, Text } from 'react-native';

const ServiceCard = ({ id, partName, price, date, mechanic, notes }) => {
  return (
    <View className="bg-white rounded-xl p-4 mb-4 mx-2 shadow-sm">
      {/* ID and Price */}
      <View className="flex-row justify-between mb-1">
        <Text className="text-black font-semibold">Id: {id}</Text>
        <Text className="text-black font-bold">Price: {price}$</Text> 
      </View>

      {/* Details */}
      <Text className="text-black">Part Name: {partName}</Text>
      <Text className="text-black">Finish Date: {date}</Text>
      <Text className="text-black">Mechanic Name: {mechanic}</Text>
      <Text className="text-black">Notes: {notes}</Text>

      {/* Before/After Section */}
     <View className="flex-row justify-start mt-3">
  {/* Before Section */}
  <View className="items-start mr-2"> {/* Added margin-right for gap */}
    <Text className="text-black text-sm mb-1">Before</Text>
    <View className="bg-gray-300 w-20 h-20 rounded" />
  </View>

  {/* After Section */}
  <View className=" items-start"> {/* Added margin-left for gap */}
    <Text className="text-black text-sm mb-1">After</Text>
    <View className="bg-gray-300 w-20 h-20 rounded" />
  </View>
</View>

    </View>
  );
};

export default ServiceCard;

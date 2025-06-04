
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
} from "react-native";

export default function HistoryDetail({ route, navigation }) {
  // get the item passed from HistoryList (if any)
  const item = {
    
    id: "0",
    date: "2025-01-01",
    description: "Sample Service",
    details: "This is a dummy history detail page.",
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Back button */}
        <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4">
          <Text className="text-blue-500">← Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <Text className="text-2xl font-bold mb-2">{item.description}</Text>
        <Text className="text-gray-500 mb-6">{item.date}</Text>

        {/* Detail section */}
        <View className="bg-gray-100 rounded-lg p-4">
          <Text className="text-base mb-2 font-semibold">Details:</Text>
          <Text className="text-gray-700">
            {item.details ||
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada."}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
const languages = [
  { name: "English", flag: require("../../assets/flag1.png") },
  { name: "Bahasa Indonesia", flag: require("../../assets/flag2.png") },
  { name: "中国人", flag: require("../../assets/flag3.png") },
  { name: "한국어", flag: require("../../assets/flag4.png") },
];

const LanguageScreen = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const navigation = useNavigation();

  const renderItem = ({ item }) => {
    const isSelected = item.name === selectedLanguage;

    return (
      <Pressable
        onPress={() => setSelectedLanguage(item.name)}
        className={`flex-row items-center px-4 py-4 mb-3 rounded-xl ${
          isSelected ? "border border-white" : "bg-black"
        }`}
      >
        <Image source={item.flag} className="w-6 h-6 mr-4 rounded-full" />
        <Text className="text-white text-base">{item.name}</Text>
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-[#111111] px-4 pt-6">
      <View>
        <TouchableOpacity
          onPress={() => navigation.navigate("Profile")}
          className="flex-row items-center py-12"
        >
          <FontAwesome name="angle-left" size={24} color="white" />
          <Text className="text-white text-lg ml-4 font-semibold">
            Language Setting
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <FlatList
          data={languages}
          renderItem={renderItem}
          keyExtractor={(item) => item.name}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      </View>
      <Pressable className="bg-black mt-auto py-4 rounded-xl items-center justify-center mb-10">
        <Text className="text-white font-semibold text-base">Save Change</Text>
      </Pressable>
    </View>
  );
};

export default LanguageScreen;

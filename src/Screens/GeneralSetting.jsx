import React from 'react';
import { View, Text, TouchableOpacity, FlatList,Pressable, Image } from 'react-native';
import Feather from 'react-native-vector-icons/Feather'; 
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
const settingsData = [
  { title: 'Language Setting', route: 'Language' },
  { title: 'Notification Setting', route: 'Notification' },
  { title: 'About EVNC', route: 'About' },
  { title: 'Term of Use', route: 'Terms' },
  { title: 'Privacy Policy', route: 'Privacy' },
];

const GeneralSettingsScreen = () => {
  const navigation = useNavigation();
  const renderItem = ({ item }) => (
    <Pressable
      className="bg-black rounded-xl px-4 py-5 flex-row items-center justify-between mb-3"
    >
      <Text className="text-white text-base">{item.title}</Text>
      <Feather name="chevron-right" size={20} color="#fff" />
    </Pressable>
  );

  return (
    <View className="flex-1 bg-[#111111] pt-6 px-4 ">
    {/* Header */}
          <View>
            <TouchableOpacity
              onPress={() => navigation.navigate("Profile")}
              className="flex-row items-center py-12"
            >
              <FontAwesome name="angle-left" size={24} color="white" />
              <Text className="text-white text-lg ml-4 font-semibold">
                General Setting
              </Text>
            </TouchableOpacity>
          </View>
<View>
      <FlatList
        data={settingsData}
        keyExtractor={(item) => item.title}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
    </View>
  );
};

export default GeneralSettingsScreen;

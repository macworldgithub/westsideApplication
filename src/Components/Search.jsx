import React from 'react';
import { TextInput, View } from 'react-native';
import { FontAwesome, Feather } from "@expo/vector-icons";

const Search = () => (
  <View className="flex-row items-center bg-white rounded-xl px-4 py-2 mb-4 mx-2 shadow-sm">
    <FontAwesome name="search" size={18} color="#aaa" />
    <TextInput
      placeholder="Search any car with plate number"
      placeholderTextColor="#aaa"
      className="ml-2 text-black flex-1"
    />
    <Feather name="filter" size={20} color="#aaa" />
  </View>
);

export default Search;

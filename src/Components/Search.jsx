import React from 'react';
import { TextInput, View } from 'react-native';
import { FontAwesome, Feather } from "@expo/vector-icons";

const Search = ({ onSearch, placeholder = "Search" }) => (
  <View className="flex-row items-center bg-white rounded-xl px-4 py-2 mb-4 mx-2 shadow-sm">
    <FontAwesome name="search" size={18} color="#aaa" />
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="#aaa"
      className="ml-2 text-black flex-1"
      onChangeText={onSearch}
      autoCapitalize="none"
      autoCorrect={false}
    />
    <Feather name="filter" size={20} color="#aaa" />
  </View>
);

export default Search;
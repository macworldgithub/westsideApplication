// navigation/CustomTabBar.js
import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View className="flex-row absolute bottom-0 bg-white  shadow-lg mb-10 rounded-[50px] p-5">
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        // choose an icon per route
        const iconName = {
          Home: "home",
          History: "clock",
          Chat: "message-circle",
          Profile: "user",
        }[route.name];

        const color = isFocused ? "#000000" : "#6B7280"; // blue vs gray

        const onPress = () => {
          if (!isFocused) navigation.navigate(route.name);
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            className="flex-1 items-center"
          >
            <Feather name={iconName} size={isFocused ? 30 : 24} color={color} />
            <Text
              className={`text-xs mt-1 all ${
                isFocused ? "#000000" : "text-gray-500"
              }`}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

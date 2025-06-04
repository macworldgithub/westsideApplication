// /screens/Splash.js
import React from "react";
import { View, Image } from "react-native";

export default function Splash() {
  return (
    <View className="flex-1 items-center bg-black justify-center ">
      <Image
        source={require("../../assets/splash.png")}
        className=" flex-1 w-[50%] h-[50%]"
        resizeMode="contain"
      />
    </View>
  );
}

import React from "react";
import RegisteredCars from "../Screens/RegisteredCars";
 import EditCarDetail from "../Screens/CarDetailEdit";
import WorkOrder from "../Screens/WorkOrder"; // make sure this path & filename are correct
import Profile from "../Screens/Profile";
import { createStackNavigator } from "@react-navigation/stack";
import { Stack } from "expo-router";


const HomeStack = createStackNavigator();

export default function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="RegisteredCars" component={RegisteredCars} />
      <HomeStack.Screen name="EditCarDetail" component={EditCarDetail} />
      <HomeStack.Screen name="WorkOrder" component={WorkOrder} />
      <HomeStack.Screen name="Profile" component={Profile}/>
  
    </HomeStack.Navigator>
  );
}

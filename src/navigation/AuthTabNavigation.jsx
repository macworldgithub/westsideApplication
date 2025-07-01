import React from 'react';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import CustomTabBar from "../Components/CustomTabBar";
// import Chat from "../Screens/Chat";
import ChatRoomsScreen from '../Screens/ChatRoomsScreen';
import Profile from "../Screens/Profile";
import HomeStackScreen from "./HomeStackNavigation";
import HistoryStackScreen from "./HistoryStackNavigation";

const Tab = createBottomTabNavigator();

export default function AuthTabs({ screenProps }) {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={props => <CustomTabBar {...props} />}>
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="Chat" component={ChatRoomsScreen}/>
      <Tab.Screen name="History" component={HistoryStackScreen} />
      <Tab.Screen name="Profile">
        {(props) => <Profile {...props} onLogout={screenProps?.onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
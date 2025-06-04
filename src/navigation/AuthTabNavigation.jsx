import Chat from "../Screens/Chat";
import Profile from "../Screens/Profile";

import HomeStackScreen from "./HomeStackNavigation";
import HistoryStackScreen from "./HistoryStackNavigation";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import CustomTabBar from "../Components/CustomTabBar";
import CarOrderDetails from "../Screens/CarOrderDetails";
import ViewServices from "../Screens/ViewServices";
import ReportScreen from "../Screens/ReportScreen";
import EditProfile from "../Screens/EditProfile";
import AccountSecurityScreen from "../Screens/AccountSecurity";
import GeneralSettingsScreen from "../Screens/GeneralSetting";
import RegisteredCars from "../Screens/RegisteredCars";

const Tab = createBottomTabNavigator();

export default function AuthTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}  tabBar={props => <CustomTabBar {...props} />}>
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="Chat" component={Chat}/>
      <Tab.Screen name="History" component={HistoryStackScreen} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

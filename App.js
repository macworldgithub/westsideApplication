// import { StatusBar } from "expo-status-bar";
// import React, { useEffect, useState, useRef } from "react";
// import { StyleSheet, Text, View, Animated } from "react-native";
// import "./global.css";
// import { NavigationContainer } from "@react-navigation/native";
// import { createStackNavigator } from "@react-navigation/stack";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import { enableScreens } from "react-native-screens";

// import Login from "./src/Screens/Login";
// import Splash from "./src/Screens/Splash";
// import AuthTabs from "./src/navigation/AuthTabNavigation";
// import EditProfile from "./src/Screens/EditProfile";
// import RegisteredCars from "./src/Screens/RegisteredCars";
// import EditCarDetail from "./src/Screens/CarDetailEdit";
// import WorkOrder from "./src/Screens/WorkOrder";
// import NewWorkOrder from "./src/Screens/NewWorkOrder";
// import EditWorkOrder from "./src/Screens/EditWorkOrder";
// import NewService from "./src/Screens/NewService";
// import EditServiceScreen from "./src/Screens/EditServiceScreen";
// import ViewServices from "./src/Screens/ViewServices";
// import CarOrderDetails from "./src/Screens/CarOrderDetails";
// import ReportScreen from "./src/Screens/ReportScreen";
// import NewCarRegistrtaiom from "./src/Screens/NewCarRegistration";
// import Profile from "./src/Screens/Profile";
// import GeneralSettingsScreen from "./src/Screens/GeneralSetting";
// import LanguageSetting from "./src/Screens/LanguageSetting";
// import AccountSecurityScreen from "./src/Screens/AccountSecurity";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const Stack = createStackNavigator();
// const RootStack = createStackNavigator();

// export default function App() {
//   const [userToken, setUserToken] = useState(AsyncStorage.getItem("jwt_token"));
//   const [isSplashDone, setIsSplashDone] = useState(false);

//   const splashOpacity = useRef(new Animated.Value(1)).current;

//   useEffect(() => {
//     // Start splash fade-out after delay
//     const timer = setTimeout(() => {
//       Animated.timing(splashOpacity, {
//         toValue: 0,
//         duration: 600,
//         useNativeDriver: true,
//       }).start(() => {
//         setIsSplashDone(true);
//       });
//     }, 2000); // Splash duration

//     return () => clearTimeout(timer);
//   }, []);

//   return (
//     <View style={styles.container}>
//       <NavigationContainer>
//         <Stack.Navigator screenOptions={{ headerShown: false }}>
//           {userToken == null ? (
//             <Stack.Screen name="Login">
//               {(props) => (
//                 <Login
//                   {...props}
//                   onLogin={(token) => {
//                     setUserToken(token);
//                   }}
//                 />
//               )}
//             </Stack.Screen>
//           ) : (
//             <>
//               <Stack.Screen name="AppTabs" component={AuthTabs} />
//               <Stack.Screen name="RegisteredCars" component={RegisteredCars} />
//               <Stack.Screen name="EditCarDetail" component={EditCarDetail} />
//               <Stack.Screen name="WorkOrder" component={WorkOrder} />
//               <Stack.Screen name="ViewServices" component={ViewServices} />
//               <Stack.Screen name="NewWorkOrder" component={NewWorkOrder} />
//               <Stack.Screen name="ReportScreen" component={ReportScreen} />
//               <Stack.Screen name="NewService" component={NewService} />
//               <Stack.Screen name="EditServiceScreen" component={EditServiceScreen} />
//               <Stack.Screen name="EditWorkOrder" component={EditWorkOrder} />
//               {/* <Stack.Screen name="CarOrderDetails" component={CarOrderDetails}/> */}
//               <Stack.Screen
//                 name="CarOrderDetails"
//                 component={CarOrderDetails}
//               />
//               <Stack.Screen
//                 name="NewCarRegistration"
//                 component={NewCarRegistrtaiom}
//               />
//               <Stack.Screen name="Profile" component={Profile} />
//               <Stack.Screen name="EditProfile" component={EditProfile} />
//               <Stack.Screen
//                 name="AccountSecurity"
//                 component={AccountSecurityScreen}
//               />
//               <Stack.Screen
//                 name="GeneralSetting"
//                 component={GeneralSettingsScreen}
//               />
//               <Stack.Screen
//                 name="LanguageSetting"
//                 component={LanguageSetting}
//               />
//             </>
//           )}
//         </Stack.Navigator>
//       </NavigationContainer>

//       {/* Always render Splash screen OVER EVERYTHING until it fades out */}
//       {!isSplashDone && (
//         <Animated.View
//           style={[styles.splashOverlay, { opacity: splashOpacity }]}
//         >
//           <Splash />
//         </Animated.View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#000", // Match app theme
//   },
//   splashOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "#000", // Match splash background
//     zIndex: 10,
//   },
// });
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, View, Animated } from "react-native";
import "./global.css";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { enableScreens } from "react-native-screens";
import Toast from "react-native-toast-message";
import { toastConfig } from "./src/utils/toastconfig";

import Login from "./src/Screens/Login";
import Splash from "./src/Screens/Splash";
import AuthTabs from "./src/navigation/AuthTabNavigation";
import EditProfile from "./src/Screens/EditProfile";
import RegisteredCars from "./src/Screens/RegisteredCars";
import EditCarDetail from "./src/Screens/CarDetailEdit";
import WorkOrder from "./src/Screens/WorkOrder";
import NewWorkOrder from "./src/Screens/NewWorkOrder";
import EditWorkOrder from "./src/Screens/EditWorkOrder";
import NewService from "./src/Screens/NewService";
import EditServiceScreen from "./src/Screens/EditServiceScreen";
import ViewServices from "./src/Screens/ViewServices";
import CarOrderDetails from "./src/Screens/CarOrderDetails";
import ReportScreen from "./src/Screens/ReportScreen";
import NewCarRegistrtaiom from "./src/Screens/NewCarRegistration";
import Profile from "./src/Screens/Profile";
import GeneralSettingsScreen from "./src/Screens/GeneralSetting";
import LanguageSetting from "./src/Screens/LanguageSetting";
import AccountSecurityScreen from "./src/Screens/AccountSecurity";
import AsyncStorage from "@react-native-async-storage/async-storage";
import UpdatePasswordScreen from "./src/Screens/UpdatePasswordScreen";
import ChatRoomsScreen from "./src/Screens/ChatRoomsScreen";
import Chat from "./src/Screens/Chat";
import { PermissionsAndroid, Platform } from "react-native";
import { getApp } from "@react-native-firebase/app";
import {
  getMessaging,
  getToken,
  requestPermission,
  onTokenRefresh,
} from "@react-native-firebase/messaging";

const Stack = createStackNavigator();
const RootStack = createStackNavigator();

export default function App() {
  const [userToken, setUserToken] = useState(null);
  const [isSplashVisible, setSplashVisible] = useState(true);

  const splashOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem("jwt_token");
        setUserToken(token);
      } catch (error) {
        console.error("Error loading token:", error);
      }
    };

    const askPermissionAndGetFCM = async () => {
      const granted = await requestNotificationPermission();
      if (granted) {
        await getFcmToken();
      }
    };

    loadToken();
    askPermissionAndGetFCM();

    const timer = setTimeout(() => {
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => setSplashVisible(false), 0);
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const app = getApp();
    const messaging = getMessaging(app);

    const unsubscribe = onTokenRefresh(messaging, (token) => {
      console.log("🔁 Refreshed FCM Token:", token);
      // Send to your backend if needed
    });

    return unsubscribe;
  }, []);

  async function requestNotificationPermission() {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: "Notification Permission",
            message: "This app needs permission to send you notifications.",
            buttonPositive: "Allow",
            buttonNegative: "Deny",
          }
        );

        console.log("📲 Permission granted:", granted);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn("⚠️ Permission error:", err);
        return false;
      }
    } else {
      try {
        const app = getApp();
        const messaging = getMessaging(app);
        const status = await requestPermission(messaging);
        const granted =
          status === messaging.AuthorizationStatus.AUTHORIZED ||
          status === messaging.AuthorizationStatus.PROVISIONAL;
        console.log("📲 iOS permission granted:", granted);
        return granted;
      } catch (err) {
        console.warn("⚠️ iOS permission error:", err);
        return false;
      }
    }
  }

  async function getFcmToken() {
    try {
      const app = getApp();
      const messaging = getMessaging(app);
      const token = await getToken(messaging);
      console.log("🔥 FCM Token:", token);

      // TODO: Send token to your backend to save
    } catch (error) {
      console.log("❌ Error getting FCM token:", error);
    }
  }

  return (
    <View style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName={userToken == null ? "Login" : "AppTabs"} // Set initial route dynamically
        >
          {userToken == null ? (
            <Stack.Screen name="Login">
              {(props) => (
                <Login
                  {...props}
                  onLogin={(token) => {
                    setUserToken(token);
                  }}
                />
              )}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen name="AppTabs">
                {(props) => (
                  <AuthTabs
                    {...props}
                    screenProps={{ onLogout: setUserToken }}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="RegisteredCars" component={RegisteredCars} />
              <Stack.Screen name="EditCarDetail" component={EditCarDetail} />
              <Stack.Screen name="WorkOrder" component={WorkOrder} />
              <Stack.Screen name="ViewServices" component={ViewServices} />
              <Stack.Screen name="NewWorkOrder" component={NewWorkOrder} />
              <Stack.Screen name="ReportScreen" component={ReportScreen} />
              <Stack.Screen name="NewService" component={NewService} />
              <Stack.Screen
                name="EditServiceScreen"
                component={EditServiceScreen}
              />
              <Stack.Screen name="EditWorkOrder" component={EditWorkOrder} />
              {/* <Stack.Screen name="CarOrderDetails" component={CarOrderDetails}/> */}
              <Stack.Screen
                name="CarOrderDetails"
                component={CarOrderDetails}
              />
              <Stack.Screen
                name="NewCarRegistration"
                component={NewCarRegistrtaiom}
              />
              <Stack.Screen name="Profile">
                {(props) => <Profile {...props} onLogout={setUserToken} />}
              </Stack.Screen>
              <Stack.Screen name="EditProfile" component={EditProfile} />
              <Stack.Screen
                name="AccountSecurity"
                component={AccountSecurityScreen}
              />
              <Stack.Screen
                name="UpdatePassword"
                component={UpdatePasswordScreen}
              />

              <Stack.Screen
                name="GeneralSetting"
                component={GeneralSettingsScreen}
              />
              <Stack.Screen
                name="LanguageSetting"
                component={LanguageSetting}
              />
              <Stack.Screen name="ChatRooms" component={ChatRoomsScreen} />
              <Stack.Screen name="Chat" component={Chat} />
            </>
          )}
        </Stack.Navigator>
        <Toast config={toastConfig} />
      </NavigationContainer>

      {/* Always render Splash screen OVER EVERYTHING until it fades out */}
      {isSplashVisible && (
        <Animated.View
          style={[styles.splashOverlay, { opacity: splashOpacity }]}
        >
          <Splash />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000", // Match app theme
  },
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000", // Match splash background
    zIndex: 10,
  },
});

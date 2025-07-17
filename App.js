
// import { StatusBar } from "expo-status-bar";
// import React, { useEffect, useState, useRef } from "react";
// import { StyleSheet, Text, View, Animated } from "react-native";
// import "./global.css";
// import { NavigationContainer } from "@react-navigation/native";
// import { createStackNavigator } from "@react-navigation/stack";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import { enableScreens } from "react-native-screens";
// import Toast from "react-native-toast-message";
// import { toastConfig } from "./src/utils/toastconfig";

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
// import UpdatePasswordScreen from "./src/Screens/UpdatePasswordScreen";
// import ChatRoomsScreen from "./src/Screens/ChatRoomsScreen";
// import Chat from "./src/Screens/Chat";
// import { PermissionsAndroid, Platform } from "react-native";
// import { getApp } from "@react-native-firebase/app";
// import {
//   getMessaging,
//   getToken,
//   requestPermission,
//   onTokenRefresh,
// } from "@react-native-firebase/messaging";

// const Stack = createStackNavigator();
// const RootStack = createStackNavigator();

// export default function App() {
//   const [userToken, setUserToken] = useState(null);
//   const [isSplashVisible, setSplashVisible] = useState(true);

//   const splashOpacity = useRef(new Animated.Value(1)).current;

//   useEffect(() => {
//     const loadToken = async () => {
//       try {
//         const token = await AsyncStorage.getItem("jwt_token");
//         console.log(token)
//         setUserToken(token);
//       } catch (error) {
//         console.error("Error loading token:", error);
//       }
//     };

//     const askPermissionAndGetFCM = async () => {
//       const granted = await requestNotificationPermission();
//       if (granted) {
//         await getFcmToken();
//       }
//     };

//     loadToken();
//     askPermissionAndGetFCM();

//     const timer = setTimeout(() => {
//       Animated.timing(splashOpacity, {
//         toValue: 0,
//         duration: 600,
//         useNativeDriver: true,
//       }).start(() => {
//         setTimeout(() => setSplashVisible(false), 0);
//       });
//     }, 2000);

//     return () => clearTimeout(timer);
//   }, []);

//   useEffect(() => {
//     const app = getApp();
//     const messaging = getMessaging(app);

//     const unsubscribe = onTokenRefresh(messaging, (token) => {
//       console.log("🔁 Refreshed FCM Token:", token);
//       // Send to your backend if needed
//     });

//     return unsubscribe;
//   }, []);

//   async function requestNotificationPermission() {
//     if (Platform.OS === "android") {
//       try {
//         const granted = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
//           {
//             title: "Notification Permission",
//             message: "This app needs permission to send you notifications.",
//             buttonPositive: "Allow",
//             buttonNegative: "Deny",
//           }
//         );

//         console.log("📲 Permission granted:", granted);
//         return granted === PermissionsAndroid.RESULTS.GRANTED;
//       } catch (err) {
//         console.warn("⚠️ Permission error:", err);
//         return false;
//       }
//     } else {
//       try {
//         const app = getApp();
//         const messaging = getMessaging(app);
//         const status = await requestPermission(messaging);
//         const granted =
//           status === messaging.AuthorizationStatus.AUTHORIZED ||
//           status === messaging.AuthorizationStatus.PROVISIONAL;
//         console.log("📲 iOS permission granted:", granted);
//         return granted;
//       } catch (err) {
//         console.warn("⚠️ iOS permission error:", err);
//         return false;
//       }
//     }
//   }

//   async function getFcmToken() {
//     try {
//       const app = getApp();
//       const messaging = getMessaging(app);
//       const token = await getToken(messaging);
//       console.log("🔥 FCM Token:", token);

//       // TODO: Send token to your backend to save
//     } catch (error) {
//       console.log("❌ Error getting FCM token:", error);
//     }
//   }

//   return (
//     <View style={styles.container}>
//       <NavigationContainer>
//         <Stack.Navigator
//           screenOptions={{ headerShown: false }}
//           initialRouteName={userToken == null ? "Login" : "AppTabs"} // Set initial route dynamically
//         >
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
//               <Stack.Screen name="AppTabs">
//                 {(props) => (
//                   <AuthTabs
//                     {...props}
//                     screenProps={{ onLogout: setUserToken }}
//                   />
//                 )}
//               </Stack.Screen>
//               <Stack.Screen name="RegisteredCars" component={RegisteredCars} />
//               <Stack.Screen name="EditCarDetail" component={EditCarDetail} />
//               <Stack.Screen name="WorkOrder" component={WorkOrder} />
//               <Stack.Screen name="ViewServices" component={ViewServices} />
//               <Stack.Screen name="NewWorkOrder" component={NewWorkOrder} />
//               <Stack.Screen name="ReportScreen" component={ReportScreen} />
//               <Stack.Screen name="NewService" component={NewService} />
//               <Stack.Screen
//                 name="EditServiceScreen"
//                 component={EditServiceScreen}
//               />
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
//               <Stack.Screen name="Profile">
//                 {(props) => <Profile {...props} onLogout={setUserToken} />}
//               </Stack.Screen>
//               <Stack.Screen name="EditProfile" component={EditProfile} />
//               <Stack.Screen
//                 name="AccountSecurity"
//                 component={AccountSecurityScreen}
//               />
//               <Stack.Screen
//                 name="UpdatePassword"
//                 component={UpdatePasswordScreen}
//               />

//               <Stack.Screen
//                 name="GeneralSetting"
//                 component={GeneralSettingsScreen}
//               />
//               <Stack.Screen
//                 name="LanguageSetting"
//                 component={LanguageSetting}
//               />
//               <Stack.Screen name="ChatRooms" component={ChatRoomsScreen} />
//               <Stack.Screen name="Chat" component={Chat} />
//             </>
//           )}
//         </Stack.Navigator>
//         <Toast config={toastConfig} />
//       </NavigationContainer>

//       {/* Always render Splash screen OVER EVERYTHING until it fades out */}
//       {isSplashVisible && (
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

// import { StatusBar } from "expo-status-bar";
// import React, { useEffect, useState, useRef } from "react";
// import { StyleSheet, Text, View, Animated } from "react-native";
// import "./global.css";
// import { NavigationContainer } from "@react-navigation/native";
// import { createStackNavigator } from "@react-navigation/stack";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import { enableScreens } from "react-native-screens";
// import Toast from "react-native-toast-message";
// import { toastConfig } from "./src/utils/toastconfig";
// import axios from "axios";

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
// import UpdatePasswordScreen from "./src/Screens/UpdatePasswordScreen";
// import ChatRoomsScreen from "./src/Screens/ChatRoomsScreen";
// import Chat from "./src/Screens/Chat";
// import { PermissionsAndroid, Platform } from "react-native";
// import { getApp } from "@react-native-firebase/app";
// import {
//   getMessaging,
//   getToken,
//   requestPermission,
//   onTokenRefresh,
// } from "@react-native-firebase/messaging";
// import { API_BASE_URL } from "./src/utils/config";
// import { deleteToken } from '@react-native-firebase/messaging';

// const Stack = createStackNavigator();
// const RootStack = createStackNavigator();

// export default function App() {
//   const [userToken, setUserToken] = useState(null);
//   const [isSplashVisible, setSplashVisible] = useState(true);

//   const splashOpacity = useRef(new Animated.Value(1)).current;

//   useEffect(() => {
//     const loadToken = async () => {
//       try {
//         const token = await AsyncStorage.getItem("jwt_token");
//         setUserToken(token);
//       } catch (error) {
//         console.error("Error loading token:", error);
//       }
//     };

//     const askPermissionAndGetFCM = async () => {
//       const granted = await requestNotificationPermission();
//       if (granted) {
//         await getFcmToken();
//       }
//     };

//     loadToken();
//     askPermissionAndGetFCM();

//     const timer = setTimeout(() => {
//       Animated.timing(splashOpacity, {
//         toValue: 0,
//         duration: 600,
//         useNativeDriver: true,
//       }).start(() => {
//         setTimeout(() => setSplashVisible(false), 0);
//       });
//     }, 2000);

//     return () => clearTimeout(timer);
//   }, []);

//   useEffect(() => {
//     const app = getApp();
//     const messaging = getMessaging(app);

//     const unsubscribe = onTokenRefresh(messaging, async (token) => {
//       console.log("🔁 Refreshed FCM Token:", token);
//       await sendFcmTokenToBackend(token);
//     });

//     return unsubscribe;
//   }, []);

//   async function requestNotificationPermission() {
//     if (Platform.OS === "android") {
//       try {
//         const granted = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
//           {
//             title: "Notification Permission",
//             message: "This app needs permission to send you notifications.",
//             buttonPositive: "Allow",
//             buttonNegative: "Deny",
//           }
//         );

//         console.log("📲 Permission granted:", granted);
//         return granted === PermissionsAndroid.RESULTS.GRANTED;
//       } catch (err) {
//         console.warn("⚠️ Permission error:", err);
//         return false;
//       }
//     } else {
//       try {
//         const app = getApp();
//         const messaging = getMessaging(app);
//         const status = await requestPermission(messaging);
//         const granted =
//           status === messaging.AuthorizationStatus.AUTHORIZED ||
//           status === messaging.AuthorizationStatus.PROVISIONAL;
//         console.log("📲 iOS permission granted:", granted);
//         return granted;
//       } catch (err) {
//         console.warn("⚠️ iOS permission error:", err);
//         return false;
//       }
//     }
//   }

//   async function getFcmToken() {
//   try {
//     const app = getApp();
//     const messaging = getMessaging(app);

//     // Delete the existing token
//     const currentToken = await getToken(messaging);
//     if (currentToken) {
//       await deleteToken(messaging);
//       console.log("🗑️ Old FCM token deleted");
//     }

//     // Get new token
//     const newToken = await getToken(messaging, true); // `true` forces refresh
//     console.log("🔥 New FCM Token:", newToken);
//     await sendFcmTokenToBackend(newToken);
//   } catch (error) {
//     console.log("❌ Error getting new FCM token:", error);
//   }
// }

//   async function sendFcmTokenToBackend(fcmToken) {
//     try {
//       const jwtToken = await AsyncStorage.getItem("jwt_token");
//       console.log(jwtToken)
//       if (!jwtToken) {
//         console.log("No JWT token found, cannot send FCM token");
//         return;
//       }
//       await axios.post(
//         `${API_BASE_URL}/notifications/register-token`,
//         { fcmToken },
//         {
//           headers: {
//             Authorization: `Bearer ${jwtToken}`,
//           },
//         }
//       );
//       console.log("FCM token sent to backend successfully");
//     } catch (error) {
//       console.error("Error sending FCM token to backend:", error);
//     }
//   }

//   return (
//     <View style={styles.container}>
//       <NavigationContainer>
//         <Stack.Navigator
//           screenOptions={{ headerShown: false }}
//           initialRouteName={userToken == null ? "Login" : "AppTabs"}
//         >
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
//               <Stack.Screen name="AppTabs">
//                 {(props) => (
//                   <AuthTabs
//                     {...props}
//                     screenProps={{ onLogout: setUserToken }}
//                   />
//                 )}
//               </Stack.Screen>
//               <Stack.Screen name="RegisteredCars" component={RegisteredCars} />
//               <Stack.Screen name="EditCarDetail" component={EditCarDetail} />
//               <Stack.Screen name="WorkOrder" component={WorkOrder} />
//               <Stack.Screen name="ViewServices" component={ViewServices} />
//               <Stack.Screen name="NewWorkOrder" component={NewWorkOrder} />
//               <Stack.Screen name="ReportScreen" component={ReportScreen} />
//               <Stack.Screen name="NewService" component={NewService} />
//               <Stack.Screen
//                 name="EditServiceScreen"
//                 component={EditServiceScreen}
//               />
//               <Stack.Screen name="EditWorkOrder" component={EditWorkOrder} />
//               <Stack.Screen
//                 name="CarOrderDetails"
//                 component={CarOrderDetails}
//               />
//               <Stack.Screen
//                 name="NewCarRegistration"
//                 component={NewCarRegistrtaiom}
//               />
//               <Stack.Screen name="Profile">
//                 {(props) => <Profile {...props} onLogout={setUserToken} />}
//               </Stack.Screen>
//               <Stack.Screen name="EditProfile" component={EditProfile} />
//               <Stack.Screen
//                 name="AccountSecurity"
//                 component={AccountSecurityScreen}
//               />
//               <Stack.Screen
//                 name="UpdatePassword"
//                 component={UpdatePasswordScreen}
//               />
//               <Stack.Screen
//                 name="GeneralSetting"
//                 component={GeneralSettingsScreen}
//               />
//               <Stack.Screen
//                 name="LanguageSetting"
//                 component={LanguageSetting}
//               />
//               <Stack.Screen name="ChatRooms" component={ChatRoomsScreen} />
//               <Stack.Screen name="Chat" component={Chat} />
//             </>
//           )}
//         </Stack.Navigator>
//         <Toast config={toastConfig} />
//       </NavigationContainer>

//       {isSplashVisible && (
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
//     backgroundColor: "#000",
//   },
//   splashOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "#000",
//     zIndex: 10,
//   },
// });

import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, View, Animated, Platform } from "react-native";
import "./global.css";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { enableScreens } from "react-native-screens";
import Toast from "react-native-toast-message";
import { toastConfig } from "./src/utils/toastconfig";
import axios from "axios";

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
import { PermissionsAndroid } from "react-native";
import { getApp } from "@react-native-firebase/app";
import {
  getMessaging,
  getToken,
  requestPermission,
  onTokenRefresh,
  deleteToken,
} from "@react-native-firebase/messaging";
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { API_BASE_URL } from "./src/utils/config";

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

    // Initialize Notifee foreground event handler
    const setupNotifee = async () => {
      // Request permissions for Android
      if (Platform.OS === 'android') {
        await notifee.requestPermission();
      }

      // Create a notification channel for Android
      await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
      });

      // Handle foreground notifications
      notifee.onForegroundEvent(({ type, detail }) => {
        switch (type) {
          case EventType.DELIVERED:
          case EventType.PRESS:
            console.log('Notification received or pressed in foreground:', detail.notification);
            break;
        }
      });
    };

    loadToken();
    askPermissionAndGetFCM();
    setupNotifee();

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

    // Handle FCM messages in foreground
    const unsubscribeMessage = messaging.onMessage(async (remoteMessage) => {
      console.log('Foreground message received:', remoteMessage);
      await displayNotification(remoteMessage);
    });

    const unsubscribeTokenRefresh = onTokenRefresh(messaging, async (token) => {
      console.log("🔁 Refreshed FCM Token:", token);
      await sendFcmTokenToBackend(token);
    });

    return () => {
      unsubscribeMessage();
      unsubscribeTokenRefresh();
    };
  }, []);

  async function displayNotification(remoteMessage) {
    try {
      await notifee.displayNotification({
        title: remoteMessage.notification?.title || 'Notification',
        body: remoteMessage.notification?.body || 'You have a new notification',
        android: {
          channelId: 'default',
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
          },
        },
        ios: {
          sound: 'default',
        },
      });
      console.log('Notification displayed via Notifee');
    } catch (error) {
      console.error('Error displaying Notifee notification:', error);
    }
  }

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

      // Delete the existing token
      const currentToken = await getToken(messaging);
      if (currentToken) {
        await deleteToken(messaging);
        console.log("🗑️ Old FCM token deleted");
      }

      // Get new token
      const newToken = await getToken(messaging, true); // `true` forces refresh
      console.log("🔥 New FCM Token:", newToken);
      await sendFcmTokenToBackend(newToken);
    } catch (error) {
      console.log("❌ Error getting new FCM token:", error);
    }
  }

  async function sendFcmTokenToBackend(fcmToken) {
    try {
      const jwtToken = await AsyncStorage.getItem("jwt_token");
      console.log(jwtToken);
      if (!jwtToken) {
        console.log("No JWT token found, cannot send FCM token");
        return;
      }
      await axios.post(
        `${API_BASE_URL}/notifications/register-token`,
        { fcmToken },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      console.log("FCM token sent to backend successfully");
    } catch (error) {
      console.error("Error sending FCM token to backend:", error);
    }
  }

  return (
    <View style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName={userToken == null ? "Login" : "AppTabs"}
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
    backgroundColor: "#000",
  },
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
    zIndex: 10,
  },
});
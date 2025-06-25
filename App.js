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

const Stack = createStackNavigator();
const RootStack = createStackNavigator();

export default function App() {
  const [userToken, setUserToken] = useState(null);
  const [isSplashVisible, setSplashVisible] = useState(true);

  const splashOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Load token from AsyncStorage
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem("jwt_token");
        setUserToken(token);
      } catch (error) {
        console.error("Error loading token:", error);
      }
    };
    loadToken();

    // Start splash fade-out after delay
    const timer = setTimeout(() => {
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        // Delay state update to avoid useInsertionEffect issues
        setTimeout(() => setSplashVisible(false), 0);
      });
    }, 2000); // Splash duration

    return () => clearTimeout(timer);
  }, []);

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
              <Stack.Screen name="EditServiceScreen" component={EditServiceScreen} />
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
                {(props) => (
                  <Profile
                    {...props}
                    onLogout={setUserToken}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="EditProfile" component={EditProfile} />
              <Stack.Screen
                name="AccountSecurity"
                component={AccountSecurityScreen}
              />
              <Stack.Screen
                name="GeneralSetting"
                component={GeneralSettingsScreen}
              />
              <Stack.Screen
                name="LanguageSetting"
                component={LanguageSetting}
              />
            </>
          )}
        </Stack.Navigator>
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
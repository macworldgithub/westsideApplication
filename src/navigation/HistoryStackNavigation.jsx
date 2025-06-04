import { createStackNavigator } from "@react-navigation/stack";
import HistoryDetail from "../Screens/HistoryDetail";
const HistoryStack = createStackNavigator();

// — History stack —
export default function HistoryStackScreen() {
  return (
    <HistoryStack.Navigator screenOptions={{ headerShown: false }}>
      {/* <HistoryStack.Screen name="HistoryList" component={HistoryList} /> */}
      <HistoryStack.Screen name="HistoryDetail" component={HistoryDetail} />
    </HistoryStack.Navigator>
  );
}

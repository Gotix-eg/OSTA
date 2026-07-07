import { Ionicons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { LoadingScreen } from "../screens/common/LoadingScreen";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { RegisterScreen } from "../screens/auth/RegisterScreen";
import { OtpScreen } from "../screens/auth/OtpScreen";
import { HomeScreen } from "../screens/client/HomeScreen";
import { CreateRequestScreen } from "../screens/client/CreateRequestScreen";
import { MyRequestsScreen } from "../screens/client/MyRequestsScreen";
import { MaterialsScreen } from "../screens/client/MaterialsScreen";
import { AllServicesScreen } from "../screens/client/AllServicesScreen";
import { WorkerDashboardScreen } from "../screens/worker/DashboardScreen";
import { JobsFeedScreen } from "../screens/worker/JobsFeedScreen";
import { ActiveJobScreen } from "../screens/worker/ActiveJobScreen";
import { VendorDashboardScreen } from "../screens/vendor/DashboardScreen";
import { InventoryScreen } from "../screens/vendor/InventoryScreen";
import { OrdersScreen } from "../screens/vendor/OrdersScreen";
import { ProfileScreen } from "../screens/common/ProfileScreen";
import { ChatScreen } from "../screens/common/ChatScreen";
import { NotificationsScreen } from "../screens/common/NotificationsScreen";
import { RequestDetailsScreen } from "../screens/common/RequestDetailsScreen";
import type { AuthStackParamList, CommonStackParamList } from "./types";

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const RootStack = createNativeStackNavigator<CommonStackParamList & { RoleTabs: undefined }>();
const Tab = createBottomTabNavigator();

function AuthNavigator() {
  const { theme } = useTheme();

  return (
    <AuthStack.Navigator screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: theme.background }
    }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="Otp" component={OtpScreen} />
    </AuthStack.Navigator>
  );
}

function tabIcon(name: keyof typeof Ionicons.glyphMap) {
  return ({ color, size }: { color: string; size: number }) => <Ionicons name={name} color={color} size={size} />;
}

function ClientTabs() {
  const tabOptions = useTabOptions();

  return (
    <Tab.Navigator screenOptions={tabOptions}>
      <Tab.Screen name="ClientHome" component={HomeScreen} options={{ title: "الرئيسية", tabBarIcon: tabIcon("home-outline") }} />
      <Tab.Screen name="AllServices" component={AllServicesScreen} options={{ title: "الخدمات", tabBarIcon: tabIcon("grid-outline") }} />
      <Tab.Screen name="CreateRequest" component={CreateRequestScreen} options={{ title: "طلب", tabBarIcon: tabIcon("add-circle-outline") }} />
      <Tab.Screen name="MyRequests" component={MyRequestsScreen} options={{ title: "طلباتي", tabBarIcon: tabIcon("list-outline") }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "حسابي", tabBarIcon: tabIcon("person-outline") }} />
    </Tab.Navigator>
  );
}

function WorkerTabs() {
  const tabOptions = useTabOptions();

  return (
    <Tab.Navigator screenOptions={tabOptions}>
      <Tab.Screen name="WorkerDashboard" component={WorkerDashboardScreen} options={{ title: "لوحة العمل", tabBarIcon: tabIcon("speedometer-outline") }} />
      <Tab.Screen name="JobsFeed" component={JobsFeedScreen} options={{ title: "الطلبات", tabBarIcon: tabIcon("briefcase-outline") }} />
      <Tab.Screen name="ActiveJobs" component={ActiveJobScreen} options={{ title: "النشطة", tabBarIcon: tabIcon("navigate-outline") }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "حسابي", tabBarIcon: tabIcon("person-outline") }} />
    </Tab.Navigator>
  );
}

function VendorTabs() {
  const tabOptions = useTabOptions();

  return (
    <Tab.Navigator screenOptions={tabOptions}>
      <Tab.Screen name="VendorDashboard" component={VendorDashboardScreen} options={{ title: "المبيعات", tabBarIcon: tabIcon("storefront-outline") }} />
      <Tab.Screen name="Inventory" component={InventoryScreen} options={{ title: "المخزون", tabBarIcon: tabIcon("albums-outline") }} />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ title: "الطلبات", tabBarIcon: tabIcon("receipt-outline") }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "حسابي", tabBarIcon: tabIcon("person-outline") }} />
    </Tab.Navigator>
  );
}

function RoleTabs() {
  const { role } = useAuth();
  if (role === "WORKER") {
    return <WorkerTabs />;
  }
  if (role === "VENDOR") {
    return <VendorTabs />;
  }
  return <ClientTabs />;
}

function AppNavigator() {
  const { theme } = useTheme();

  return (
    <RootStack.Navigator screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: theme.background }
    }}>
      <RootStack.Screen name="RoleTabs" component={RoleTabs} />
      <RootStack.Screen name="Chat" component={ChatScreen} />
      <RootStack.Screen name="RequestDetails" component={RequestDetailsScreen} />
      <RootStack.Screen name="Notifications" component={NotificationsScreen} />
    </RootStack.Navigator>
  );
}

function useTabOptions() {
  const { theme } = useTheme();

  return {
    headerShown: false,
    tabBarActiveTintColor: theme.primary,
    tabBarInactiveTintColor: theme.muted,
    tabBarStyle: {
      backgroundColor: theme.tabBar,
      borderTopColor: theme.border,
      minHeight: 64,
      paddingBottom: 8,
      paddingTop: 6
    },
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: "700" as const
    }
  };
}

export function RootNavigator() {
  const { token, isLoading } = useAuth();
  const { theme, mode } = useTheme();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer theme={{
      dark: mode === "dark",
      colors: {
        primary: theme.primary,
        background: theme.background,
        card: theme.surface,
        text: theme.text,
        border: theme.border,
        notification: theme.accent
      },
      fonts: {
        regular: { fontFamily: "System", fontWeight: "400" },
        medium: { fontFamily: "System", fontWeight: "500" },
        bold: { fontFamily: "System", fontWeight: "700" },
        heavy: { fontFamily: "System", fontWeight: "900" }
      }
    }}>
      {token ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

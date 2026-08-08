import { Ionicons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import { navigationRef } from "../context/NotificationContext";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Text, StyleSheet } from "react-native";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNotifications } from "../context/NotificationContext";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { LoadingScreen } from "../screens/common/LoadingScreen";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { RegisterScreen } from "../screens/auth/RegisterScreen";
import { OtpScreen } from "../screens/auth/OtpScreen";
import { HomeScreen } from "../screens/client/HomeScreen";
import { CreateRequestScreen } from "../screens/client/CreateRequestScreen";
import { MyRequestsScreen } from "../screens/client/MyRequestsScreen";
import { MaterialsScreen } from "../screens/client/MaterialsScreen";
import { AllServicesScreen } from "../screens/client/AllServicesScreen";
import { VendorsScreen } from "../screens/client/VendorsScreen";
import { WorkersScreen } from "../screens/client/WorkersScreen";
import { WorkerProfileScreen } from "../screens/client/WorkerProfileScreen";
import { VendorProfileScreen } from "../screens/client/VendorProfileScreen";
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
import { SupportScreen } from "../screens/common/SupportScreen";
import type { AuthStackParamList } from "./types";

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const RootStack = createNativeStackNavigator<any>();
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

// Badge component for notification count
function NotifBadge({ count, color }: { count: number; color: string }) {
  if (count === 0) return null;
  return (
    <View style={[badgeStyles.badge, { backgroundColor: color }]}>
      <Text style={badgeStyles.badgeText}>{count > 99 ? "99+" : count}</Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
});

function NotifTabIcon({ color, size, focused }: { color: string; size: number; focused: boolean }) {
  const { unreadCount } = useNotifications();
  const { theme } = useTheme();
  return (
    <View>
      <Ionicons name={focused ? "notifications" : "notifications-outline"} color={color} size={size} />
      <NotifBadge count={unreadCount} color="#ef4444" />
    </View>
  );
}

function ClientTabs() {
  const tabOptions = useTabOptions();

  return (
    <Tab.Navigator screenOptions={tabOptions}>
      <Tab.Screen name="ClientHome" component={HomeScreen} options={{ title: "الرئيسية", tabBarIcon: tabIcon("home-outline", "home") }} />
      <Tab.Screen name="AllServices" component={AllServicesScreen} options={{ title: "الخدمات", tabBarIcon: tabIcon("grid-outline", "grid") }} />
      <Tab.Screen name="Workers" component={WorkersScreen} options={{ title: "الفنيين", tabBarIcon: tabIcon("people-outline", "people") }} />
      <Tab.Screen name="Vendors" component={VendorsScreen} options={{ title: "الموردين", tabBarIcon: tabIcon("storefront-outline", "storefront") }} />
      <Tab.Screen name="MyRequests" component={MyRequestsScreen} options={{ title: "طلباتي", tabBarIcon: tabIcon("list-outline", "list") }} />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{
          title: "الإشعارات",
          tabBarIcon: ({ color, size, focused }) => <NotifTabIcon color={color} size={size} focused={focused} />,
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "حسابي", tabBarIcon: tabIcon("person-outline", "person") }} />
    </Tab.Navigator>
  );
}

function WorkerTabs() {
  const tabOptions = useTabOptions();

  return (
    <Tab.Navigator screenOptions={tabOptions}>
      <Tab.Screen name="WorkerDashboard" component={WorkerDashboardScreen} options={{ title: "لوحة العمل", tabBarIcon: tabIcon("speedometer-outline", "speedometer") }} />
      <Tab.Screen name="JobsFeed" component={JobsFeedScreen} options={{ title: "الطلبات", tabBarIcon: tabIcon("briefcase-outline", "briefcase") }} />
      <Tab.Screen name="ActiveJobs" component={ActiveJobScreen} options={{ title: "النشطة", tabBarIcon: tabIcon("navigate-outline", "navigate") }} />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{
          title: "الإشعارات",
          tabBarIcon: ({ color, size, focused }) => <NotifTabIcon color={color} size={size} focused={focused} />,
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "حسابي", tabBarIcon: tabIcon("person-outline", "person") }} />
    </Tab.Navigator>
  );
}

function VendorTabs() {
  const tabOptions = useTabOptions();

  return (
    <Tab.Navigator screenOptions={tabOptions}>
      <Tab.Screen name="VendorDashboard" component={VendorDashboardScreen} options={{ title: "المبيعات", tabBarIcon: tabIcon("storefront-outline", "storefront") }} />
      <Tab.Screen name="Inventory" component={InventoryScreen} options={{ title: "المخزون", tabBarIcon: tabIcon("albums-outline", "albums") }} />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ title: "الطلبات", tabBarIcon: tabIcon("receipt-outline", "receipt") }} />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{
          title: "الإشعارات",
          tabBarIcon: ({ color, size, focused }) => <NotifTabIcon color={color} size={size} focused={focused} />,
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "حسابي", tabBarIcon: tabIcon("person-outline", "person") }} />
    </Tab.Navigator>
  );
}

// Registers device push token and handles push notification taps
// Must be inside NavigationContainer and AuthProvider
function PushNotificationsSetup() {
  const { token } = useAuth();
  if (!token) return null;
  return <PushNotificationsSetupInner />;
}

function PushNotificationsSetupInner() {
  usePushNotifications();
  return null;
}

function AppNavigator() {
  const { theme } = useTheme();
  const { role } = useAuth();

  return (
    <>
      <PushNotificationsSetup />
      <RootStack.Navigator screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background }
      }}>
      {role === "WORKER" ? (
        <RootStack.Screen name="WorkerTabs" component={WorkerTabs} />
      ) : role === "VENDOR" ? (
        <RootStack.Screen name="VendorTabs" component={VendorTabs} />
      ) : (
        <RootStack.Screen name="ClientTabs" component={ClientTabs} />
      )}
      <RootStack.Screen name="CreateRequest" component={CreateRequestScreen} />
      <RootStack.Screen name="WorkerProfile" component={WorkerProfileScreen} />
      <RootStack.Screen name="VendorProfile" component={VendorProfileScreen} />
      <RootStack.Screen name="Chat" component={ChatScreen} />
      <RootStack.Screen name="RequestDetails" component={RequestDetailsScreen} />
      {/* Notifications is also a tab screen — keep in stack for toast navigation */}
      <RootStack.Screen name="Notifications" component={NotificationsScreen} />
      <RootStack.Screen name="Auth" component={AuthNavigator} />
      <RootStack.Screen name="Support" component={SupportScreen} />
      </RootStack.Navigator>
    </>
  );
}

function tabIcon(outlineName: string, filledName: string) {
  return ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
    <Ionicons name={focused ? (filledName as any) : (outlineName as any)} color={color} size={size} />
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
    },
    sceneStyle: {
      backgroundColor: theme.background
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
    <NavigationContainer ref={navigationRef} theme={{
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
      <AppNavigator />
    </NavigationContainer>
  );
}

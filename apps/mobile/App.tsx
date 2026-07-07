import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { I18nManager } from "react-native";

import { AuthProvider } from "./src/context/AuthContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import { NotificationProvider } from "./src/context/NotificationContext";
import { RootNavigator } from "./src/navigation/RootNavigator";

export default function App() {
  useEffect(() => {
    if (!I18nManager.isRTL) {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(true);
    }
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <StatusBar style="auto" />
          <RootNavigator />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

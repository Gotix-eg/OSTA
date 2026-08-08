import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { I18nManager } from "react-native";

import { AuthProvider } from "./src/context/AuthContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import { NotificationProvider } from "./src/context/NotificationContext";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { SplashScreen } from "./src/screens/common/SplashScreen";

export default function App() {
  const [splashDone, setSplashDone] = useState(true);

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
          <StatusBar style="light" />
          {!splashDone && (
            <SplashScreen onFinish={() => setSplashDone(true)} />
          )}
          {splashDone && <RootNavigator />}
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

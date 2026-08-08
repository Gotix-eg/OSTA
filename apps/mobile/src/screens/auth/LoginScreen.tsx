import { useState } from "react";
import { Alert, StyleSheet, View, Platform } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AppButton } from "../../components/AppButton";
import { AppCard } from "../../components/AppCard";
import { Screen } from "../../components/Screen";
import { TextField } from "../../components/TextField";
import { ThemeToggle } from "../../components/ThemeToggle";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { spacing } from "../../theme/spacing";
import type { AuthStackParamList } from "../../navigation/types";
import DarkLogo from "../../../assets/logo.svg";
import LightLogo from "../../../assets/logo-light.svg";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const { theme, mode } = useTheme();
  const styles = makeStyles(theme);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    setIsSubmitting(true);
    try {
      const loggedInUser = await login(phone, password);
      const targetRoute = 
        loggedInUser.role === "WORKER" ? "WorkerTabs" :
        loggedInUser.role === "VENDOR" ? "VendorTabs" : "ClientTabs";

      const parentNav = navigation.getParent();
      if (parentNav) {
        parentNav.reset({
          index: 0,
          routes: [{ name: targetRoute }],
        });
      } else {
        navigation.navigate(targetRoute as any);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "حاول مرة أخرى";
      if (Platform.OS === "web") {
        alert(`تعذر تسجيل الدخول: ${msg}`);
      } else {
        Alert.alert("تعذر تسجيل الدخول", msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const Logo = mode === "dark" ? DarkLogo : LightLogo;

  return (
    <Screen>
      <View style={styles.brandHeader}>
        <ThemeToggle />
        <View style={styles.logo}>
          <Logo width="100%" height="100%" />
        </View>
      </View>
      <AppCard style={styles.form}>
        <TextField label="رقم الهاتف" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
        <TextField label="كلمة المرور" secureTextEntry value={password} onChangeText={setPassword} />
        <AppButton title="تسجيل الدخول" isLoading={isSubmitting} onPress={handleLogin} />
        <AppButton title="إنشاء حساب" variant="ghost" onPress={() => navigation.navigate("Register")} />
      </AppCard>
    </Screen>
  );
}

const makeStyles = (theme: ReturnType<typeof useTheme>["theme"]) => StyleSheet.create({
  brandHeader: {
    gap: spacing.sm,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    alignItems: "flex-end",
  },
  logo: {
    width: "100%",
    height: 80,
  },
  form: {
    gap: spacing.md
  },
});

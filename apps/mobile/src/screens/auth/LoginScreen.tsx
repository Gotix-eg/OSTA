import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
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
      await login(phone, password);
    } catch (error) {
      Alert.alert("تعذر تسجيل الدخول", error instanceof Error ? error.message : "حاول مرة أخرى");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Dark mode → white text logo (original SVG), Light mode → black text logo
  const logoSource = mode === "dark"
    ? require("../../../assets/logo.svg")
    : require("../../../assets/logo-light.svg");

  return (
    <Screen>
      <View style={styles.brandHeader}>
        <ThemeToggle />
        <Image
          source={logoSource}
          style={styles.logo}
          contentFit="contain"
        />
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

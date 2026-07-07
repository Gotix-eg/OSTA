import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
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
  const { theme } = useTheme();
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

  return (
    <Screen>
      <View style={styles.brandHeader}>
        <ThemeToggle />
        <Text style={styles.brand}>أُسطى</Text>
        <Text style={styles.tagline}>خدمات وصيانة وطلبات متاجر في تطبيق Native واحد</Text>
      </View>
      <AppCard style={styles.form}>
        <TextField label="رقم الهاتف" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
        <TextField label="كلمة المرور" secureTextEntry value={password} onChangeText={setPassword} />
        <AppButton title="تسجيل الدخول" isLoading={isSubmitting} onPress={handleLogin} />
        <AppButton title="إنشاء حساب" variant="ghost" onPress={() => navigation.navigate("Register")} />
        <Text style={styles.help}>الجلسة تحفظ بأمان على الجهاز، والبيانات تأتي من API أُسطى المتصل بالداتا بيز.</Text>
      </AppCard>
    </Screen>
  );
}

const makeStyles = (theme: ReturnType<typeof useTheme>["theme"]) => StyleSheet.create({
  brandHeader: {
    gap: spacing.sm,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md
  },
  brand: {
    color: theme.text,
    fontSize: 42,
    lineHeight: 48,
    fontWeight: "900",
    textAlign: "right"
  },
  tagline: {
    color: theme.muted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "right"
  },
  form: {
    gap: spacing.md
  },
  help: {
    color: theme.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "right"
  }
});

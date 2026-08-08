import { useState } from "react";
import { Alert, StyleSheet, View, Platform } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AppButton } from "../../components/AppButton";
import { AppCard } from "../../components/AppCard";
import { Screen } from "../../components/Screen";
import { TextField } from "../../components/TextField";
import { useAuth } from "../../context/AuthContext";
import type { AuthStackParamList } from "../../navigation/types";
import { spacing } from "../../theme/spacing";

type Props = NativeStackScreenProps<AuthStackParamList, "Otp">;

export function OtpScreen({ route, navigation }: Props) {
  const { verifyOtp } = useAuth();
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleVerify() {
    setIsSubmitting(true);
    try {
      const loggedInUser = await verifyOtp(code, route.params?.phone);
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
        alert(`تعذر التحقق: ${msg}`);
      } else {
        Alert.alert("تعذر التحقق", msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen title="رمز التحقق" subtitle="أدخل الرمز المكون من 6 أرقام.">
      <AppCard style={styles.form}>
        <TextField label="رمز التحقق" keyboardType="number-pad" maxLength={6} value={code} onChangeText={setCode} />
        <AppButton title="تأكيد" isLoading={isSubmitting} onPress={handleVerify} />
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md
  }
});

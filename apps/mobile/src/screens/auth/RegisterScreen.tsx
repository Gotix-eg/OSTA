import { useState } from "react";
import { Alert, StyleSheet, Text, View, Pressable, ActivityIndicator } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";

import { AppButton } from "../../components/AppButton";
import { AppCard } from "../../components/AppCard";
import { Screen } from "../../components/Screen";
import { TextField } from "../../components/TextField";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { spacing } from "../../theme/spacing";
import { uploadMedia } from "../../api/upload";
import type { AuthStackParamList } from "../../navigation/types";
import type { RegisterPayload } from "../../types/auth";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;
type RegisterRole = RegisterPayload["role"];

export function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const [role, setRole] = useState<RegisterRole>("CLIENT");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Image picker state for personal face photo
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  async function pickAvatar() {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("الإذن مطلوب", "يجب السماح بالوصول لمعرض الصور لاختيار الصورة الشخصية.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  }

  async function handleRegister() {
    setErrorMessage(null);
    setIsSubmitting(true);

    // Validate parameters
    if (!firstName.trim() || !lastName.trim() || !phone.trim() || !password.trim()) {
      Alert.alert("بيانات ناقصة", "يرجى ملء جميع الحقول المطلوبة.");
      setIsSubmitting(false);
      return;
    }

    // Photo validation: mandatory for worker, optional for client/vendor
    if (role === "WORKER" && !avatarUri) {
      Alert.alert("صورة شخصية مطلوبة", "يجب رفع صورة شخصية واضحة لوجهك لإكمال تسجيل الفني.");
      setIsSubmitting(false);
      return;
    }

    let uploadedAvatarUrl = "";
    if (avatarUri) {
      setIsUploading(true);
      try {
        uploadedAvatarUrl = await uploadMedia(avatarUri);
      } catch (error) {
        const msg = error instanceof Error ? error.message : "تعذر رفع الصورة الشخصية";
        Alert.alert("فشل تحميل الصورة", msg);
        setIsUploading(false);
        setIsSubmitting(false);
        return;
      }
      setIsUploading(false);
    }

    try {
      const result = await register({
        role,
        firstName,
        lastName,
        phone,
        email,
        password,
        confirmPassword: password,
        avatarUrl: uploadedAvatarUrl || undefined
      });
      if (result?.needsVerification) {
        navigation.navigate("Otp", { phone });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "حاول مرة أخرى";
      setErrorMessage(message);
      Alert.alert("تعذر إنشاء الحساب", message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen title="إنشاء حساب" subtitle="اختر نوع الحساب وأدخل البيانات الأساسية.">
      <View style={styles.roles}>
        <AppButton title="عميل" variant={role === "CLIENT" ? "primary" : "secondary"} onPress={() => setRole("CLIENT")} />
        <AppButton title="عامل" variant={role === "WORKER" ? "primary" : "secondary"} onPress={() => setRole("WORKER")} />
        <AppButton title="تاجر" variant={role === "VENDOR" ? "primary" : "secondary"} onPress={() => setRole("VENDOR")} />
      </View>

      <AppCard style={styles.form}>
        {/* Face Image Picker Section */}
        <View style={styles.avatarSection}>
          <Text style={styles.avatarLabel}>
            صورة الوجه الشخصية {role === "WORKER" ? <Text style={styles.required}>*(إجباري)</Text> : <Text style={styles.optional}>(اختياري)</Text>}
          </Text>
          <Pressable style={styles.avatarPicker} onPress={pickAvatar}>
            {isUploading ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : avatarUri ? (
              <Image source={avatarUri} style={styles.avatarImage as any} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="camera-outline" size={28} color={theme.muted} />
                <Text style={styles.pickerText}>اضغط لاختيار صورة</Text>
              </View>
            )}
          </Pressable>
        </View>

        <TextField label="الاسم الأول" value={firstName} onChangeText={setFirstName} />
        <TextField label="اسم العائلة" value={lastName} onChangeText={setLastName} />
        <TextField label="رقم الهاتف" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
        <TextField label="البريد الإلكتروني" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
        <TextField label="كلمة المرور" secureTextEntry value={password} onChangeText={setPassword} />
        
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        
        <AppButton title="إنشاء الحساب" isLoading={isSubmitting || isUploading} onPress={handleRegister} />
      </AppCard>
    </Screen>
  );
}

const makeStyles = (theme: ReturnType<typeof useTheme>["theme"]) => StyleSheet.create({
  roles: {
    flexDirection: "row-reverse",
    gap: spacing.sm
  },
  form: {
    gap: spacing.md
  },
  avatarSection: {
    alignItems: "center",
    marginVertical: spacing.sm,
    gap: spacing.xs
  },
  avatarLabel: {
    color: theme.text,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "right",
    width: "100%",
    marginBottom: 4
  },
  avatarPicker: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: theme.primary,
    borderStyle: "dashed",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.surfaceAlt
  },
  avatarImage: {
    width: "100%",
    height: "100%"
  },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    gap: 4
  },
  pickerText: {
    color: theme.muted,
    fontSize: 10,
    textAlign: "center"
  },
  required: {
    color: theme.danger,
    fontSize: 12,
    fontWeight: "bold"
  },
  optional: {
    color: theme.muted,
    fontSize: 12
  },
  error: {
    color: theme.danger,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "right"
  }
});

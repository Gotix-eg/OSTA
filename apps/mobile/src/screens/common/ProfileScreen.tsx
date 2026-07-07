import { useState } from "react";
import { Text, View, StyleSheet, Pressable, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";

import { AppButton } from "../../components/AppButton";
import { AppCard } from "../../components/AppCard";
import { Screen } from "../../components/Screen";
import { ThemeToggle } from "../../components/ThemeToggle";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { spacing } from "../../theme/spacing";
import { formatUserName } from "../../utils/formatters";
import { uploadMedia } from "../../api/upload";
import { apiClient, unwrapApiData } from "../../api/client";

export function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth();
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const [isUploading, setIsUploading] = useState(false);

  async function handleChangeAvatar() {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("الإذن مطلوب", "يجب السماح بالوصول لمعرض الصور لتغيير الصورة الشخصية.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setIsUploading(true);
      try {
        const uploadedUrl = await uploadMedia(result.assets[0].uri);
        // Update user avatarUrl in DB via PATCH /auth/profile
        await apiClient.patch("/auth/profile", { avatarUrl: uploadedUrl });
        // Sync context
        await refreshUser();
        Alert.alert("تمت العملية بنجاح", "تم تحديث صورتك الشخصية بنجاح.");
      } catch (error) {
        const msg = error instanceof Error ? error.message : "تعذر تحديث الصورة";
        Alert.alert("فشل تحديث الصورة", msg);
      } finally {
        setIsUploading(false);
      }
    }
  }

  const [isSwitching, setIsSwitching] = useState(false);

  async function handleSwitchRole() {
    setIsSwitching(true);
    try {
      const response = await apiClient.post("/auth/switch-role");
      const data = unwrapApiData<{ user: any; role: string }>(response.data);
      // Sync auth context state
      await refreshUser();
      Alert.alert("تم التبديل بنجاح", `أنت الآن في وضع ${data.role === "WORKER" ? "الفني" : "العميل"}.`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "فشل تبديل نوع الحساب";
      Alert.alert("تعذر التبديل", msg);
    } finally {
      setIsSwitching(false);
    }
  }

  return (
    <Screen title="الملف الشخصي" subtitle={user?.role ? `نوع الحساب: ${user.role}` : undefined} showBack={false}>
      <ThemeToggle />
      
      <AppCard style={styles.panel}>
        {/* Avatar Section */}
        <View style={styles.avatarWrapper}>
          <Pressable style={styles.avatarContainer} onPress={handleChangeAvatar} disabled={isUploading}>
            {isUploading ? (
              <ActivityIndicator size="large" color={theme.primary} />
            ) : user?.avatarUrl ? (
              <Image source={user.avatarUrl} style={styles.avatarImage as any} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={48} color={theme.muted} />
              </View>
            )}
            {!isUploading && (
              <View style={styles.cameraIconBadge}>
                <Ionicons name="camera" size={16} color={theme.primaryText} />
              </View>
            )}
          </Pressable>
          <Text style={styles.avatarHelpText}>اضغط على الصورة لتعديلها</Text>
        </View>

        <View style={styles.infoBlock}>
          <Text style={styles.name}>{formatUserName(user?.firstName, user?.lastName) || "مستخدم أُسطى"}</Text>
          <Text style={styles.meta}>{user?.phone}</Text>
          {user?.email ? <Text style={styles.meta}>{user.email}</Text> : null}
        </View>
      </AppCard>
      
      {user?.role !== "VENDOR" && (
        <AppButton 
          title={user?.role === "WORKER" ? "التبديل إلى وضع العميل" : "التبديل إلى وضع الفني"} 
          variant="primary" 
          isLoading={isSwitching}
          onPress={handleSwitchRole}
          style={{ marginBottom: spacing.sm }}
        />
      )}

      <AppButton title="تسجيل الخروج" variant="secondary" onPress={logout} />
    </Screen>
  );
}

const makeStyles = (theme: ReturnType<typeof useTheme>["theme"]) => StyleSheet.create({
  panel: {
    gap: spacing.md,
    alignItems: "center",
    paddingVertical: spacing.lg
  },
  avatarWrapper: {
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm
  },
  avatarContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: theme.primary,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.surfaceAlt,
    position: "relative"
  },
  avatarImage: {
    width: "100%",
    height: "100%"
  },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center"
  },
  cameraIconBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarHelpText: {
    color: theme.muted,
    fontSize: 11,
    fontWeight: "600"
  },
  infoBlock: {
    alignItems: "center",
    gap: 4
  },
  name: {
    color: theme.text,
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center"
  },
  meta: {
    color: theme.muted,
    fontSize: 14,
    textAlign: "center"
  }
});

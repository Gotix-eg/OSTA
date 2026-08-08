import { useState } from "react";
import { Text, View, StyleSheet, Pressable, Alert, ActivityIndicator, Platform, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";

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
import { GuestGate } from "../../components/GuestGate";
import { useApiResource } from "../../hooks/useApiResource";

export function ProfileScreen() {
  const { user, logout, refreshUser, switchRole, token } = useAuth();
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const navigation = useNavigation<any>();
  const [isUploading, setIsUploading] = useState(false);
  const [showProfessionDropdown, setShowProfessionDropdown] = useState(false);
  const [isUpdatingProfession, setIsUpdatingProfession] = useState(false);

  const [isEditingVendor, setIsEditingVendor] = useState(false);
  const [editedShopName, setEditedShopName] = useState("");
  const [editedCategory, setEditedCategory] = useState("");
  const [editedAddress, setEditedAddress] = useState("");
  const [editedShopDesc, setEditedShopDesc] = useState("");
  const [isSavingVendor, setIsSavingVendor] = useState(false);

  function handleStartEditVendor() {
    setEditedShopName(user?.profile?.shopName || "");
    setEditedCategory(user?.profile?.category || "");
    setEditedAddress(user?.profile?.address || "");
    setEditedShopDesc(user?.profile?.shopDescription || "");
    setIsEditingVendor(true);
  }

  async function handleSaveVendor() {
    setIsSavingVendor(true);
    try {
      await apiClient.patch("/auth/profile", {
        shopName: editedShopName,
        category: editedCategory,
        address: editedAddress,
        shopDescription: editedShopDesc
      });
      await refreshUser();
      setIsEditingVendor(false);
      showAlert("تم التحديث", "تم تحديث بيانات المتجر بنجاح.");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "تعذر تحديث البيانات";
      showAlert("خطأ", msg);
    } finally {
      setIsSavingVendor(false);
    }
  }

  const categories = useApiResource<Array<{ id: string; nameAr: string; slug: string }>>("/services/categories", []);

  async function handleUpdateProfession(newProfession: string) {
    setShowProfessionDropdown(false);
    setIsUpdatingProfession(true);
    try {
      await apiClient.patch("/auth/profile", { profession: newProfession });
      await refreshUser();
      showAlert("تم التحديث", "تم تحديث مهنتك بنجاح.");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "تعذر تحديث المهنة";
      showAlert("خطأ", msg);
    } finally {
      setIsUpdatingProfession(false);
    }
  }

  if (!token) {
    return (
      <Screen title="حسابي" showBack={false}>
        <GuestGate message="يرجى تسجيل الدخول لعرض حسابك الشخصي وإدارة طلباتك وبياناتك." />
      </Screen>
    );
  }

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
        showAlert("تمت العملية بنجاح", "تم تحديث صورتك الشخصية بنجاح.");
      } catch (error) {
        const msg = error instanceof Error ? error.message : "تعذر تحديث الصورة";
        showAlert("فشل تحديث الصورة", msg);
      } finally {
        setIsUploading(false);
      }
    }
  }

  function showAlert(title: string, message: string) {
    if (Platform.OS === "web") {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  }

  const [isSwitching, setIsSwitching] = useState(false);

  async function handleSwitchRole(targetRole: "CLIENT" | "WORKER" | "VENDOR") {
    setIsSwitching(true);
    try {
      await switchRole(targetRole);
      showAlert("تم التبديل بنجاح", `تم الانتقال لوضع الحساب الآخر بنجاح.`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "فشل تبديل نوع الحساب";
      showAlert("تعذر التبديل", msg);
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

        {user?.role === "VENDOR" && isEditingVendor ? (
          <View style={styles.vendorEditForm}>
            <Text style={styles.editFormLabel}>اسم المتجر</Text>
            <TextInput
              style={styles.vendorInput}
              value={editedShopName}
              onChangeText={setEditedShopName}
              placeholder="اسم المتجر"
              placeholderTextColor={theme.muted}
            />
            
            <Text style={styles.editFormLabel}>نشاط / تصنيف المتجر</Text>
            <TextInput
              style={styles.vendorInput}
              value={editedCategory}
              onChangeText={setEditedCategory}
              placeholder="مثال: قطع غيار، أدوات صحية، دهانات"
              placeholderTextColor={theme.muted}
            />

            <Text style={styles.editFormLabel}>العنوان بالتفصيل</Text>
            <TextInput
              style={styles.vendorInput}
              value={editedAddress}
              onChangeText={setEditedAddress}
              placeholder="عنوان المتجر"
              placeholderTextColor={theme.muted}
            />

            <Text style={styles.editFormLabel}>وصف المتجر</Text>
            <TextInput
              style={[styles.vendorInput, { minHeight: 60 }]}
              multiline
              value={editedShopDesc}
              onChangeText={setEditedShopDesc}
              placeholder="وصف متجرك والمنتجات التي توفرها..."
              placeholderTextColor={theme.muted}
            />

            <View style={styles.vendorEditActions}>
              <Pressable 
                style={[styles.vendorActionBtn, { backgroundColor: theme.primary }]} 
                onPress={handleSaveVendor}
                disabled={isSavingVendor}
              >
                {isSavingVendor ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.vendorActionBtnText}>حفظ</Text>
                )}
              </Pressable>
              <Pressable 
                style={[styles.vendorActionBtn, { backgroundColor: theme.surfaceAlt, borderWidth: 1, borderColor: theme.border }]} 
                onPress={() => setIsEditingVendor(false)}
                disabled={isSavingVendor}
              >
                <Text style={[styles.vendorActionBtnText, { color: theme.text }]}>إلغاء</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.infoBlock}>
            <Text style={styles.name}>
              {user?.role === "VENDOR" 
                ? (user?.profile?.shopName || formatUserName(user?.firstName, user?.lastName) || "متجر أُسطى")
                : (formatUserName(user?.firstName, user?.lastName) || "مستخدم أُسطى")
              }
            </Text>
            <Text style={styles.meta}>{user?.phone}</Text>
            {user?.email ? <Text style={styles.meta}>{user.email}</Text> : null}

            {user?.role === "VENDOR" && (
              <View style={styles.vendorDetails}>
                <Text style={styles.vendorDetailText}>
                  النشاط: {user?.profile?.category || "غير محدد"}
                </Text>
                <Text style={styles.vendorDetailText}>
                  العنوان: {user?.profile?.address || "غير محدد"}
                </Text>
                {user?.profile?.shopDescription ? (
                  <Text style={styles.vendorDetailText}>
                    الوصف: {user.profile.shopDescription}
                  </Text>
                ) : null}
                
                <Pressable style={styles.editVendorBtn} onPress={handleStartEditVendor}>
                  <Ionicons name="create-outline" size={16} color={theme.primary} />
                  <Text style={styles.editVendorBtnText}>تعديل بيانات المتجر</Text>
                </Pressable>
              </View>
            )}

            {user?.role === "WORKER" && (
              <View style={styles.professionContainer}>
                <View style={styles.professionRow}>
                  <Text style={styles.professionText}>
                    المهنة: {user?.profile?.profession || "غير محددة"}
                  </Text>
                  <Pressable 
                    style={styles.editProfessionBtn} 
                    onPress={() => setShowProfessionDropdown(!showProfessionDropdown)}
                    disabled={isUpdatingProfession}
                  >
                    {isUpdatingProfession ? (
                      <ActivityIndicator size="small" color={theme.primary} />
                    ) : (
                      <>
                        <Ionicons name="create-outline" size={14} color={theme.primary} />
                        <Text style={styles.editProfessionBtnText}>تعديل</Text>
                      </>
                    )}
                  </Pressable>
                </View>

                {showProfessionDropdown && (
                  <View style={styles.dropdown}>
                    {categories.data.map((cat) => (
                      <Pressable
                        key={cat.id}
                        style={styles.dropdownItem}
                        onPress={() => handleUpdateProfession(cat.nameAr)}
                      >
                        <Text style={styles.dropdownItemText}>{cat.nameAr}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </AppCard>

      {user?.role === "WORKER" && user?.profile?.id && (
        <AppButton 
          title="عرض صفحتي الشخصية كفني" 
          variant="primary" 
          onPress={() => navigation.navigate("WorkerProfile", { workerId: user.profile.id })}
          style={{ marginBottom: spacing.sm }}
        />
      )}
      
      {user?.role !== "CLIENT" && (
        <AppButton 
          title="التبديل إلى وضع العميل" 
          variant="primary" 
          isLoading={isSwitching}
          onPress={() => handleSwitchRole("CLIENT")}
          style={{ marginBottom: spacing.sm }}
        />
      )}

      {user?.role !== "WORKER" && (
        <AppButton 
          title="التبديل إلى وضع الفني" 
          variant="primary" 
          isLoading={isSwitching}
          onPress={() => handleSwitchRole("WORKER")}
          style={{ marginBottom: spacing.sm }}
        />
      )}

      {user?.role !== "VENDOR" && (
        <AppButton 
          title="التبديل إلى وضع المورد" 
          variant="primary" 
          isLoading={isSwitching}
          onPress={() => handleSwitchRole("VENDOR")}
          style={{ marginBottom: spacing.sm }}
        />
      )}

      <AppButton 
        title="الدعم والسياسات" 
        variant="primary" 
        onPress={() => navigation.navigate("Support")}
        style={{ marginBottom: spacing.md }}
      />

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
    gap: 4,
    width: "100%"
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
  },
  professionContainer: {
    width: "100%",
    marginTop: spacing.sm,
    alignItems: "center"
  },
  professionRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm
  },
  professionText: {
    color: theme.primary,
    fontSize: 14,
    fontWeight: "bold"
  },
  editProfessionBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: theme.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4
  },
  editProfessionBtnText: {
    color: theme.primary,
    fontSize: 11,
    fontWeight: "bold"
  },
  dropdown: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    marginTop: 6,
    width: 200,
    maxHeight: 180,
    overflow: "scroll",
    zIndex: 10
  },
  dropdownItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.border
  },
  dropdownItemText: {
    color: theme.text,
    fontSize: 13,
    textAlign: "center",
    fontWeight: "600"
  },
  vendorDetails: {
    width: "100%",
    marginTop: spacing.md,
    backgroundColor: theme.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.xs,
    alignItems: "flex-end"
  },
  vendorDetailText: {
    color: theme.text,
    fontSize: 13,
    textAlign: "right",
    lineHeight: 18,
    fontWeight: "600"
  },
  editVendorBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: spacing.sm,
    gap: 8,
    alignSelf: "center"
  },
  editVendorBtnText: {
    color: theme.primary,
    fontSize: 13,
    fontWeight: "bold"
  },
  vendorEditForm: {
    width: "100%",
    paddingHorizontal: spacing.sm,
    gap: spacing.xs
  },
  editFormLabel: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right",
    marginTop: 6
  },
  vendorInput: {
    width: "100%",
    backgroundColor: theme.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: theme.text,
    fontSize: 14,
    textAlign: "right"
  },
  vendorEditActions: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
    marginTop: spacing.md,
    justifyContent: "center"
  },
  vendorActionBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 100,
    alignItems: "center",
    justifyContent: "center"
  },
  vendorActionBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold"
  }
});

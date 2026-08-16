import { useState } from "react";
import { Alert, StyleSheet, Text, View, Pressable, Platform } from "react-native";
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
import { apiClient } from "../../api/client";

export function WorkerOnboardingScreen() {
  const { theme } = useTheme();
  const { refreshUser } = useAuth();
  const styles = makeStyles(theme);

  const [nationalIdNumber, setNationalIdNumber] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [nidFrontUri, setNidFrontUri] = useState<string | null>(null);
  const [nidBackUri, setNidBackUri] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState("");

  function showAlert(title: string, message: string) {
    if (Platform.OS === "web") {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  }

  async function pickDocument(docType: "avatar" | "nidFront" | "nidBack") {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      showAlert("الإذن مطلوب", "يجب السماح بالوصول لمعرض الصور لاختيار المستندات.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const uri = result.assets[0].uri;
      if (docType === "avatar") setAvatarUri(uri);
      else if (docType === "nidFront") setNidFrontUri(uri);
      else if (docType === "nidBack") setNidBackUri(uri);
    }
  }

  async function handleSubmit() {
    setErrorMessage(null);
    setIsSubmitting(true);

    if (!avatarUri) {
      showAlert("صورة شخصية مطلوبة", "يجب رفع صورة شخصية واضحة لوجهك لإكمال التوثيق.");
      setIsSubmitting(false);
      return;
    }
    if (!nationalIdNumber.trim() || nationalIdNumber.trim().length !== 14) {
      showAlert("الرقم القومي غير صالح", "يجب إدخال الرقم القومي المكون من 14 رقماً.");
      setIsSubmitting(false);
      return;
    }
    if (!nidFrontUri || !nidBackUri) {
      showAlert("مستندات مطلوبة", "يجب إرفاق صورة وجه البطاقة وظهر البطاقة القومية للتوثيق.");
      setIsSubmitting(false);
      return;
    }

    try {
      setUploadProgressMsg("جاري رفع الصورة الشخصية...");
      const uploadedAvatarUrl = await uploadMedia(avatarUri);
      
      setUploadProgressMsg("جاري رفع وجه البطاقة القومية...");
      const uploadedNidFront = await uploadMedia(nidFrontUri);
      
      setUploadProgressMsg("جاري رفع ظهر البطاقة القومية...");
      const uploadedNidBack = await uploadMedia(nidBackUri);

      setUploadProgressMsg("جاري إرسال البيانات للمراجعة...");

      await apiClient.patch("/auth/profile", {
        avatarUrl: uploadedAvatarUrl,
        nationalIdNumber,
        nationalIdFront: uploadedNidFront,
        nationalIdBack: uploadedNidBack
      });

      // After successful update, refresh the user to update the status in the app
      await refreshUser();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "تعذر إرسال المستندات للمراجعة";
      showAlert("فشل التحميل", msg);
      setErrorMessage(msg);
    } finally {
      setUploadProgressMsg("");
      setIsSubmitting(false);
    }
  }

  return (
    <Screen title="استكمال البيانات" subtitle="يرجى إرفاق المستندات المطلوبة لتفعيل حساب الفني الخاص بك">
      <AppCard style={styles.form}>
        <View style={styles.avatarSection}>
          <Text style={styles.avatarLabel}>صورة الوجه الشخصية <Text style={styles.required}>*(إجباري)</Text></Text>
          <Pressable style={styles.avatarPicker} onPress={() => pickDocument("avatar")}>
            {avatarUri ? (
              <Image source={avatarUri} style={styles.avatarImage as any} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="camera-outline" size={28} color={theme.muted} />
                <Text style={styles.pickerText}>تحميل صورة لوجهك</Text>
              </View>
            )}
          </Pressable>
        </View>

        <Text style={styles.sectionDivider}>بيانات التوثيق</Text>
        <TextField 
          label="الرقم القومي (14 رقم بالكامل)" 
          keyboardType="number-pad" 
          maxLength={14} 
          value={nationalIdNumber} 
          onChangeText={setNationalIdNumber} 
        />

        <Text style={styles.documentTitle}>المستندات المطلوبة للتوثيق (صورة البطاقة)</Text>
        <View style={styles.rowDocs}>
          <View style={styles.docCol}>
            <Text style={styles.docLabel}>وجه البطاقة القومية *(إجباري)</Text>
            <Pressable style={styles.docPicker} onPress={() => pickDocument("nidFront")}>
              {nidFrontUri ? (
                <Image source={nidFrontUri} style={styles.docImage as any} />
              ) : (
                <View style={styles.docPickerPlaceholder}>
                  <Ionicons name="card-outline" size={24} color={theme.muted} />
                  <Text style={styles.docPickerText}>رفع الوجه الأمامي</Text>
                </View>
              )}
            </Pressable>
          </View>

          <View style={styles.docCol}>
            <Text style={styles.docLabel}>ظهر البطاقة القومية *(إجباري)</Text>
            <Pressable style={styles.docPicker} onPress={() => pickDocument("nidBack")}>
              {nidBackUri ? (
                <Image source={nidBackUri} style={styles.docImage as any} />
              ) : (
                <View style={styles.docPickerPlaceholder}>
                  <Ionicons name="card-outline" size={24} color={theme.muted} />
                  <Text style={styles.docPickerText}>رفع الوجه الخلفي</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        {uploadProgressMsg ? <Text style={styles.progressText}>{uploadProgressMsg}</Text> : null}
        
        <AppButton 
          title="إرسال للمراجعة" 
          isLoading={isSubmitting} 
          onPress={handleSubmit} 
        />
      </AppCard>
    </Screen>
  );
}

const makeStyles = (theme: ReturnType<typeof useTheme>["theme"]) => StyleSheet.create({
  form: {
    gap: spacing.md
  },
  avatarSection: {
    alignItems: "center",
    marginVertical: spacing.xs,
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
    width: 80,
    height: 80,
    borderRadius: 40,
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
    fontSize: 9,
    textAlign: "center"
  },
  sectionDivider: {
    color: theme.primary,
    fontSize: 15,
    fontWeight: "900",
    textAlign: "right",
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    paddingBottom: 6,
    marginTop: spacing.sm,
    marginBottom: 4
  },
  documentTitle: {
    color: theme.text,
    fontSize: 13,
    fontWeight: "800",
    textAlign: "right",
    marginTop: spacing.xs
  },
  rowDocs: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md
  },
  docCol: {
    flex: 1,
    gap: spacing.xs
  },
  docLabel: {
    color: theme.muted,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "right"
  },
  docPicker: {
    height: 100,
    borderWidth: 1.5,
    borderColor: theme.border,
    borderStyle: "dashed",
    borderRadius: 8,
    backgroundColor: theme.surfaceAlt,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center"
  },
  docImage: {
    width: "100%",
    height: "100%"
  },
  docPickerPlaceholder: {
    alignItems: "center",
    gap: 4
  },
  docPickerText: {
    color: theme.muted,
    fontSize: 10,
    fontWeight: "600"
  },
  required: {
    color: theme.danger,
    fontSize: 12,
    fontWeight: "bold"
  },
  progressText: {
    color: theme.primary,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 4
  },
  error: {
    color: theme.danger,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "right"
  }
});

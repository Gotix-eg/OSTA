import { useState } from "react";
import { Alert, StyleSheet, Text, View, Pressable, ActivityIndicator, TextInput } from "react-native";
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
import { useApiResource } from "../../hooks/useApiResource";
import type { AuthStackParamList } from "../../navigation/types";
import type { RegisterPayload } from "../../types/auth";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;
type RegisterRole = RegisterPayload["role"];

// Egypt Governorates & Cities lists
const GOVERNORATES = ["القاهرة", "الجيزة", "الإسكندرية", "القليوبية", "الغربية"];
const CITIES_BY_GOV: Record<string, string[]> = {
  "القاهرة": ["مصر الجديدة", "مدينة نصر", "المعادي", "التجمع الخامس", "شبرا", "حلوان"],
  "الجيزة": ["الدقي", "المهندسين", "الهرم", "فيصل", "6 أكتوبر", "الشيخ زايد"],
  "الإسكندرية": ["سموحة", "المنتزه", "الرمل", "سيدي بشر", "محرم بك"],
  "القليوبية": ["بنها", "شبرا الخيمة", "طوخ", "قليوب"],
  "الغربية": ["طنطا", "المحلة الكبرى", "كفر الزيات"]
};

// Worker Professions list
const PROFESSIONS = [
  "كهربائي فني",
  "سباك فني",
  "نجار محترف",
  "نقاش ودهانات",
  "فني تكييف وتبريد",
  "حداد وكريتال",
  "فني ألوميتال"
];

// Vendor Categories list
const VENDOR_CATEGORIES = [
  "أدوات كهربائية وتأسيس",
  "أدوات سباكة وصحي",
  "دهانات وبويات وحوائط",
  "مواد بناء وأسمنت وحديد",
  "أخشاب ومستلزمات نجارة",
  "خردوات ومعدات وعدد يدوية"
];

export function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  
  const [role, setRole] = useState<RegisterRole>("CLIENT");
  
  // Basic Fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Dynamic Profile & Address Details
  const [gov, setGov] = useState<string>("القاهرة");
  const [city, setCity] = useState<string>("مصر الجديدة");
  const [address, setAddress] = useState("");
  
  // Dynamic Categories Hook
  const categories = useApiResource<Array<{ id: string; nameAr: string; slug: string }>>("/services/categories", []);

  // Technician Fields
  const [profession, setProfession] = useState("");
  const [nationalIdNumber, setNationalIdNumber] = useState("");
  
  // Store (Vendor) Fields
  const [shopName, setShopName] = useState("");
  const [vendorCategory, setVendorCategory] = useState(VENDOR_CATEGORIES[0]);

  // File pickers URIs
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [nidFrontUri, setNidFrontUri] = useState<string | null>(null);
  const [nidBackUri, setNidBackUri] = useState<string | null>(null);
  const [commRecordUri, setCommRecordUri] = useState<string | null>(null);
  const [taxCardUri, setTaxCardUri] = useState<string | null>(null);
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState("");

  // Selectors visibility states
  const [showGovDropdown, setShowGovDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showProfessionDropdown, setShowProfessionDropdown] = useState(false);
  const [showVendorCatDropdown, setShowVendorCatDropdown] = useState(false);

  async function pickDocument(docType: "avatar" | "nidFront" | "nidBack" | "commRecord" | "taxCard") {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("الإذن مطلوب", "يجب السماح بالوصول لمعرض الصور لاختيار المستندات.");
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
      else if (docType === "commRecord") setCommRecordUri(uri);
      else if (docType === "taxCard") setTaxCardUri(uri);
    }
  }

  async function handleRegister() {
    setErrorMessage(null);
    setIsSubmitting(true);

    // Validate Basic Fields
    if (!firstName.trim() || !lastName.trim() || !phone.trim() || !password.trim()) {
      Alert.alert("بيانات ناقصة", "يرجى ملء الاسم، رقم الهاتف، وكلمة المرور.");
      setIsSubmitting(false);
      return;
    }

    // Role-specific validation
    if (role === "WORKER") {
      if (!avatarUri) {
        Alert.alert("صورة شخصية مطلوبة", "يجب رفع صورة شخصية واضحة لوجهك لإكمال تسجيل الفني.");
        setIsSubmitting(false);
        return;
      }
      if (!nationalIdNumber.trim() || nationalIdNumber.trim().length !== 14) {
        Alert.alert("الرقم القومي غير صالح", "يجب إدخال الرقم القومي المكون من 14 رقماً.");
        setIsSubmitting(false);
        return;
      }
      if (!nidFrontUri || !nidBackUri) {
        Alert.alert("مستندات مطلوبة", "يجب إرفاق صورة وجه البطاقة وظهر البطاقة القومية للتوثيق.");
        setIsSubmitting(false);
        return;
      }
    } else if (role === "VENDOR") {
      if (!shopName.trim()) {
        Alert.alert("اسم المتجر مطلوب", "يرجى إدخال اسم المحل أو المتجر الخاص بك.");
        setIsSubmitting(false);
        return;
      }
      if (!commRecordUri || !taxCardUri) {
        Alert.alert("أوراق مطلوبة", "يجب إرفاق صورة السجل التجاري والبطاقة الضريبية لتوثيق المتجر.");
        setIsSubmitting(false);
        return;
      }
    }

    // File Upload Phase
    let uploadedAvatarUrl = "";
    let uploadedNidFront = "";
    let uploadedNidBack = "";
    let uploadedCommRecord = "";
    let uploadedTaxCard = "";

    try {
      if (avatarUri) {
        setUploadProgressMsg("جاري رفع الصورة الشخصية...");
        uploadedAvatarUrl = await uploadMedia(avatarUri);
      }
      if (role === "WORKER") {
        setUploadProgressMsg("جاري رفع وجه البطاقة القومية...");
        uploadedNidFront = await uploadMedia(nidFrontUri!);
        setUploadProgressMsg("جاري رفع ظهر البطاقة القومية...");
        uploadedNidBack = await uploadMedia(nidBackUri!);
      } else if (role === "VENDOR") {
        setUploadProgressMsg("جاري رفع السجل التجاري...");
        uploadedCommRecord = await uploadMedia(commRecordUri!);
        setUploadProgressMsg("جاري رفع البطاقة الضريبية...");
        uploadedTaxCard = await uploadMedia(taxCardUri!);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "تعذر رفع المستندات المرفقة";
      Alert.alert("فشل تحميل الملفات", msg);
      setUploadProgressMsg("");
      setIsSubmitting(false);
      return;
    }

    setUploadProgressMsg("جاري تسجيل الحساب الجديد...");

    try {
      const result = await register({
        role,
        firstName,
        lastName,
        phone,
        email: email || undefined,
        password,
        confirmPassword: password,
        avatarUrl: uploadedAvatarUrl || undefined,
        // Profile Info
        governorate: gov,
        city: city,
        address: address || undefined,
        // Worker Fields
        profession: role === "WORKER" ? (profession || (categories.data[0] ? categories.data[0].nameAr : "")) : undefined,
        nationalIdNumber: role === "WORKER" ? nationalIdNumber : undefined,
        nationalIdFront: role === "WORKER" ? uploadedNidFront : undefined,
        nationalIdBack: role === "WORKER" ? uploadedNidBack : undefined,
        // Vendor Fields
        shopName: role === "VENDOR" ? shopName : undefined,
        category: role === "VENDOR" ? vendorCategory : undefined,
        commercialRecord: role === "VENDOR" ? uploadedCommRecord : undefined,
        taxCard: role === "VENDOR" ? uploadedTaxCard : undefined
      });

      if (result?.needsVerification) {
        navigation.navigate("Otp", { phone });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "حاول مرة أخرى";
      setErrorMessage(message);
      Alert.alert("تعذر إنشاء الحساب", message);
    } finally {
      setUploadProgressMsg("");
      setIsSubmitting(false);
    }
  }

  return (
    <Screen title="إنشاء حساب" subtitle="اختر نوع الحساب وأدخل البيانات الأساسية والمستندات المطلوبة.">
      <View style={styles.roles}>
        <AppButton title="عميل" variant={role === "CLIENT" ? "primary" : "secondary"} onPress={() => setRole("CLIENT")} />
        <AppButton title="فني / صنايعي" variant={role === "WORKER" ? "primary" : "secondary"} onPress={() => setRole("WORKER")} />
        <AppButton title="متجر خامات" variant={role === "VENDOR" ? "primary" : "secondary"} onPress={() => setRole("VENDOR")} />
      </View>

      <AppCard style={styles.form}>
        {/* Face Image Picker Section */}
        <View style={styles.avatarSection}>
          <Text style={styles.avatarLabel}>
            صورة الوجه الشخصية {role === "WORKER" ? <Text style={styles.required}>*(إجباري)</Text> : <Text style={styles.optional}>(اختياري)</Text>}
          </Text>
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

        {/* Section 1: Basic Info */}
        <Text style={styles.sectionDivider}>البيانات الشخصية والأساسية</Text>
        <TextField label="الاسم الأول" value={firstName} onChangeText={setFirstName} />
        <TextField label="اسم العائلة" value={lastName} onChangeText={setLastName} />
        <TextField label="رقم الهاتف" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
        <TextField label="البريد الإلكتروني" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
        <TextField label="كلمة المرور" secureTextEntry value={password} onChangeText={setPassword} />

        {/* Section 2: Address (Cairo, Giza, etc.) */}
        <Text style={styles.sectionDivider}>العنوان والتغطية الجغرافية</Text>
        
        {/* Governorate Selector */}
        <View style={styles.selectorWrapper}>
          <Text style={styles.selectorLabel}>المحافظة</Text>
          <Pressable style={styles.selectorButton} onPress={() => setShowGovDropdown(!showGovDropdown)}>
            <Text style={styles.selectorButtonText}>{gov}</Text>
            <Ionicons name={showGovDropdown ? "chevron-up" : "chevron-down"} size={16} color={theme.text} />
          </Pressable>
          {showGovDropdown && (
            <View style={styles.dropdown}>
              {GOVERNORATES.map((g) => (
                <Pressable
                  key={g}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setGov(g);
                    const cities = CITIES_BY_GOV[g];
                    if (cities && cities[0]) {
                      setCity(cities[0]);
                    }
                    setShowGovDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{g}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* City Selector */}
        <View style={styles.selectorWrapper}>
          <Text style={styles.selectorLabel}>المنطقة / المدينة</Text>
          <Pressable style={styles.selectorButton} onPress={() => setShowCityDropdown(!showCityDropdown)}>
            <Text style={styles.selectorButtonText}>{city}</Text>
            <Ionicons name={showCityDropdown ? "chevron-up" : "chevron-down"} size={16} color={theme.text} />
          </Pressable>
          {showCityDropdown && (
            <View style={styles.dropdown}>
              {(CITIES_BY_GOV[gov] || []).map((c: string) => (
                <Pressable
                  key={c}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setCity(c);
                    setShowCityDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{c}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <TextField label="العنوان بالتفصيل (الشارع، اسم العمارة...)" value={address} onChangeText={setAddress} />

        {/* Section 3: Professional Info (Worker/Vendor) */}
        {role === "WORKER" && (
          <>
            <Text style={styles.sectionDivider}>بيانات الحرف والتوثيق</Text>
            
            {/* Profession Selector */}
            <View style={styles.selectorWrapper}>
              <Text style={styles.selectorLabel}>تخصصك الرئيسي</Text>
              <Pressable style={styles.selectorButton} onPress={() => setShowProfessionDropdown(!showProfessionDropdown)}>
                <Text style={styles.selectorButtonText}>
                  {profession || (categories.data[0] ? categories.data[0].nameAr : "اختر التخصص")}
                </Text>
                <Ionicons name={showProfessionDropdown ? "chevron-up" : "chevron-down"} size={16} color={theme.text} />
              </Pressable>
              {showProfessionDropdown && (
                <View style={styles.dropdown}>
                  {categories.data.map((cat) => (
                    <Pressable
                      key={cat.id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setProfession(cat.nameAr);
                        setShowProfessionDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{cat.nameAr}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            <TextField 
              label="الرقم القومي (14 رقم بالكامل)" 
              keyboardType="number-pad" 
              maxLength={14} 
              value={nationalIdNumber} 
              onChangeText={setNationalIdNumber} 
            />

            {/* National ID Document Uploads */}
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
          </>
        )}

        {role === "VENDOR" && (
          <>
            <Text style={styles.sectionDivider}>بيانات متجر خامات التشطيب</Text>
            <TextField label="اسم المتجر / المحل التجاري" value={shopName} onChangeText={setShopName} />
            
            {/* Vendor Category Selector */}
            <View style={styles.selectorWrapper}>
              <Text style={styles.selectorLabel}>نوع الخامات والمواد المباعة</Text>
              <Pressable style={styles.selectorButton} onPress={() => setShowVendorCatDropdown(!showVendorCatDropdown)}>
                <Text style={styles.selectorButtonText}>{vendorCategory}</Text>
                <Ionicons name={showVendorCatDropdown ? "chevron-up" : "chevron-down"} size={16} color={theme.text} />
              </Pressable>
              {showVendorCatDropdown && (
                <View style={styles.dropdown}>
                  {VENDOR_CATEGORIES.map((vc) => (
                    <Pressable
                      key={vc}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setVendorCategory(vc);
                        setShowVendorCatDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{vc}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Vendor Documents Uploads */}
            <Text style={styles.documentTitle}>الأوراق والمستندات القانونية للمتجر</Text>
            
            <View style={styles.rowDocs}>
              <View style={styles.docCol}>
                <Text style={styles.docLabel}>السجل التجاري *(إجباري)</Text>
                <Pressable style={styles.docPicker} onPress={() => pickDocument("commRecord")}>
                  {commRecordUri ? (
                    <Image source={commRecordUri} style={styles.docImage as any} />
                  ) : (
                    <View style={styles.docPickerPlaceholder}>
                      <Ionicons name="document-text-outline" size={24} color={theme.muted} />
                      <Text style={styles.docPickerText}>رفع السجل التجاري</Text>
                    </View>
                  )}
                </Pressable>
              </View>

              <View style={styles.docCol}>
                <Text style={styles.docLabel}>البطاقة الضريبية *(إجباري)</Text>
                <Pressable style={styles.docPicker} onPress={() => pickDocument("taxCard")}>
                  {taxCardUri ? (
                    <Image source={taxCardUri} style={styles.docImage as any} />
                  ) : (
                    <View style={styles.docPickerPlaceholder}>
                      <Ionicons name="document-text-outline" size={24} color={theme.muted} />
                      <Text style={styles.docPickerText}>رفع البطاقة الضريبية</Text>
                    </View>
                  )}
                </Pressable>
              </View>
            </View>
          </>
        )}

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        {uploadProgressMsg ? <Text style={styles.progressText}>{uploadProgressMsg}</Text> : null}
        
        <AppButton 
          title="إنشاء الحساب" 
          isLoading={isSubmitting} 
          onPress={handleRegister} 
        />
      </AppCard>
    </Screen>
  );
}

const makeStyles = (theme: ReturnType<typeof useTheme>["theme"]) => StyleSheet.create({
  roles: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
    marginBottom: spacing.xs
  },
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
  selectorWrapper: {
    gap: spacing.xs
  },
  selectorLabel: {
    color: theme.text,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "right"
  },
  selectorButton: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  selectorButtonText: {
    color: theme.text,
    fontSize: 14,
    fontWeight: "600"
  },
  dropdown: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    marginTop: 2,
    maxHeight: 180,
    overflow: "scroll"
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
    textAlign: "right",
    fontWeight: "600"
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
  optional: {
    color: theme.muted,
    fontSize: 12
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

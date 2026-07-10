import { Alert, StyleSheet, Text, View, Platform, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { useMemo, useState, useEffect } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";

import { apiClient, unwrapApiData } from "../../api/client";
import { AppButton } from "../../components/AppButton";
import { AppCard } from "../../components/AppCard";
import { Screen } from "../../components/Screen";
import { TextField } from "../../components/TextField";
import { useTheme } from "../../context/ThemeContext";
import { useApiResource } from "../../hooks/useApiResource";
import { spacing } from "../../theme/spacing";
import { uploadMedia } from "../../api/upload";
import { useAuth } from "../../context/AuthContext";
import { GuestGate } from "../../components/GuestGate";

type Service = {
  id: string;
  nameAr?: string;
  nameEn?: string;
};

type Category = {
  id: string;
  nameAr?: string;
  nameEn?: string;
  slug?: string;
  services?: Service[];
};

export function CreateRequestScreen() {
  const { theme } = useTheme();
  const { token } = useAuth();
  const styles = makeStyles(theme);
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const categories = useApiResource<Category[]>(token ? "/services/categories" : "", []);

  // Wizard state: 0 = Describe Issue, 1 = Location & Timing, 2 = Review & Confirm
  const [step, setStep] = useState(0);

  // Parse parameters from route
  const { categoryId, title: routeTitle, description: routeDescription, workerId, workerName, categorySlug } = route.params ?? {};

  // Form Fields State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [governorate, setGovernorate] = useState("القاهرة");
  const [city, setCity] = useState("القاهرة");
  const [district, setDistrict] = useState("المنطقة");
  const [street, setStreet] = useState("");

  const [timingType, setTimingType] = useState<"today" | "tomorrow" | "emergency" | "custom">("today");
  const [customDate, setCustomDate] = useState("");
  const [customWindow, setCustomWindow] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success / Matchmaking State
  const [submittedRequest, setSubmittedRequest] = useState<any>(null);
  const [matchingWorkers, setMatchingWorkers] = useState<any[]>([]);
  const [isLoadingWorkers, setIsLoadingWorkers] = useState(false);

  // Set initial states when route params change (e.g. on repeat request)
  useEffect(() => {
    if (routeTitle) setTitle(routeTitle);
    if (routeDescription) setDescription(routeDescription);
  }, [routeTitle, routeDescription]);

  // Find the selected category based on passed categoryId
  const selectedCategory = useMemo(() => {
    if (categoryId && categories.data.length > 0) {
      const found = categories.data.find(c => c.id === categoryId);
      if (found) return found;
    }
    return categories.data[0];
  }, [categories.data, categoryId]);

  const selectedService = useMemo(() => selectedCategory?.services?.[0], [selectedCategory]);

  if (!token) {
    return (
      <Screen title="طلب خدمة" showBack={true}>
        <GuestGate message="يرجى تسجيل الدخول لتتمكن من طلب خدمة وصيانة منزلية." />
      </Screen>
    );
  }

  function showAlert(title: string, message: string, onConfirm?: () => void) {
    if (Platform.OS === "web") {
      alert(`${title}: ${message}`);
      if (onConfirm) onConfirm();
    } else {
      if (onConfirm) {
        Alert.alert(title, message, [{ text: "حسناً", onPress: onConfirm }]);
      } else {
        Alert.alert(title, message);
      }
    }
  }

  // Load matching workers
  const loadMatchingWorkers = async () => {
    setIsLoadingWorkers(true);
    try {
      const slug = categorySlug || selectedCategory?.slug || "plumbing";
      const response = await apiClient.get(`/public/workers?specialty=${slug}&governorate=${governorate}&city=${city}`);
      const workersList = unwrapApiData<any[]>(response.data);
      setMatchingWorkers(workersList);
    } catch (err) {
      console.error("Failed to load matching workers:", err);
    } finally {
      setIsLoadingWorkers(false);
    }
  };

  // Handle image picking and uploading
  const handleAddPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAlert("الإذن مطلوب", "يرجى السماح بالوصول لمعرض الصور لإضافة صور المشكلة.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setIsUploading(true);
      try {
        const url = await uploadMedia(result.assets[0].uri);
        setImages(prev => [...prev, url]);
      } catch (err: any) {
        showAlert("فشل الرفع", err.message || "تعذر رفع الصورة المحددة.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const validateStep0 = () => {
    if (title.trim().length < 3) {
      showAlert("بيانات غير كاملة", "يرجى كتابة عنوان للمشكلة لا يقل عن 3 أحرف.");
      return false;
    }
    if (description.trim().length < 10) {
      showAlert("بيانات غير كاملة", "يرجى كتابة وصف تفصيلي للمشكلة لا يقل عن 10 أحرف.");
      return false;
    }
    return true;
  };

  const validateStep1 = () => {
    if (!governorate.trim() || !city.trim() || !district.trim() || !street.trim()) {
      showAlert("بيانات العنوان ناقصة", "يرجى تعبئة كافة تفاصيل العنوان الخاص بك.");
      return false;
    }
    if (timingType === "custom") {
      if (!customDate.trim()) {
        showAlert("التوقيت مطلوب", "يرجى تحديد تاريخ الزيارة المطلوبة.");
        return false;
      }
      if (!customWindow.trim()) {
        showAlert("التوقيت مطلوب", "يرجى كتابة الفترة الزمنية المفضلة (مثال: 6م - 8م).");
        return false;
      }
    }
    return true;
  };

  // Submit Request
  async function submitRequest() {
    if (!selectedCategory || !selectedService) {
      showAlert("لا توجد خدمة", "لا يمكن إنشاء طلب قبل تحميل الخدمات من الداتا بيز.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.post("/clients/requests", {
        categoryId: selectedCategory.id,
        serviceId: selectedService.id,
        title,
        description,
        address: {
          mode: "new",
          governorate,
          city,
          district,
          street
        },
        timing: {
          type: timingType,
          customDate: timingType === "custom" ? customDate : undefined,
          customWindow: timingType === "custom" ? customWindow : undefined
        },
        images,
        ...(workerId && { workerId })
      });
      const createdRequest = unwrapApiData<any>(response.data);
      
      // Save submitted request info
      setSubmittedRequest(createdRequest);
      
      // Load matching workers
      await loadMatchingWorkers();
    } catch (error: any) {
      showAlert("تعذر إرسال الطلب", error.message || "حدث خطأ ما أثناء إرسال الطلب.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // 4. Success View showing matching workers
  if (submittedRequest) {
    return (
      <Screen title="تم تقديم الطلب" showBack={false}>
        <AppCard style={styles.successCard}>
          <View style={styles.successIconWrapper}>
            <Ionicons name="checkmark-circle" size={70} color={theme.success} />
          </View>
          <Text style={styles.successTitle}>تم إرسال طلبك بنجاح!</Text>
          <Text style={styles.successSubtitle}>
            رقم الطلب الخاص بك هو: #{submittedRequest.requestNumber || submittedRequest.id}
          </Text>
          <Text style={styles.successDesc}>
            تم نشر طلبك بنجاح وإخطار الفنيين المتخصصين في منطقتك. سيصلك عروض أسعار منهم قريباً.
          </Text>
        </AppCard>

        <Text style={styles.sectionHeader}>الفنيون المتاحون في منطقتك حالياً</Text>

        {isLoadingWorkers ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginVertical: spacing.lg }} />
        ) : matchingWorkers.length === 0 ? (
          <AppCard style={styles.emptyWorkersCard}>
            <Ionicons name="people-outline" size={40} color={theme.muted} />
            <Text style={styles.emptyWorkersText}>
              لا يوجد فنيين متصلين حالياً في منطقتك لهذه الخدمة. تم إرسال الطلب لهم وسيقومون بتقديم عروضهم فور اتصالهم بالإنترنت.
            </Text>
          </AppCard>
        ) : (
          <View style={styles.workersList}>
            {matchingWorkers.map((worker) => (
              <AppCard key={worker.id} style={styles.workerCard}>
                <Pressable 
                  style={styles.workerRow} 
                  onPress={() => navigation.navigate("WorkerProfile", { workerId: worker.id })}
                >
                  <View style={styles.workerImageWrapper}>
                    {worker.avatarUrl ? (
                      <Image source={worker.avatarUrl} style={styles.workerAvatar as any} />
                    ) : (
                      <View style={styles.workerPlaceholder}>
                        <Ionicons name="person" size={24} color={theme.muted} />
                      </View>
                    )}
                    {worker.isOnline && <View style={styles.onlineBadge} />}
                  </View>
                  
                  <View style={styles.workerDetails}>
                    <Text style={styles.workerName}>{worker.name}</Text>
                    <Text style={styles.workerSpecialty}>{worker.professionAr || "فني صيانة"}</Text>
                    <View style={styles.workerMeta}>
                      <Ionicons name="star" size={14} color="#D7A24D" />
                      <Text style={styles.workerRating}>{worker.rating?.toFixed(1) ?? "5.0"}</Text>
                      <Text style={styles.workerJobs}>({worker.totalJobs ?? 0} عملية)</Text>
                    </View>
                  </View>

                  <Ionicons name="chevron-back" size={20} color={theme.muted} />
                </Pressable>
              </AppCard>
            ))}
          </View>
        )}

        <View style={styles.successButtons}>
          <AppButton 
            title="الذهاب لطلباتي لمتابعة العروض" 
            onPress={() => {
              setSubmittedRequest(null);
              setStep(0);
              navigation.navigate("MyRequests");
            }} 
          />
          <AppButton 
            title="العودة للرئيسية" 
            variant="secondary" 
            style={{ marginTop: spacing.sm }}
            onPress={() => {
              setSubmittedRequest(null);
              setStep(0);
              navigation.navigate("Home");
            }} 
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen title={workerName ? `طلب فني: ${workerName}` : "طلب خدمة"} subtitle="قم بملء تفاصيل طلبك كما هو في الموقع تماماً.">
      
      {/* 1. Selected Service Header */}
      <AppCard style={styles.selectedService}>
        <Text style={styles.kicker}>الخدمة المطلوبة</Text>
        <Text style={styles.serviceName}>
          {selectedCategory ? `${selectedCategory.nameAr} - ${selectedService?.nameAr ?? ""}` : "جاري التحميل..."}
        </Text>
      </AppCard>

      {/* 2. Wizard Progress Indicator */}
      <View style={styles.progressRail}>
        <View style={styles.stepDot}>
          <Text style={[styles.stepNumber, step >= 2 && styles.activeNumber]}>3</Text>
          <Text style={[styles.stepLabel, step >= 2 && styles.activeLabelText]}>المراجعة</Text>
        </View>
        <View style={[styles.stepLine, step >= 2 && styles.activeLine]} />
        
        <View style={styles.stepDot}>
          <Text style={[styles.stepNumber, step >= 1 && styles.activeNumber]}>2</Text>
          <Text style={[styles.stepLabel, step >= 1 && styles.activeLabelText]}>العنوان والموعد</Text>
        </View>
        <View style={[styles.stepLine, step >= 1 && styles.activeLine]} />
        
        <View style={styles.stepDot}>
          <Text style={[styles.stepNumber, step >= 0 && styles.activeNumber]}>1</Text>
          <Text style={[styles.stepLabel, step >= 0 && styles.activeLabelText]}>وصف المشكلة</Text>
        </View>
      </View>

      {/* 3. Wizard Content Blocks */}
      {step === 0 && (
        <AppCard style={styles.card}>
          <Text style={styles.stepTitle}>تفاصيل ومواصفات العطل</Text>
          
          <TextField 
            label="عنوان المشكلة باختصار" 
            placeholder="مثال: تسريب مياه تحت الحوض" 
            value={title} 
            onChangeText={setTitle} 
          />
          
          <TextField 
            label="تفاصيل ووصف المشكلة" 
            placeholder="يرجى كتابة المشكلة بوضوح وما يجب على الفني إحضاره معه..." 
            multiline 
            numberOfLines={6} 
            value={description} 
            onChangeText={setDescription} 
          />

          {/* Photo upload section matching site */}
          <Text style={styles.fieldLabel}>صور توضيحية للمشكلة (اختياري)</Text>
          <View style={styles.photosWrapper}>
            {images.map((imgUrl, idx) => (
              <View key={idx} style={styles.photoContainer}>
                <Image source={imgUrl} style={styles.photoPreview as any} />
                <Pressable style={styles.removeBtn} onPress={() => handleRemovePhoto(idx)}>
                  <Ionicons name="close-circle" size={20} color={theme.danger} />
                </Pressable>
              </View>
            ))}
            
            {images.length < 3 && (
              <Pressable style={styles.addPhotoBtn} onPress={handleAddPhoto} disabled={isUploading}>
                {isUploading ? (
                  <ActivityIndicator size="small" color={theme.primary} />
                ) : (
                  <>
                    <Ionicons name="camera-outline" size={26} color={theme.primary} />
                    <Text style={styles.addPhotoText}>إضافة صورة</Text>
                  </>
                )}
              </Pressable>
            )}
          </View>

          <AppButton 
            title="متابعة الخطوة التالية ➔" 
            style={{ marginTop: spacing.md }} 
            onPress={() => validateStep0() && setStep(1)} 
          />
        </AppCard>
      )}

      {step === 1 && (
        <AppCard style={styles.card}>
          <Text style={styles.stepTitle}>توقيت ومكان زيارة الفني</Text>
          
          {/* Address Fields */}
          <TextField label="المحافظة" value={governorate} onChangeText={setGovernorate} />
          <TextField label="المدينة/المركز" value={city} onChangeText={setCity} />
          <TextField label="المنطقة/الحي" value={district} onChangeText={setDistrict} />
          <TextField label="اسم الشارع، رقم العقار أو علامة مميزة" value={street} onChangeText={setStreet} />

          {/* Timing Selector */}
          <Text style={styles.fieldLabel}>موعد الزيارة المطلوبة</Text>
          <View style={styles.timingGrid}>
            <Pressable 
              style={[styles.timingBtn, timingType === "today" && styles.activeTimingBtn]} 
              onPress={() => setTimingType("today")}
            >
              <Text style={[styles.timingBtnText, timingType === "today" && styles.activeTimingBtnText]}>اليوم</Text>
            </Pressable>
            
            <Pressable 
              style={[styles.timingBtn, timingType === "tomorrow" && styles.activeTimingBtn]} 
              onPress={() => setTimingType("tomorrow")}
            >
              <Text style={[styles.timingBtnText, timingType === "tomorrow" && styles.activeTimingBtnText]}>بكرة</Text>
            </Pressable>

            <Pressable 
              style={[styles.timingBtn, timingType === "emergency" && styles.activeTimingBtn]} 
              onPress={() => setTimingType("emergency")}
            >
              <Text style={[styles.timingBtnText, timingType === "emergency" && styles.activeTimingBtnText]}>طارئ فوري</Text>
            </Pressable>

            <Pressable 
              style={[styles.timingBtn, timingType === "custom" && styles.activeTimingBtn]} 
              onPress={() => setTimingType("custom")}
            >
              <Text style={[styles.timingBtnText, timingType === "custom" && styles.activeTimingBtnText]}>موعد مخصص</Text>
            </Pressable>
          </View>

          {timingType === "custom" && (
            <View style={styles.customTimingWrapper}>
              <TextField 
                label="تاريخ الزيارة" 
                placeholder="YYYY-MM-DD (مثال: 2026-07-15)" 
                value={customDate} 
                onChangeText={setCustomDate} 
              />
              <TextField 
                label="الفترة الزمنية المفضلة" 
                placeholder="مثال: من 6 مساءً إلى 9 مساءً" 
                value={customWindow} 
                onChangeText={setCustomWindow} 
              />
            </View>
          )}

          <View style={styles.buttonsRow}>
            <AppButton 
              title="السابق" 
              variant="secondary" 
              style={styles.halfBtn} 
              onPress={() => setStep(0)} 
            />
            <AppButton 
              title="المراجعة والتأكيد ➔" 
              style={styles.halfBtn} 
              onPress={() => validateStep1() && setStep(2)} 
            />
          </View>
        </AppCard>
      )}

      {step === 2 && (
        <AppCard style={styles.card}>
          <Text style={styles.stepTitle}>مراجعة وتأكيد تفاصيل الطلب</Text>
          
          <View style={styles.reviewBlock}>
            <Text style={styles.reviewLabel}>عنوان العطل:</Text>
            <Text style={styles.reviewValue}>{title}</Text>
          </View>

          <View style={styles.reviewBlock}>
            <Text style={styles.reviewLabel}>الوصف:</Text>
            <Text style={styles.reviewValue}>{description}</Text>
          </View>

          <View style={styles.reviewBlock}>
            <Text style={styles.reviewLabel}>العنوان:</Text>
            <Text style={styles.reviewValue}>{`${governorate}، ${city}، ${district}، ${street}`}</Text>
          </View>

          <View style={styles.reviewBlock}>
            <Text style={styles.reviewLabel}>التوقيت:</Text>
            <Text style={styles.reviewValue}>
              {timingType === "today" && "زيارة اليوم"}
              {timingType === "tomorrow" && "زيارة غداً"}
              {timingType === "emergency" && "طارئ فوري (في أسرع وقت)"}
              {timingType === "custom" && `موعد مخصص بتاريخ ${customDate} (${customWindow})`}
            </Text>
          </View>

          {images.length > 0 && (
            <View style={styles.reviewBlock}>
              <Text style={styles.reviewLabel}>الصور المرفقة:</Text>
              <Text style={styles.reviewValue}>{images.length} صور توضيحية</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewImagesScroll}>
                {images.map((img, idx) => (
                  <Image key={idx} source={img} style={styles.reviewThumbnail as any} />
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.buttonsRow}>
            <AppButton 
              title="تعديل البيانات" 
              variant="secondary" 
              style={styles.halfBtn} 
              onPress={() => setStep(1)} 
            />
            <AppButton 
              title="تأكيد وإرسال الطلب" 
              isLoading={isSubmitting} 
              style={styles.halfBtn} 
              onPress={submitRequest} 
            />
          </View>
        </AppCard>
      )}

    </Screen>
  );
}

const makeStyles = (theme: ReturnType<typeof useTheme>["theme"]) => StyleSheet.create({
  selectedService: {
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.background
  },
  kicker: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right"
  },
  serviceName: {
    color: theme.primary,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "right"
  },
  progressRail: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: spacing.md,
    paddingHorizontal: spacing.xs
  },
  stepDot: {
    alignItems: "center",
    flex: 1
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.muted + "30",
    color: theme.muted,
    textAlign: "center",
    lineHeight: 28,
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 4
  },
  stepLabel: {
    fontSize: 11,
    color: theme.muted,
    fontWeight: "bold",
    textAlign: "center"
  },
  activeLabelText: {
    color: theme.primary
  },
  activeNumber: {
    backgroundColor: theme.primary,
    color: theme.primaryText
  },
  stepLine: {
    height: 2,
    flex: 0.8,
    backgroundColor: theme.muted + "20"
  },
  activeLine: {
    backgroundColor: theme.primary
  },
  card: {
    gap: spacing.md
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.text,
    textAlign: "right",
    marginBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    paddingBottom: spacing.sm
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: theme.text,
    textAlign: "right",
    marginTop: spacing.xs
  },
  photosWrapper: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
    flexWrap: "wrap",
    marginTop: spacing.xs
  },
  photoContainer: {
    position: "relative",
    width: 80,
    height: 80,
    borderRadius: spacing.sm,
    overflow: "visible"
  },
  photoPreview: {
    width: "100%",
    height: "100%",
    borderRadius: spacing.sm
  },
  removeBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: theme.background,
    borderRadius: 10
  },
  addPhotoBtn: {
    width: 80,
    height: 80,
    borderRadius: spacing.sm,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: theme.primary,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.primary + "10"
  },
  addPhotoText: {
    fontSize: 10,
    color: theme.primary,
    fontWeight: "bold",
    marginTop: 4
  },
  timingGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.xs
  },
  timingBtn: {
    flex: 1,
    minWidth: 70,
    height: 40,
    borderRadius: spacing.sm,
    borderWidth: 1.5,
    borderColor: theme.border,
    backgroundColor: theme.background,
    justifyContent: "center",
    alignItems: "center"
  },
  activeTimingBtn: {
    borderColor: theme.primary,
    backgroundColor: theme.primary + "10"
  },
  timingBtnText: {
    fontSize: 13,
    fontWeight: "bold",
    color: theme.muted
  },
  activeTimingBtnText: {
    color: theme.primary
  },
  customTimingWrapper: {
    gap: spacing.sm,
    marginTop: spacing.xs
  },
  buttonsRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    gap: spacing.md,
    marginTop: spacing.md
  },
  halfBtn: {
    flex: 1
  },
  reviewBlock: {
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    paddingBottom: spacing.sm,
    gap: 4
  },
  reviewLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: theme.muted,
    textAlign: "right"
  },
  reviewValue: {
    fontSize: 14,
    color: theme.text,
    textAlign: "right",
    fontWeight: "700"
  },
  reviewImagesScroll: {
    flexDirection: "row-reverse",
    marginTop: spacing.sm
  },
  reviewThumbnail: {
    width: 60,
    height: 60,
    borderRadius: spacing.xs,
    marginLeft: spacing.sm
  },
  
  // Success & Matchmaking View Styles
  successCard: {
    alignItems: "center",
    paddingVertical: spacing.lg,
    gap: spacing.sm
  },
  successIconWrapper: {
    marginBottom: spacing.xs
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: theme.success,
    textAlign: "center"
  },
  successSubtitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: theme.muted,
    textAlign: "center"
  },
  successDesc: {
    fontSize: 12,
    color: theme.subtle,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: spacing.sm
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.text,
    textAlign: "right",
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs
  },
  emptyWorkersCard: {
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: theme.backgroundRaised
  },
  emptyWorkersText: {
    fontSize: 12,
    color: theme.muted,
    textAlign: "center",
    lineHeight: 18
  },
  workersList: {
    gap: spacing.xs
  },
  workerCard: {
    padding: spacing.sm,
    backgroundColor: theme.surface
  },
  workerRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between"
  },
  workerImageWrapper: {
    position: "relative"
  },
  workerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22
  },
  workerPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.primarySoft,
    justifyContent: "center",
    alignItems: "center"
  },
  onlineBadge: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2ECC71",
    borderWidth: 2,
    borderColor: theme.surface
  },
  workerDetails: {
    flex: 1,
    marginHorizontal: spacing.sm,
    alignItems: "flex-end",
    gap: 2
  },
  workerName: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.text
  },
  workerSpecialty: {
    fontSize: 11,
    color: theme.muted
  },
  workerMeta: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4
  },
  workerRating: {
    fontSize: 11,
    fontWeight: "bold",
    color: theme.text
  },
  workerJobs: {
    fontSize: 10,
    color: theme.subtle
  },
  successButtons: {
    marginTop: spacing.lg,
    paddingBottom: spacing.lg
  }
});

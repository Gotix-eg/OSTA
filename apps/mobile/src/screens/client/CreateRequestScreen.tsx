import { Alert, StyleSheet, Text, View, Platform } from "react-native";
import { useMemo, useState, useEffect } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";

import { apiClient, unwrapApiData } from "../../api/client";
import { AppButton } from "../../components/AppButton";
import { AppCard } from "../../components/AppCard";
import { Screen } from "../../components/Screen";
import { TextField } from "../../components/TextField";
import { useTheme } from "../../context/ThemeContext";
import { useApiResource } from "../../hooks/useApiResource";
import { spacing } from "../../theme/spacing";

type Service = {
  id: string;
  nameAr?: string;
  nameEn?: string;
};

type Category = {
  id: string;
  nameAr?: string;
  nameEn?: string;
  services?: Service[];
};

export function CreateRequestScreen() {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const categories = useApiResource<Category[]>("/services/categories", []);

  // Parse parameters from route
  const { categoryId, title: routeTitle, description: routeDescription, workerId, workerName } = route.params ?? {};

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [governorate, setGovernorate] = useState("Cairo");
  const [city, setCity] = useState("New Cairo");
  const [district, setDistrict] = useState("First Settlement");
  const [street, setStreet] = useState("");
  const [timingType, setTimingType] = useState<"today" | "tomorrow" | "emergency">("today");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set initial states when route params change (e.g. on repeat request)
  useEffect(() => {
    if (routeTitle) setTitle(routeTitle);
    if (routeDescription) setDescription(routeDescription);
  }, [routeTitle, routeDescription]);

  // Find the selected category based on passed categoryId, or fallback to first category
  const selectedCategory = useMemo(() => {
    if (categoryId && categories.data.length > 0) {
      const found = categories.data.find(c => c.id === categoryId);
      if (found) return found;
    }
    return categories.data[0];
  }, [categories.data, categoryId]);

  const selectedService = useMemo(() => selectedCategory?.services?.[0], [selectedCategory]);

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
          type: timingType
        },
        ...(workerId && { workerId }) // Pass workerId if booking a specific worker
      });
      unwrapApiData(response.data);
      setTitle("");
      setDescription("");
      setStreet("");
      showAlert("تم إرسال الطلب", "سيظهر الطلب للفنيين المتاحين.", () => {
        navigation.goBack();
      });
    } catch (error) {
      showAlert("تعذر إرسال الطلب", error instanceof Error ? error.message : "حاول مرة أخرى");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen title={workerName ? `طلب فني: ${workerName}` : "طلب خدمة"} subtitle="الطلب يتم حفظه في الداتا بيز عبر API العملاء.">
      <AppCard style={styles.selectedService}>
        <Text style={styles.kicker}>الخدمة المختارة من قاعدة البيانات</Text>
        <Text style={styles.serviceName}>
          {selectedCategory ? `${selectedCategory.nameAr} - ${selectedService?.nameAr ?? ""}` : "جاري تحميل الخدمات"}
        </Text>
      </AppCard>
      <AppCard style={styles.form}>
        <TextField label="عنوان الطلب" value={title} onChangeText={setTitle} />
        <TextField label="وصف المشكلة" multiline numberOfLines={5} value={description} onChangeText={setDescription} />
        <TextField label="المحافظة" value={governorate} onChangeText={setGovernorate} />
        <TextField label="المدينة" value={city} onChangeText={setCity} />
        <TextField label="المنطقة" value={district} onChangeText={setDistrict} />
        <TextField label="الشارع والعلامة المميزة" value={street} onChangeText={setStreet} />
        <View style={styles.timing}>
          <AppButton title="اليوم" variant={timingType === "today" ? "primary" : "secondary"} onPress={() => setTimingType("today")} />
          <AppButton title="بكرة" variant={timingType === "tomorrow" ? "primary" : "secondary"} onPress={() => setTimingType("tomorrow")} />
          <AppButton title="طارئ" variant={timingType === "emergency" ? "primary" : "secondary"} onPress={() => setTimingType("emergency")} />
        </View>
        <AppButton title="إرسال الطلب" isLoading={isSubmitting} onPress={submitRequest} />
      </AppCard>
    </Screen>
  );
}

const makeStyles = (theme: ReturnType<typeof useTheme>["theme"]) => StyleSheet.create({
  selectedService: {
    gap: spacing.xs
  },
  kicker: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "right"
  },
  serviceName: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "right"
  },
  form: {
    gap: spacing.md
  },
  timing: {
    flexDirection: "row-reverse",
    gap: spacing.sm
  }
});

import { useState } from "react";
import { StyleSheet, Text, View, ActivityIndicator, Alert, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { apiClient, unwrapApiData } from "../../api/client";
import { AppButton } from "../../components/AppButton";
import { AppCard } from "../../components/AppCard";
import { DataList } from "../../components/DataList";
import { Screen } from "../../components/Screen";
import { StatTile } from "../../components/StatTile";
import { useApiResource } from "../../hooks/useApiResource";
import { useTheme } from "../../context/ThemeContext";
import { spacing } from "../../theme/spacing";

type VendorDashboard = {
  summary?: {
    monthlySales?: number;
    activeOrders?: number;
    walletBalance?: number;
    isOpen?: boolean;
  };
  recentRequests?: Array<Record<string, unknown>>;
};

export function VendorDashboardScreen() {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const { data, isLoading, reload } = useApiResource<VendorDashboard>("/vendors/dashboard", {});
  const summary = data.summary ?? {};
  
  const [isToggling, setIsToggling] = useState(false);

  const isOpen = summary.isOpen ?? false;

  function showAlert(title: string, message: string) {
    if (Platform.OS === "web") {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  }

  const handleToggleStatus = async () => {
    setIsToggling(true);
    try {
      const response = await apiClient.put("/vendors/status", { isOpen: !isOpen });
      showAlert("تم تحديث الحالة", !isOpen ? "المحل مفتوح الآن ويستقبل الطلبات." : "تم إغلاق المحل مؤقتاً.");
      reload();
    } catch (error: any) {
      showAlert("تعذر تعديل الحالة", error.message || "حدث خطأ ما أثناء تحديث حالة المتجر.");
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Screen title="لوحة التاجر" subtitle="متابعة مبيعاتك وحالة متجرك في قاعدة البيانات.">
      
      {/* Store Status Toggle Banner */}
      <AppCard style={[styles.statusCard, isOpen ? styles.statusCardOpen : styles.statusCardClosed]}>
        <View style={styles.statusHeader}>
          <Ionicons 
            name={isOpen ? "checkmark-circle-outline" : "close-circle-outline"} 
            size={36} 
            color={isOpen ? theme.success : theme.danger} 
          />
          <View style={styles.statusTextWrapper}>
            <Text style={styles.statusTitle}>حالة المتجر: {isOpen ? "مفتوح ويستقبل طلبات" : "مغلق حالياً"}</Text>
            <Text style={styles.statusDesc}>
              {isOpen 
                ? "يظهر متجرك للعملاء ويمكنهم طلب المنتجات الآن." 
                : "متجرك مخفي عن العملاء ولا يمكنهم الشراء حالياً."}
            </Text>
          </View>
        </View>
        
        <AppButton 
          title={isOpen ? "إغلاق المتجر مؤقتاً" : "فتح المتجر للبيع الآن"} 
          variant={isOpen ? "secondary" : "primary"}
          isLoading={isToggling}
          onPress={handleToggleStatus}
          style={styles.statusBtn}
        />
      </AppCard>

      <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", gap: spacing.md, marginTop: spacing.md }}>
        <StatTile label="مبيعات الشهر" value={summary.monthlySales ?? 0} />
        <StatTile label="طلبات نشطة" value={summary.activeOrders ?? 0} tone="accent" />
        <StatTile label="المحفظة" value={summary.walletBalance ?? 0} tone="success" />
      </View>
      
      <DataList title="طلبات مخصصة حديثة" items={data.recentRequests ?? []} isLoading={isLoading} />
    </Screen>
  );
}

const makeStyles = (theme: ReturnType<typeof useTheme>["theme"]) => StyleSheet.create({
  statusCard: {
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: spacing.md
  },
  statusCardOpen: {
    borderColor: theme.success + "60",
    backgroundColor: theme.success + "08"
  },
  statusCardClosed: {
    borderColor: theme.danger + "60",
    backgroundColor: theme.danger + "08"
  },
  statusHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md
  },
  statusTextWrapper: {
    flex: 1,
    alignItems: "flex-end",
    gap: 2
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.text,
    textAlign: "right"
  },
  statusDesc: {
    fontSize: 11,
    color: theme.muted,
    textAlign: "right"
  },
  statusBtn: {
    height: 40,
    borderRadius: 20
  }
});

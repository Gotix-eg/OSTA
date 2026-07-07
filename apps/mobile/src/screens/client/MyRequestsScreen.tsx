import { useState } from "react";
import { StyleSheet, Text, View, Pressable, ActivityIndicator, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { Screen } from "../../components/Screen";
import { AppCard } from "../../components/AppCard";
import { useApiResource } from "../../hooks/useApiResource";
import { useTheme } from "../../context/ThemeContext";
import { spacing } from "../../theme/spacing";

type RequestItem = {
  id: string;
  requestNumber: string;
  title: string;
  serviceId: string;
  serviceNameAr: string;
  serviceNameEn: string;
  status: string;
  area: string;
  createdAt: string;
};

export function MyRequestsScreen() {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const navigation = useNavigation<any>();
  const { data, isLoading, reload } = useApiResource<RequestItem[]>("/clients/requests", []);

  const getStatusMeta = (status: string) => {
    const mapping: Record<string, { label: string; bg: string; color: string }> = {
      PENDING: { label: "بانتظار الفنيين", bg: "#FEF9E7", color: "#B7950B" },
      WORKER_EN_ROUTE: { label: "الفني في الطريق", bg: "#EBF5FB", color: "#2980B9" },
      IN_PROGRESS: { label: "قيد التنفيذ", bg: "#EAF2F8", color: "#1F618D" },
      COMPLETED: { label: "تم الإنجاز", bg: "#E8F8F5", color: "#117A65" },
      CANCELLED: { label: "ملغي", bg: "#FDEDEC", color: "#C0392B" }
    };
    return mapping[status] || { label: status, bg: theme.backgroundRaised, color: theme.text };
  };

  return (
    <Screen title="طلباتي" subtitle="كل الطلبات الصادرة من حسابك لمتابعة حالتها والعروض." showBack={false}>
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onRefresh={reload}
          refreshing={isLoading}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={48} color={theme.muted} style={{ marginBottom: spacing.sm }} />
              <Text style={styles.emptyText}>لا توجد طلبات خدمة مرسلة حالياً</Text>
            </View>
          }
          renderItem={({ item }) => {
            const statusMeta = getStatusMeta(item.status);
            return (
              <AppCard style={styles.card}>
                <Pressable 
                  style={styles.cardContent}
                  onPress={() => navigation.navigate("RequestDetails", { requestId: item.id })}
                >
                  <View style={styles.headerRow}>
                    <View style={[styles.statusBadge, { backgroundColor: statusMeta.bg }]}>
                      <Text style={[styles.statusText, { color: statusMeta.color }]}>{statusMeta.label}</Text>
                    </View>
                    <Text style={styles.requestNum}>طلب #{item.requestNumber || item.id.substring(0, 8)}</Text>
                  </View>

                  <Text style={styles.title}>{item.title}</Text>
                  
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons name="location-outline" size={14} color={theme.muted} />
                      <Text style={styles.metaText}>{item.area}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="build-outline" size={14} color={theme.muted} />
                      <Text style={styles.metaText}>{item.serviceNameAr}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="calendar-outline" size={14} color={theme.muted} />
                      <Text style={styles.metaText}>
                        {new Date(item.createdAt).toLocaleDateString("ar-EG", { month: "short", day: "numeric" })}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              </AppCard>
            );
          }}
        />
      )}
    </Screen>
  );
}

const makeStyles = (theme: ReturnType<typeof useTheme>["theme"]) => StyleSheet.create({
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl
  },
  listContainer: {
    paddingBottom: spacing.lg,
    gap: spacing.sm
  },
  card: {
    padding: 0,
    overflow: "hidden"
  },
  cardContent: {
    padding: spacing.md,
    gap: spacing.sm
  },
  headerRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center"
  },
  requestNum: {
    fontSize: 11,
    fontWeight: "bold",
    color: theme.muted
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    fontSize: 11,
    fontWeight: "bold"
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.text,
    textAlign: "right"
  },
  metaRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.border + "40",
    paddingTop: spacing.sm
  },
  metaItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4
  },
  metaText: {
    fontSize: 12,
    color: theme.subtle
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl
  },
  emptyText: {
    color: theme.muted,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center"
  }
});

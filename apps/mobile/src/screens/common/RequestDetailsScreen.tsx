import { Alert, StyleSheet, Text, View, Platform, Pressable, ActivityIndicator, ScrollView, Linking } from "react-native";
import { useMemo, useState, useEffect } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

import { apiClient, unwrapApiData } from "../../api/client";
import { AppButton } from "../../components/AppButton";
import { AppCard } from "../../components/AppCard";
import { Screen } from "../../components/Screen";
import { useTheme } from "../../context/ThemeContext";
import { useApiResource } from "../../hooks/useApiResource";
import { spacing } from "../../theme/spacing";

export function RequestDetailsScreen() {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  // Extract parameters
  const { requestId } = route.params ?? {};

  // Fetch request details from API
  const requestDetails = useApiResource<any>(`/clients/requests/${requestId}`, null);

  // Matchmaking technicians state
  const [matchingWorkers, setMatchingWorkers] = useState<any[]>([]);
  const [isLoadingWorkers, setIsLoadingWorkers] = useState(false);

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

  // Load matching workers when request details are loaded
  useEffect(() => {
    let active = true;
    if (requestDetails.data && !requestDetails.data.worker && requestDetails.data.status === "PENDING") {
      const categorySlug = requestDetails.data.serviceId || "plumbing";
      const governorate = requestDetails.data.address?.governorate || "القاهرة";
      const city = requestDetails.data.address?.city || "القاهرة";
      
      setIsLoadingWorkers(true);
      apiClient.get(`/public/workers?specialty=${categorySlug}&governorate=${governorate}&city=${city}`)
        .then(response => {
          if (!active) return;
          const workersList = unwrapApiData<any[]>(response.data);
          setMatchingWorkers(workersList);
        })
        .catch(err => console.error("Failed to load matching workers:", err))
        .finally(() => {
          if (active) setIsLoadingWorkers(false);
        });
    }
    return () => {
      active = false;
    };
  }, [requestDetails.data]);

  function showAlert(title: string, message: string) {
    if (Platform.OS === "web") {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  }

  const handleCallWorker = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      showAlert("تعذر الاتصال", "لا يمكن فتح تطبيق الاتصال الهاتفي.");
    });
  };

  const handleChatWorker = (userId: string, name: string) => {
    navigation.navigate("Chat", {
      conversationId: userId,
      recipientName: name
    });
  };

  if (requestDetails.isLoading) {
    return (
      <Screen title="تفاصيل الطلب" showBack={true}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loaderText}>جاري تحميل تفاصيل الطلب...</Text>
        </View>
      </Screen>
    );
  }

  if (!requestDetails.data) {
    return (
      <Screen title="تفاصيل الطلب" showBack={true}>
        <AppCard style={styles.errorCard}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.danger} />
          <Text style={styles.errorText}>تعذر العثور على تفاصيل هذا الطلب.</Text>
        </AppCard>
      </Screen>
    );
  }

  const data = requestDetails.data;
  const statusMeta = getStatusMeta(data.status);
  const addressString = `${data.address?.governorate || ""}، ${data.address?.city || ""}، ${data.address?.district || ""}، ${data.address?.street || ""}`;

  return (
    <Screen title={`طلب #${data.requestNumber || data.id.substring(0, 8)}`} showBack={true} scroll={true}>
      
      {/* 1. Status & Service Header */}
      <AppCard style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={[styles.statusBadge, { backgroundColor: statusMeta.bg }]}>
            <Text style={[styles.statusText, { color: statusMeta.color }]}>{statusMeta.label}</Text>
          </View>
          <Text style={styles.serviceName}>{data.serviceNameAr || "طلب صيانة"}</Text>
        </View>

        <Text style={styles.title}>{data.title}</Text>
        <Text style={styles.description}>{data.description}</Text>
        
        <Text style={styles.dateLabel}>
          تم الإنشاء في: {new Date(data.createdAt).toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </Text>
      </AppCard>

      {/* 2. Address & Timing Panel */}
      <AppCard style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={20} color={theme.primary} style={styles.infoIcon} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>عنوان زيارة الفني</Text>
            <Text style={styles.infoValue}>{addressString}</Text>
          </View>
        </View>

        <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: theme.border + "30", paddingTop: spacing.md, marginTop: spacing.md }]}>
          <Ionicons name="time-outline" size={20} color={theme.primary} style={styles.infoIcon} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>التوقيت المفضل</Text>
            <Text style={styles.infoValue}>
              {data.timing?.type === "emergency" && "طارئ فوري (في أسرع وقت)"}
              {data.timing?.type === "today" && "اليوم في أقرب وقت"}
              {data.timing?.type === "tomorrow" && "غداً"}
              {data.timing?.type === "custom" && `موعد مخصص (${data.timing.customDate || ""} - ${data.timing.customWindow || ""})`}
              {!data.timing?.type && "غير محدد"}
            </Text>
          </View>
        </View>
      </AppCard>

      {/* 3. Media Files */}
      {data.images && data.images.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>الصور التوضيحية المرفقة</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
            {data.images.map((img: string, idx: number) => (
              <Image key={idx} source={img} style={styles.thumbnail as any} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* 4. Assigned Worker OR Matchmaking Available List */}
      {data.worker ? (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>الفني المعيّن بالطلب</Text>
          <AppCard style={styles.workerCard}>
            <View style={styles.workerRow}>
              <View style={styles.workerImageWrapper}>
                {data.worker.avatarUrl ? (
                  <Image source={data.worker.avatarUrl} style={styles.workerAvatar as any} />
                ) : (
                  <View style={styles.workerPlaceholder}>
                    <Ionicons name="person" size={28} color={theme.muted} />
                  </View>
                )}
              </View>
              
              <View style={styles.workerDetails}>
                <Text style={styles.workerName}>{data.worker.name}</Text>
                <View style={styles.workerMeta}>
                  <Ionicons name="star" size={14} color="#D7A24D" />
                  <Text style={styles.workerRating}>{data.worker.ratingCount && data.worker.ratingCount > 0 ? data.worker.rating?.toFixed(1) : "جديد"}</Text>
                </View>
              </View>
            </View>

            <View style={styles.actionButtons}>
              {data.worker.phone && (
                <Pressable 
                  style={[styles.actionBtn, { backgroundColor: theme.primary + "10", borderColor: theme.primary }]}
                  onPress={() => handleCallWorker(data.worker.phone)}
                >
                  <Ionicons name="call-outline" size={18} color={theme.primary} />
                  <Text style={[styles.actionBtnText, { color: theme.primary }]}>اتصال هاتفى</Text>
                </Pressable>
              )}
              
              <Pressable 
                style={[styles.actionBtn, { backgroundColor: theme.accent + "10", borderColor: theme.accent }]}
                onPress={() => handleChatWorker(data.worker.userId, data.worker.name)}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={18} color={theme.accent} />
                <Text style={[styles.actionBtnText, { color: theme.accent }]}>محادثة فورية</Text>
              </Pressable>
            </View>
          </AppCard>
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>الفنيون المتاحون في منطقتك حالياً</Text>
          
          {isLoadingWorkers ? (
            <ActivityIndicator size="large" color={theme.primary} style={{ marginVertical: spacing.lg }} />
          ) : matchingWorkers.length === 0 ? (
            <AppCard style={styles.emptyWorkersCard}>
              <Ionicons name="people-outline" size={40} color={theme.muted} style={{ marginBottom: spacing.xs }} />
              <Text style={styles.emptyWorkersText}>
                تم إرسال الطلب لجميع الفنيين المتوافقين. سيظهر الفني المعين مباشرة فور قبوله للطلب. يمكنك أيضاً تصفح الفنيين والاتصال بهم يدوياً.
              </Text>
            </AppCard>
          ) : (
            <View style={styles.workersList}>
              {matchingWorkers.map((worker) => (
                <AppCard key={worker.id} style={styles.workerRowCard}>
                  <Pressable 
                    style={styles.workerItemRow} 
                    onPress={() => navigation.navigate("WorkerProfile", { workerId: worker.id })}
                  >
                    <View style={styles.workerImageWrapper}>
                      {worker.avatarUrl ? (
                        <Image source={worker.avatarUrl} style={styles.workerAvatarSm as any} />
                      ) : (
                        <View style={styles.workerPlaceholderSm}>
                          <Ionicons name="person" size={20} color={theme.muted} />
                        </View>
                      )}
                      {worker.isOnline && <View style={styles.onlineBadge} />}
                    </View>
                    
                    <View style={styles.workerDetails}>
                      <Text style={styles.workerName}>{worker.name}</Text>
                      <View style={styles.workerMeta}>
                        <Ionicons name="star" size={14} color="#D7A24D" />
                        <Text style={styles.workerRating}>{worker.ratingCount && worker.ratingCount > 0 ? worker.rating?.toFixed(1) : "جديد"}</Text>
                        <Text style={styles.workerJobs}>({worker.totalJobs ?? 0} عملية)</Text>
                      </View>
                    </View>

                    <Ionicons name="chevron-back" size={20} color={theme.muted} />
                  </Pressable>
                </AppCard>
              ))}
            </View>
          )}
        </View>
      )}

    </Screen>
  );
}

const makeStyles = (theme: ReturnType<typeof useTheme>["theme"]) => StyleSheet.create({
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
    gap: spacing.sm
  },
  loaderText: {
    color: theme.muted,
    fontSize: 14,
    fontWeight: "600"
  },
  errorCard: {
    alignItems: "center",
    padding: spacing.xl,
    gap: spacing.sm
  },
  errorText: {
    color: theme.danger,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center"
  },
  headerCard: {
    gap: spacing.sm
  },
  headerRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center"
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "900",
    color: theme.primary
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
    fontSize: 18,
    fontWeight: "800",
    color: theme.text,
    textAlign: "right",
    marginTop: spacing.xs
  },
  description: {
    fontSize: 14,
    color: theme.subtle,
    textAlign: "right",
    lineHeight: 22
  },
  dateLabel: {
    fontSize: 11,
    color: theme.muted,
    textAlign: "right",
    marginTop: spacing.xs
  },
  infoCard: {
    padding: spacing.md
  },
  infoRow: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: spacing.sm
  },
  infoIcon: {
    marginTop: 2
  },
  infoContent: {
    flex: 1,
    alignItems: "flex-end",
    gap: 2
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: theme.muted
  },
  infoValue: {
    fontSize: 13,
    color: theme.text,
    textAlign: "right",
    fontWeight: "700"
  },
  section: {
    marginTop: spacing.md
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.text,
    textAlign: "right",
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs
  },
  imagesScroll: {
    flexDirection: "row-reverse",
    marginTop: spacing.xs
  },
  thumbnail: {
    width: 90,
    height: 90,
    borderRadius: spacing.sm,
    marginLeft: spacing.sm
  },
  workerCard: {
    gap: spacing.md
  },
  workerRow: {
    flexDirection: "row-reverse",
    alignItems: "center"
  },
  workerImageWrapper: {
    position: "relative"
  },
  workerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28
  },
  workerPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.primarySoft,
    justifyContent: "center",
    alignItems: "center"
  },
  workerDetails: {
    flex: 1,
    marginHorizontal: spacing.md,
    alignItems: "flex-end",
    gap: spacing.xs
  },
  workerName: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.text
  },
  workerMeta: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4
  },
  workerRating: {
    fontSize: 12,
    fontWeight: "bold",
    color: theme.text
  },
  workerJobs: {
    fontSize: 11,
    color: theme.subtle
  },
  actionButtons: {
    flexDirection: "row-reverse",
    gap: spacing.sm
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xs
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: "bold"
  },
  emptyWorkersCard: {
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: theme.backgroundRaised,
    gap: spacing.sm
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
  workerRowCard: {
    padding: spacing.sm,
    backgroundColor: theme.surface
  },
  workerItemRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between"
  },
  workerAvatarSm: {
    width: 40,
    height: 40,
    borderRadius: 20
  },
  workerPlaceholderSm: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.primarySoft,
    justifyContent: "center",
    alignItems: "center"
  },
  onlineBadge: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2ECC71",
    borderWidth: 1.5,
    borderColor: theme.surface
  },
  workerSpecialty: {
    fontSize: 11,
    color: theme.muted
  }
});

import { useNavigation, useRoute } from "@react-navigation/native";
import { StyleSheet, Text, View, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

import { Screen } from "../../components/Screen";
import { AppCard } from "../../components/AppCard";
import { AppButton } from "../../components/AppButton";
import { useApiResource } from "../../hooks/useApiResource";
import { useTheme } from "../../context/ThemeContext";
import { spacing } from "../../theme/spacing";

type RouteParams = {
  workerId: string;
};

type Review = {
  id: string;
  authorName: string;
  authorAvatar: string | null;
  rating: number;
  comment: string;
  createdAt: string;
};

type PublicWorkerProfile = {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string | null;
  professionAr: string;
  professionEn: string;
  categoryId: string;
  serviceId: string;
  rating: number;
  ratingCount: number;
  totalJobs: number;
  isOnline: boolean;
  isAvailable: boolean;
  isFeatured: boolean;
  areas: string[];
  bio: string | null;
  joinedAt: string;
  reviews: Review[];
};

export function WorkerProfileScreen() {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { workerId } = route.params as RouteParams;

  const profileResource = useApiResource<PublicWorkerProfile | null>(
    `/public/workers/${workerId}`,
    null
  );

  const worker = profileResource.data;
  const isLoading = profileResource.isLoading;

  if (isLoading) {
    return (
      <Screen showBack={true} title="الملف الشخصي" scroll={false}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </Screen>
    );
  }

  if (!worker) {
    return (
      <Screen showBack={true} title="غير متوفر" scroll={false}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.danger} />
          <Text style={styles.errorText}>عذراً، لم يتم العثور على ملف الفني أو قد يكون الحساب غير نشط حالياً.</Text>
          <AppButton 
            title="العودة للرئيسية" 
            onPress={() => navigation.goBack()} 
            style={{ marginTop: spacing.md }}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen showBack={true} title={worker.name} scroll={true}>
      {/* 1. Header Banner & Profile Details */}
      <AppCard style={styles.headerCard}>
        <View style={styles.bannerBackground} />
        
        <View style={styles.profileRow}>
          <View style={styles.avatarContainer}>
            {worker.avatarUrl ? (
              <Image source={worker.avatarUrl} style={styles.avatarImage as any} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={56} color={theme.muted} />
              </View>
            )}
            {worker.isOnline && <View style={styles.onlineDot} />}
          </View>

          <View style={styles.infoColumn}>
            <View style={styles.nameRow}>
              <Text style={styles.nameText}>{worker.name}</Text>
              <Ionicons name="checkmark-circle" size={18} color="#D7A24D" style={{ marginRight: 6 }} />
            </View>
            <Text style={styles.professionText}>{worker.professionAr || "فني محترف"}</Text>
            
            <View style={styles.statusRow}>
              {worker.isAvailable ? (
                <View style={styles.availableBadge}>
                  <Text style={styles.availableBadgeText}>متاح للعمل</Text>
                </View>
              ) : (
                <View style={[styles.availableBadge, { backgroundColor: theme.surfaceAlt }]}>
                  <Text style={[styles.availableBadgeText, { color: theme.muted }]}>مشغول حالياً</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </AppCard>

      {/* 2. Stats Grid */}
      <View style={styles.statsRow}>
        <AppCard style={styles.statCard}>
          <Ionicons name="briefcase-outline" size={24} color={theme.primary} />
          <Text style={styles.statValue}>{worker.totalJobs ?? 0}</Text>
          <Text style={styles.statLabel}>العمليات المنجزة</Text>
        </AppCard>

        <AppCard style={styles.statCard}>
          <Ionicons name="star" size={24} color="#D7A24D" />
          <Text style={styles.statValue}>{worker.rating?.toFixed(1) ?? "5.0"}</Text>
          <Text style={styles.statLabel}>{worker.ratingCount ?? 0} تقييم</Text>
        </AppCard>
      </View>

      {/* 3. Biography Section */}
      <AppCard style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>نبذة عن الفني</Text>
        <Text style={styles.bioText}>
          {worker.bio || "فني معتمد ومحترف على منصة أسطى، ملتزم بتقديم خدمات صيانة ممتازة وبأعلى مستويات الجودة والأمان لحل جميع مشكلاتك التقنية والمنزلية."}
        </Text>
      </AppCard>

      {/* 4. Service Areas Covered */}
      <AppCard style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>مناطق التغطية</Text>
        <View style={styles.tagsContainer}>
          {worker.areas && worker.areas.length > 0 ? (
            worker.areas.map((area, index) => (
              <View key={index} style={styles.tag}>
                <Ionicons name="location-outline" size={12} color={theme.text} style={{ marginLeft: 4 }} />
                <Text style={styles.tagText}>{area}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>يغطي جميع مناطق مدينته المسجلة.</Text>
          )}
        </View>
      </AppCard>

      {/* 5. Reviews Section */}
      <View style={styles.reviewsHeaderRow}>
        <Text style={styles.reviewsTitle}>آراء العملاء والتقييمات</Text>
        <Text style={styles.reviewsCount}>({worker.reviews?.length ?? 0} رأي)</Text>
      </View>

      {worker.reviews && worker.reviews.length > 0 ? (
        worker.reviews.map((review) => (
          <AppCard key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewAuthorInfo}>
                {review.authorAvatar ? (
                  <Image source={review.authorAvatar} style={styles.reviewAvatar as any} />
                ) : (
                  <View style={styles.reviewAvatarPlaceholder}>
                    <Ionicons name="person" size={16} color={theme.muted} />
                  </View>
                )}
                <Text style={styles.reviewAuthorName}>{review.authorName}</Text>
              </View>
              
              <View style={styles.reviewRatingRow}>
                <Ionicons name="star" size={12} color="#D7A24D" />
                <Text style={styles.reviewRatingText}>{review.rating?.toFixed(1) ?? "5.0"}</Text>
              </View>
            </View>

            {review.comment ? (
              <Text style={styles.reviewComment}>{review.comment}</Text>
            ) : (
              <Text style={[styles.reviewComment, { fontStyle: "italic", color: theme.muted }]}>بدون تعليق مكتوب</Text>
            )}
            
            <Text style={styles.reviewDate}>
              {new Date(review.createdAt).toLocaleDateString("ar-EG", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </AppCard>
        ))
      ) : (
        <AppCard style={styles.emptyCard}>
          <Ionicons name="chatbubbles-outline" size={32} color={theme.muted} />
          <Text style={styles.emptyReviewsText}>لا توجد تقييمات مكتوبة لهذا الفني بعد.</Text>
        </AppCard>
      )}

      {/* 6. Call To Action (Book Button) */}
      <View style={styles.actionContainer}>
        <AppButton 
          title="اطلب الفني الآن" 
          onPress={() => {
            navigation.navigate("CreateRequest", {
              workerId: worker.id,
              workerName: worker.name,
              categoryId: worker.categoryId,
              categoryNameAr: worker.professionAr
            });
          }}
        />
      </View>
    </Screen>
  );
}

const makeStyles = (theme: ReturnType<typeof useTheme>["theme"]) => StyleSheet.create({
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.sm
  },
  errorText: {
    color: theme.muted,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 24
  },
  headerCard: {
    padding: 0,
    overflow: "hidden",
    marginBottom: spacing.md
  },
  bannerBackground: {
    height: 90,
    backgroundColor: theme.primarySoft,
    borderBottomWidth: 1,
    borderColor: theme.border
  },
  profileRow: {
    flexDirection: "row-reverse",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    marginTop: -45,
    gap: spacing.md
  },
  avatarContainer: {
    position: "relative"
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: theme.surface
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: theme.backgroundRaised,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: theme.surface
  },
  onlineDot: {
    position: "absolute",
    bottom: 4,
    left: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.success,
    borderWidth: 2,
    borderColor: theme.surface
  },
  infoColumn: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 4,
    gap: 4
  },
  nameRow: {
    flexDirection: "row-reverse",
    alignItems: "center"
  },
  nameText: {
    color: theme.text,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "right"
  },
  professionText: {
    color: theme.primary,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "right"
  },
  statusRow: {
    flexDirection: "row-reverse",
    marginTop: 2
  },
  availableBadge: {
    backgroundColor: theme.successSoft,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8
  },
  availableBadgeText: {
    color: theme.success,
    fontSize: 11,
    fontWeight: "800"
  },
  statsRow: {
    flexDirection: "row-reverse",
    gap: spacing.md,
    marginBottom: spacing.md
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: spacing.md,
    gap: 4
  },
  statValue: {
    color: theme.text,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 2
  },
  statLabel: {
    color: theme.muted,
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center"
  },
  sectionCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm
  },
  sectionTitle: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "right"
  },
  bioText: {
    color: theme.text,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "right"
  },
  tagsContainer: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  tag: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: theme.backgroundRaised,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  tagText: {
    color: theme.text,
    fontSize: 12,
    fontWeight: "600"
  },
  emptyText: {
    color: theme.muted,
    fontSize: 13,
    textAlign: "right"
  },
  reviewsHeaderRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: spacing.sm,
    paddingHorizontal: 4,
    gap: 6
  },
  reviewsTitle: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "800"
  },
  reviewsCount: {
    color: theme.muted,
    fontSize: 13,
    fontWeight: "600"
  },
  reviewCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.xs
  },
  reviewHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center"
  },
  reviewAuthorInfo: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16
  },
  reviewAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.backgroundRaised,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.border
  },
  reviewAuthorName: {
    color: theme.text,
    fontSize: 14,
    fontWeight: "800"
  },
  reviewRatingRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: theme.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4
  },
  reviewRatingText: {
    color: theme.text,
    fontSize: 12,
    fontWeight: "800"
  },
  reviewComment: {
    color: theme.text,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "right",
    marginTop: 2
  },
  reviewDate: {
    color: theme.muted,
    fontSize: 11,
    textAlign: "left",
    marginTop: 4
  },
  emptyCard: {
    alignItems: "center",
    padding: spacing.xl,
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  emptyReviewsText: {
    color: theme.muted,
    fontSize: 13,
    fontWeight: "600"
  },
  actionContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl
  }
});

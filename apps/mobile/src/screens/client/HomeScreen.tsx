import { useState } from "react";
import { Image } from "expo-image";
import { ScrollView, StyleSheet, Text, View, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { AppCard } from "../../components/AppCard";
import { Screen } from "../../components/Screen";
import { useApiResource } from "../../hooks/useApiResource";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { spacing } from "../../theme/spacing";

type Slide = {
  id?: string;
  titleAr?: string;
  imageUrl?: string;
  image?: string;
};

type Campaign = {
  id: string;
  titleAr: string;
  descAr: string;
  imageUrl?: string;
  link: string;
};

type Worker = {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  profession: string;
  rating: number;
  ratingCount: number;
  yearsOfExperience: number;
};

function getIconName(slug: string): keyof typeof Ionicons.glyphMap {
  const mapping: Record<string, keyof typeof Ionicons.glyphMap> = {
    electricity: "flash-outline",
    electrical: "flash-outline",
    plumbing: "water-outline",
    carpentry: "hammer-outline",
    ac: "thermometer-outline",
    "ac-maintenance": "thermometer-outline",
    appliances: "build-outline",
    painting: "color-palette-outline",
    aluminum: "construct-outline",
    networks: "wifi-outline",
    computer: "desktop-outline",
    "computer-repair": "desktop-outline",
    cctv: "videocam-outline",
    cameras: "videocam-outline"
  };
  return mapping[slug] || "settings-outline";
}

export function HomeScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const styles = makeStyles(theme);
  const navigation = useNavigation<any>();

  // Fetch all live database resources matching the website configurations
  const categories = useApiResource<Array<Record<string, any>>>("/services/categories", []);
  const slides = useApiResource<Slide[]>("/public/mobile-slides", []);
  const campaigns = useApiResource<Campaign[]>("/public/campaigns", []);
  const workers = useApiResource<Worker[]>("/public/workers", []);

  const greetings = `أهلاً، ${user?.firstName ?? "عميلنا العزيز"}`;

  return (
    <Screen scroll={true}>
      {/* 1. Greeting & Brand Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Pressable style={styles.iconButton} onPress={() => navigation.navigate("Notifications")}>
            <Ionicons name="notifications-outline" size={24} color={theme.text} />
          </Pressable>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.greetingText}>{greetings}</Text>
          <Text style={styles.brandTitle}>أُسطى OSTA</Text>
        </View>
      </View>

      {/* 2. Premium Search bar placeholder */}
      <Pressable style={styles.searchBar} onPress={() => navigation.navigate("CreateRequest")}>
        <Ionicons name="search-outline" size={20} color={theme.muted} />
        <Text style={styles.searchText}>ابحث عن خدمة أو صنايعي محترف...</Text>
      </Pressable>

      {/* 3. Hero Slides Carousel */}
      {slides.isLoading ? (
        <ActivityIndicator color={theme.primary} style={{ marginVertical: spacing.md }} />
      ) : slides.data.length > 0 ? (
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.slidesContainer}>
            {slides.data.map((slide, index) => {
              const source = slide.imageUrl ?? slide.image;
              return (
                <View key={slide.id ?? index} style={styles.slideCard}>
                  {source ? <Image source={source} style={styles.slideImage} contentFit="cover" /> : null}
                  <View style={styles.slideGradient} />
                  <Text style={styles.slideText} numberOfLines={2}>{slide.titleAr ?? "أُسطى"}</Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      {/* 4. Service Categories Section (Squared Grid/Layout matching website design) */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>أقسام الخدمات</Text>
        <Text style={styles.sectionSubtitle}>اختر التخصص المطلوب لطلب الخدمة فوراً</Text>
      </View>

      {categories.isLoading ? (
        <ActivityIndicator color={theme.primary} />
      ) : (
        <View style={styles.categoriesGrid}>
          {categories.data.map((cat) => (
            <Pressable
              key={cat.id}
              style={styles.categoryCard}
              onPress={() => {
                navigation.navigate("CreateRequest", {
                  categoryId: cat.id,
                  categorySlug: cat.slug,
                  categoryNameAr: cat.nameAr
                });
              }}
            >
              <View style={styles.categoryIconWrapper}>
                <Ionicons name={getIconName(cat.slug)} size={28} color={theme.primary} />
              </View>
              <Text style={styles.categoryName} numberOfLines={1}>{cat.nameAr}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* 5. Sponsored Deals & Campaigns (Website Campaign cards adapted for native) */}
      {campaigns.data.length > 0 && (
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderWithIcon}>
              <Ionicons name="megaphone" size={20} color={theme.primary} />
              <Text style={styles.sectionTitle}>العروض والشركاء المميزين</Text>
            </View>
            <Text style={styles.sectionSubtitle}>عروض حصرية وخصومات من الشركاء المعتمدين لدينا</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.campaignsContainer}>
            {campaigns.data.map((camp) => (
              <AppCard key={camp.id} style={styles.campaignCard}>
                {camp.imageUrl ? (
                  <View style={styles.campaignImageWrapper}>
                    <Image source={camp.imageUrl} style={styles.campaignImage} contentFit="cover" />
                    <View style={styles.adBadge}>
                      <Text style={styles.adBadgeText}>ممول</Text>
                    </View>
                  </View>
                ) : null}
                <View style={styles.campaignDetails}>
                  <Text style={styles.campaignTitle} numberOfLines={1}>{camp.titleAr}</Text>
                  <Text style={styles.campaignDesc} numberOfLines={2}>{camp.descAr}</Text>
                </View>
              </AppCard>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 6. Featured/Top Verified Workers */}
      {workers.data.length > 0 && (
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderWithIcon}>
              <Ionicons name="ribbon-outline" size={20} color={theme.primary} />
              <Text style={styles.sectionTitle}>أفضل الفنيين الموثقين</Text>
            </View>
            <Text style={styles.sectionSubtitle}>صنايعية معتمدين ذوي تقييم عالي جاهزون لخدمتك</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.workersContainer}>
            {workers.data.map((worker) => (
              <AppCard key={worker.id} style={styles.workerCard}>
                <View style={styles.workerHeader}>
                  <View style={styles.workerInfo}>
                    <Text style={styles.workerName} numberOfLines={1}>
                      {worker.user?.firstName} {worker.user?.lastName}
                    </Text>
                    <Text style={styles.workerProfession} numberOfLines={1}>{worker.profession}</Text>
                  </View>
                  <View style={styles.workerAvatarWrapper}>
                    {worker.user?.avatarUrl ? (
                      <Image source={worker.user.avatarUrl} style={styles.workerAvatar} />
                    ) : (
                      <View style={styles.workerAvatarPlaceholder}>
                        <Ionicons name="person" size={24} color={theme.muted} />
                      </View>
                    )}
                  </View>
                </View>
                
                <View style={styles.workerMeta}>
                  <View style={styles.workerRating}>
                    <Ionicons name="star" size={14} color="#D7A24D" />
                    <Text style={styles.workerRatingText}>
                      {worker.rating?.toFixed(1) ?? "5.0"} ({worker.ratingCount ?? 0})
                    </Text>
                  </View>
                  <View style={styles.workerExp}>
                    <Text style={styles.workerExpText}>خبرة {worker.yearsOfExperience ?? 3} سنوات</Text>
                  </View>
                </View>

                <Pressable 
                  style={styles.bookButton} 
                  onPress={() => {
                    navigation.navigate("CreateRequest", {
                      workerId: worker.id,
                      workerName: `${worker.user?.firstName} ${worker.user?.lastName}`
                    });
                  }}
                >
                  <Text style={styles.bookButtonText}>اطلب الفني الآن</Text>
                  <Ionicons name="arrow-back" size={14} color={theme.primaryText} style={{ transform: [{ rotate: "180deg" }] }} />
                </Pressable>
              </AppCard>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 7. Service Zone Info Card */}
      <AppCard style={styles.infoCard}>
        <View style={styles.infoIconWrapper}>
          <Ionicons name="location-outline" size={24} color={theme.primary} />
        </View>
        <View style={styles.infoTextWrapper}>
          <Text style={styles.infoTitle}>تغطية الخدمة ومواقع الفنيين</Text>
          <Text style={styles.infoBody}>
            عند إنشاء أي طلب خدمة، يتم رصد موقعك تلقائياً لعرض طلبك فوراً لأقرب الفنيين والمحترفين المتواجدين في نطاق منطقتك السكنية لضمان سرعة الوصول والاستجابة.
          </Text>
        </View>
      </AppCard>
    </Screen>
  );
}

const makeStyles = (theme: ReturnType<typeof useTheme>["theme"]) => StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.border
  },
  headerLeft: {
    flexDirection: "row",
    gap: spacing.sm
  },
  headerRight: {
    alignItems: "flex-end"
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.surfaceAlt,
    alignItems: "center",
    justifyContent: "center"
  },
  greetingText: {
    color: theme.muted,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right"
  },
  brandTitle: {
    color: theme.text,
    fontSize: 22,
    fontWeight: "900",
    textAlign: "right"
  },
  searchBar: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 24,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    marginVertical: spacing.xs
  },
  searchText: {
    color: theme.muted,
    fontSize: 14,
    flex: 1,
    textAlign: "right"
  },
  slidesContainer: {
    gap: spacing.md,
    paddingVertical: spacing.xs
  },
  slideCard: {
    width: 290,
    height: 140,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: theme.primarySoft,
    justifyContent: "flex-end"
  },
  slideImage: {
    ...StyleSheet.absoluteFillObject
  },
  slideGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)"
  },
  slideText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    padding: spacing.md,
    textAlign: "right",
    lineHeight: 24
  },
  sectionBlock: {
    marginTop: spacing.md
  },
  sectionHeader: {
    gap: spacing.xs,
    marginBottom: spacing.sm
  },
  sectionHeaderWithIcon: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.xs
  },
  sectionTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "right"
  },
  sectionSubtitle: {
    color: theme.muted,
    fontSize: 13,
    textAlign: "right"
  },
  categoriesGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: spacing.md,
    justifyContent: "space-between"
  },
  categoryCard: {
    width: "30%",
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 16,
    padding: spacing.sm,
    alignItems: "center",
    gap: spacing.xs
  },
  categoryIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.primarySoft,
    alignItems: "center",
    justifyContent: "center"
  },
  categoryName: {
    color: theme.text,
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center"
  },
  campaignsContainer: {
    gap: spacing.md,
    paddingVertical: spacing.xs
  },
  campaignCard: {
    width: 260,
    padding: 0,
    overflow: "hidden"
  },
  campaignImageWrapper: {
    width: "100%",
    height: 120,
    position: "relative"
  },
  campaignImage: {
    width: "100%",
    height: "100%"
  },
  adBadge: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4
  },
  adBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800"
  },
  campaignDetails: {
    padding: spacing.md,
    gap: spacing.xs
  },
  campaignTitle: {
    color: theme.text,
    fontSize: 15,
    fontWeight: "900",
    textAlign: "right"
  },
  campaignDesc: {
    color: theme.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "right"
  },
  workersContainer: {
    gap: spacing.md,
    paddingVertical: spacing.xs
  },
  workerCard: {
    width: 240,
    padding: spacing.md,
    gap: spacing.sm
  },
  workerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  workerInfo: {
    flex: 1,
    marginRight: spacing.sm
  },
  workerName: {
    color: theme.text,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "right"
  },
  workerProfession: {
    color: theme.primary,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right",
    marginTop: 2
  },
  workerAvatarWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.border
  },
  workerAvatar: {
    width: "100%",
    height: "100%"
  },
  workerAvatarPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.surfaceAlt,
    alignItems: "center",
    justifyContent: "center"
  },
  workerMeta: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center"
  },
  workerRating: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4
  },
  workerRatingText: {
    color: theme.text,
    fontSize: 12,
    fontWeight: "700"
  },
  workerExp: {
    backgroundColor: theme.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12
  },
  workerExpText: {
    color: theme.muted,
    fontSize: 10,
    fontWeight: "700"
  },
  bookButton: {
    flexDirection: "row-reverse",
    backgroundColor: theme.primary,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    marginTop: spacing.xs
  },
  bookButtonText: {
    color: theme.primaryText,
    fontSize: 13,
    fontWeight: "800"
  },
  infoCard: {
    flexDirection: "row-reverse",
    padding: spacing.md,
    gap: spacing.md,
    backgroundColor: theme.backgroundRaised,
    marginTop: spacing.sm
  },
  infoIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.primarySoft,
    alignItems: "center",
    justifyContent: "center"
  },
  infoTextWrapper: {
    flex: 1
  },
  infoTitle: {
    color: theme.text,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "right",
    marginBottom: 4
  },
  infoBody: {
    color: theme.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "right"
  }
});

import { useState, useRef } from "react";
import { Image } from "expo-image";
import { ScrollView, StyleSheet, Text, View, Pressable, ActivityIndicator, Linking, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { AppCard } from "../../components/AppCard";
import { Screen } from "../../components/Screen";
import { useApiResource } from "../../hooks/useApiResource";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { spacing } from "../../theme/spacing";
import HeaderLogo from "../../../assets/logo.svg";

type Slide = {
  id?: string;
  titleAr?: string;
  descAr?: string;
  imageUrl?: string;
  image?: string;
  btn1TextAr?: string;
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
  name: string;
  avatarUrl?: string;
  professionAr: string;
  professionEn: string;
  rating: number;
  ratingCount: number;
  totalJobs: number;
};

type VendorStore = {
  id: string;
  shopName: string;
  shopNameAr: string;
  category: string;
  shopDescription: string | null;
  shopImageUrl: string | null;
  governorate: string;
  city: string;
  rating: number;
  ratingCount: number;
  totalOrders: number;
  isOpen: boolean;
};

type ClientRequest = {
  id: string;
  title: string;
  serviceId: string;
  serviceNameAr: string;
  status: string;
  createdAt: string;
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

function getStatusColor(status: string) {
  switch (status.toUpperCase()) {
    case "PENDING":
      return "#A96500";
    case "ACCEPTED":
      return "#146D68";
    case "COMPLETED":
      return "#267348";
    default:
      return "#74675B";
  }
}

function getStatusTextAr(status: string) {
  switch (status.toUpperCase()) {
    case "PENDING":
      return "قيد الانتظار";
    case "ACCEPTED":
      return "تم القبول";
    case "COMPLETED":
      return "مكتمل";
    default:
      return status;
  }
}

export function HomeScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const styles = makeStyles(theme);
  const navigation = useNavigation<any>();

  // Fetch all live database resources matching the configurations
  const categories = useApiResource<Array<Record<string, any>>>("/services/categories", []);
  const slides = useApiResource<Slide[]>("/public/mobile-slides", []);
  const campaigns = useApiResource<Campaign[]>("/public/campaigns", []);
  const workers = useApiResource<Worker[]>("/public/workers", []);
  const vendorsList = useApiResource<VendorStore[]>("/vendors/stores", []);
  
  // Conditionally fetch recent client requests
  const recentRequests = useApiResource<ClientRequest[]>(
    user?.role === "CLIENT" ? "/clients/requests" : "",
    []
  );

  const greetings = `أهلاً، ${user?.firstName ?? "عميلنا العزيز"}`;

  // ── Scroll-Driven Animation Values ──
  const scrollY = useRef(new Animated.Value(0)).current;

  // Parallax + Scale + Fade for Top Banner
  const bannerTranslateY = scrollY.interpolate({
    inputRange: [0, 180],
    outputRange: [0, 75],
    extrapolate: "clamp",
  });
  const bannerScale = scrollY.interpolate({
    inputRange: [-150, 0],
    outputRange: [1.3, 1],
    extrapolate: "clamp",
  });
  const bannerOpacity = scrollY.interpolate({
    inputRange: [0, 180],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  // Sticky Header Collapsing Offset
  const stickyHeaderTranslateY = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [0, -42],
    extrapolate: "clamp",
  });
  const headerRowOpacity = scrollY.interpolate({
    inputRange: [0, 35],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const handleAdPress = (link: string) => {
    if (!link) return;
    
    let targetUrl = link;
    if (!link.startsWith("http://") && !link.startsWith("https://")) {
      const cleanLink = link.startsWith("/") ? link : `/${link}`;
      targetUrl = `https://www.ostafy.com${cleanLink}`;
    }
    
    Linking.openURL(targetUrl).catch((err) => console.error("Failed to open URL:", err));
  };

  // Split campaigns into technician ads vs shop ads
  const allCampaigns = campaigns.data;
  const storeAds = allCampaigns.filter(c => c.link?.includes("vendor") || c.link?.includes("store") || c.link?.includes("shop"));
  const technicianAds = allCampaigns.filter(c => !storeAds.includes(c));

  // If one list is empty, split them by index to ensure both sections look rich
  const displayTechAds = technicianAds.length > 0 ? technicianAds : allCampaigns.slice(0, Math.ceil(allCampaigns.length / 2));
  const displayStoreAds = storeAds.length > 0 ? storeAds : allCampaigns.slice(Math.ceil(allCampaigns.length / 2));

  // Get the first slide to display as the single top advertisement banner
  const topSlide = slides.data[0] || {
    id: "fallback-slide",
    titleAr: "صنايعيك بنقرة واحدة في مصر",
    descAr: "أمهر الفنيين الحرفيين الموثقين جاهزون لخدمتك في جميع التخصصات المنزلية والتقنية بضمان حقيقي ودفع آمن.",
    btn1TextAr: "اطلب فني الآن"
  };

  return (
    <Screen scroll={false} style={{ flex: 1, padding: 0 }} showBack={false}>
      {/* 
        Custom Animated.ScrollView with stickyHeaderIndices={1}.
        This will freeze the search bar container at the top of the screen when scrolling down.
      */}
      <Animated.ScrollView 
        stickyHeaderIndices={[1]} 
        showsVerticalScrollIndicator={false} 
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        
        {/* 1. TOP SINGLE AD CAROUSEL / SLIDER (Fills screen width, very top) */}
        <Animated.View style={[styles.topAdBanner, {
          opacity: bannerOpacity,
          transform: [
            { translateY: bannerTranslateY },
            { scale: bannerScale }
          ]
        }]}>
          {topSlide.imageUrl || topSlide.image ? (
            <Image source={topSlide.imageUrl ?? topSlide.image} style={styles.slideImage as any} contentFit="cover" />
          ) : (
            <View style={styles.slideImagePlaceholder} />
          )}
          <View style={styles.slideGradient} />
          <View style={styles.slideContent}>
            <Text style={styles.slideTitle} numberOfLines={2}>{topSlide.titleAr}</Text>
            {topSlide.descAr ? <Text style={styles.slideDesc} numberOfLines={2}>{topSlide.descAr}</Text> : null}
            
            <Pressable 
              style={styles.slideCta}
              onPress={() => navigation.navigate("CreateRequest")}
            >
              <Text style={styles.slideCtaText}>{topSlide.btn1TextAr || "اطلب فني الآن"}</Text>
              <Ionicons name="arrow-back" size={14} color="#15110D" style={{ transform: [{ rotate: "180deg" }] }} />
            </Pressable>
          </View>
        </Animated.View>

        {/* 2. STICKY HEADER WRAPPER (LOGO + SEARCH BAR) - sticks when scrolled */}
        <Animated.View style={[styles.stickyHeaderWrapper, {
          transform: [{ translateY: stickyHeaderTranslateY }],
        }]}>
          <Animated.View style={[styles.headerRow, { opacity: headerRowOpacity }]}>
            <View style={styles.headerLeft}>
              <Pressable style={styles.iconButton} onPress={() => navigation.navigate("Notifications")}>
                <Ionicons name="notifications-outline" size={20} color={theme.text} />
              </Pressable>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.greetingText}>{greetings}</Text>
              <View style={styles.logo}>
                <HeaderLogo width="100%" height="100%" />
              </View>
            </View>
          </Animated.View>

          <Pressable style={styles.searchBar} onPress={() => navigation.navigate("AllServices")}>
            <Ionicons name="search-outline" size={20} color={theme.muted} />
            <Text style={styles.searchText}>ابحث عن خدمة أو صنايعي محترف...</Text>
          </Pressable>
        </Animated.View>

        {/* 3. SCROLLABLE INNER BODY CONTENT */}
        <View style={styles.bodyContainer}>

          {/* 3.1. RECENT CLIENT REQUESTS (LAST 2 REQUESTS FOR QUICK REPEAT) */}
          {user?.role === "CLIENT" && recentRequests.data.length > 0 && (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>طلباتك الأخيرة</Text>
                <Text style={styles.sectionSubtitle}>أعد تكرار طلباتك السابقة بضغطة زر واحدة</Text>
              </View>

              <View style={styles.recentRequestsRow}>
                {recentRequests.data.slice(0, 2).map((req) => (
                  <AppCard key={req.id} style={styles.recentRequestCard}>
                    <View style={styles.recentHeader}>
                      <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(req.status) }]}>
                        <Text style={styles.statusText}>{getStatusTextAr(req.status)}</Text>
                      </View>
                      <Text style={styles.recentTitle} numberOfLines={1}>{req.title || req.serviceNameAr}</Text>
                    </View>
                    <Text style={styles.recentService} numberOfLines={1}>نوع الخدمة: {req.serviceNameAr}</Text>
                    
                    <Pressable 
                      style={styles.repeatButton}
                      onPress={() => {
                        navigation.navigate("CreateRequest", {
                          categoryId: req.serviceId, // In API mapping, serviceId maps to categoryId or category relationship
                          title: req.title,
                          description: `تكرار للطلب السابق: ${req.title}`
                        });
                      }}
                    >
                      <Ionicons name="refresh-outline" size={13} color={theme.primary} />
                      <Text style={styles.repeatButtonText}>تكرار الطلب</Text>
                    </Pressable>
                  </AppCard>
                ))}
              </View>
            </View>
          )}

          {/* 3.2. SERVICE CATEGORIES (4 ITEMS + MORE BUTTON NAVIGATING TO ALL SERVICES PAGE) */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderWithLink}>
              <Pressable 
                style={styles.viewAllLink}
                onPress={() => navigation.navigate("AllServices")}
              >
                <Text style={styles.viewAllLinkText}>كل الخدمات</Text>
                <Ionicons name="chevron-back" size={14} color={theme.primary} />
              </Pressable>
              <Text style={styles.sectionTitle}>أقسام الخدمات</Text>
            </View>

            {categories.isLoading ? (
              <ActivityIndicator color={theme.primary} style={{ paddingVertical: spacing.md }} />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCategoriesContainer}>
                {/* Display exactly up to 4 categories */}
                {categories.data.slice(0, 4).map((cat) => (
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
                      {cat.imageUrl ? (
                        <Image source={{ uri: cat.imageUrl }} style={styles.categoryIconImage} contentFit="cover" />
                      ) : (
                        <Ionicons name={getIconName(cat.slug)} size={26} color={theme.primary} />
                      )}
                    </View>
                    <Text style={styles.categoryName} numberOfLines={1}>{cat.nameAr}</Text>
                  </Pressable>
                ))}

                {/* More / All Services Card at the end of the row */}
                <Pressable
                  style={[styles.categoryCard, { backgroundColor: theme.primarySoft, borderColor: theme.primary }]}
                  onPress={() => navigation.navigate("AllServices")}
                >
                  <View style={[styles.categoryIconWrapper, { backgroundColor: theme.surface }]}>
                    <Ionicons name="grid-outline" size={26} color={theme.primary} />
                  </View>
                  <Text style={[styles.categoryName, { color: theme.primary }]} numberOfLines={1}>المزيد</Text>
                </Pressable>
              </ScrollView>
            )}
          </View>

          {/* 3.3. TECHNICIAN ADS / CAMPAIGNS */}
          {displayTechAds.length > 0 && (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderWithIcon}>
                  <Ionicons name="people-circle-outline" size={20} color={theme.primary} />
                  <Text style={styles.sectionTitle}>إعلانات الفنيين الحرفيين</Text>
                </View>
                <Text style={styles.sectionSubtitle}>خدمات وعروض مقدمة مباشرة من أمهر صنايعية أُسطى</Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.campaignsContainer}>
                {displayTechAds.map((camp) => (
                  <Pressable key={camp.id} onPress={() => handleAdPress(camp.link)}>
                    <AppCard style={styles.campaignCard}>
                      {camp.imageUrl ? (
                        <View style={styles.campaignImageWrapper}>
                          <Image source={camp.imageUrl} style={styles.campaignImage as any} contentFit="cover" />
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
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* 3.4. VENDOR / SHOP ADS / CAMPAIGNS */}
          {displayStoreAds.length > 0 && (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderWithIcon}>
                  <Ionicons name="storefront-outline" size={18} color={theme.primary} />
                  <Text style={styles.sectionTitle}>إعلانات المتاجر والشركاء</Text>
                </View>
                <Text style={styles.sectionSubtitle}>أفضل أسعار خامات ومعدات ومواد تشطيب من متاجر معتمدة</Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.campaignsContainer}>
                {displayStoreAds.map((camp) => (
                  <Pressable key={camp.id} onPress={() => handleAdPress(camp.link)}>
                    <AppCard style={styles.campaignCard}>
                      {camp.imageUrl ? (
                        <View style={styles.campaignImageWrapper}>
                          <Image source={camp.imageUrl} style={styles.campaignImage as any} contentFit="cover" />
                          <View style={styles.adBadge}>
                            <Text style={styles.adBadgeText}>متجر شريك</Text>
                          </View>
                        </View>
                      ) : null}
                      <View style={styles.campaignDetails}>
                        <Text style={styles.campaignTitle} numberOfLines={1}>{camp.titleAr}</Text>
                        <Text style={styles.campaignDesc} numberOfLines={2}>{camp.descAr}</Text>
                      </View>
                    </AppCard>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* 3.5. FEATURED / TOP VERIFIED WORKERS */}
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
                    <Pressable
                      onPress={() => navigation.navigate("WorkerProfile", { workerId: worker.id })}
                      style={{ gap: spacing.md }}
                    >
                      <View style={styles.workerHeader}>
                        <View style={styles.workerInfo}>
                          <Text style={styles.workerName} numberOfLines={1}>
                            {worker.name}
                          </Text>
                          <Text style={styles.workerProfession} numberOfLines={1}>{worker.professionAr || "فني محترف"}</Text>
                        </View>
                        <View style={styles.workerAvatarWrapper}>
                          {worker.avatarUrl ? (
                            <Image source={worker.avatarUrl} style={styles.workerAvatar as any} />
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
                          <Text style={styles.workerExpText}>{worker.totalJobs ?? 0} عملية</Text>
                        </View>
                      </View>
                    </Pressable>

                    <Pressable 
                      style={styles.bookButton} 
                      onPress={() => {
                        navigation.navigate("CreateRequest", {
                          workerId: worker.id,
                          workerName: worker.name
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

          {/* 3.6. TOP REGISTERED VENDORS/SUPPLIERS */}
          {vendorsList.data.length > 0 && (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderWithIcon}>
                  <Ionicons name="storefront-outline" size={20} color={theme.primary} />
                  <Text style={styles.sectionTitle}>أفضل الموردين والمتاجر</Text>
                </View>
                <Text style={styles.sectionSubtitle}>متاجر معتمدة لتوفير الخامات ومواد التشطيب بضمان المنصة</Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.workersContainer}>
                {vendorsList.data.map((vendor) => (
                  <AppCard key={vendor.id} style={styles.workerCard}>
                    <Pressable
                      onPress={() => navigation.navigate("VendorProfile", { vendorId: vendor.id })}
                      style={{ gap: spacing.md }}
                    >
                      <View style={styles.workerHeader}>
                        <View style={styles.workerInfo}>
                          <Text style={styles.workerName} numberOfLines={1}>
                            {vendor.shopNameAr || vendor.shopName}
                          </Text>
                          <Text style={styles.workerProfession} numberOfLines={1}>{vendor.category || "مورد خامات"}</Text>
                        </View>
                        <View style={styles.workerAvatarWrapper}>
                          {vendor.shopImageUrl ? (
                            <Image source={vendor.shopImageUrl} style={styles.workerAvatar as any} />
                          ) : (
                            <View style={styles.workerAvatarPlaceholder}>
                              <Ionicons name="storefront" size={22} color={theme.muted} />
                            </View>
                          )}
                        </View>
                      </View>
                      
                      <View style={styles.workerMeta}>
                        <View style={styles.workerRating}>
                          <Ionicons name="star" size={14} color="#D7A24D" />
                          <Text style={styles.workerRatingText}>
                            {vendor.rating?.toFixed(1) ?? "5.0"} ({vendor.ratingCount ?? 0})
                          </Text>
                        </View>
                        <View style={styles.workerExp}>
                          <Text style={styles.workerExpText}>{vendor.totalOrders ?? 0} طلب</Text>
                        </View>
                      </View>
                    </Pressable>

                    <Pressable 
                      style={styles.bookButton} 
                      onPress={() => {
                        navigation.navigate("VendorProfile", { vendorId: vendor.id });
                      }}
                    >
                      <Text style={styles.bookButtonText}>تصفح المنتجات</Text>
                      <Ionicons name="arrow-back" size={14} color={theme.primaryText} style={{ transform: [{ rotate: "180deg" }] }} />
                    </Pressable>
                  </AppCard>
                ))}
              </ScrollView>
            </View>
          )}

          {/* 3.6. ADVERTISEMENT PLACEHOLDER SPACE (Mesa7a E3lanya) */}
          <View style={[styles.sectionBlock, { marginBottom: spacing.xl }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>مساحة إعلانية مميزة</Text>
            </View>
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
          </View>

        </View>
      </Animated.ScrollView>
    </Screen>
  );
}

const makeStyles = (theme: ReturnType<typeof useTheme>["theme"]) => StyleSheet.create({
  topAdBanner: {
    width: "100%",
    height: 180,
    position: "relative",
    backgroundColor: theme.primarySoft
  },
  slideImagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#15110D"
  },
  slideImage: {
    ...StyleSheet.absoluteFillObject
  },
  slideGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)"
  },
  slideContent: {
    position: "absolute",
    bottom: spacing.md,
    left: spacing.lg,
    right: spacing.lg,
    alignItems: "flex-end",
    gap: spacing.xs
  },
  slideTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    textAlign: "right",
    lineHeight: 28
  },
  slideDesc: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    textAlign: "right",
    lineHeight: 18,
    marginBottom: spacing.xs
  },
  slideCta: {
    flexDirection: "row-reverse",
    backgroundColor: theme.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignItems: "center",
    gap: spacing.xs
  },
  slideCtaText: {
    color: "#15110D",
    fontSize: 12,
    fontWeight: "900"
  },
  stickyHeaderWrapper: {
    backgroundColor: theme.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    zIndex: 100,
    elevation: 4
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm
  },
  headerLeft: {
    flexDirection: "row",
    gap: spacing.sm
  },
  headerRight: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.surfaceAlt,
    alignItems: "center",
    justifyContent: "center"
  },
  greetingText: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  logo: {
    width: 80,
    height: 28
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
    gap: spacing.sm
  },
  searchText: {
    color: theme.muted,
    fontSize: 13,
    flex: 1,
    textAlign: "right"
  },
  bodyContainer: {
    padding: spacing.lg,
    gap: spacing.lg
  },
  sectionBlock: {
    gap: spacing.sm
  },
  sectionHeader: {
    gap: spacing.xs
  },
  sectionHeaderWithIcon: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.xs
  },
  sectionHeaderWithLink: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center"
  },
  viewAllLink: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 2
  },
  viewAllLinkText: {
    color: theme.primary,
    fontSize: 13,
    fontWeight: "700"
  },
  sectionTitle: {
    color: theme.text,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "right"
  },
  sectionSubtitle: {
    color: theme.muted,
    fontSize: 12,
    textAlign: "right"
  },
  recentRequestsRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    gap: spacing.md
  },
  recentRequestCard: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: theme.border
  },
  recentHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4
  },
  recentTitle: {
    color: theme.text,
    fontSize: 13,
    fontWeight: "800",
    flex: 1,
    marginRight: 4,
    textAlign: "right"
  },
  statusIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700"
  },
  recentService: {
    color: theme.muted,
    fontSize: 11,
    textAlign: "right"
  },
  repeatButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    paddingVertical: 5,
    marginTop: spacing.xs,
    backgroundColor: theme.backgroundRaised
  },
  repeatButtonText: {
    color: theme.text,
    fontSize: 11,
    fontWeight: "800"
  },
  horizontalCategoriesContainer: {
    gap: spacing.md,
    paddingVertical: spacing.xs,
    flexDirection: "row-reverse"
  },
  categoryCard: {
    width: 90,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 16,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    alignItems: "center",
    gap: spacing.xs
  },
  categoryIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  categoryIconImage: {
    width: "100%",
    height: "100%"
  },
  categoryName: {
    color: theme.text,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center"
  },
  campaignsContainer: {
    gap: spacing.md,
    paddingVertical: spacing.xs,
    flexDirection: "row-reverse"
  },
  campaignCard: {
    width: 250,
    padding: 0,
    overflow: "hidden"
  },
  campaignImageWrapper: {
    width: "100%",
    height: 110,
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
    fontSize: 14,
    fontWeight: "900",
    textAlign: "right"
  },
  campaignDesc: {
    color: theme.muted,
    fontSize: 11,
    lineHeight: 16,
    textAlign: "right"
  },
  workersContainer: {
    gap: spacing.md,
    paddingVertical: spacing.xs,
    flexDirection: "row-reverse"
  },
  workerCard: {
    width: 230,
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
    fontSize: 14,
    fontWeight: "800",
    textAlign: "right"
  },
  workerProfession: {
    color: theme.primary,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "right",
    marginTop: 2
  },
  workerAvatarWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    fontSize: 11,
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
    fontSize: 9,
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
    fontSize: 12,
    fontWeight: "800"
  },
  infoCard: {
    flexDirection: "row-reverse",
    padding: spacing.md,
    gap: spacing.md,
    backgroundColor: theme.backgroundRaised
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
    fontSize: 14,
    fontWeight: "800",
    textAlign: "right",
    marginBottom: 4
  },
  infoBody: {
    color: theme.muted,
    fontSize: 11,
    lineHeight: 16,
    textAlign: "right"
  }
});

import { useState } from "react";
import { StyleSheet, Text, View, Pressable, ActivityIndicator, FlatList, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

import { AppCard } from "../../components/AppCard";
import { Screen } from "../../components/Screen";
import { useApiResource } from "../../hooks/useApiResource";
import { useTheme } from "../../context/ThemeContext";
import { spacing } from "../../theme/spacing";

interface VendorStore {
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
}

export function VendorsScreen() {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch the stores list from the server API matching the website
  const vendors = useApiResource<VendorStore[]>("/vendors/stores", []);

  const filteredVendors = vendors.data.filter((vendor) => {
    const name = vendor.shopNameAr || vendor.shopName || "";
    const category = vendor.category || "";
    const desc = vendor.shopDescription || "";
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <Screen title="دليل الموردين" subtitle="ابحث عن أفضل المحلات والموردين للخدمات ومواد التشطيب" scroll={false} style={{ flex: 1 }}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={theme.muted} />
        <TextInput
          placeholder="ابحث عن متجر، تخصص، أو منتج..."
          placeholderTextColor={theme.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={18} color={theme.muted} />
          </Pressable>
        )}
      </View>

      {vendors.isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredVendors}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="storefront-outline" size={48} color={theme.muted} style={{ marginBottom: spacing.sm }} />
              <Text style={styles.emptyText}>لم نجد أي متاجر مطابقة لبحثك</Text>
            </View>
          }
          renderItem={({ item }) => (
            <AppCard style={styles.card}>
              <View style={styles.storeRow}>
                <View style={styles.storeDetails}>
                  <View style={styles.storeTitleRow}>
                    {item.isOpen ? (
                      <View style={styles.openBadge}>
                        <Text style={styles.openBadgeText}>مفتوح</Text>
                      </View>
                    ) : (
                      <View style={[styles.openBadge, { backgroundColor: theme.dangerSoft }]}>
                        <Text style={[styles.openBadgeText, { color: theme.danger }]}>مغلق</Text>
                      </View>
                    )}
                    <Text style={styles.shopName} numberOfLines={1}>{item.shopNameAr || item.shopName}</Text>
                  </View>

                  <Text style={styles.shopCategory} numberOfLines={1}>التخصص: {item.category || "مواد تشطيب"}</Text>
                  {item.shopDescription ? (
                    <Text style={styles.shopDesc} numberOfLines={2}>{item.shopDescription}</Text>
                  ) : null}

                  <View style={styles.storeMeta}>
                    <View style={styles.storeLocation}>
                      <Ionicons name="location-outline" size={14} color={theme.muted} />
                      <Text style={styles.locationText} numberOfLines={1}>{item.city}، {item.governorate}</Text>
                    </View>
                    
                    <View style={styles.storeRating}>
                      <Ionicons name="star" size={14} color="#D7A24D" />
                      <Text style={styles.ratingText}>
                        {item.rating?.toFixed(1) ?? "5.0"} ({item.ratingCount ?? 0})
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.imageWrapper}>
                  {item.shopImageUrl ? (
                    <Image source={item.shopImageUrl} style={styles.shopImage as any} contentFit="cover" />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons name="storefront" size={28} color={theme.muted} />
                    </View>
                  )}
                </View>
              </View>
            </AppCard>
          )}
        />
      )}
    </Screen>
  );
}

const makeStyles = (theme: ReturnType<typeof useTheme>["theme"]) => StyleSheet.create({
  searchContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 24,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  searchInput: {
    flex: 1,
    color: theme.text,
    fontSize: 14,
    textAlign: "right",
    padding: 0
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  listContainer: {
    paddingBottom: spacing.lg
  },
  card: {
    marginBottom: spacing.md,
    padding: spacing.md
  },
  storeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  storeDetails: {
    flex: 1,
    marginRight: spacing.md,
    gap: 4
  },
  storeTitleRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center"
  },
  shopName: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "900",
    textAlign: "right",
    flex: 1,
    marginLeft: 6
  },
  openBadge: {
    backgroundColor: theme.successSoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8
  },
  openBadgeText: {
    color: theme.success,
    fontSize: 10,
    fontWeight: "800"
  },
  shopCategory: {
    color: theme.primary,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "right"
  },
  shopDesc: {
    color: theme.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "right"
  },
  storeMeta: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xs
  },
  storeLocation: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    maxWidth: "60%"
  },
  locationText: {
    color: theme.muted,
    fontSize: 11,
    fontWeight: "600"
  },
  storeRating: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4
  },
  ratingText: {
    color: theme.text,
    fontSize: 11,
    fontWeight: "800"
  },
  imageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.border
  },
  shopImage: {
    width: "100%",
    height: "100%"
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.surfaceAlt,
    alignItems: "center",
    justifyContent: "center"
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

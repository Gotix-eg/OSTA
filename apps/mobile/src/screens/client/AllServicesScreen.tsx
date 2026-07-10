import { useState } from "react";
import { StyleSheet, Text, View, Pressable, ActivityIndicator, FlatList, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";

import { Screen } from "../../components/Screen";
import { useApiResource } from "../../hooks/useApiResource";
import { useTheme } from "../../context/ThemeContext";
import { spacing } from "../../theme/spacing";
import { LinearGradient } from "expo-linear-gradient";

type Category = {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  imageUrl?: string;
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

function getServiceImageUrl(slug: string): string {
  const baseUrl = "https://www.ostafy.com/images/services";
  const mapping: Record<string, string> = {
    electricity: `${baseUrl}/electrical.png`,
    electrical: `${baseUrl}/electrical.png`,
    plumbing: `${baseUrl}/plumbing.png`,
    carpentry: `${baseUrl}/carpentry.png`,
    ac: `${baseUrl}/ac.png`,
    "ac-maintenance": `${baseUrl}/ac.png`,
    appliances: `${baseUrl}/appliances.png`,
    painting: `${baseUrl}/painting.png`,
    aluminum: `${baseUrl}/aluminum.png`,
    networks: `${baseUrl}/networks.png`,
    computer: `${baseUrl}/computer.png`,
    "computer-repair": `${baseUrl}/computer.png`,
    cctv: `${baseUrl}/cctv.png`,
    cameras: `${baseUrl}/cctv.png`,
    tiling: `${baseUrl}/tiling.png`,
    plastering: `${baseUrl}/plastering.png`,
    ironwork: `${baseUrl}/ironwork.png`,
    finishing: `${baseUrl}/finishing.png`,
    gypsum: `${baseUrl}/gypsum.png`,
    moving: `${baseUrl}/moving.png`,
    cleaning: `${baseUrl}/cleaning.png`,
    "car-mechanic": `${baseUrl}/car-mechanic.png`,
    "bike-mechanic": `${baseUrl}/bike-mechanic.png`,
    "engine-repair": `${baseUrl}/engine-repair.png`
  };
  return mapping[slug] || `${baseUrl}/electrical.png`;
}

export function AllServicesScreen() {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useApiResource<Category[]>("/services/categories", []);

  const filteredCategories = categories.data.filter((cat) =>
    cat.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.nameEn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Screen title="كل الخدمات" subtitle="تصفح جميع التخصصات المتوفرة على المنصة" scroll={false} style={{ flex: 1 }} showBack={false}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={theme.muted} />
        <TextInput
          placeholder="ابحث عن تخصص (كهرباء، سباكة...)"
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

      {categories.isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredCategories}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={theme.muted} style={{ marginBottom: spacing.sm }} />
              <Text style={styles.emptyText}>لم نجد أي خدمات مطابقة لبحثك</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => {
                navigation.navigate("CreateRequest", {
                  categoryId: item.id,
                  categorySlug: item.slug,
                  categoryNameAr: item.nameAr
                });
              }}
            >
              <Image 
                source={{ uri: getServiceImageUrl(item.slug) }} 
                style={StyleSheet.absoluteFillObject} 
                contentFit="cover" 
              />
              <LinearGradient
                colors={["transparent", "rgba(0, 0, 0, 0.85)"]}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.cardContent}>
                <Text style={styles.nameAr} numberOfLines={1}>{item.nameAr}</Text>
                <Text style={styles.nameEn} numberOfLines={1}>{item.nameEn}</Text>
              </View>
            </Pressable>
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
  row: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: spacing.md
  },
  card: {
    width: "48%",
    height: 120,
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "flex-end"
  },
  cardContent: {
    padding: spacing.sm,
    alignItems: "center",
    width: "100%",
    zIndex: 1
  },
  nameAr: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3
  },
  nameEn: {
    color: "rgba(255, 255, 255, 0.75)",
    fontSize: 11,
    textAlign: "center"
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

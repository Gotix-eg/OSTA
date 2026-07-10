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
  const mapping: Record<string, string> = {
    electricity: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1000&auto=format&fit=crop&v=osta4",
    electrical: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1000&auto=format&fit=crop&v=osta4",
    plumbing: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=1000&auto=format&fit=crop&v=osta5",
    carpentry: "https://images.unsplash.com/photo-1601058268499-e52658b8bb88?q=80&w=1000&auto=format&fit=crop&v=osta4",
    ac: "https://www.ostafy.com/images/services/ac.jpg",
    "ac-maintenance": "https://www.ostafy.com/images/services/ac.jpg",
    appliances: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1000&auto=format&fit=crop&v=osta4",
    painting: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=1000&auto=format&fit=crop&v=osta4",
    aluminum: "https://www.ostafy.com/images/services/aluminum.jpg",
    networks: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop&v=osta4",
    computer: "https://images.unsplash.com/photo-1588508065123-287b28e013da?q=80&w=1000&auto=format&fit=crop&v=osta4",
    "computer-repair": "https://images.unsplash.com/photo-1588508065123-287b28e013da?q=80&w=1000&auto=format&fit=crop&v=osta4",
    cctv: "https://www.ostafy.com/images/services/cameras.jpg",
    cameras: "https://www.ostafy.com/images/services/cameras.jpg"
  };
  return mapping[slug] || "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1000&auto=format&fit=crop";
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

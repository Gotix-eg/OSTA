import { useState } from "react";
import { StyleSheet, Text, View, Pressable, ActivityIndicator, FlatList, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { Screen } from "../../components/Screen";
import { useApiResource } from "../../hooks/useApiResource";
import { useTheme } from "../../context/ThemeContext";
import { spacing } from "../../theme/spacing";

type Category = {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
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
              <View style={styles.iconWrapper}>
                <Ionicons name={getIconName(item.slug)} size={32} color={theme.primary} />
              </View>
              <Text style={styles.nameAr} numberOfLines={1}>{item.nameAr}</Text>
              <Text style={styles.nameEn} numberOfLines={1}>{item.nameEn}</Text>
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
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.xs
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs
  },
  nameAr: {
    color: theme.text,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center"
  },
  nameEn: {
    color: theme.muted,
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

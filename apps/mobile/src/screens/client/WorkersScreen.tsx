import { useState } from "react";
import { StyleSheet, Text, View, Pressable, ActivityIndicator, FlatList, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";

import { AppCard } from "../../components/AppCard";
import { Screen } from "../../components/Screen";
import { useApiResource } from "../../hooks/useApiResource";
import { useTheme } from "../../context/ThemeContext";
import { spacing } from "../../theme/spacing";

interface Worker {
  id: string;
  name: string;
  avatarUrl?: string;
  professionAr: string;
  professionEn: string;
  rating: number;
  ratingCount: number;
  totalJobs: number;
}

export function WorkersScreen() {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch the workers list from the public API
  const workers = useApiResource<Worker[]>("/public/workers", []);

  const filteredWorkers = workers.data.filter((worker) => {
    const name = worker.name || "";
    const profession = worker.professionAr || worker.professionEn || "";
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profession.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <Screen title="دليل الفنيين" subtitle="ابحث عن أمهر الفنيين والحرفيين الموثقين" scroll={false} style={{ flex: 1 }} showBack={false}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={theme.muted} />
        <TextInput
          placeholder="ابحث عن فني، تخصص، أو خدمة..."
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

      {workers.isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredWorkers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color={theme.muted} style={{ marginBottom: spacing.sm }} />
              <Text style={styles.emptyText}>لم نجد أي فنيين مطابقين لبحثك</Text>
            </View>
          }
          renderItem={({ item }) => (
            <AppCard style={styles.card}>
              <Pressable onPress={() => navigation.navigate("WorkerProfile", { workerId: item.id })}>
                <View style={styles.workerRow}>
                  <View style={styles.workerDetails}>
                    <View style={styles.workerTitleRow}>
                      <Text style={styles.workerName} numberOfLines={1}>{item.name}</Text>
                    </View>

                    <Text style={styles.workerProfession} numberOfLines={1}>التخصص: {item.professionAr || item.professionEn || "فني محترف"}</Text>
                    
                    <View style={styles.workerMeta}>
                      <View style={styles.workerStats}>
                        <Ionicons name="briefcase-outline" size={14} color={theme.muted} />
                        <Text style={styles.statsText}>{item.totalJobs && item.totalJobs > 0 ? `${item.totalJobs} عملية ناجحة` : "فني جديد"}</Text>
                      </View>
                      
                      <View style={styles.workerRating}>
                        <Ionicons name="star" size={14} color="#D7A24D" />
                        <Text style={styles.ratingText}>
                          {item.ratingCount && item.ratingCount > 0 ? `${item.rating?.toFixed(1)} (${item.ratingCount})` : "جديد (لا تقييمات)"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.avatarWrapper}>
                    {item.avatarUrl ? (
                      <Image source={item.avatarUrl} style={styles.avatarImage as any} contentFit="cover" />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Ionicons name="person" size={28} color={theme.muted} />
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
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
  workerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  workerDetails: {
    flex: 1,
    marginRight: spacing.md,
    gap: 4
  },
  workerTitleRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center"
  },
  workerName: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "900",
    textAlign: "right",
    flex: 1,
    marginLeft: 6
  },
  workerProfession: {
    color: theme.primary,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "right"
  },
  workerMeta: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xs
  },
  workerStats: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    maxWidth: "60%"
  },
  statsText: {
    color: theme.muted,
    fontSize: 11,
    fontWeight: "600"
  },
  workerRating: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4
  },
  ratingText: {
    color: theme.text,
    fontSize: 11,
    fontWeight: "800"
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.border
  },
  avatarImage: {
    width: "100%",
    height: "100%"
  },
  avatarPlaceholder: {
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

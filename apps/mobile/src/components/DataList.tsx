import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useTheme } from "../context/ThemeContext";
import { spacing } from "../theme/spacing";

type DataListProps = {
  title: string;
  items: Array<Record<string, unknown>>;
  isLoading?: boolean;
  emptyText?: string;
};

function itemLabel(item: Record<string, unknown>) {
  const value = item.nameAr ?? item.name ?? item.title ?? item.shopNameAr ?? item.shopName ?? item.requestNumber ?? item.id;
  return typeof value === "string" || typeof value === "number" ? String(value) : "عنصر";
}

function itemMeta(item: Record<string, unknown>) {
  const value = item.status ?? item.city ?? item.category ?? item.price ?? item.createdAt;
  return typeof value === "string" || typeof value === "number" ? String(value) : null;
}

export function DataList({ title, items, isLoading, emptyText = "لا توجد بيانات حالياً" }: DataListProps) {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {isLoading ? <ActivityIndicator color={theme.primary} /> : null}
      {!isLoading && items.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.empty}>{emptyText}</Text>
        </View>
      ) : null}
      {items.slice(0, 8).map((item, index) => (
        <View key={String(item.id ?? index)} style={styles.row}>
          <Text style={styles.rowText}>{itemLabel(item)}</Text>
          {itemMeta(item) ? <Text style={styles.meta}>{itemMeta(item)}</Text> : null}
        </View>
      ))}
    </View>
  );
}

const makeStyles = (theme: ReturnType<typeof useTheme>["theme"]) => StyleSheet.create({
  container: {
    gap: spacing.md
  },
  title: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "right"
  },
  emptyBox: {
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.backgroundRaised,
    borderRadius: 8,
    padding: spacing.lg
  },
  empty: {
    color: theme.muted,
    textAlign: "right"
  },
  row: {
    minHeight: 58,
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs
  },
  rowText: {
    color: theme.text,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "right"
  },
  meta: {
    color: theme.muted,
    fontSize: 12,
    textAlign: "right"
  }
});

import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text } from "react-native";

import { useTheme } from "../context/ThemeContext";
import { spacing } from "../theme/spacing";

export function ThemeToggle() {
  const { mode, theme, toggleMode } = useTheme();
  const styles = makeStyles(theme);
  const isDark = mode === "dark";

  return (
    <Pressable accessibilityRole="switch" accessibilityState={{ checked: isDark }} style={styles.toggle} onPress={toggleMode}>
      <Ionicons name={isDark ? "moon" : "sunny"} color={theme.primary} size={18} />
      <Text style={styles.text}>{isDark ? "دارك مود" : "لايت مود"}</Text>
    </Pressable>
  );
}

const makeStyles = (theme: ReturnType<typeof useTheme>["theme"]) => StyleSheet.create({
  toggle: {
    minHeight: 42,
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface,
    paddingHorizontal: spacing.md
  },
  text: {
    color: theme.text,
    fontWeight: "800"
  }
});

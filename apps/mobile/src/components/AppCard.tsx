import { StyleSheet, View, type ViewProps } from "react-native";

import { useTheme } from "../context/ThemeContext";
import { spacing } from "../theme/spacing";

export function AppCard({ style, ...props }: ViewProps) {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  return <View style={[styles.card, style]} {...props} />;
}

const makeStyles = (theme: ReturnType<typeof useTheme>["theme"]) => StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface,
    padding: spacing.lg,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: theme.mode === "dark" ? 0.2 : 0.08,
    shadowRadius: 18,
    elevation: 2
  }
});

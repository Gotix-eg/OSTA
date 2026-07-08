import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "../context/ThemeContext";
import { spacing } from "../theme/spacing";

type StatTileProps = {
  label: string;
  value: string | number;
  tone?: "primary" | "accent" | "success" | "warning";
};

export function StatTile({ label, value, tone = "primary" }: StatTileProps) {
  const { theme } = useTheme();
  const styles = makeStyles(theme, tone);

  return (
    <View style={styles.tile}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const makeStyles = (theme: ReturnType<typeof useTheme>["theme"], tone: NonNullable<StatTileProps["tone"]>) => {
  const toneMap = {
    primary: [theme.primary, theme.primarySoft],
    accent: [theme.accent, theme.accentSoft],
    success: [theme.success, theme.successSoft],
    warning: [theme.warning, theme.warningSoft]
  } as const;

  return StyleSheet.create({
    tile: {
      flex: 1,
      minWidth: 132,
      borderRadius: 8,
      backgroundColor: toneMap[tone][1],
      padding: spacing.md,
      gap: spacing.xs
    },
    value: {
      color: toneMap[tone][0],
      fontSize: 22,
      fontWeight: "900",
      textAlign: "right"
    },
    label: {
      color: theme.muted,
      fontSize: 12,
      fontWeight: "700",
      textAlign: "right"
    }
  });
};

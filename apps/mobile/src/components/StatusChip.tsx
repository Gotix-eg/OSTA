import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "../context/ThemeContext";
import { spacing } from "../theme/spacing";

type StatusChipProps = {
  label: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "accent";
};

export function StatusChip({ label, tone = "neutral" }: StatusChipProps) {
  const { theme } = useTheme();
  const styles = makeStyles(theme, tone);

  return (
    <View style={styles.chip}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const makeStyles = (theme: ReturnType<typeof useTheme>["theme"], tone: NonNullable<StatusChipProps["tone"]>) => {
  const toneMap = {
    neutral: [theme.muted, theme.surfaceAlt],
    success: [theme.success, theme.successSoft],
    warning: [theme.warning, theme.warningSoft],
    danger: [theme.danger, theme.dangerSoft],
    accent: [theme.accent, theme.accentSoft]
  } as const;

  return StyleSheet.create({
    chip: {
      alignSelf: "flex-end",
      borderRadius: 999,
      backgroundColor: toneMap[tone][1],
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs
    },
    text: {
      color: toneMap[tone][0],
      fontSize: 12,
      fontWeight: "800"
    }
  });
};

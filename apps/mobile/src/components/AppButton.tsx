import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle
} from "react-native";

import { useTheme } from "../context/ThemeContext";
import { spacing } from "../theme/spacing";

type AppButtonProps = Omit<PressableProps, "style"> & {
  title: string;
  variant?: "primary" | "secondary" | "ghost";
  isLoading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AppButton({ title, variant = "primary", isLoading, disabled, style, ...props }: AppButtonProps) {
  const isDisabled = disabled || isLoading;
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style
      ]}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === "primary" ? theme.primaryText : theme.primary} />
      ) : (
        <Text style={[styles.text, variant !== "primary" && styles.secondaryText]}>{title}</Text>
      )}
    </Pressable>
  );
}

const makeStyles = (theme: ReturnType<typeof useTheme>["theme"]) => StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md
  },
  primary: {
    backgroundColor: theme.primary
  },
  secondary: {
    backgroundColor: theme.primarySoft
  },
  ghost: {
    backgroundColor: "transparent"
  },
  disabled: {
    opacity: 0.55
  },
  pressed: {
    opacity: 0.82
  },
  text: {
    color: theme.primaryText,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center"
  },
  secondaryText: {
    color: theme.primary
  }
});

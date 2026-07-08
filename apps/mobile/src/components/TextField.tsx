import { StyleSheet, Text, TextInput, type TextInputProps, View } from "react-native";

import { useTheme } from "../context/ThemeContext";
import { spacing } from "../theme/spacing";

type TextFieldProps = TextInputProps & {
  label: string;
};

export function TextField({ label, style, ...props }: TextFieldProps) {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={theme.subtle}
        style={[styles.input, style]}
        textAlign="right"
        {...props}
      />
    </View>
  );
}

const makeStyles = (theme: ReturnType<typeof useTheme>["theme"]) => StyleSheet.create({
  container: {
    gap: spacing.sm
  },
  label: {
    color: theme.text,
    fontSize: 14,
    fontWeight: "700"
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    backgroundColor: theme.surface,
    color: theme.text,
    paddingHorizontal: spacing.md,
    fontSize: 16
  }
});

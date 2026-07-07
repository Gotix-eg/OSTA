import { SafeAreaView, ScrollView, StyleSheet, Text, View, Pressable, type ViewProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { useTheme } from "../context/ThemeContext";
import { spacing } from "../theme/spacing";

type ScreenProps = ViewProps & {
  title?: string;
  subtitle?: string;
  scroll?: boolean;
  showBack?: boolean;
};

export function Screen({ title, subtitle, scroll = true, showBack, children, style, ...props }: ScreenProps) {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const navigation = useNavigation<any>();

  // Show back button if showBack is explicitly true, or if it is undefined and navigation can go back
  const canGoBack = navigation.canGoBack();
  const displayBackButton = showBack !== false && (showBack || canGoBack);

  const content = (
    <View style={[styles.content, style]} {...props}>
      {displayBackButton && (
        <Pressable 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-forward" size={20} color={theme.primary} />
          <Text style={styles.backText}>رجوع</Text>
        </Pressable>
      )}
      {(title || subtitle) && (
        <View style={styles.header}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      )}
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {scroll ? (
        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={{ flexGrow: 1 }} 
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const makeStyles = (theme: ReturnType<typeof useTheme>["theme"]) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    gap: spacing.lg
  },
  backButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: spacing.xs,
    paddingVertical: spacing.xs
  },
  backText: {
    color: theme.primary,
    fontSize: 14,
    fontWeight: "700"
  },
  header: {
    gap: spacing.sm
  },
  title: {
    color: theme.text,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    textAlign: "right"
  },
  subtitle: {
    color: theme.muted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "right"
  }
});

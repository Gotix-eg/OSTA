import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { spacing } from "../theme/spacing";

export function GuestGate({ message = "يرجى تسجيل الدخول للوصول إلى هذه الصفحة" }: { message?: string }) {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const styles = makeStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="lock-closed-outline" size={64} color={theme.primary} />
      </View>
      <Text style={styles.title}>تسجيل الدخول مطلوب</Text>
      <Text style={styles.message}>{message}</Text>
      <Pressable style={styles.button} onPress={() => navigation.navigate("Auth")}>
        <Text style={styles.buttonText}>تسجيل الدخول / تسجيل جديد</Text>
      </Pressable>
    </View>
  );
}

const makeStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    backgroundColor: theme.background
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.text,
    marginBottom: spacing.sm,
    textAlign: "center"
  },
  message: {
    fontSize: 14,
    color: theme.muted,
    textAlign: "center",
    marginBottom: spacing.xl,
    lineHeight: 20
  },
  button: {
    backgroundColor: theme.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 24,
    width: "100%",
    alignItems: "center"
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold"
  }
});

import { Text, View, StyleSheet } from "react-native";

import { AppButton } from "../../components/AppButton";
import { AppCard } from "../../components/AppCard";
import { Screen } from "../../components/Screen";
import { ThemeToggle } from "../../components/ThemeToggle";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { spacing } from "../../theme/spacing";
import { formatUserName } from "../../utils/formatters";

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  return (
    <Screen title="الملف الشخصي" subtitle={user?.role ? `نوع الحساب: ${user.role}` : undefined} showBack={false}>
      <ThemeToggle />
      <AppCard style={styles.panel}>
        <Text style={styles.name}>{formatUserName(user?.firstName, user?.lastName) || "مستخدم أُسطى"}</Text>
        <Text style={styles.meta}>{user?.phone}</Text>
        {user?.email ? <Text style={styles.meta}>{user.email}</Text> : null}
      </AppCard>
      <AppButton title="تسجيل الخروج" variant="secondary" onPress={logout} />
    </Screen>
  );
}

const makeStyles = (theme: ReturnType<typeof useTheme>["theme"]) => StyleSheet.create({
  panel: {
    gap: spacing.sm
  },
  name: {
    color: theme.text,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "right"
  },
  meta: {
    color: theme.muted,
    textAlign: "right"
  }
});

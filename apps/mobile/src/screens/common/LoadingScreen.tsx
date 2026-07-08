import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useTheme } from "../../context/ThemeContext";

export function LoadingScreen() {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  return (
    <View style={styles.container}>
      <ActivityIndicator color={theme.primary} size="large" />
    </View>
  );
}

const makeStyles = (theme: ReturnType<typeof useTheme>["theme"]) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.background
  }
});

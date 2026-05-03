import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  // يمكنك تغيير هذا الرابط إلى رابطك النهائي (مثل osta.eg) عندما تكون مستعداً
  const OSTA_URL = 'https://osta-c3zejipbw-gotixs-projects.vercel.app/';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#000000" />
      <WebView 
        source={{ uri: OSTA_URL }} 
        style={styles.webview}
        allowsBackForwardNavigationGestures={true}
        bounces={false}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: Platform.OS === 'android' ? 25 : 0, // Padding for Android status bar
  },
  webview: {
    flex: 1,
    backgroundColor: '#000000',
  },
});

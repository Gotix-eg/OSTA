import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView, Platform, BackHandler, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRef, useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

// Trigger build for local AAB workflow
export default function App() {
  // يمكنك تغيير هذا الرابط إلى رابطك النهائي (مثل osta.eg) عندما تكون مستعداً
  const OSTA_URL = 'https://osta.vercel.app/';
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    const backAction = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true; // Prevent default behavior (exit app)
      }
      return false; // Let default behavior happen (exit app)
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [canGoBack]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#000000" />
      <View style={{ flex: 1 }}>
        <WebView 
          ref={webViewRef}
          source={{ uri: OSTA_URL }} 
          style={styles.webview}
          allowsBackForwardNavigationGestures={true}
          bounces={false}
          showsVerticalScrollIndicator={false}
          onNavigationStateChange={(navState) => {
            setCanGoBack(navState.canGoBack);
          }}
        />
        
        {/* Floating Back Button (Appears only when you can go back) */}
        {canGoBack && (
          <TouchableOpacity 
            style={styles.floatingButton} 
            onPress={() => webViewRef.current?.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
        )}
      </View>
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
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#d4af37', // Gold color to match OSTA theme
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
});

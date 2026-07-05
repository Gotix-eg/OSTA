import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView, Platform, BackHandler, TouchableOpacity, View, Linking, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRef, useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function App() {
  const OSTA_URL = 'https://www.ostafy.com/';
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    const backAction = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [canGoBack]);

  // فتح الروابط الخارجية في تطبيقاتها المخصصة
  const openExternalURL = (url) => {
    try {
      // معالجة رابط intent:// الخاص بأندرويد
      if (Platform.OS === 'android' && url.startsWith('intent://')) {
        const schemeMatch = url.match(/scheme=([^;#]+)/);
        const packageMatch = url.match(/package=([^;#]+)/);
        if (schemeMatch && schemeMatch[1]) {
          const scheme = schemeMatch[1];
          const body = url.substring('intent://'.length).split('#Intent;')[0];
          const newUrl = `${scheme}://${body}`;
          Linking.openURL(newUrl).catch(() => {
            // إذا لم يكن التطبيق مثبتاً، افتح المتجر
            if (packageMatch && packageMatch[1]) {
              Linking.openURL(`market://details?id=${packageMatch[1]}`).catch(() => {});
            }
          });
        }
        return;
      }

      // فتح الرابط مباشرة
      Linking.openURL(url).catch((err) => {
        console.warn('Cannot open URL:', url, err);
      });
    } catch (e) {
      console.warn('openExternalURL error:', e);
    }
  };

  // اعتراض أي رابط قبل تحميله في WebView
  const handleShouldStartLoad = (request) => {
    const url = request.url;

    // السماح بتحميل الصفحة الأولى دائماً
    if (url === OSTA_URL || url === 'about:blank') return true;

    // اعتراض الروابط غير HTTP
    const isExternalScheme = !url.startsWith('http://') && !url.startsWith('https://');

    // اعتراض روابط واتساب حتى لو بدأت بـ https
    const isWhatsApp = url.includes('wa.me') || url.includes('api.whatsapp.com') || url.includes('whatsapp.com/send');

    // اعتراض روابط مواقع التواصل الاجتماعي الخارجية
    const isSocialMedia =
      url.includes('facebook.com') ||
      url.includes('instagram.com') ||
      url.includes('twitter.com') ||
      url.includes('youtube.com') ||
      url.includes('t.me') || // تيليجرام
      url.includes('maps.google.com') ||
      url.includes('goo.gl/maps');

    if (isExternalScheme || isWhatsApp || isSocialMedia) {
      openExternalURL(url);
      return false;
    }

    return true;
  };

  // JavaScript لاعتراض نوافذ target="_blank" داخل الصفحة
  const injectedJavaScript = `
    (function() {
      // منع فتح نوافذ جديدة وتحويلها للنافذة الحالية
      var originalOpen = window.open;
      window.open = function(url, name, features) {
        if (url && url !== 'about:blank') {
          window.location.href = url;
        }
        return null;
      };

      // اعتراض روابط target="_blank"
      document.addEventListener('click', function(e) {
        var target = e.target;
        while (target && target.tagName !== 'A') {
          target = target.parentElement;
        }
        if (target && target.tagName === 'A') {
          var href = target.getAttribute('href');
          var targetAttr = target.getAttribute('target');
          if (targetAttr === '_blank' && href) {
            e.preventDefault();
            window.location.href = href;
          }
        }
      }, true);
    })();
    true;
  `;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#000000" />
      <View style={{ flex: 1 }}>
        <WebView
          ref={webViewRef}
          source={{ uri: OSTA_URL }}
          style={styles.webview}
          // السماح بجميع الأصول لتفادي حجب أي محتوى
          originWhitelist={['*']}
          // اعتراض الروابط قبل تحميلها
          onShouldStartLoadWithRequest={handleShouldStartLoad}
          // تحديث حالة التنقل
          onNavigationStateChange={(navState) => {
            setCanGoBack(navState.canGoBack);
          }}
          // JavaScript مُحقون لمعالجة target="_blank"
          injectedJavaScript={injectedJavaScript}
          // معالجة أخطاء التحميل بدلاً من تعطل التطبيق
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error:', nativeEvent);
            // إعادة تحميل الصفحة تلقائياً عند الخطأ
            if (webViewRef.current) {
              webViewRef.current.reload();
            }
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView HTTP error:', nativeEvent.statusCode);
          }}
          // إعدادات Android
          allowsBackForwardNavigationGestures={true}
          bounces={false}
          showsVerticalScrollIndicator={false}
          // السماح بمحتوى مختلط
          mixedContentMode="compatibility"
          // تحسين الأداء
          cacheEnabled={true}
          domStorageEnabled={true}
          javaScriptEnabled={true}
          // منع تكبير النص التلقائي
          textZoom={100}
        />

        {/* زر الرجوع العائم */}
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
    paddingTop: Platform.OS === 'android' ? 25 : 0,
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
    backgroundColor: '#d4af37',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
});

import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  SafeAreaView,
  Platform,
  BackHandler,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useRef, useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function App() {
  const OSTA_URL = 'https://www.ostafy.com/';
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);

  // =============================================
  // معالجة زر الرجوع الخلفي في الأندرويد
  // =============================================
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

  // =============================================
  // فتح الروابط الخارجية في تطبيقاتها
  // =============================================
  const openExternalURL = (url) => {
    if (!url || url === 'about:blank') return;
    try {
      // معالجة intent:// (أندرويد)
      if (Platform.OS === 'android' && url.startsWith('intent://')) {
        const schemeMatch = url.match(/scheme=([^;#]+)/);
        const packageMatch = url.match(/package=([^;#]+)/);
        if (schemeMatch?.[1]) {
          const body = url.substring('intent://'.length).split('#Intent;')[0];
          const newUrl = `${schemeMatch[1]}://${body}`;
          Linking.openURL(newUrl).catch(() => {
            if (packageMatch?.[1]) {
              Linking.openURL(`market://details?id=${packageMatch[1]}`).catch(() => {});
            }
          });
        }
        return;
      }
      Linking.openURL(url).catch((e) => console.warn('Linking error:', e));
    } catch (e) {
      console.warn('openExternalURL error:', e);
    }
  };

  // =============================================
  // اعتراض الروابط قبل تحميلها في WebView
  // =============================================
  const handleShouldStartLoad = (request) => {
    const url = request.url;
    if (!url || url === 'about:blank') return true;

    const isHTTP = url.startsWith('http://') || url.startsWith('https://');
    const isExternal =
      url.includes('wa.me') ||
      url.includes('api.whatsapp.com') ||
      url.includes('whatsapp.com/send') ||
      url.includes('t.me/') ||
      url.includes('maps.google') ||
      url.includes('goo.gl/maps') ||
      url.includes('play.google.com');

    // أي رابط مش http أو https → افتحه خارجياً
    if (!isHTTP) {
      openExternalURL(url);
      return false;
    }

    // روابط خارجية معروفة → افتحها خارجياً
    if (isExternal) {
      openExternalURL(url);
      return false;
    }

    return true;
  };

  // =============================================
  // JavaScript Bridge - الحل الجذري للمشكلة
  // يعترض كل الـ clicks قبل أي شيء ويرسلها لـ RN
  // =============================================
  const injectedJavaScript = `
    (function() {
      // اعتراض كل الـ clicks على أي رابط
      document.addEventListener('click', function(e) {
        var el = e.target;
        // ابحث عن أقرب عنصر <a> حتى لو الضغط على عنصر داخله
        for (var i = 0; i < 5; i++) {
          if (!el) break;
          if (el.tagName === 'A') {
            var href = el.href || el.getAttribute('href');
            if (href && href !== '' && !href.startsWith('javascript:')) {
              var isHTTP = href.startsWith('http://') || href.startsWith('https://');
              var isSameOrigin = href.startsWith(window.location.origin);
              
              // أي رابط مش في نفس الموقع → أرسله لـ React Native
              if (!isHTTP || !isSameOrigin) {
                e.preventDefault();
                e.stopPropagation();
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'OPEN_EXTERNAL',
                  url: href
                }));
                return;
              }
              
              // روابط واتساب وتليجرام ومواقع خارجية → أرسلها لـ RN
              var externalPatterns = ['wa.me', 'api.whatsapp.com', 't.me/', 'maps.google', 'play.google'];
              for (var j = 0; j < externalPatterns.length; j++) {
                if (href.includes(externalPatterns[j])) {
                  e.preventDefault();
                  e.stopPropagation();
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'OPEN_EXTERNAL',
                    url: href
                  }));
                  return;
                }
              }
            }
            break;
          }
          el = el.parentElement;
        }
      }, true);

      // منع window.open من فتح نوافذ جديدة
      window.open = function(url) {
        if (url && url !== 'about:blank') {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'OPEN_EXTERNAL',
            url: url
          }));
        }
        return null;
      };

      // إضافة padding في الأسفل لتجنب تغطية المنيو بأزرار الأندرويد
      var style = document.createElement('style');
      style.innerHTML = \`
        /* padding للمنيو السفلي على الأجهزة التي فيها شريط تنقل */
        body {
          padding-bottom: env(safe-area-inset-bottom, 0px) !important;
        }
        /* ضمان أن المنيو السفلي فوق شريط التنقل */
        nav, [class*="bottom-nav"], [class*="bottomNav"], 
        [class*="bottom-bar"], [class*="bottomBar"],
        [class*="footer-nav"], [class*="tab-bar"],
        [class*="navbar"][style*="bottom"],
        .btm-nav, .bottom-navigation {
          padding-bottom: env(safe-area-inset-bottom, 16px) !important;
          margin-bottom: 0 !important;
        }
      \`;
      document.head.appendChild(style);

      true;
    })();
  `;

  // =============================================
  // معالجة الرسائل من JavaScript Bridge
  // =============================================
  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'OPEN_EXTERNAL' && data.url) {
        openExternalURL(data.url);
      }
    } catch (e) {
      console.warn('handleMessage error:', e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#000000" />
      <View style={styles.webviewContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: OSTA_URL }}
          style={styles.webview}
          // السماح بجميع الأصول
          originWhitelist={['*']}
          // اعتراض الروابط
          onShouldStartLoadWithRequest={handleShouldStartLoad}
          // JavaScript Bridge
          injectedJavaScript={injectedJavaScript}
          onMessage={handleMessage}
          // تتبع التنقل
          onNavigationStateChange={(navState) => {
            setCanGoBack(navState.canGoBack);
          }}
          // معالجة الأخطاء بدلاً من التعطل
          onError={() => {
            setTimeout(() => webViewRef.current?.reload(), 1000);
          }}
          onHttpError={(e) => {
            console.warn('HTTP Error:', e.nativeEvent.statusCode);
          }}
          // إعدادات أساسية
          javaScriptEnabled={true}
          domStorageEnabled={true}
          cacheEnabled={true}
          mixedContentMode="compatibility"
          allowsBackForwardNavigationGestures={true}
          bounces={false}
          showsVerticalScrollIndicator={false}
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
  webviewContainer: {
    flex: 1,
    // padding إضافي في الأسفل لتجنب تغطية المنيو بأزرار الأندرويد
    paddingBottom: Platform.OS === 'android' ? 0 : 0,
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

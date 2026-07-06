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
  const OSTA_URL = 'https://ostafy.com/';
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
  // فتح الروابط الخارجية في تطبيقاتها بشكل آمن
  // =============================================
  const openExternalURL = async (url) => {
    if (!url || url === 'about:blank' || url.startsWith('data:') || url.startsWith('blob:')) return;
    try {
      // معالجة intent:// (أندرويد)
      if (Platform.OS === 'android' && url.startsWith('intent://')) {
        const schemeMatch = url.match(/scheme=([^;#]+)/);
        const packageMatch = url.match(/package=([^;#]+)/);
        if (schemeMatch?.[1]) {
          const body = url.substring('intent://'.length).split('#Intent;')[0];
          const newUrl = `${schemeMatch[1]}://${body}`;
          const canOpen = await Linking.canOpenURL(newUrl).catch(() => false);
          if (canOpen) {
            await Linking.openURL(newUrl).catch(() => {});
          } else if (packageMatch?.[1]) {
            await Linking.openURL(`market://details?id=${packageMatch[1]}`).catch(() => {});
          }
        }
        return;
      }

      const canOpen = await Linking.canOpenURL(url).catch(() => false);
      if (canOpen) {
        await Linking.openURL(url).catch((e) => console.warn('Linking error:', e));
      }
    } catch (e) {
      console.warn('openExternalURL error:', e);
    }
  };

  // =============================================
  // اعتراض الروابط قبل تحميلها في WebView
  // =============================================
  const handleShouldStartLoad = (request) => {
    const url = request.url;
    if (!url || url === 'about:blank' || url.startsWith('data:') || url.startsWith('blob:')) return true;

    const isHTTP = url.startsWith('http://') || url.startsWith('https://');
    const isOstafy = url.includes('ostafy.com');

    // روابط HTTP/HTTPS داخل نطاق ostafy → دعها تفتح داخل التطبيق
    if (isHTTP && isOstafy) {
      const isExternalApp =
        url.includes('wa.me') ||
        url.includes('api.whatsapp.com') ||
        url.includes('whatsapp.com/send') ||
        url.includes('t.me/') ||
        url.includes('maps.google') ||
        url.includes('goo.gl/maps') ||
        url.includes('play.google.com');

      if (isExternalApp) {
        openExternalURL(url);
        return false;
      }
      return true;
    }

    // أي شيء آخر (رقم هاتف، بريد، واتساب مباشر، روابط خارجية) → افتحه خارجياً
    if (!url.startsWith('/') && !url.startsWith('#') && !url.startsWith('.')) {
      openExternalURL(url);
    }
    return false;
  };

  // =============================================
  // JavaScript Bridge - معالجة ضغطات الروابط بالـ DOM
  // =============================================
  const injectedJavaScript = `
    (function() {
      document.addEventListener('click', function(e) {
        var el = e.target;
        for (var i = 0; i < 5; i++) {
          if (!el) break;
          if (el.tagName === 'A') {
            var href = el.href || el.getAttribute('href');
            if (href && href !== '' && !href.startsWith('javascript:')) {
              var isHTTP = href.startsWith('http://') || href.startsWith('https://');
              var isRelative = href.startsWith('/') || href.startsWith('.') || href.startsWith('#') || !href.includes(':');
              
              var isOstafy = false;
              try {
                var urlObj = new URL(href, window.location.href);
                if (urlObj.hostname.endsWith('ostafy.com') || urlObj.hostname === 'ostafy.com') {
                  isOstafy = true;
                }
              } catch(e) {
                if (isRelative) isOstafy = true;
              }

              // إذا كان رابط داخلي أو نسبي → دعه يعمل طبيعياً داخل الـ WebView
              if (isRelative || isOstafy) {
                var externalPatterns = ['wa.me', 'api.whatsapp.com', 't.me/', 'maps.google', 'play.google'];
                var isSpecialExternal = false;
                for (var j = 0; j < externalPatterns.length; j++) {
                  if (href.includes(externalPatterns[j])) {
                    isSpecialExternal = true;
                    break;
                  }
                }
                if (!isSpecialExternal) {
                  return; // دعه يمر بدون اعتراض
                }
              }
              
              // روابط واتساب، تليجرام، خرائط، تليفون، أو مواقع خارجية أخرى
              e.preventDefault();
              e.stopPropagation();
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'OPEN_EXTERNAL',
                url: href
              }));
            }
            break;
          }
          el = el.parentElement;
        }
      }, true);

      // منع window.open من التسبب في انهيار التطبيق
      window.open = function(url) {
        if (url && url !== 'about:blank') {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'OPEN_EXTERNAL',
            url: url
          }));
        }
        return null;
      };

      // تحسينات التصميم ومراعاة الـ Safe Area للـ Bottom Navigation
      var style = document.createElement('style');
      style.innerHTML = \`
        body {
          padding-bottom: env(safe-area-inset-bottom, 0px) !important;
        }
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
          originWhitelist={['*']}
          onShouldStartLoadWithRequest={handleShouldStartLoad}
          injectedJavaScript={injectedJavaScript}
          onMessage={handleMessage}
          onNavigationStateChange={(navState) => {
            setCanGoBack(navState.canGoBack);
          }}
          onError={() => {
            setTimeout(() => webViewRef.current?.reload(), 1000);
          }}
          onHttpError={(e) => {
            console.warn('HTTP Error:', e.nativeEvent.statusCode);
          }}
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

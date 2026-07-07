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
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const OSTA_URL = 'https://ostafy.com/';
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [pushToken, setPushToken] = useState('');

  // =============================================
  // تفعيل التنبيهات الفورية والحصول على الرمز
  // =============================================
  useEffect(() => {
    async function registerForPushNotificationsAsync() {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          console.warn('Failed to get push token for push notification!');
          return;
        }
        const projectId = '69b907c6-1b86-4a22-ad06-7833c6800262';
        try {
          const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
          const token = tokenData.data;
          setPushToken(token);
        } catch (e) {
          console.warn('Error getting Expo Push Token:', e);
        }
      } else {
        console.warn('Must use physical device for Push Notifications');
      }
    }

    registerForPushNotificationsAsync();
  }, []);

  // حقن الرمز في الـ WebView عند تغير الرمز
  useEffect(() => {
    if (pushToken && webViewRef.current) {
      const injectTokenScript = `
        (function() {
          window.EXPO_PUSH_TOKEN = "${pushToken}";
          window.postMessage(JSON.stringify({ type: 'SET_PUSH_TOKEN', token: "${pushToken}" }), "*");
          console.log("Token injected dynamically from Native:", "${pushToken}");
        })();
      `;
      webViewRef.current.injectJavaScript(injectTokenScript);
    }
  }, [pushToken]);

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

      // التحقق من صحة الرابط والـ scheme لتجنب أي انهيار للـ Android
      const hasValidScheme = /^(https?|mailto|tel|sms|whatsapp|tg|intent|market):/i.test(url);
      if (!hasValidScheme) {
        console.warn('Skipping invalid scheme URL:', url);
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
    
    // الحصول على الـ host الخاص بـ OSTA_URL والـ target url بشكل آمن وديناميكي
    let ostaHost = '';
    let targetHost = '';
    try {
      ostaHost = new URL(OSTA_URL).hostname.replace(/^www\./, '');
      if (isHTTP) {
        targetHost = new URL(url).hostname.replace(/^www\./, '');
      }
    } catch (e) {
      console.warn('URL parsing error in handleShouldStartLoad:', e);
    }

    const isInternal = isHTTP && (targetHost === ostaHost || targetHost.endsWith('.' + ostaHost));

    // روابط HTTP/HTTPS داخل نطاق الموقع → دعها تفتح داخل التطبيق
    if (isInternal) {
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
      window.EXPO_PUSH_TOKEN = "${pushToken || ''}";
      document.addEventListener('click', function(e) {
        var el = e.target;
        for (var i = 0; i < 5; i++) {
          if (!el) break;
          if (el.tagName === 'A') {
            var href = el.href || el.getAttribute('href');
            if (href && href !== '' && !href.startsWith('javascript:')) {
              var isHTTP = href.startsWith('http://') || href.startsWith('https://');
              var isRelative = href.startsWith('/') || href.startsWith('.') || href.startsWith('#') || !href.includes(':');
              
              var isInternal = false;
              try {
                var urlObj = new URL(href, window.location.href);
                var currentHost = window.location.hostname.replace(/^www\./, '');
                var targetHost = urlObj.hostname.replace(/^www\./, '');
                if (targetHost === currentHost || targetHost.endsWith('.' + currentHost)) {
                  isInternal = true;
                }
              } catch(e) {
                if (isRelative) isInternal = true;
              }

              // إذا كان رابط داخلي أو نسبي → دعه يعمل طبيعياً داخل الـ WebView
              if (isRelative || isInternal) {
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
      } else if (data.type === 'GET_PUSH_TOKEN') {
        if (pushToken && webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            (function() {
              window.EXPO_PUSH_TOKEN = "${pushToken}";
              window.postMessage(JSON.stringify({ type: 'SET_PUSH_TOKEN', token: "${pushToken}" }), "*");
            })();
          `);
        }
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

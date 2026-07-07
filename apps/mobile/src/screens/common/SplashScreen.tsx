import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const GOLD = "#f5bd18";
const GOLD_DIM = "rgba(245,189,24,0.18)";
const GOLD_MID = "rgba(245,189,24,0.55)";

// Single rising spark
function Spark({ index }: { index: number }) {
  const y = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const x = useRef(width * 0.2 + Math.random() * width * 0.6).current;
  const size = 1.5 + Math.random() * 3;
  const dur = 1400 + Math.random() * 1800;
  const startDelay = index * 180 + Math.random() * 400;

  useEffect(() => {
    const run = () => {
      y.setValue(height * 0.7);
      opacity.setValue(0);
      Animated.parallel([
        Animated.sequence([
          Animated.delay(startDelay),
          Animated.timing(y, { toValue: height * 0.1, duration: dur, useNativeDriver: true, easing: Easing.linear }),
        ]),
        Animated.sequence([
          Animated.delay(startDelay),
          Animated.timing(opacity, { toValue: 0.9, duration: 300, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.6, duration: dur - 500, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]),
      ]).start(() => setTimeout(run, Math.random() * 600 + 200));
    };
    run();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x,
        top: 0,
        width: size,
        height: size * 3,
        borderRadius: size,
        backgroundColor: GOLD,
        opacity,
        transform: [{ translateY: y }],
        shadowColor: GOLD,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 4,
      }}
    />
  );
}

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {

  /* ── icon phase ── */
  const iconScale   = useRef(new Animated.Value(0)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const iconRotate  = useRef(new Animated.Value(0)).current;

  /* ── glow rings ── */
  const ring1Scale   = useRef(new Animated.Value(0.6)).current;
  const ring1Opacity = useRef(new Animated.Value(0)).current;
  const ring2Scale   = useRef(new Animated.Value(0.6)).current;
  const ring2Opacity = useRef(new Animated.Value(0)).current;

  /* ── logo text reveal ── */
  const logoOpacity  = useRef(new Animated.Value(0)).current;
  const logoScale    = useRef(new Animated.Value(0.9)).current;
  const logoY        = useRef(new Animated.Value(15)).current;

  /* ── line + tagline + promo ── */
  const lineScale    = useRef(new Animated.Value(0)).current;
  const tagOpacity   = useRef(new Animated.Value(0)).current;
  const promoOpacity = useRef(new Animated.Value(0)).current;
  const promoY       = useRef(new Animated.Value(10)).current;

  /* ── exit ── */
  const exitOpacity  = useRef(new Animated.Value(1)).current;
  const exitScale    = useRef(new Animated.Value(1)).current;

  /* ── glitch shift ── */
  const glitch       = useRef(new Animated.Value(0)).current;

  const rotate = iconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  useEffect(() => {
    Animated.sequence([
      Animated.delay(150),

      // 1. Icon spins and scales in with glow rings
      Animated.parallel([
        Animated.spring(iconScale,   { toValue: 1,   useNativeDriver: true, tension: 100, friction: 8 }),
        Animated.timing(iconOpacity, { toValue: 1,   duration: 450, useNativeDriver: true }),
        Animated.timing(iconRotate,  { toValue: 1,   duration: 800, useNativeDriver: true, easing: Easing.out(Easing.back(1.2)) }),
        Animated.timing(ring1Opacity,{ toValue: 0.6, duration: 400, useNativeDriver: true }),
        Animated.spring(ring1Scale,  { toValue: 1,   useNativeDriver: true, tension: 70, friction: 6 }),
        Animated.timing(ring2Opacity,{ toValue: 0.3, duration: 600, useNativeDriver: true }),
        Animated.spring(ring2Scale,  { toValue: 1.35,useNativeDriver: true, tension: 50, friction: 7 }),
      ]),

      // Brief pause to show the icon
      Animated.delay(500),

      // 2. Icon glitches, shrinks slightly, and disappears
      Animated.sequence([
        Animated.parallel([
          Animated.timing(glitch, { toValue: 6, duration: 50, useNativeDriver: true }),
          Animated.timing(iconScale, { toValue: 0.9, duration: 150, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(glitch, { toValue: -6, duration: 50, useNativeDriver: true }),
          Animated.timing(iconOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(ring1Opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(ring2Opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]),
        Animated.timing(glitch, { toValue: 0, duration: 10, useNativeDriver: true }),
      ]),

      Animated.delay(100),

      // 3. Full logo fades in, and tagline/divider reveals
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(logoScale,   { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }),
        Animated.timing(logoY,       { toValue: 0, duration: 600, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
      ]),

      // 4. Divider line, Tagline and World Cup Promo reveal
      Animated.parallel([
        Animated.timing(lineScale,    { toValue: 1, duration: 500, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
        Animated.timing(tagOpacity,   { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(promoOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(promoY,       { toValue: 0, duration: 700, useNativeDriver: true, easing: Easing.out(Easing.back(1.5)) }),
      ]),

      // Hold on the complete design
      Animated.delay(2000),

      // 5. Glitch and exit fade out
      Animated.sequence([
        Animated.timing(glitch, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(glitch, { toValue: -6, duration: 50, useNativeDriver: true }),
        Animated.timing(glitch, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]),

      Animated.parallel([
        Animated.timing(exitOpacity, { toValue: 0, duration: 500, useNativeDriver: true, easing: Easing.in(Easing.quad) }),
        Animated.timing(exitScale,   { toValue: 1.06, duration: 500, useNativeDriver: true }),
      ]),

    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[styles.root, { opacity: exitOpacity, transform: [{ scale: exitScale }] }]}>

      {/* Background */}
      <LinearGradient
        colors={["#0a0800", "#120e02", "#070500"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Rising gold sparks */}
      {Array.from({ length: 22 }).map((_, i) => <Spark key={i} index={i} />)}

      {/* ── Glow rings (behind icon) ── */}
      {[{ scale: ring1Scale, opacity: ring1Opacity, size: 220, bw: 2 },
        { scale: ring2Scale, opacity: ring2Opacity, size: 220, bw: 1 }].map((r, i) => (
        <Animated.View key={i} style={[styles.ring, {
          width: r.size, height: r.size, borderRadius: r.size / 2,
          borderWidth: r.bw,
          opacity: r.opacity,
          transform: [{ scale: r.scale }],
        }]} />
      ))}

      {/* ── CENTER CONTENT ── */}
      <View style={styles.center}>

        {/* CONTAINER FOR LOGO & ICON OVERLAY */}
        <View style={styles.mediaContainer}>
          {/* ICON (Phased out) */}
          <Animated.View style={[styles.iconAbsolute, {
            opacity: iconOpacity,
            transform: [{ scale: iconScale }, { rotate }],
          }]}>
            {/* glitch offset copy */}
            <Animated.View style={[StyleSheet.absoluteFill, styles.iconInner, {
              transform: [{ translateX: glitch }],
            }]}>
              <Image source={require("../../../assets/icon-only.svg")}
                style={styles.iconOnly} contentFit="contain"
                tintColor={GOLD_MID} />
            </Animated.View>
            {/* Real icon */}
            <Image source={require("../../../assets/icon-only.svg")}
              style={styles.iconOnly} contentFit="contain"
              tintColor={GOLD} />
          </Animated.View>

          {/* FULL LOGO (Phased in) */}
          <Animated.View style={[styles.logoAbsolute, {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }, { translateY: logoY }],
          }]}>
            {/* Glitch copy */}
            <Animated.View style={[StyleSheet.absoluteFill, styles.logoInner, {
              transform: [{ translateX: glitch }],
            }]}>
              <Image source={require("../../../assets/logo.svg")}
                style={styles.logo} contentFit="contain"
                tintColor="rgba(245,189,24,0.35)" />
            </Animated.View>
            {/* Real logo */}
            <Image source={require("../../../assets/logo.svg")}
              style={styles.logo} contentFit="contain" />
          </Animated.View>
        </View>

        {/* Divider line */}
        <Animated.View style={[styles.line, { transform: [{ scaleX: lineScale }] }]} />

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, { opacity: tagOpacity }]}>
          BUILT ON TRUST. BACKED BY SKILL.
        </Animated.Text>

        {/* 🏆 World Cup 2026 Promotion Banner */}
        <Animated.View style={[styles.promoContainer, {
          opacity: promoOpacity,
          transform: [{ translateY: promoY }],
        }]}>
          <View style={styles.promoBadge}>
            <Text style={styles.promoBadgeText}>مستجدات 2026</Text>
          </View>
          <Text style={styles.promoText}>
            الراعي الرقمي لخدمات الصيانة والتشغيل لكأس العالم 2026 🏆⚽
          </Text>
        </Animated.View>

      </View>

      {/* Corner brackets */}
      {[styles.cTL, styles.cTR, styles.cBL, styles.cBR].map((c, i) => (
        <View key={i} style={[styles.corner, c]} />
      ))}

    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0a0800",
  },
  ring: {
    position: "absolute",
    borderColor: GOLD,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 18,
  },
  center: {
    alignItems: "center",
    gap: 16,
    zIndex: 10,
    width: "100%",
  },
  mediaContainer: {
    width: width * 0.75,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  iconAbsolute: {
    position: "absolute",
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  iconInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconOnly: {
    width: 110,
    height: 110,
  },
  logoAbsolute: {
    position: "absolute",
    width: "100%",
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  logoInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: "100%",
    height: 80,
  },
  line: {
    width: width * 0.55,
    height: 1,
    backgroundColor: GOLD,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    marginTop: 4,
  },
  tagline: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 3.5,
    color: "rgba(245,189,24,0.6)",
    textAlign: "center",
  },
  promoContainer: {
    marginTop: 24,
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
  },
  promoBadge: {
    backgroundColor: "rgba(245,189,24,0.12)",
    borderColor: GOLD,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  promoBadgeText: {
    color: GOLD,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },
  promoText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    opacity: 0.85,
    lineHeight: 18,
    textShadowColor: "rgba(245,189,24,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  corner: {
    position: "absolute",
    width: 20,
    height: 20,
    borderColor: GOLD,
    opacity: 0.4,
  },
  cTL: { top: 44, left: 24, borderTopWidth: 1.5, borderLeftWidth: 1.5 },
  cTR: { top: 44, right: 24, borderTopWidth: 1.5, borderRightWidth: 1.5 },
  cBL: { bottom: 44, left: 24, borderBottomWidth: 1.5, borderLeftWidth: 1.5 },
  cBR: { bottom: 44, right: 24, borderBottomWidth: 1.5, borderRightWidth: 1.5 },
});

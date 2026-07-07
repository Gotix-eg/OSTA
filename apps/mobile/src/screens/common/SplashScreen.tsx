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
const GOLD_MID = "rgba(245,189,24,0.55)";

// Single rising spark
function Spark({ index }: { index: number }) {
  const y = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const x = useRef(width * 0.1 + Math.random() * width * 0.8).current;
  const size = 1 + Math.random() * 3;
  const dur = 1200 + Math.random() * 1500;
  const startDelay = index * 100 + Math.random() * 200;

  useEffect(() => {
    const run = () => {
      y.setValue(height * 0.8);
      opacity.setValue(0);
      Animated.parallel([
        Animated.sequence([
          Animated.delay(startDelay),
          Animated.timing(y, { toValue: height * 0.1, duration: dur, useNativeDriver: true, easing: Easing.linear }),
        ]),
        Animated.sequence([
          Animated.delay(startDelay),
          Animated.timing(opacity, { toValue: 0.8, duration: 250, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.5, duration: dur - 400, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
        ]),
      ]).start(() => setTimeout(run, Math.random() * 500));
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

  /* ── World Cup Logo Phase ── */
  const wcLogoScale   = useRef(new Animated.Value(0)).current;
  const wcLogoOpacity = useRef(new Animated.Value(0)).current;

  /* ── World Cup Ball (Kicked) ── */
  const ballTranslateX = useRef(new Animated.Value(-width * 0.6)).current;
  const ballTranslateY = useRef(new Animated.Value(height * 0.3)).current;
  const ballScale      = useRef(new Animated.Value(0.1)).current;
  const ballRotate     = useRef(new Animated.Value(0)).current;
  const ballOpacity    = useRef(new Animated.Value(0)).current;

  /* ── Impact Ring ── */
  const impactScale    = useRef(new Animated.Value(0.2)).current;
  const impactOpacity  = useRef(new Animated.Value(0)).current;

  /* ── Ostafy Logo Reveal ── */
  const logoOpacity    = useRef(new Animated.Value(0)).current;
  const logoScale      = useRef(new Animated.Value(0.85)).current;
  const logoY          = useRef(new Animated.Value(15)).current;

  /* ── Line + Tagline ── */
  const lineScale      = useRef(new Animated.Value(0)).current;
  const tagOpacity     = useRef(new Animated.Value(0)).current;

  /* ── Exit ── */
  const exitOpacity    = useRef(new Animated.Value(1)).current;
  const exitScale      = useRef(new Animated.Value(1)).current;

  /* ── Glitch Shift ── */
  const glitch         = useRef(new Animated.Value(0)).current;

  const ballRotation = ballRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "720deg"],
  });

  useEffect(() => {
    Animated.sequence([
      Animated.delay(100),

      // 1. World Cup Logo springs in at the center-right
      Animated.parallel([
        Animated.spring(wcLogoScale,   { toValue: 1.1, useNativeDriver: true, tension: 70, friction: 6 }),
        Animated.timing(wcLogoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),

      Animated.delay(100),

      // 2. The Ostafy Ball is kicked in from bottom-left, spins, scale-up, and collides with WC Logo
      Animated.parallel([
        Animated.timing(ballOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(ballTranslateX, { toValue: -15, duration: 650, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
        Animated.timing(ballTranslateY, { toValue: -20, duration: 650, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
        Animated.timing(ballScale, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(ballRotate, { toValue: 1, duration: 650, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
      ]),

      // 3. Impact effect triggers: Energy ring expands, WC logo shakes slightly
      Animated.parallel([
        Animated.sequence([
          Animated.timing(impactOpacity, { toValue: 0.9, duration: 50, useNativeDriver: true }),
          Animated.timing(impactOpacity, { toValue: 0, duration: 350, useNativeDriver: true }),
        ]),
        Animated.timing(impactScale, { toValue: 2.2, duration: 400, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
        Animated.sequence([
          Animated.timing(glitch, { toValue: 8, duration: 40, useNativeDriver: true }),
          Animated.timing(glitch, { toValue: -6, duration: 40, useNativeDriver: true }),
          Animated.timing(glitch, { toValue: 0, duration: 40, useNativeDriver: true }),
        ]),
      ]),

      Animated.delay(400),

      // 4. Glitch burst: Ball and World Cup logo disappear together
      Animated.parallel([
        Animated.timing(ballOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(wcLogoOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(ballScale, { toValue: 0.75, duration: 250, useNativeDriver: true }),
        Animated.timing(wcLogoScale, { toValue: 0.75, duration: 250, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(glitch, { toValue: 12, duration: 50, useNativeDriver: true }),
          Animated.timing(glitch, { toValue: -10, duration: 50, useNativeDriver: true }),
          Animated.timing(glitch, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]),
      ]),

      Animated.delay(150),

      // 5. Full Ostafy Logo fades in and settles at the center
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(logoScale,   { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }),
        Animated.timing(logoY,       { toValue: 0, duration: 600, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
      ]),

      // 6. Divider line + Tagline reveal
      Animated.parallel([
        Animated.timing(lineScale,  { toValue: 1, duration: 500, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
        Animated.timing(tagOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),

      Animated.delay(1800),

      // 7. Exit animation
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
        colors={["#080600", "#100d02", "#050400"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Rising gold sparks */}
      {Array.from({ length: 22 }).map((_, i) => <Spark key={i} index={i} />)}

      {/* ── CENTER SCENE ── */}
      <View style={styles.center}>

        {/* WORLD CUP ANIME STAGE (Overlay Container) */}
        <View style={styles.animeStage}>

          {/* World Cup 2026 Logo */}
          <Animated.View style={[styles.wcLogoWrap, {
            opacity: wcLogoOpacity,
            transform: [{ scale: wcLogoScale }, { translateX: glitch }],
          }]}>
            <Image source={require("../../../assets/wc-logo.png")}
              style={styles.wcLogo} contentFit="contain" />
          </Animated.View>

          {/* Ostafy World Cup Match Ball */}
          <Animated.View style={[styles.ballWrap, {
            opacity: ballOpacity,
            transform: [
              { translateX: ballTranslateX },
              { translateY: ballTranslateY },
              { scale: ballScale },
              { rotate: ballRotation },
            ],
          }]}>
            <Image source={require("../../../assets/wc-ball.png")}
              style={styles.ball} contentFit="contain" />
          </Animated.View>

          {/* Impact Energy Ring */}
          <Animated.View style={[styles.impactRing, {
            opacity: impactOpacity,
            transform: [{ scale: impactScale }],
          }]} />
        </View>

        {/* FULL OSTAFY LOGO (Revealed after glitch exit of WC scene) */}
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

        {/* Divider line */}
        <Animated.View style={[styles.line, { transform: [{ scaleX: lineScale }] }]} />

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, { opacity: tagOpacity }]}>
          BUILT ON TRUST. BACKED BY SKILL.
        </Animated.Text>

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
  center: {
    alignItems: "center",
    gap: 16,
    zIndex: 10,
    width: "100%",
  },
  animeStage: {
    width: width * 0.85,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  wcLogoWrap: {
    position: "absolute",
    right: width * 0.1,
    width: 130,
    height: 150,
    alignItems: "center",
    justifyContent: "center",
  },
  wcLogo: {
    width: "100%",
    height: "100%",
  },
  ballWrap: {
    position: "absolute",
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  ball: {
    width: "100%",
    height: "100%",
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  impactRing: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: GOLD,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
  },
  logoAbsolute: {
    width: width * 0.75,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
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

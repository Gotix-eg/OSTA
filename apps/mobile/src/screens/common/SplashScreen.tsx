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
  const ring3Scale   = useRef(new Animated.Value(0.6)).current;
  const ring3Opacity = useRef(new Animated.Value(0)).current;

  /* ── logo text reveal ── */
  const logoOpacity  = useRef(new Animated.Value(0)).current;
  const logoY        = useRef(new Animated.Value(20)).current;

  /* ── line + tagline ── */
  const lineScale    = useRef(new Animated.Value(0)).current;
  const tagOpacity   = useRef(new Animated.Value(0)).current;

  /* ── exit ── */
  const exitOpacity  = useRef(new Animated.Value(1)).current;
  const exitScale    = useRef(new Animated.Value(1)).current;

  /* ── glitch shift on icon ── */
  const glitch       = useRef(new Animated.Value(0)).current;

  const rotate = iconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  useEffect(() => {
    Animated.sequence([

      // 1. Icon spins in + glow
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(iconScale,   { toValue: 1,   useNativeDriver: true, tension: 90, friction: 7 }),
        Animated.timing(iconOpacity, { toValue: 1,   duration: 500, useNativeDriver: true }),
        Animated.timing(iconRotate,  { toValue: 1,   duration: 900, useNativeDriver: true, easing: Easing.out(Easing.back(1.4)) }),
        Animated.timing(ring1Opacity,{ toValue: 0.7, duration: 400, useNativeDriver: true }),
        Animated.spring(ring1Scale,  { toValue: 1,   useNativeDriver: true, tension: 60, friction: 6 }),
        Animated.timing(ring2Opacity,{ toValue: 0.4, duration: 600, useNativeDriver: true }),
        Animated.spring(ring2Scale,  { toValue: 1.3, useNativeDriver: true, tension: 40, friction: 7 }),
        Animated.timing(ring3Opacity,{ toValue: 0.2, duration: 800, useNativeDriver: true }),
        Animated.spring(ring3Scale,  { toValue: 1.75,useNativeDriver: true, tension: 30, friction: 8 }),
      ]),

      // 2. Icon glitch burst
      Animated.sequence([
        Animated.timing(glitch, { toValue: 8,  duration: 50,  useNativeDriver: true }),
        Animated.timing(glitch, { toValue: -6, duration: 40,  useNativeDriver: true }),
        Animated.timing(glitch, { toValue: 4,  duration: 35,  useNativeDriver: true }),
        Animated.timing(glitch, { toValue: 0,  duration: 50,  useNativeDriver: true }),
      ]),

      Animated.delay(120),

      // 3. Full logo fades up
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(logoY, { toValue: 0, duration: 500, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        // Rings pulse out and fade
        Animated.timing(ring1Opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(ring2Opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(ring3Opacity, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),

      Animated.delay(150),

      // 4. Line + tagline
      Animated.parallel([
        Animated.timing(lineScale,  { toValue: 1, duration: 500, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
        Animated.timing(tagOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),

      Animated.delay(800),

      // 5. Final glitch then exit
      Animated.sequence([
        Animated.timing(glitch, { toValue: 10, duration: 55, useNativeDriver: true }),
        Animated.timing(glitch, { toValue: -8, duration: 45, useNativeDriver: true }),
        Animated.timing(glitch, { toValue: 0,  duration: 55, useNativeDriver: true }),
      ]),

      Animated.parallel([
        Animated.timing(exitOpacity, { toValue: 0, duration: 550, useNativeDriver: true, easing: Easing.in(Easing.quad) }),
        Animated.timing(exitScale,   { toValue: 1.08, duration: 550, useNativeDriver: true }),
      ]),

    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[styles.root, { opacity: exitOpacity, transform: [{ scale: exitScale }] }]}>

      {/* Background */}
      <LinearGradient
        colors={["#0c0900", "#110d00", "#0a0800"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Rising gold sparks */}
      {Array.from({ length: 20 }).map((_, i) => <Spark key={i} index={i} />)}

      {/* ── Glow rings (behind icon) ── */}
      {[{ scale: ring1Scale, opacity: ring1Opacity, size: 200, bw: 2 },
        { scale: ring2Scale, opacity: ring2Opacity, size: 200, bw: 1.5 },
        { scale: ring3Scale, opacity: ring3Opacity, size: 200, bw: 1 }].map((r, i) => (
        <Animated.View key={i} style={[styles.ring, {
          width: r.size, height: r.size, borderRadius: r.size / 2,
          borderWidth: r.bw,
          opacity: r.opacity,
          transform: [{ scale: r.scale }],
        }]} />
      ))}

      {/* ── CENTER ── */}
      <View style={styles.center}>

        {/* ICON — glitch layers + real */}
        <Animated.View style={[styles.iconWrap, {
          opacity: iconOpacity,
          transform: [{ scale: iconScale }, { rotate }],
        }]}>
          {/* gold tint glitch shift */}
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

        {/* Full logo fades in below icon */}
        <Animated.View style={[styles.logoWrap, {
          opacity: logoOpacity,
          transform: [{ translateY: logoY }],
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
    backgroundColor: "#0c0900",
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
  },
  iconWrap: {
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
    width: 120,
    height: 120,
  },
  logoWrap: {
    width: width * 0.72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  logoInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: "100%",
    height: 72,
  },
  line: {
    width: width * 0.6,
    height: 1,
    backgroundColor: GOLD,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
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
    opacity: 0.5,
  },
  cTL: { top: 44, left: 24, borderTopWidth: 1.5, borderLeftWidth: 1.5 },
  cTR: { top: 44, right: 24, borderTopWidth: 1.5, borderRightWidth: 1.5 },
  cBL: { bottom: 44, left: 24, borderBottomWidth: 1.5, borderLeftWidth: 1.5 },
  cBR: { bottom: 44, right: 24, borderBottomWidth: 1.5, borderRightWidth: 1.5 },
});

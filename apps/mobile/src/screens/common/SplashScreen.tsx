import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

// Scanline rows
const SCANLINES = Array.from({ length: 40 });

// Random glitch block
function GlitchBlock({ delay }: { delay: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const x = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      const randomX = Math.random() * width * 0.4;
      const randomY = Math.random() * height;
      const randomW = 20 + Math.random() * 120;
      const randomH = 2 + Math.random() * 8;

      x.setValue(randomX);
      Animated.sequence([
        Animated.delay(delay + Math.random() * 2000),
        Animated.timing(opacity, { toValue: 0.6 + Math.random() * 0.4, duration: 30, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start(() => setTimeout(loop, Math.random() * 800));
    };
    loop();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: Math.random() * height,
        left: Math.random() * width * 0.3,
        width: 20 + Math.random() * 120,
        height: 2 + Math.random() * 6,
        backgroundColor: Math.random() > 0.5 ? "#00ffff" : "#ff00ff",
        opacity,
      }}
    />
  );
}

// Single neon particle
function NeonParticle({ index }: { index: number }) {
  const y = useRef(new Animated.Value(height + 20)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const x = useRef(Math.random() * width).current;
  const color = ["#00ffff", "#ff00ff", "#f5bd18", "#00ff88"][Math.floor(Math.random() * 4)];
  const size = 2 + Math.random() * 4;
  const duration = 1800 + Math.random() * 2000;

  useEffect(() => {
    const delay = index * 120;
    const loop = () => {
      y.setValue(height + 20);
      opacity.setValue(0);
      Animated.parallel([
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(y, { toValue: -20, duration, useNativeDriver: true, easing: Easing.linear }),
        ]),
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.8, duration: duration - 600, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
      ]).start(() => setTimeout(loop, Math.random() * 500));
    };
    loop();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        transform: [{ translateY: y }],
        opacity,
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 6,
      }}
    />
  );
}

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  // Master timeline
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoY = useRef(new Animated.Value(40)).current;

  const glowOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.2)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;

  const lineWidth = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineX = useRef(new Animated.Value(30)).current;

  const glitchShift = useRef(new Animated.Value(0)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;
  const exitScale = useRef(new Animated.Value(1)).current;

  const [showGlitch, setShowGlitch] = useState(false);

  useEffect(() => {
    // Phase 1: Logo appears with glitch burst
    Animated.sequence([
      Animated.delay(300),

      // Logo glitch-in
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1.08, useNativeDriver: true, tension: 120, friction: 6 }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(logoY, { toValue: 0, duration: 400, useNativeDriver: true, easing: Easing.out(Easing.exp) }),
        Animated.timing(glowOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(ringScale, { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }),
        Animated.timing(ringOpacity, { toValue: 0.6, duration: 500, useNativeDriver: true }),
      ]),

      // Slight overshoot correction
      Animated.spring(logoScale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 10 }),

      Animated.delay(200),

      // Horizontal line reveal
      Animated.timing(lineWidth, { toValue: 1, duration: 500, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),

      // Tagline slides in
      Animated.parallel([
        Animated.timing(taglineOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(taglineX, { toValue: 0, duration: 400, useNativeDriver: true, easing: Easing.out(Easing.back(2)) }),
      ]),

      Animated.delay(600),

      // Glitch effect before exit
      Animated.sequence([
        Animated.timing(glitchShift, { toValue: 6, duration: 60, useNativeDriver: true }),
        Animated.timing(glitchShift, { toValue: -5, duration: 50, useNativeDriver: true }),
        Animated.timing(glitchShift, { toValue: 4, duration: 40, useNativeDriver: true }),
        Animated.timing(glitchShift, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]),

      Animated.delay(100),

      // Flash then fade exit
      Animated.parallel([
        Animated.timing(exitOpacity, { toValue: 0, duration: 500, useNativeDriver: true, easing: Easing.in(Easing.exp) }),
        Animated.timing(exitScale, { toValue: 1.1, duration: 500, useNativeDriver: true }),
      ]),
    ]).start(() => {
      onFinish();
    });

    // Trigger glitch blocks mid-animation
    setTimeout(() => setShowGlitch(true), 200);
    setTimeout(() => setShowGlitch(false), 900);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: exitOpacity, transform: [{ scale: exitScale }] }]}>
      {/* Background gradient */}
      <LinearGradient
        colors={["#050510", "#0a0a1a", "#080820"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Scanlines overlay */}
      <View style={styles.scanlines} pointerEvents="none">
        {SCANLINES.map((_, i) => (
          <View key={i} style={styles.scanline} />
        ))}
      </View>

      {/* Neon rising particles */}
      {Array.from({ length: 18 }).map((_, i) => (
        <NeonParticle key={i} index={i} />
      ))}

      {/* Random glitch blocks */}
      {showGlitch && Array.from({ length: 8 }).map((_, i) => (
        <GlitchBlock key={i} delay={i * 60} />
      ))}

      {/* Neon ring behind logo */}
      <Animated.View
        style={[
          styles.ring,
          {
            opacity: ringOpacity,
            transform: [{ scale: ringScale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.ring2,
          {
            opacity: ringOpacity,
            transform: [{ scale: ringScale }],
          },
        ]}
      />

      {/* Logo center */}
      <View style={styles.centerContent}>
        {/* Neon glow behind logo */}
        <Animated.View style={[styles.glowBlob, { opacity: glowOpacity }]} />

        {/* Logo with glitch layers */}
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              transform: [
                { scale: logoScale },
                { translateY: logoY },
              ],
              opacity: logoOpacity,
            },
          ]}
        >
          {/* Cyan glitch copy */}
          <Animated.View
            style={[
              styles.glitchLayer,
              { transform: [{ translateX: glitchShift }] },
            ]}
          >
            <Image
              source={require("../../../assets/logo.svg")}
              style={styles.logo}
              contentFit="contain"
              tintColor="rgba(0,255,255,0.55)"
            />
          </Animated.View>

          {/* Magenta glitch copy */}
          <Animated.View
            style={[
              styles.glitchLayer,
              { transform: [{ translateX: Animated.multiply(glitchShift, new Animated.Value(-1)) }] },
            ]}
          >
            <Image
              source={require("../../../assets/logo.svg")}
              style={styles.logo}
              contentFit="contain"
              tintColor="rgba(255,0,255,0.45)"
            />
          </Animated.View>

          {/* Real logo on top */}
          <Image
            source={require("../../../assets/logo.svg")}
            style={styles.logo}
            contentFit="contain"
          />
        </Animated.View>

        {/* Horizontal neon line */}
        <Animated.View
          style={[
            styles.neonLine,
            { transform: [{ scaleX: lineWidth }] },
          ]}
        />

        {/* Tagline */}
        <Animated.Text
          style={[
            styles.tagline,
            {
              opacity: taglineOpacity,
              transform: [{ translateX: taglineX }],
            },
          ]}
        >
          BUILT ON TRUST. BACKED BY SKILL.
        </Animated.Text>
      </View>

      {/* Corner decorations */}
      <View style={[styles.corner, styles.cornerTL]} />
      <View style={[styles.corner, styles.cornerTR]} />
      <View style={[styles.corner, styles.cornerBL]} />
      <View style={[styles.corner, styles.cornerBR]} />
    </Animated.View>
  );
}

const NEON_CYAN = "#00ffff";
const NEON_MAGENTA = "#ff00ff";
const NEON_YELLOW = "#f5bd18";

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#050510",
  },
  scanlines: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "column",
    overflow: "hidden",
    opacity: 0.06,
  },
  scanline: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#ffffff",
  },
  ring: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
    borderColor: NEON_CYAN,
    shadowColor: NEON_CYAN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  ring2: {
    position: "absolute",
    width: 360,
    height: 360,
    borderRadius: 180,
    borderWidth: 0.5,
    borderColor: NEON_MAGENTA,
    shadowColor: NEON_MAGENTA,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
  },
  centerContent: {
    alignItems: "center",
    gap: 20,
    zIndex: 10,
  },
  glowBlob: {
    position: "absolute",
    width: 320,
    height: 120,
    borderRadius: 60,
    backgroundColor: NEON_CYAN,
    opacity: 0.07,
    shadowColor: NEON_CYAN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 60,
  },
  logoWrapper: {
    width: width * 0.72,
    height: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  glitchLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: "100%",
    height: 90,
  },
  neonLine: {
    width: width * 0.65,
    height: 1.5,
    backgroundColor: NEON_CYAN,
    shadowColor: NEON_CYAN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  tagline: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 3,
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
  },
  // Corner brackets
  corner: {
    position: "absolute",
    width: 24,
    height: 24,
    borderColor: NEON_YELLOW,
    opacity: 0.7,
  },
  cornerTL: {
    top: 40,
    left: 24,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  cornerTR: {
    top: 40,
    right: 24,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  cornerBL: {
    bottom: 40,
    left: 24,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  cornerBR: {
    bottom: 40,
    right: 24,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
});

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  PanResponder,
  Vibration,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import IconOnlyLogo from "../../../assets/icon-only.svg";
import FullLogo from "../../../assets/logo.svg";

const { width, height } = Dimensions.get("window");

const GOLD = "#f5bd18";
const GREEN_DARK = "#051a0b";
const GREEN_LIGHT = "#0d471d";

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [gameState, setGameState] = useState<"playing" | "goal" | "resolving">("playing");
  const [hintText, setHintText] = useState("اسحب الكرة إلى وسط الملعب لتبدأ! ⚽");

  // Draggable ball animation values
  const pan = useRef(new Animated.ValueXY({ x: 0, y: height * 0.25 })).current;
  const ballScale = useRef(new Animated.Value(1)).current;

  // Stadium & Goal Animations
  const stadiumScale = useRef(new Animated.Value(1)).current;
  const stadiumOpacity = useRef(new Animated.Value(1)).current;
  const goalTextScale = useRef(new Animated.Value(0)).current;
  const goalTextOpacity = useRef(new Animated.Value(0)).current;

  // Ostafy Logo Transition
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const logoY = useRef(new Animated.Value(20)).current;
  const lineScale = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  // Exit Animation
  const exitOpacity = useRef(new Animated.Value(1)).current;
  const exitScale = useRef(new Animated.Value(1)).current;

  // Target Goal position: center of the screen (0, 0 in offset space)
  const GOAL_X = 0;
  const GOAL_Y = -height * 0.15; // Center of the stadium circle
  const COLLISION_RADIUS = 65;

  // Auto-play timer if user is inactive
  const idleTimeout = useRef<any>(null);

  const startGoalAnimation = () => {
    if (idleTimeout.current) clearTimeout(idleTimeout.current);
    setGameState("goal");
    setHintText("جووووووول! 🎉");
    Vibration.vibrate([0, 100, 50, 150]);

    // Animate ball entering/colliding with stadium
    Animated.sequence([
      Animated.parallel([
        Animated.spring(ballScale, { toValue: 0, useNativeDriver: true, tension: 80, friction: 5 }),
        Animated.timing(stadiumScale, { toValue: 1.4, duration: 250, useNativeDriver: true }),
        Animated.timing(stadiumOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(goalTextOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(goalTextScale, { toValue: 1.3, useNativeDriver: true, tension: 120, friction: 6 }),
      ]),
      Animated.delay(1200),
      Animated.parallel([
        Animated.timing(goalTextOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(goalTextScale, { toValue: 1.6, duration: 300, useNativeDriver: true }),
      ]),
    ]).start(() => {
      setGameState("resolving");
      // Fade in the full Ostafy logo
      Animated.sequence([
        Animated.parallel([
          Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.spring(logoScale, { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }),
          Animated.timing(logoY, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(lineScale, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(taglineOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]),
        Animated.delay(1800),
        // Final exit
        Animated.parallel([
          Animated.timing(exitOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
          Animated.timing(exitScale, { toValue: 1.08, duration: 500, useNativeDriver: true }),
        ]),
      ]).start(() => onFinish());
    });
  };

  // Configure drag gesture
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => gameState === "playing",
      onPanResponderGrant: () => {
        if (idleTimeout.current) clearTimeout(idleTimeout.current);
        Animated.spring(ballScale, { toValue: 1.15, useNativeDriver: true }).start();
      },
      onPanResponderMove: (_, gestureState) => {
        if (gameState !== "playing") return;
        pan.setValue({ x: gestureState.dx, y: height * 0.25 + gestureState.dy });

        // Real-time distance check to highlight the goal area
        const currentY = height * 0.25 + gestureState.dy;
        const currentX = gestureState.dx;
        const dist = Math.sqrt(Math.pow(currentX - GOAL_X, 2) + Math.pow(currentY - GOAL_Y, 2));
        if (dist < COLLISION_RADIUS + 20) {
          stadiumScale.setValue(1.1);
        } else {
          stadiumScale.setValue(1);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gameState !== "playing") return;

        const finalX = gestureState.dx;
        const finalY = height * 0.25 + gestureState.dy;

        // Check if ball is inside the stadium/goal
        const distance = Math.sqrt(Math.pow(finalX - GOAL_X, 2) + Math.pow(finalY - GOAL_Y, 2));

        if (distance < COLLISION_RADIUS) {
          // Snap directly to goal center and trigger goal
          Animated.parallel([
            Animated.spring(pan, { toValue: { x: GOAL_X, y: GOAL_Y }, useNativeDriver: true }),
            Animated.spring(ballScale, { toValue: 1, useNativeDriver: true }),
          ]).start(() => {
            startGoalAnimation();
          });
        } else {
          // Snap back to starting point
          Animated.parallel([
            Animated.spring(pan, { toValue: { x: 0, y: height * 0.25 }, useNativeDriver: true, tension: 60, friction: 7 }),
            Animated.spring(ballScale, { toValue: 1, useNativeDriver: true }),
            Animated.spring(stadiumScale, { toValue: 1, useNativeDriver: true }),
          ]).start();

          // Reset idle timeout
          resetIdleTimeout();
        }
      },
    })
  ).current;

  const resetIdleTimeout = () => {
    if (idleTimeout.current) clearTimeout(idleTimeout.current);
    idleTimeout.current = setTimeout(() => {
      // Auto-kick animation: ball automatically shoots into the goal
      setHintText("ركلة تلقائية.. ⚽💥");
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pan, { toValue: { x: GOAL_X, y: GOAL_Y }, duration: 800, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
          Animated.timing(ballScale, { toValue: 1.1, duration: 300, useNativeDriver: true }),
        ]),
      ]).start(() => {
        startGoalAnimation();
      });
    }, 5500);
  };

  useEffect(() => {
    resetIdleTimeout();
    return () => {
      if (idleTimeout.current) clearTimeout(idleTimeout.current);
    };
  }, [gameState]);

  return (
    <Animated.View style={[styles.root, { opacity: exitOpacity, transform: [{ scale: exitScale }] }]}>

      {/* Field Background */}
      <LinearGradient
        colors={[GREEN_DARK, GREEN_LIGHT]}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Stadium lines (CSS drawn soccer pitch) ── */}
      {gameState !== "resolving" && (
        <View style={styles.pitchLines} pointerEvents="none">
          {/* Halfway line */}
          <View style={styles.halfwayLine} />
          {/* Center circle */}
          <View style={styles.centerCircle} />
          {/* Penalty box outlines */}
          <View style={styles.penaltyAreaTop} />
          <View style={styles.penaltyAreaBottom} />
        </View>
      )}

      {/* ── Game elements ── */}
      {gameState !== "resolving" && (
        <View style={styles.gameContainer}>

          {/* Goal Stadium Circle */}
          <Animated.View style={[styles.stadium, {
            transform: [{ scale: stadiumScale }],
            opacity: stadiumOpacity,
            top: height * 0.35, // match the GOAL_Y offset calculation
          }]}>
            <View style={styles.stadiumGoalRing} />
            <Text style={styles.stadiumText}>الـمـلـعـب 🏆</Text>
          </Animated.View>

          {/* Draggable Ball */}
          <Animated.View
            style={[styles.ballContainer, {
              transform: [
                { translateX: pan.x },
                { translateY: pan.y },
                { scale: ballScale }
              ]
            }]}
            {...panResponder.panHandlers}
          >
            {/* Soccer ball pattern custom drawn */}
            <View style={styles.ball}>
              <View style={styles.ballInnerBorder}>
                <IconOnlyLogo width="100%" height="100%" style={styles.ballIcon} />
              </View>
            </View>
          </Animated.View>

          {/* Goal Neon Text Alert */}
          <Animated.View style={[styles.goalTextWrap, {
            opacity: goalTextOpacity,
            transform: [{ scale: goalTextScale }],
          }]}>
            <Text style={styles.goalText}>جووووووول!</Text>
            <Text style={styles.goalTextSub}>أُسطى بيبدأ اللقاء ⚽</Text>
          </Animated.View>

          {/* Bottom Hint Banner */}
          {gameState === "playing" && (
            <View style={styles.hintContainer}>
              <Text style={styles.hintText}>{hintText}</Text>
            </View>
          )}
        </View>
      )}

      {/* ── Ostafy Logo Resolving Screen (fades in after game finishes) ── */}
      {gameState === "resolving" && (
        <View style={styles.logoStage}>
          <Animated.View style={[styles.logoWrap, {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }, { translateY: logoY }],
          }]}>
            <FullLogo width="100%" height="100%" style={styles.logo} />
          </Animated.View>

          {/* Divider line */}
          <Animated.View style={[styles.line, { transform: [{ scaleX: lineScale }] }]} />

          {/* Tagline */}
          <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
            BUILT ON TRUST. BACKED BY SKILL.
          </Animated.Text>
        </View>
      )}

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
    backgroundColor: GREEN_DARK,
  },
  pitchLines: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.06)",
    margin: 20,
    borderRadius: 8,
  },
  halfwayLine: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  centerCircle: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.06)",
    marginLeft: -70,
    marginTop: -70,
  },
  penaltyAreaTop: {
    position: "absolute",
    top: 0,
    left: "50%",
    width: 200,
    height: 100,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: "rgba(255,255,255,0.05)",
    marginLeft: -100,
  },
  penaltyAreaBottom: {
    position: "absolute",
    bottom: 0,
    left: "50%",
    width: 200,
    height: 100,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: "rgba(255,255,255,0.05)",
    marginLeft: -100,
  },
  gameContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  stadium: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    borderColor: GOLD,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(245,189,24,0.08)",
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
  },
  stadiumGoalRing: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: GOLD,
    opacity: 0.6,
  },
  stadiumText: {
    color: GOLD,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    textShadowColor: "rgba(245,189,24,0.5)",
    textShadowRadius: 4,
  },
  ballContainer: {
    position: "absolute",
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },
  ball: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#ffffff",
    borderWidth: 3,
    borderColor: GOLD,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  ballInnerBorder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.15)",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  ballIcon: {
    width: 32,
    height: 32,
  },
  goalTextWrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 30,
  },
  goalText: {
    fontSize: 48,
    fontWeight: "900",
    color: GOLD,
    textShadowColor: GOLD,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  goalTextSub: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: 8,
    textShadowColor: "#000",
    textShadowRadius: 4,
  },
  hintContainer: {
    position: "absolute",
    bottom: 50,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  hintText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  logoStage: {
    alignItems: "center",
    gap: 16,
    width: "100%",
  },
  logoWrap: {
    width: width * 0.75,
    height: 80,
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
    opacity: 0.35,
  },
  cTL: { top: 44, left: 24, borderTopWidth: 1.5, borderLeftWidth: 1.5 },
  cTR: { top: 44, right: 24, borderTopWidth: 1.5, borderRightWidth: 1.5 },
  cBL: { bottom: 44, left: 24, borderBottomWidth: 1.5, borderLeftWidth: 1.5 },
  cBR: { bottom: 44, right: 24, borderBottomWidth: 1.5, borderRightWidth: 1.5 },
});

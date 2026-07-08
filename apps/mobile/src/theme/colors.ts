export type ThemeMode = "light" | "dark";

export type AppTheme = {
  mode: ThemeMode;
  background: string;
  backgroundRaised: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  muted: string;
  subtle: string;
  border: string;
  primary: string;
  primaryText: string;
  primarySoft: string;
  accent: string;
  accentSoft: string;
  danger: string;
  dangerSoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  tabBar: string;
  shadow: string;
};

export const themes: Record<ThemeMode, AppTheme> = {
  light: {
    mode: "light",
    background: "#F0BB19",
    backgroundRaised: "#FEF4D5",
    surface: "#FFFFFF",
    surfaceAlt: "#FCD05F",
    text: "#15110D",
    muted: "#5A4C3E",
    subtle: "#7E6E5E",
    border: "#E9D29A",
    primary: "#000000",
    primaryText: "#FFF8EA",
    primarySoft: "#FEF2CF",
    accent: "#146D68",
    accentSoft: "#D7ECE8",
    danger: "#B3261E",
    dangerSoft: "#F8DAD6",
    success: "#267348",
    successSoft: "#DCEFE3",
    warning: "#A96500",
    warningSoft: "#FFE6BE",
    tabBar: "#FDF0CC",
    shadow: "#4B3520"
  },
  dark: {
    mode: "dark",
    background: "#15110D",
    backgroundRaised: "#1E1813",
    surface: "#2A221B",
    surfaceAlt: "#382E25",
    text: "#F4E9D8",
    muted: "#B8A999",
    subtle: "#8D7F70",
    border: "#46382B",
    primary: "#D7A24D",
    primaryText: "#201307",
    primarySoft: "#46331A",
    accent: "#61BBB1",
    accentSoft: "#173D3A",
    danger: "#FFB4AB",
    dangerSoft: "#5F1815",
    success: "#8FD8A8",
    successSoft: "#183E28",
    warning: "#F4BC62",
    warningSoft: "#4B3212",
    tabBar: "#211A14",
    shadow: "#000000"
  }
};

export const colors = themes.light;

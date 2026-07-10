import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable, ScrollView, Linking, ActivityIndicator, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "../../components/Screen";
import { AppCard } from "../../components/AppCard";
import { useApiResource } from "../../hooks/useApiResource";
import { useTheme } from "../../context/ThemeContext";
import { spacing } from "../../theme/spacing";

type SettingItem = {
  key: string;
  value: string;
  type: string;
};

export function SupportScreen() {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  // Active Tab: "support" | "terms" | "privacy"
  const [activeTab, setActiveTab] = useState<"support" | "terms" | "privacy">("support");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Fetch settings from DB
  const settings = useApiResource<SettingItem[]>("/settings", []);

  // Safe parsing helper
  const parseJson = (val: any) => {
    if (!val) return null;
    if (typeof val === "object") return val;
    try {
      return JSON.parse(val);
    } catch {
      return null;
    }
  };

  const rawPrivacy = settings.data.find(s => s.key === "privacy_policy")?.value;
  const rawTerms = settings.data.find(s => s.key === "terms_of_service")?.value;
  const rawSupport = settings.data.find(s => s.key === "support_info")?.value;

  const privacy = parseJson(rawPrivacy);
  const terms = parseJson(rawTerms);
  const support = parseJson(rawSupport);

  const handleContact = (type: "phone" | "email" | "whatsapp" | "facebook" | "instagram", val?: string) => {
    if (!val) return;
    if (type === "phone") {
      Linking.openURL(`tel:${val}`);
    } else if (type === "email") {
      Linking.openURL(`mailto:${val}`);
    } else {
      Linking.openURL(val);
    }
  };

  const renderSupportTab = () => {
    if (!support) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>جاري تحميل معلومات الدعم...</Text>
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.tabContentContainer} showsVerticalScrollIndicator={false}>
        {/* Contact Cards */}
        <Text style={styles.sectionHeader}>قنوات التواصل الرسمية</Text>
        
        <View style={styles.contactGrid}>
          {support.whatsapp && (
            <Pressable style={styles.contactCard} onPress={() => handleContact("whatsapp", support.whatsapp)}>
              <Ionicons name="logo-whatsapp" size={28} color="#25D366" />
              <Text style={styles.contactLabel}>واتساب</Text>
            </Pressable>
          )}

          {support.phone && (
            <Pressable style={styles.contactCard} onPress={() => handleContact("phone", support.phone)}>
              <Ionicons name="call-outline" size={28} color={theme.primary} />
              <Text style={styles.contactLabel}>اتصال هاتفي</Text>
            </Pressable>
          )}

          {support.email && (
            <Pressable style={styles.contactCard} onPress={() => handleContact("email", support.email)}>
              <Ionicons name="mail-outline" size={28} color="#EA4335" />
              <Text style={styles.contactLabel}>البريد الإلكتروني</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.socialRow}>
          {support.facebook && (
            <Pressable style={styles.socialButton} onPress={() => handleContact("facebook", support.facebook)}>
              <Ionicons name="logo-facebook" size={22} color="#1877F2" />
              <Text style={styles.socialButtonText}>فيسبوك</Text>
            </Pressable>
          )}
          {support.instagram && (
            <Pressable style={styles.socialButton} onPress={() => handleContact("instagram", support.instagram)}>
              <Ionicons name="logo-instagram" size={22} color="#E1306C" />
              <Text style={styles.socialButtonText}>انستجرام</Text>
            </Pressable>
          )}
        </View>

        {/* FAQs */}
        {support.faq && support.faq.length > 0 && (
          <View style={styles.faqSection}>
            <Text style={styles.sectionHeader}>الأسئلة الشائعة</Text>
            {support.faq.map((item: any, idx: number) => {
              const isExpanded = expandedFaq === idx;
              return (
                <AppCard key={idx} style={styles.faqCard}>
                  <Pressable 
                    style={styles.faqHeader} 
                    onPress={() => setExpandedFaq(isExpanded ? null : idx)}
                  >
                    <Ionicons 
                      name={isExpanded ? "chevron-up" : "chevron-down"} 
                      size={18} 
                      color={theme.text} 
                    />
                    <Text style={styles.faqQuestion}>{item.question}</Text>
                  </Pressable>
                  {isExpanded && (
                    <View style={styles.faqAnswerContainer}>
                      <Text style={styles.faqAnswer}>{item.answer}</Text>
                    </View>
                  )}
                </AppCard>
              );
            })}
          </View>
        )}
      </ScrollView>
    );
  };

  const renderContentSections = (data: any, type: string) => {
    if (!data) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>جاري تحميل البيانات...</Text>
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.tabContentContainer} showsVerticalScrollIndicator={false}>
        <AppCard style={styles.heroCard}>
          <Text style={styles.heroTitle}>{data.title}</Text>
          <Text style={styles.heroDesc}>{data.description}</Text>
        </AppCard>

        {data.sections && data.sections.map((sec: any, idx: number) => (
          <AppCard key={idx} style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="shield-checkmark" size={20} color={theme.primary} />
              <Text style={styles.sectionTitle}>{sec.title}</Text>
            </View>
            <Text style={styles.sectionBody}>{sec.body}</Text>
          </AppCard>
        ))}
      </ScrollView>
    );
  };

  return (
    <Screen title="الدعم والسياسات" showBack={true}>
      {/* Dynamic Tabs */}
      <View style={styles.tabsWrapper}>
        <Pressable 
          style={[styles.tabButton, activeTab === "support" && styles.tabButtonActive]}
          onPress={() => setActiveTab("support")}
        >
          <Text style={[styles.tabText, activeTab === "support" && styles.tabTextActive]}>اتصل بنا والدعم</Text>
        </Pressable>

        <Pressable 
          style={[styles.tabButton, activeTab === "terms" && styles.tabButtonActive]}
          onPress={() => setActiveTab("terms")}
        >
          <Text style={[styles.tabText, activeTab === "terms" && styles.tabTextActive]}>شروط الخدمة</Text>
        </Pressable>

        <Pressable 
          style={[styles.tabButton, activeTab === "privacy" && styles.tabButtonActive]}
          onPress={() => setActiveTab("privacy")}
        >
          <Text style={[styles.tabText, activeTab === "privacy" && styles.tabTextActive]}>سياسة الخصوصية</Text>
        </Pressable>
      </View>

      {settings.isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loaderText}>جاري تحميل إعدادات الأمان والدعم من السيرفر...</Text>
        </View>
      ) : (
        <View style={styles.container}>
          {activeTab === "support" && renderSupportTab()}
          {activeTab === "terms" && renderContentSections(terms, "terms")}
          {activeTab === "privacy" && renderContentSections(privacy, "privacy")}
        </View>
      )}
    </Screen>
  );
}

const makeStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.xl
  },
  loaderText: {
    fontSize: 13,
    color: theme.muted,
    textAlign: "center"
  },
  tabsWrapper: {
    flexDirection: "row-reverse",
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: theme.border
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: 8
  },
  tabButtonActive: {
    backgroundColor: theme.backgroundRaised
  },
  tabText: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.muted
  },
  tabTextActive: {
    color: theme.primary
  },
  tabContentContainer: {
    gap: spacing.md,
    paddingBottom: spacing.xl
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.text,
    marginVertical: spacing.xs,
    textAlign: "right"
  },
  contactGrid: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  contactCard: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs
  },
  contactLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: theme.text,
    textAlign: "center"
  },
  socialRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  socialButton: {
    flex: 1,
    flexDirection: "row-reverse",
    backgroundColor: theme.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    paddingVertical: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs
  },
  socialButtonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: theme.text
  },
  faqSection: {
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  faqCard: {
    padding: 0,
    overflow: "hidden"
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    width: "100%"
  },
  faqQuestion: {
    fontSize: 13,
    fontWeight: "bold",
    color: theme.text,
    flex: 1,
    textAlign: "right",
    paddingLeft: spacing.sm
  },
  faqAnswerContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: spacing.sm,
    backgroundColor: theme.backgroundRaised
  },
  faqAnswer: {
    fontSize: 12,
    lineHeight: 18,
    color: theme.muted,
    textAlign: "right"
  },
  heroCard: {
    backgroundColor: theme.primarySoft,
    borderColor: theme.primary,
    padding: spacing.lg
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.primaryText,
    marginBottom: spacing.xs,
    textAlign: "right"
  },
  heroDesc: {
    fontSize: 12,
    lineHeight: 18,
    color: theme.primaryText,
    opacity: 0.8,
    textAlign: "right"
  },
  sectionCard: {
    gap: spacing.xs
  },
  sectionTitleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xs
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.text,
    flex: 1,
    textAlign: "right"
  },
  sectionBody: {
    fontSize: 12,
    lineHeight: 18,
    color: theme.muted,
    textAlign: "right"
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: "center"
  },
  emptyText: {
    fontSize: 13,
    color: theme.muted
  }
});

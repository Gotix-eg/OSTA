import { useState } from "react";
import { StyleSheet, Text, View, Pressable, ActivityIndicator, FlatList, Modal, ScrollView, Alert, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { Screen } from "../../components/Screen";
import { AppCard } from "../../components/AppCard";
import { AppButton } from "../../components/AppButton";
import { useApiResource } from "../../hooks/useApiResource";
import { useTheme } from "../../context/ThemeContext";
import { spacing } from "../../theme/spacing";
import { apiClient } from "../../api/client";

// Maintenance Request type
type RequestItem = {
  id: string;
  requestNumber: string;
  title: string;
  serviceId: string;
  serviceNameAr: string;
  serviceNameEn: string;
  status: string;
  area: string;
  createdAt: string;
};

// Store Direct Order type
type DirectOrder = {
  id: string;
  totalAmount: number;
  status: "PENDING" | "PREPARING" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
  paymentMethod: string;
  deliveryNotes?: string;
  createdAt: string;
  vendor: {
    userId: string;
    shopName: string;
    shopNameAr?: string;
    shopImageUrl?: string;
  };
  items: Array<{
    id: string;
    qty: number;
    unitPrice: number;
    product: {
      nameAr: string;
      nameEn?: string;
    };
  }>;
};

// Store Custom Request type
type CustomRequest = {
  id: string;
  title: string;
  description: string;
  category?: string;
  price?: number;
  status: "PENDING" | "REPLIED" | "ACCEPTED" | "REJECTED" | "PREPARING" | "SHIPPED" | "COMPLETED" | "CLOSED";
  vendorReply?: string;
  createdAt: string;
  vendor: {
    id: string;
    userId: string;
    shopName: string;
    shopNameAr?: string;
    shopImageUrl?: string;
  };
};

export function MyRequestsScreen() {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const navigation = useNavigation<any>();

  // Active Main Tab: "service" (طلبات صيانة) | "store" (طلبات المتاجر)
  const [activeTab, setActiveTab] = useState<"service" | "store">("service");

  // Store Orders sub-tab filter: "direct" | "custom"
  const [storeSubTab, setStoreSubTab] = useState<"direct" | "custom">("direct");

  // Fetch Resources
  const serviceRequests = useApiResource<RequestItem[]>("/clients/requests", []);
  const directOrders = useApiResource<DirectOrder[]>("/vendors/my-orders", []);
  const customRequests = useApiResource<CustomRequest[]>("/vendors/my-custom-requests", []);

  // Modal detail states
  const [selectedDirectOrder, setSelectedDirectOrder] = useState<DirectOrder | null>(null);
  const [selectedCustomRequest, setSelectedCustomRequest] = useState<CustomRequest | null>(null);
  const [isAcceptingOffer, setIsAcceptingOffer] = useState(false);

  function showAlert(title: string, message: string) {
    if (Platform.OS === "web") {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  }

  // Handle navigating to chat
  const handleChatWithVendor = (vendorUserId: string, shopName: string) => {
    setSelectedDirectOrder(null);
    setSelectedCustomRequest(null);
    navigation.navigate("Chat", {
      conversationId: vendorUserId,
      recipientName: shopName
    });
  };

  // Accept Custom Request Offer
  const handleAcceptOffer = async (requestId: string) => {
    setIsAcceptingOffer(true);
    try {
      await apiClient.patch(`/vendors/custom-requests/${requestId}/accept`, {
        deliveryMethod: "SHIPPING",
        paymentMethod: "CASH_ON_DELIVERY"
      });
      showAlert("تم قبول العرض", "تم قبول عرض السعر بنجاح، وجاري تجهيز طلبك.");
      setSelectedCustomRequest(null);
      customRequests.reload();
    } catch (err: any) {
      showAlert("خطأ", err.message || "تعذر قبول العرض حالياً.");
    } finally {
      setIsAcceptingOffer(false);
    }
  };

  // Status Meta Translators
  const getServiceStatusMeta = (status: string) => {
    const mapping: Record<string, { label: string; bg: string; color: string }> = {
      PENDING: { label: "بانتظار الفنيين", bg: "#FEF9E7", color: "#B7950B" },
      WORKER_EN_ROUTE: { label: "الفني في الطريق", bg: "#EBF5FB", color: "#2980B9" },
      IN_PROGRESS: { label: "قيد التنفيذ", bg: "#EAF2F8", color: "#1F618D" },
      COMPLETED: { label: "تم الإنجاز", bg: "#E8F8F5", color: "#117A65" },
      CANCELLED: { label: "ملغي", bg: "#FDEDEC", color: "#C0392B" }
    };
    return mapping[status] || { label: status, bg: theme.backgroundRaised, color: theme.text };
  };

  const getDirectStatusMeta = (status: DirectOrder["status"]) => {
    switch (status) {
      case "PENDING":
        return { label: "قيد المراجعة", color: "#F59E0B", bg: "#FEF3C7" };
      case "PREPARING":
        return { label: "قيد التجهيز", color: "#3B82F6", bg: "#DBEAFE" };
      case "IN_TRANSIT":
        return { label: "مع المندوب", color: "#8B5CF6", bg: "#EDE9FE" };
      case "DELIVERED":
        return { label: "تم التوصيل", color: "#10B981", bg: "#D1FAE5" };
      case "CANCELLED":
        return { label: "ملغي", color: "#EF4444", bg: "#FEE2E2" };
      default:
        return { label: status, color: theme.muted, bg: theme.border };
    }
  };

  const getCustomStatusMeta = (status: CustomRequest["status"]) => {
    switch (status) {
      case "PENDING":
        return { label: "طلب جديد", color: "#F59E0B", bg: "#FEF3C7" };
      case "REPLIED":
        return { label: "وصلك عرض سعر!", color: "#3B82F6", bg: "#DBEAFE" };
      case "ACCEPTED":
        return { label: "مقبول", color: "#10B981", bg: "#D1FAE5" };
      case "REJECTED":
        return { label: "مرفوض", color: "#EF4444", bg: "#FEE2E2" };
      case "PREPARING":
        return { label: "قيد التجهيز", color: "#3B82F6", bg: "#DBEAFE" };
      case "SHIPPED":
        return { label: "تم الشحن", color: "#8B5CF6", bg: "#EDE9FE" };
      case "COMPLETED":
        return { label: "مكتمل", color: "#10B981", bg: "#D1FAE5" };
      case "CLOSED":
        return { label: "مغلق", color: theme.muted, bg: theme.border };
      default:
        return { label: status, color: theme.muted, bg: theme.border };
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("ar-EG", { day: "numeric", month: "short" });
    } catch {
      return dateStr;
    }
  };

  const handleReloadAll = () => {
    serviceRequests.reload();
    directOrders.reload();
    customRequests.reload();
  };

  return (
    <Screen title="طلباتي" subtitle="متابعة حالة طلبات الصيانة وطلبات الشراء من المتاجر." showBack={false}>
      
      {/* Main Tab Selector (Service vs Store) */}
      <View style={styles.mainTabsRow}>
        <Pressable 
          style={[styles.mainTabBtn, activeTab === "service" && styles.mainTabBtnActive]}
          onPress={() => setActiveTab("service")}
        >
          <Text style={[styles.mainTabBtnText, activeTab === "service" && styles.mainTabBtnTextActive]}>
            طلبات صيانة ({serviceRequests.data.length})
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.mainTabBtn, activeTab === "store" && styles.mainTabBtnActive]}
          onPress={() => setActiveTab("store")}
        >
          <Text style={[styles.mainTabBtnText, activeTab === "store" && styles.mainTabBtnTextActive]}>
            طلبات المتاجر ({directOrders.data.length + customRequests.data.length})
          </Text>
        </Pressable>
      </View>

      {/* Store Sub-tabs if Store selected */}
      {activeTab === "store" && (
        <View style={styles.subTabsRow}>
          <Pressable 
            style={[styles.subTabBtn, storeSubTab === "direct" && styles.subTabBtnActive]}
            onPress={() => setStoreSubTab("direct")}
          >
            <Text style={[styles.subTabBtnText, storeSubTab === "direct" && styles.subTabBtnTextActive]}>
              طلب منتجات مباشر ({directOrders.data.length})
            </Text>
          </Pressable>
          <Pressable 
            style={[styles.subTabBtn, storeSubTab === "custom" && styles.subTabBtnActive]}
            onPress={() => setStoreSubTab("custom")}
          >
            <Text style={[styles.subTabBtnText, storeSubTab === "custom" && styles.subTabBtnTextActive]}>
              طلب تفصيلي مخصص ({customRequests.data.length})
            </Text>
          </Pressable>
        </View>
      )}

      {/* Main Lists Logic */}
      {activeTab === "service" ? (
        // 1. Service Requests list
        serviceRequests.isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : (
          <FlatList
            data={serviceRequests.data}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            onRefresh={handleReloadAll}
            refreshing={serviceRequests.isLoading}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="receipt-outline" size={48} color={theme.muted} style={{ marginBottom: spacing.sm }} />
                <Text style={styles.emptyText}>لا توجد طلبات خدمة مرسلة حالياً</Text>
              </View>
            }
            renderItem={({ item }) => {
              const statusMeta = getServiceStatusMeta(item.status);
              return (
                <AppCard style={styles.card}>
                  <Pressable 
                    style={styles.cardContent}
                    onPress={() => navigation.navigate("RequestDetails", { requestId: item.id })}
                  >
                    <View style={styles.headerRow}>
                      <View style={[styles.statusBadge, { backgroundColor: statusMeta.bg }]}>
                        <Text style={[styles.statusText, { color: statusMeta.color }]}>{statusMeta.label}</Text>
                      </View>
                      <Text style={styles.requestNum}>طلب #{item.requestNumber || item.id.substring(0, 8)}</Text>
                    </View>

                    <Text style={styles.cardTitle}>{item.title}</Text>
                    
                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Ionicons name="location-outline" size={14} color={theme.muted} />
                        <Text style={styles.metaText}>{item.area}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="build-outline" size={14} color={theme.muted} />
                        <Text style={styles.metaText}>{item.serviceNameAr}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="calendar-outline" size={14} color={theme.muted} />
                        <Text style={styles.metaText}>{formatDate(item.createdAt)}</Text>
                      </View>
                    </View>
                  </Pressable>
                </AppCard>
              );
            }}
          />
        )
      ) : storeSubTab === "direct" ? (
        // 2. Direct Store Orders List
        directOrders.isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : (
          <FlatList
            data={directOrders.data}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            onRefresh={handleReloadAll}
            refreshing={directOrders.isLoading}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="storefront-outline" size={48} color={theme.muted} style={{ marginBottom: spacing.sm }} />
                <Text style={styles.emptyText}>لا توجد طلبات شراء مباشرة حالياً</Text>
              </View>
            }
            renderItem={({ item }) => {
              const statusMeta = getDirectStatusMeta(item.status);
              const shopName = item.vendor?.shopNameAr || item.vendor?.shopName || "المتجر";
              return (
                <Pressable onPress={() => setSelectedDirectOrder(item)}>
                  <AppCard style={styles.orderCard}>
                    <View style={styles.orderCardHeader}>
                      <Text style={styles.shopNameText}>{shopName}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: statusMeta.bg }]}>
                        <Text style={[styles.statusText, { color: statusMeta.color }]}>{statusMeta.label}</Text>
                      </View>
                    </View>
                    <View style={styles.orderCardDetails}>
                      <Text style={styles.orderText}>المنتجات: {item.items?.length || 0} صنف</Text>
                      <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
                    </View>
                    <View style={styles.orderCardFooter}>
                      <Text style={styles.totalPrice}>إجمالي: {item.totalAmount} ج.م</Text>
                      <Text style={styles.metaText}>
                        {item.paymentMethod === "CASH_ON_DELIVERY" ? "كاش عند الاستلام" : "دفع إلكتروني"}
                      </Text>
                    </View>
                  </AppCard>
                </Pressable>
              );
            }}
          />
        )
      ) : (
        // 3. Custom Store Requests List
        customRequests.isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : (
          <FlatList
            data={customRequests.data}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            onRefresh={handleReloadAll}
            refreshing={customRequests.isLoading}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbox-ellipses-outline" size={48} color={theme.muted} style={{ marginBottom: spacing.sm }} />
                <Text style={styles.emptyText}>لا توجد طلبات مخصصة مرسلة حالياً</Text>
              </View>
            }
            renderItem={({ item }) => {
              const statusMeta = getCustomStatusMeta(item.status);
              const shopName = item.vendor?.shopNameAr || item.vendor?.shopName || "المتجر";
              return (
                <Pressable onPress={() => setSelectedCustomRequest(item)}>
                  <AppCard style={styles.orderCard}>
                    <View style={styles.orderCardHeader}>
                      <Text style={styles.shopNameText}>{shopName} - {item.title}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: statusMeta.bg }]}>
                        <Text style={[styles.statusText, { color: statusMeta.color }]}>{statusMeta.label}</Text>
                      </View>
                    </View>
                    <View style={styles.orderCardDetails}>
                      <Text style={styles.orderDesc} numberOfLines={2}>{item.description}</Text>
                      <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
                    </View>
                    <View style={styles.orderCardFooter}>
                      {item.price ? (
                        <Text style={styles.totalPrice}>العرض المقدم: {item.price} ج.م</Text>
                      ) : (
                        <Text style={styles.noOfferText}>بانتظار تسعير المتجر</Text>
                      )}
                      {item.category && <Text style={styles.metaText}>{item.category}</Text>}
                    </View>
                  </AppCard>
                </Pressable>
              );
            }}
          />
        )
      )}

      {/* Direct Order Details Modal (Client perspective) */}
      <Modal
        visible={!!selectedDirectOrder}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedDirectOrder(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setSelectedDirectOrder(null)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </Pressable>
              <Text style={styles.modalTitle}>تفاصيل الطلب من المتجر</Text>
            </View>

            {selectedDirectOrder && (
              <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
                
                {/* Shop details */}
                <View style={styles.metaSection}>
                  <Text style={[styles.metaRowText, { fontWeight: "bold", fontSize: 15 }]}>
                    متجر: {selectedDirectOrder.vendor?.shopNameAr || selectedDirectOrder.vendor?.shopName}
                  </Text>
                  <Text style={styles.metaRowText}>رقم الطلب: #{selectedDirectOrder.id.slice(-6).toUpperCase()}</Text>
                  <Text style={styles.metaRowText}>التاريخ: {new Date(selectedDirectOrder.createdAt).toLocaleString("ar-EG")}</Text>
                  <Text style={styles.metaRowText}>
                    حالة الطلب الحالية: <Text style={{ fontWeight: "bold", color: getDirectStatusMeta(selectedDirectOrder.status).color }}>
                      {getDirectStatusMeta(selectedDirectOrder.status).label}
                    </Text>
                  </Text>
                </View>

                {/* Items List */}
                <Text style={styles.sectionTitle}>المنتجات المطلوبة</Text>
                <View style={styles.itemsWrapper}>
                  {selectedDirectOrder.items?.map((item) => (
                    <View key={item.id} style={styles.itemRow}>
                      <Text style={styles.itemQty}>× {item.qty}</Text>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.product?.nameAr}</Text>
                        <Text style={styles.itemUnitPrice}>{item.unitPrice} ج.م</Text>
                      </View>
                      <Text style={styles.itemTotal}>{item.unitPrice * item.qty} ج.م</Text>
                    </View>
                  ))}
                </View>

                {/* Delivery Notes */}
                {selectedDirectOrder.deliveryNotes ? (
                  <View style={styles.notesSection}>
                    <Text style={styles.notesTitle}>ملاحظات التوصيل المرفقة:</Text>
                    <Text style={styles.notesText}>{selectedDirectOrder.deliveryNotes}</Text>
                  </View>
                ) : null}

                {/* Price Summary */}
                <View style={styles.priceSummary}>
                  <Text style={styles.priceSummaryLabel}>الإجمالي الكلي</Text>
                  <Text style={styles.priceSummaryVal}>{selectedDirectOrder.totalAmount} ج.م</Text>
                </View>

                {/* Communication buttons */}
                <Text style={styles.sectionTitle}>التواصل مع المتجر</Text>
                <AppButton 
                  title="مراسلة المتجر شات" 
                  variant="primary"
                  onPress={() => handleChatWithVendor(
                    selectedDirectOrder.vendor.userId, 
                    selectedDirectOrder.vendor.shopNameAr || selectedDirectOrder.vendor.shopName
                  )}
                />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Custom Request Details Modal (Client perspective) */}
      <Modal
        visible={!!selectedCustomRequest}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedCustomRequest(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setSelectedCustomRequest(null)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </Pressable>
              <Text style={styles.modalTitle}>تفاصيل طلب التسعير المخصص</Text>
            </View>

            {selectedCustomRequest && (
              <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
                
                {/* Vendor details */}
                <View style={styles.metaSection}>
                  <Text style={[styles.metaRowText, { fontWeight: "bold", fontSize: 15 }]}>
                    موجه للمتجر: {selectedCustomRequest.vendor?.shopNameAr || selectedCustomRequest.vendor?.shopName}
                  </Text>
                  <Text style={styles.metaRowText}>العنوان: {selectedCustomRequest.title}</Text>
                  <Text style={styles.metaRowText}>التاريخ: {new Date(selectedCustomRequest.createdAt).toLocaleString("ar-EG")}</Text>
                  <Text style={styles.metaRowText}>
                    الحالة الحالية: <Text style={{ fontWeight: "bold", color: getCustomStatusMeta(selectedCustomRequest.status).color }}>
                      {getCustomStatusMeta(selectedCustomRequest.status).label}
                    </Text>
                  </Text>
                </View>

                {/* Description */}
                <Text style={styles.sectionTitle}>مواصفاتك المطلوبة</Text>
                <AppCard style={styles.descBox}>
                  <Text style={styles.descText}>{selectedCustomRequest.description}</Text>
                </AppCard>

                {/* Offer description if replied */}
                {selectedCustomRequest.vendorReply ? (
                  <View style={styles.replySection}>
                    <Text style={styles.sectionTitle}>عرض السعر والرد المقدم من المتجر</Text>
                    <AppCard style={styles.offerBox}>
                      <Text style={styles.offerNotes}>الرد: {selectedCustomRequest.vendorReply}</Text>
                      {selectedCustomRequest.price && (
                        <Text style={styles.offerPrice}>السعر: {selectedCustomRequest.price} ج.م</Text>
                      )}
                    </AppCard>

                    {/* Accept offer button if status is REPLIED */}
                    {selectedCustomRequest.status === "REPLIED" && (
                      <AppButton 
                        title="قبول عرض السعر وتأكيد الشراء" 
                        variant="primary"
                        isLoading={isAcceptingOffer}
                        style={{ marginTop: spacing.xs }}
                        onPress={() => handleAcceptOffer(selectedCustomRequest.id)}
                      />
                    )}
                  </View>
                ) : (
                  <View style={styles.replySection}>
                    <Text style={styles.noOfferText}>بانتظار مراجعة المتجر لطلبك وتقديم عرض السعر...</Text>
                  </View>
                )}

                {/* Communication buttons */}
                <Text style={styles.sectionTitle}>التواصل مع المتجر</Text>
                <AppButton 
                  title="مراسلة المتجر شات" 
                  variant="primary"
                  onPress={() => handleChatWithVendor(
                    selectedCustomRequest.vendor.userId, 
                    selectedCustomRequest.vendor.shopNameAr || selectedCustomRequest.vendor.shopName
                  )}
                />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

    </Screen>
  );
}

const makeStyles = (theme: ReturnType<typeof useTheme>["theme"]) => StyleSheet.create({
  mainTabsRow: {
    flexDirection: "row-reverse",
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: theme.surface,
    marginBottom: spacing.xs
  },
  mainTabBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.surface
  },
  mainTabBtnActive: {
    backgroundColor: theme.primary
  },
  mainTabBtnText: {
    fontSize: 13,
    fontWeight: "bold",
    color: theme.text
  },
  mainTabBtnTextActive: {
    color: theme.primaryText
  },
  subTabsRow: {
    flexDirection: "row-reverse",
    gap: spacing.xs,
    marginBottom: spacing.md
  },
  subTabBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: theme.border,
    backgroundColor: theme.surface
  },
  subTabBtnActive: {
    borderColor: theme.primary,
    backgroundColor: theme.primarySoft
  },
  subTabBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: theme.text
  },
  subTabBtnTextActive: {
    color: theme.primary
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl
  },
  listContainer: {
    paddingBottom: spacing.lg,
    gap: spacing.sm
  },
  card: {
    padding: 0,
    overflow: "hidden"
  },
  cardContent: {
    padding: spacing.md,
    gap: spacing.sm
  },
  headerRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center"
  },
  requestNum: {
    fontSize: 11,
    fontWeight: "bold",
    color: theme.muted
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    fontSize: 11,
    fontWeight: "bold"
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.text,
    textAlign: "right"
  },
  metaRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.border + "40",
    paddingTop: spacing.sm
  },
  metaItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4
  },
  metaText: {
    fontSize: 12,
    color: theme.subtle
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
    gap: spacing.xs
  },
  emptyText: {
    color: theme.muted,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center"
  },
  orderCard: {
    padding: spacing.md,
    backgroundColor: theme.surface,
    gap: spacing.xs
  },
  orderCardHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center"
  },
  shopNameText: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.text,
    textAlign: "right"
  },
  orderCardDetails: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    paddingBottom: spacing.xs,
    marginBottom: 4
  },
  orderText: {
    fontSize: 13,
    color: theme.text,
    textAlign: "right"
  },
  orderDesc: {
    fontSize: 12,
    color: theme.muted,
    textAlign: "right",
    flex: 1,
    marginLeft: spacing.lg
  },
  orderDate: {
    fontSize: 11,
    color: theme.muted
  },
  orderCardFooter: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 4
  },
  totalPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.primary
  },
  noOfferText: {
    fontSize: 12,
    color: theme.muted,
    fontWeight: "600"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end"
  },
  modalContent: {
    backgroundColor: theme.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    paddingBottom: spacing.lg
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.border
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.text
  },
  modalScroll: {
    padding: spacing.lg,
    gap: spacing.md
  },
  metaSection: {
    backgroundColor: theme.surface,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: "flex-end",
    gap: spacing.xs
  },
  metaRowText: {
    fontSize: 13,
    color: theme.text,
    textAlign: "right"
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.text,
    textAlign: "right",
    marginBottom: -spacing.xs
  },
  itemsWrapper: {
    gap: spacing.xs
  },
  itemRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: theme.surface,
    borderRadius: 8,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: theme.border
  },
  itemQty: {
    fontSize: 13,
    fontWeight: "bold",
    color: theme.primary,
    marginLeft: spacing.sm
  },
  itemInfo: {
    flex: 1,
    alignItems: "flex-end"
  },
  itemName: {
    fontSize: 13,
    fontWeight: "bold",
    color: theme.text,
    textAlign: "right"
  },
  itemUnitPrice: {
    fontSize: 11,
    color: theme.muted
  },
  itemTotal: {
    fontSize: 13,
    fontWeight: "bold",
    color: theme.text
  },
  notesSection: {
    backgroundColor: theme.surface,
    padding: spacing.md,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.primary,
    alignItems: "flex-end"
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: theme.text,
    marginBottom: 4
  },
  notesText: {
    fontSize: 12,
    color: theme.muted,
    textAlign: "right"
  },
  priceSummary: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.border
  },
  priceSummaryLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.text
  },
  priceSummaryVal: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.primary
  },
  descBox: {
    padding: spacing.md,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border
  },
  descText: {
    fontSize: 13,
    color: theme.text,
    lineHeight: 20,
    textAlign: "right"
  },
  replySection: {
    gap: spacing.xs
  },
  offerBox: {
    padding: spacing.md,
    backgroundColor: theme.primarySoft,
    borderColor: theme.primary + "30",
    borderWidth: 1,
    gap: spacing.xs
  },
  offerNotes: {
    fontSize: 13,
    color: theme.text,
    textAlign: "right"
  },
  offerPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.primary,
    textAlign: "right"
  }
});

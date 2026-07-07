import { useState } from "react";
import { StyleSheet, Text, View, ActivityIndicator, FlatList, Pressable, Modal, ScrollView, Alert, Platform, TextInput, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { apiClient } from "../../api/client";
import { AppButton } from "../../components/AppButton";
import { AppCard } from "../../components/AppCard";
import { Screen } from "../../components/Screen";
import { useApiResource } from "../../hooks/useApiResource";
import { useTheme } from "../../context/ThemeContext";
import { spacing } from "../../theme/spacing";

type DirectOrderItem = {
  id: string;
  productId: string;
  qty: number;
  unitPrice: number;
  product: {
    nameAr: string;
    nameEn?: string;
    imageUrl?: string;
  };
};

type DirectOrder = {
  id: string;
  clientId: string;
  totalAmount: number;
  status: "PENDING" | "PREPARING" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
  paymentMethod: string;
  deliveryNotes?: string;
  createdAt: string;
  items: DirectOrderItem[];
  client?: {
    name: string;
    phone?: string;
  } | null;
};

type CustomRequest = {
  id: string;
  clientId: string;
  vendorId: string;
  title: string;
  description: string;
  category?: string;
  price?: number;
  status: "PENDING" | "REPLIED" | "ACCEPTED" | "REJECTED" | "PREPARING" | "SHIPPED" | "COMPLETED" | "CLOSED";
  vendorReply?: string;
  createdAt: string;
  clientName: string;
  clientPhone?: string;
};

export function OrdersScreen() {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const navigation = useNavigation<any>();

  // Api Resources
  const directOrders = useApiResource<DirectOrder[]>("/vendors/direct-orders", []);
  const customRequests = useApiResource<CustomRequest[]>("/vendors/custom-requests", []);

  // UI Active Tab: "direct" | "custom"
  const [activeTab, setActiveTab] = useState<"direct" | "custom">("direct");

  // Selected Items for Details Modal
  const [selectedDirectOrder, setSelectedDirectOrder] = useState<DirectOrder | null>(null);
  const [selectedCustomRequest, setSelectedCustomRequest] = useState<CustomRequest | null>(null);

  // Custom Request Reply Form State
  const [replyPrice, setReplyPrice] = useState("");
  const [replyNotes, setReplyNotes] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  function showAlert(title: string, message: string, onConfirm?: () => void) {
    if (Platform.OS === "web") {
      alert(`${title}: ${message}`);
      if (onConfirm) onConfirm();
    } else {
      if (onConfirm) {
        Alert.alert(title, message, [{ text: "حسناً", onPress: onConfirm }]);
      } else {
        Alert.alert(title, message);
      }
    }
  }

  // Handle call dialer
  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      showAlert("تعذر الاتصال", "لا يمكن فتح تطبيق الاتصال الهاتفي.");
    });
  };

  // Handle navigating to chat
  const handleChat = (userId: string, name: string) => {
    navigation.navigate("Chat", {
      conversationId: userId,
      recipientName: name
    });
  };

  // Update Status of Direct Order
  const handleUpdateDirectOrderStatus = async (orderId: string, newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      await apiClient.put(`/vendors/direct-orders/${orderId}/status`, { status: newStatus });
      showAlert("تم تحديث الحالة", "تم تغيير حالة الطلب بنجاح.");
      setSelectedDirectOrder(null);
      directOrders.reload();
    } catch (err: any) {
      showAlert("خطأ", err.message || "تعذر تحديث حالة الطلب.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Submit Reply to Custom Request
  const handleSubmitCustomRequestReply = async (requestId: string) => {
    if (!replyNotes.trim()) {
      showAlert("حقل مطلوب", "يرجى كتابة الرد/العرض للعميل.");
      return;
    }

    const priceNum = parseFloat(replyPrice);
    if (replyPrice.trim() && (isNaN(priceNum) || priceNum <= 0)) {
      showAlert("خطأ في القيمة", "السعر المدخل غير صحيح.");
      return;
    }

    setIsSubmittingReply(true);
    try {
      await apiClient.patch(`/vendors/custom-requests/${requestId}/reply`, {
        reply: replyNotes.trim(),
        price: replyPrice.trim() ? priceNum : undefined
      });
      showAlert("تم إرسال العرض", "تم إرسال عرض السعر للعميل بنجاح.");
      setSelectedCustomRequest(null);
      setReplyPrice("");
      setReplyNotes("");
      customRequests.reload();
    } catch (err: any) {
      showAlert("خطأ", err.message || "تعذر إرسال عرض السعر.");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Update Status of Custom Request Order
  const handleUpdateCustomRequestStatus = async (requestId: string, newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      await apiClient.patch(`/vendors/custom-requests/${requestId}/status`, { status: newStatus });
      showAlert("تم تحديث الحالة", "تم تحديث حالة طلب العميل بنجاح.");
      setSelectedCustomRequest(null);
      customRequests.reload();
    } catch (err: any) {
      showAlert("خطأ", err.message || "تعذر تحديث حالة الطلب.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Status Translators & Styles
  const getDirectStatusConfig = (status: DirectOrder["status"]) => {
    switch (status) {
      case "PENDING":
        return { text: "قيد الانتظار", color: "#F59E0B", bg: "#FEF3C7" };
      case "PREPARING":
        return { text: "قيد التجهيز", color: "#3B82F6", bg: "#DBEAFE" };
      case "IN_TRANSIT":
        return { text: "مع المندوب", color: "#8B5CF6", bg: "#EDE9FE" };
      case "DELIVERED":
        return { text: "تم التوصيل", color: "#10B981", bg: "#D1FAE5" };
      case "CANCELLED":
        return { text: "ملغي", color: "#EF4444", bg: "#FEE2E2" };
      default:
        return { text: status, color: theme.muted, bg: theme.border };
    }
  };

  const getCustomStatusConfig = (status: CustomRequest["status"]) => {
    switch (status) {
      case "PENDING":
        return { text: "طلب جديد", color: "#F59E0B", bg: "#FEF3C7" };
      case "REPLIED":
        return { text: "تم تقديم عرضك", color: "#3B82F6", bg: "#DBEAFE" };
      case "ACCEPTED":
        return { text: "مقبول من العميل", color: "#10B981", bg: "#D1FAE5" };
      case "REJECTED":
        return { text: "مرفوض", color: "#EF4444", bg: "#FEE2E2" };
      case "PREPARING":
        return { text: "جاري التحضير", color: "#3B82F6", bg: "#DBEAFE" };
      case "SHIPPED":
        return { text: "تم الشحن", color: "#8B5CF6", bg: "#EDE9FE" };
      case "COMPLETED":
        return { text: "مكتمل", color: "#10B981", bg: "#D1FAE5" };
      case "CLOSED":
        return { text: "مغلق", color: theme.muted, bg: theme.border };
      default:
        return { text: status, color: theme.muted, bg: theme.border };
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("ar-EG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    } catch {
      return dateStr;
    }
  };

  return (
    <Screen title="الطلبات" subtitle="إدارة وتجهيز طلبات العملاء المباشرة والمخصصة." showBack={false}>
      
      {/* Tabs Selector */}
      <View style={styles.tabsRow}>
        <Pressable 
          style={[styles.tabButton, activeTab === "direct" && styles.tabButtonActive]}
          onPress={() => setActiveTab("direct")}
        >
          <Text style={[styles.tabButtonText, activeTab === "direct" && styles.tabButtonTextActive]}>
            طلبات مباشرة ({directOrders.data.length})
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.tabButton, activeTab === "custom" && styles.tabButtonActive]}
          onPress={() => setActiveTab("custom")}
        >
          <Text style={[styles.tabButtonText, activeTab === "custom" && styles.tabButtonTextActive]}>
            طلبات تفصيلية ({customRequests.data.length})
          </Text>
        </Pressable>
      </View>

      {/* Orders List */}
      {activeTab === "direct" ? (
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
            onRefresh={directOrders.reload}
            refreshing={directOrders.isLoading}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="receipt-outline" size={48} color={theme.muted} style={{ marginBottom: spacing.sm }} />
                <Text style={styles.emptyText}>لا توجد طلبات مباشرة حالياً</Text>
              </View>
            }
            renderItem={({ item }) => {
              const statusCfg = getDirectStatusConfig(item.status);
              return (
                <Pressable onPress={() => setSelectedDirectOrder(item)}>
                  <AppCard style={styles.orderCard}>
                    <View style={styles.orderCardHeader}>
                      <Text style={styles.orderId}>طلب #{item.id.slice(-6).toUpperCase()}</Text>
                      <View style={[styles.statusChip, { backgroundColor: statusCfg.bg }]}>
                        <Text style={[styles.statusChipText, { color: statusCfg.color }]}>{statusCfg.text}</Text>
                      </View>
                    </View>
                    <View style={styles.orderCardDetails}>
                      <Text style={styles.orderText}>المنتجات: {item.items?.length || 0} صنف</Text>
                      <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
                    </View>
                    <View style={styles.orderCardFooter}>
                      <Text style={styles.totalPrice}>إجمالي: {item.totalAmount} ج.م</Text>
                      <Text style={styles.paymentMethod}>
                        {item.paymentMethod === "CASH_ON_DELIVERY" ? "كاش عند الاستلام" : "تحويل فودافون/إنستاباي"}
                      </Text>
                    </View>
                  </AppCard>
                </Pressable>
              );
            }}
          />
        )
      ) : (
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
            onRefresh={customRequests.reload}
            refreshing={customRequests.isLoading}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="create-outline" size={48} color={theme.muted} style={{ marginBottom: spacing.sm }} />
                <Text style={styles.emptyText}>لا توجد طلبات تفصيلية/مخصصة حالياً</Text>
              </View>
            }
            renderItem={({ item }) => {
              const statusCfg = getCustomStatusConfig(item.status);
              return (
                <Pressable onPress={() => setSelectedCustomRequest(item)}>
                  <AppCard style={styles.orderCard}>
                    <View style={styles.orderCardHeader}>
                      <Text style={styles.orderId} numberOfLines={1}>{item.title}</Text>
                      <View style={[styles.statusChip, { backgroundColor: statusCfg.bg }]}>
                        <Text style={[styles.statusChipText, { color: statusCfg.color }]}>{statusCfg.text}</Text>
                      </View>
                    </View>
                    <View style={styles.orderCardDetails}>
                      <Text style={styles.orderDesc} numberOfLines={2}>{item.description}</Text>
                      <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
                    </View>
                    <View style={styles.orderCardFooter}>
                      {item.price ? (
                        <Text style={styles.totalPrice}>العرض: {item.price} ج.م</Text>
                      ) : (
                        <Text style={styles.noOfferText}>بانتظار عرض السعر</Text>
                      )}
                      {item.category && <Text style={styles.paymentMethod}>{item.category}</Text>}
                    </View>
                  </AppCard>
                </Pressable>
              );
            }}
          />
        )
      )}

      {/* Direct Order Details Modal */}
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
              <Text style={styles.modalTitle}>تفاصيل الطلب المباشر</Text>
            </View>

            {selectedDirectOrder && (
              <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
                
                {/* Meta details */}
                <View style={styles.metaSection}>
                  <Text style={styles.metaRow}>رقم الطلب: #{selectedDirectOrder.id.toUpperCase()}</Text>
                  <Text style={styles.metaRow}>التاريخ: {formatDate(selectedDirectOrder.createdAt)}</Text>
                  <Text style={styles.metaRow}>
                    طريقة الدفع: {selectedDirectOrder.paymentMethod === "CASH_ON_DELIVERY" ? "الدفع عند الاستلام" : "تحويل إلكتروني"}
                  </Text>
                  <Text style={styles.metaRow}>
                    الحالة الحالية: <Text style={{ fontWeight: "bold", color: getDirectStatusConfig(selectedDirectOrder.status).color }}>
                      {getDirectStatusConfig(selectedDirectOrder.status).text}
                    </Text>
                  </Text>
                </View>

                {/* Client Details Section */}
                <View style={styles.clientDetailsCard}>
                  <Text style={styles.clientDetailsTitle}>بيانات التواصل مع العميل</Text>
                  <View style={styles.clientDetailsContent}>
                    <Text style={styles.clientText}>اسم العميل: {selectedDirectOrder.client?.name || "عميل أُسطى"}</Text>
                    {selectedDirectOrder.client?.phone ? (
                      <Text style={styles.clientText}>رقم الجوال: {selectedDirectOrder.client.phone}</Text>
                    ) : null}
                  </View>
                  <View style={styles.clientActionsRow}>
                    {selectedDirectOrder.client?.phone ? (
                      <Pressable style={styles.clientCallBtn} onPress={() => handleCall(selectedDirectOrder.client!.phone!)}>
                        <Ionicons name="call" size={16} color={theme.primary} />
                        <Text style={styles.clientCallBtnText}>اتصال هاتفي</Text>
                      </Pressable>
                    ) : null}
                    <Pressable 
                      style={styles.clientChatBtn} 
                      onPress={() => handleChat(selectedDirectOrder.clientId, selectedDirectOrder.client?.name || "عميل أُسطى")}
                    >
                      <Ionicons name="chatbubble-ellipses" size={16} color={theme.primaryText} />
                      <Text style={styles.clientChatBtnText}>محادثة فورية</Text>
                    </Pressable>
                  </View>
                </View>

                {/* Items Section */}
                <Text style={styles.sectionTitle}>المنتجات المطلوبة</Text>
                <View style={styles.itemsWrapper}>
                  {selectedDirectOrder.items?.map((item) => (
                    <View key={item.id} style={styles.itemRow}>
                      <Text style={styles.itemQty}>× {item.qty}</Text>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.product?.nameAr}</Text>
                        <Text style={styles.itemUnitPrice}>{item.unitPrice} ج.م للوحدة</Text>
                      </View>
                      <Text style={styles.itemTotal}>{item.unitPrice * item.qty} ج.م</Text>
                    </View>
                  ))}
                </View>

                {/* Delivery Notes */}
                {selectedDirectOrder.deliveryNotes ? (
                  <View style={styles.notesSection}>
                    <Text style={styles.notesTitle}>ملاحظات العميل للتوصيل:</Text>
                    <Text style={styles.notesText}>{selectedDirectOrder.deliveryNotes}</Text>
                  </View>
                ) : null}

                {/* Total Price Section */}
                <View style={styles.priceSummary}>
                  <Text style={styles.priceSummaryLabel}>الإجمالي الكلي</Text>
                  <Text style={styles.priceSummaryVal}>{selectedDirectOrder.totalAmount} ج.م</Text>
                </View>

                {/* Action controls */}
                <Text style={styles.sectionTitle}>تحديث حالة الطلب</Text>
                <View style={styles.actionsContainer}>
                  {selectedDirectOrder.status === "PENDING" && (
                    <AppButton 
                      title="قبول وبدء التجهيز" 
                      variant="primary"
                      isLoading={isUpdatingStatus}
                      onPress={() => handleUpdateDirectOrderStatus(selectedDirectOrder.id, "PREPARING")}
                    />
                  )}
                  {selectedDirectOrder.status === "PREPARING" && (
                    <AppButton 
                      title="تسليم لمندوب التوصيل" 
                      variant="primary"
                      isLoading={isUpdatingStatus}
                      onPress={() => handleUpdateDirectOrderStatus(selectedDirectOrder.id, "IN_TRANSIT")}
                    />
                  )}
                  {selectedDirectOrder.status === "IN_TRANSIT" && (
                    <AppButton 
                      title="تم توصيل الطلب بنجاح" 
                      variant="primary"
                      isLoading={isUpdatingStatus}
                      onPress={() => handleUpdateDirectOrderStatus(selectedDirectOrder.id, "DELIVERED")}
                    />
                  )}

                  {/* Cancel Button */}
                  {selectedDirectOrder.status !== "DELIVERED" && selectedDirectOrder.status !== "CANCELLED" && (
                    <Pressable 
                      style={[styles.cancelBtn, isUpdatingStatus && { opacity: 0.55 }]}
                      disabled={isUpdatingStatus}
                      onPress={() => handleUpdateDirectOrderStatus(selectedDirectOrder.id, "CANCELLED")}
                    >
                      {isUpdatingStatus ? (
                        <ActivityIndicator color={theme.danger} />
                      ) : (
                        <Text style={styles.cancelBtnText}>إلغاء الطلب</Text>
                      )}
                    </Pressable>
                  )}
                </View>

              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Custom Request Details Modal */}
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
              <Text style={styles.modalTitle}>تفاصيل الطلب المخصص</Text>
            </View>

            {selectedCustomRequest && (
              <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
                
                {/* Details Section */}
                <View style={styles.metaSection}>
                  <Text style={[styles.metaRow, { fontWeight: "bold", fontSize: 15 }]}>{selectedCustomRequest.title}</Text>
                  <Text style={styles.metaRow}>التاريخ: {formatDate(selectedCustomRequest.createdAt)}</Text>
                  {selectedCustomRequest.category && <Text style={styles.metaRow}>القسم: {selectedCustomRequest.category}</Text>}
                  <Text style={styles.metaRow}>
                    حالة الطلب: <Text style={{ fontWeight: "bold", color: getCustomStatusConfig(selectedCustomRequest.status).color }}>
                      {getCustomStatusConfig(selectedCustomRequest.status).text}
                    </Text>
                  </Text>
                </View>

                {/* Client Details Section */}
                <View style={styles.clientDetailsCard}>
                  <Text style={styles.clientDetailsTitle}>بيانات التواصل مع العميل</Text>
                  <View style={styles.clientDetailsContent}>
                    <Text style={styles.clientText}>اسم العميل: {selectedCustomRequest.clientName || "عميل أُسطى"}</Text>
                    {selectedCustomRequest.clientPhone ? (
                      <Text style={styles.clientText}>رقم الجوال: {selectedCustomRequest.clientPhone}</Text>
                    ) : null}
                  </View>
                  <View style={styles.clientActionsRow}>
                    {selectedCustomRequest.clientPhone ? (
                      <Pressable style={styles.clientCallBtn} onPress={() => handleCall(selectedCustomRequest.clientPhone!)}>
                        <Ionicons name="call" size={16} color={theme.primary} />
                        <Text style={styles.clientCallBtnText}>اتصال هاتفي</Text>
                      </Pressable>
                    ) : null}
                    <Pressable 
                      style={styles.clientChatBtn} 
                      onPress={() => handleChat(selectedCustomRequest.clientId, selectedCustomRequest.clientName || "عميل أُسطى")}
                    >
                      <Ionicons name="chatbubble-ellipses" size={16} color={theme.primaryText} />
                      <Text style={styles.clientChatBtnText}>محادثة فورية</Text>
                    </Pressable>
                  </View>
                </View>

                {/* Description */}
                <Text style={styles.sectionTitle}>مواصفات وطلبات العميل</Text>
                <AppCard style={styles.descBox}>
                  <Text style={styles.descText}>{selectedCustomRequest.description}</Text>
                </AppCard>

                {/* Vendor Reply Info if already replied */}
                {selectedCustomRequest.status !== "PENDING" && selectedCustomRequest.vendorReply ? (
                  <View style={styles.replySection}>
                    <Text style={styles.sectionTitle}>عرض السعر المقدم منك</Text>
                    <AppCard style={styles.offerBox}>
                      <Text style={styles.offerNotes}>توضيح العرض: {selectedCustomRequest.vendorReply}</Text>
                      {selectedCustomRequest.price && (
                        <Text style={styles.offerPrice}>السعر المقترح: {selectedCustomRequest.price} ج.م</Text>
                      )}
                    </AppCard>
                  </View>
                ) : null}

                {/* Form to submit reply if Pending */}
                {selectedCustomRequest.status === "PENDING" && (
                  <View style={styles.replyForm}>
                    <Text style={styles.sectionTitle}>تقديم عرض سعر للعميل</Text>
                    
                    <Text style={styles.fieldLabel}>السعر المقترح (ج.م)</Text>
                    <TextInput 
                      style={styles.formInput} 
                      placeholder="مثال: 350" 
                      placeholderTextColor={theme.muted}
                      keyboardType="numeric"
                      value={replyPrice} 
                      onChangeText={setReplyPrice}
                    />

                    <Text style={styles.fieldLabel}>ملاحظات وتفاصيل العرض*</Text>
                    <TextInput 
                      style={[styles.formInput, { height: 100, textAlignVertical: "top" }]} 
                      placeholder="اكتب للعميل مواصفات القطع المتوفرة، الجودة، وتاريخ التوصيل المقترح..." 
                      placeholderTextColor={theme.muted}
                      multiline 
                      numberOfLines={4}
                      value={replyNotes} 
                      onChangeText={setReplyNotes}
                    />

                    <AppButton 
                      title="تقديم عرض سعر الآن" 
                      variant="primary"
                      isLoading={isSubmittingReply}
                      style={{ marginTop: spacing.sm }}
                      onPress={() => handleSubmitCustomRequestReply(selectedCustomRequest.id)}
                    />
                  </View>
                )}

                {/* Status transitions if client ACCEPTED the offer */}
                {["ACCEPTED", "PREPARING", "SHIPPED"].includes(selectedCustomRequest.status) && (
                  <View style={styles.replyForm}>
                    <Text style={styles.sectionTitle}>تحديث حالة طلب التجهيز</Text>
                    
                    {selectedCustomRequest.status === "ACCEPTED" && (
                      <AppButton 
                        title="تأكيد والبدء في التحضير" 
                        variant="primary"
                        isLoading={isUpdatingStatus}
                        onPress={() => handleUpdateCustomRequestStatus(selectedCustomRequest.id, "PREPARING")}
                      />
                    )}

                    {selectedCustomRequest.status === "PREPARING" && (
                      <AppButton 
                        title="تم شحن الطلب المخصص" 
                        variant="primary"
                        isLoading={isUpdatingStatus}
                        onPress={() => handleUpdateCustomRequestStatus(selectedCustomRequest.id, "SHIPPED")}
                      />
                    )}

                    {selectedCustomRequest.status === "SHIPPED" && (
                      <AppButton 
                        title="اكتمال وتسليم الطلب" 
                        variant="primary"
                        isLoading={isUpdatingStatus}
                        onPress={() => handleUpdateCustomRequestStatus(selectedCustomRequest.id, "COMPLETED")}
                      />
                    )}

                    {/* Reject/Cancel offer */}
                    <Pressable 
                      style={[styles.cancelBtn, isUpdatingStatus && { opacity: 0.55 }]}
                      disabled={isUpdatingStatus}
                      onPress={() => handleUpdateCustomRequestStatus(selectedCustomRequest.id, "REJECTED")}
                    >
                      {isUpdatingStatus ? (
                        <ActivityIndicator color={theme.danger} />
                      ) : (
                        <Text style={styles.cancelBtnText}>إلغاء/رفض الطلب</Text>
                      )}
                    </Pressable>
                  </View>
                )}

              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

    </Screen>
  );
}

const makeStyles = (theme: ReturnType<typeof useTheme>["theme"]) => StyleSheet.create({
  tabsRow: {
    flexDirection: "row-reverse",
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: theme.surface,
    marginBottom: spacing.md
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.surface
  },
  tabButtonActive: {
    backgroundColor: theme.primary
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: "bold",
    color: theme.text
  },
  tabButtonTextActive: {
    color: theme.primaryText
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
  orderId: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.text,
    textAlign: "right"
  },
  statusChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: "bold"
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
  paymentMethod: {
    fontSize: 12,
    color: theme.muted
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
    fontWeight: "bold",
    textAlign: "center"
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
  metaRow: {
    fontSize: 13,
    color: theme.text,
    textAlign: "right"
  },
  clientDetailsCard: {
    backgroundColor: theme.surface,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    gap: spacing.sm
  },
  clientDetailsTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: theme.text,
    textAlign: "right",
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    paddingBottom: 4
  },
  clientDetailsContent: {
    alignItems: "flex-end",
    gap: spacing.xs
  },
  clientText: {
    fontSize: 13,
    color: theme.text,
    textAlign: "right"
  },
  clientActionsRow: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
    marginTop: 4
  },
  clientCallBtn: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: theme.primary,
    backgroundColor: "transparent"
  },
  clientCallBtnText: {
    color: theme.primary,
    fontSize: 12,
    fontWeight: "bold"
  },
  clientChatBtn: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.primary
  },
  clientChatBtnText: {
    color: theme.primaryText,
    fontSize: 12,
    fontWeight: "bold"
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
  actionsContainer: {
    gap: spacing.xs
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
  },
  replyForm: {
    gap: spacing.sm
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: theme.text,
    textAlign: "right"
  },
  formInput: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface,
    color: theme.text,
    paddingHorizontal: spacing.md,
    textAlign: "right",
    fontSize: 13
  },
  cancelBtn: {
    minHeight: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1.5,
    borderColor: theme.danger,
    backgroundColor: "transparent",
    marginTop: spacing.sm
  },
  cancelBtnText: {
    color: theme.danger,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center"
  }
});

import { useNavigation, useRoute } from "@react-navigation/native";
import { useState } from "react";
import { StyleSheet, Text, View, ActivityIndicator, Pressable, FlatList, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

import { Screen } from "../../components/Screen";
import { AppCard } from "../../components/AppCard";
import { AppButton } from "../../components/AppButton";
import { TextField } from "../../components/TextField";
import { useApiResource } from "../../hooks/useApiResource";
import { useTheme } from "../../context/ThemeContext";
import { spacing } from "../../theme/spacing";
import { apiClient } from "../../api/client";

type RouteParams = {
  vendorId: string;
};

type VendorStoreDetail = {
  id: string;
  shopName: string;
  shopNameAr: string;
  category: string;
  shopDescription: string | null;
  shopImageUrl: string | null;
  governorate: string;
  city: string;
  rating: number;
  ratingCount: number;
  isOpen: boolean;
};

type VendorProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  unit?: string;
};

type StoreData = {
  vendor: VendorStoreDetail;
  products: VendorProduct[];
};

export function VendorProfileScreen() {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { vendorId } = route.params as RouteParams;

  // Local shopping cart state: productId -> quantity
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState("");

  const storeResource = useApiResource<StoreData | null>(
    `/vendors/stores/${vendorId}/products`,
    null
  );

  const data = storeResource.data;
  const isLoading = storeResource.isLoading;

  if (isLoading) {
    return (
      <Screen showBack={true} title="متجر المورد" scroll={false}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </Screen>
    );
  }

  if (!data || !data.vendor) {
    return (
      <Screen showBack={true} title="متجر غير متوفر" scroll={false}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.danger} />
          <Text style={styles.errorText}>عذراً، لم يتم العثور على بيانات هذا المتجر حالياً.</Text>
          <AppButton 
            title="العودة للدليل" 
            onPress={() => navigation.goBack()} 
            style={{ marginTop: spacing.md }}
          />
        </View>
      </Screen>
    );
  }

  const { vendor, products } = data;

  // Cart operations
  const updateQty = (productId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[productId] ?? 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: next };
    });
  };

  const getProductQty = (productId: string) => cart[productId] ?? 0;

  // Calculate cart summary
  const cartItemsArray = Object.entries(cart).map(([productId, qty]) => {
    const product = products.find((p) => p.id === productId);
    return {
      productId,
      qty,
      price: product?.price ?? 0,
      name: product?.name ?? "منتج",
    };
  });

  const cartTotal = cartItemsArray.reduce((acc, item) => acc + item.price * item.qty, 0);

  // Submit Direct Order
  const handlePlaceOrder = async () => {
    if (cartItemsArray.length === 0) {
      Alert.alert("السلة فارغة", "برجاء إضافة منتج واحد على الأقل لإجراء الطلب.");
      return;
    }
    if (!vendor.isOpen) {
      Alert.alert("عذراً", "هذا المتجر مغلق حالياً ولا يستقبل طلبات جديدة.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post(`/vendors/stores/${vendorId}/order`, {
        items: cartItemsArray.map(item => ({ productId: item.productId, qty: item.qty })),
        deliveryNotes: deliveryNotes || undefined,
        paymentMethod: "COD" // Cash on delivery
      });

      Alert.alert("تم إرسال الطلب بنجاح", "تم إرسال طلبك المباشر للمتجر، وسيتم التواصل معك لتأكيد التوصيل.", [
        { text: "حسناً", onPress: () => navigation.goBack() }
      ]);
    } catch (err: any) {
      Alert.alert("تعذر تقديم الطلب", err instanceof Error ? err.message : "حدث خطأ ما، يرجى المحاولة لاحقاً.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen showBack={true} title={vendor.shopNameAr || vendor.shopName} scroll={true}>
      {/* 1. Shop Profile Details Header */}
      <AppCard style={styles.headerCard}>
        <View style={styles.storeHeaderRow}>
          <View style={styles.storeDetails}>
            <View style={styles.titleRow}>
              {vendor.isOpen ? (
                <View style={styles.openBadge}>
                  <Text style={styles.openBadgeText}>مفتوح</Text>
                </View>
              ) : (
                <View style={[styles.openBadge, { backgroundColor: theme.dangerSoft }]}>
                  <Text style={[styles.openBadgeText, { color: theme.danger }]}>مغلق</Text>
                </View>
              )}
              <Text style={styles.shopName}>{vendor.shopNameAr || vendor.shopName}</Text>
            </View>

            <Text style={styles.shopCategory}>التخصص: {vendor.category || "خامات ومواد تشطيب"}</Text>
            <Text style={styles.shopDesc}>{vendor.shopDescription || "متجر معتمد على منصة أسطى لتوفير مستلزمات الصيانة والتشطيب بجودة ممتازة وسعر تنافسي."}</Text>

            <View style={styles.metaRow}>
              <View style={styles.locationContainer}>
                <Ionicons name="location-outline" size={14} color={theme.muted} />
                <Text style={styles.metaText}>{vendor.city}، {vendor.governorate}</Text>
              </View>
              
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#D7A24D" />
                <Text style={styles.metaText}>
                  {vendor.rating?.toFixed(1) ?? "5.0"} ({vendor.ratingCount ?? 0} تقييم)
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.imageWrapper}>
            {vendor.shopImageUrl ? (
              <Image source={vendor.shopImageUrl} style={styles.shopImage as any} contentFit="cover" />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="storefront" size={32} color={theme.muted} />
              </View>
            )}
          </View>
        </View>
      </AppCard>

      {/* 2. Products List */}
      <Text style={styles.sectionTitle}>منتجات المتجر المتاحة</Text>
      
      {products && products.length > 0 ? (
        products.map((product) => {
          const qty = getProductQty(product.id);
          return (
            <AppCard key={product.id} style={styles.productCard}>
              <View style={styles.productRow}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  {product.description ? (
                    <Text style={styles.productDesc} numberOfLines={2}>{product.description}</Text>
                  ) : null}
                  <Text style={styles.productPrice}>{product.price} ج.م {product.unit ? `/ ${product.unit}` : ""}</Text>
                  
                  {/* Quantity Selector */}
                  <View style={styles.quantityRow}>
                    <Pressable style={styles.qtyButton} onPress={() => updateQty(product.id, 1)}>
                      <Ionicons name="add" size={16} color={theme.text} />
                    </Pressable>
                    <Text style={styles.qtyText}>{qty}</Text>
                    <Pressable 
                      style={[styles.qtyButton, qty === 0 && { opacity: 0.4 }]} 
                      disabled={qty === 0} 
                      onPress={() => updateQty(product.id, -1)}
                    >
                      <Ionicons name="remove" size={16} color={theme.text} />
                    </Pressable>
                  </View>
                </View>

                <View style={styles.productImageWrapper}>
                  {product.imageUrl ? (
                    <Image source={product.imageUrl} style={styles.productImage as any} contentFit="cover" />
                  ) : (
                    <View style={styles.productImagePlaceholder}>
                      <Ionicons name="cube-outline" size={24} color={theme.muted} />
                    </View>
                  )}
                </View>
              </View>
            </AppCard>
          );
        })
      ) : (
        <AppCard style={styles.emptyCard}>
          <Ionicons name="cube-outline" size={36} color={theme.muted} />
          <Text style={styles.emptyText}>لم يقم هذا المتجر بإضافة منتجات بعد.</Text>
        </AppCard>
      )}

      {/* 3. Checkout Summary Card */}
      {cartTotal > 0 && (
        <AppCard style={styles.checkoutCard}>
          <Text style={styles.checkoutTitle}>ملخص الطلب</Text>
          <View style={styles.divider} />
          
          {cartItemsArray.map((item) => (
            <View key={item.productId} style={styles.cartItemRow}>
              <Text style={styles.cartItemPrice}>{item.price * item.qty} ج.م</Text>
              <Text style={styles.cartItemName}>{item.name} × {item.qty}</Text>
            </View>
          ))}

          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalPrice}>{cartTotal} ج.م</Text>
            <Text style={styles.totalLabel}>الإجمالي الكلي</Text>
          </View>

          <TextField 
            label="ملاحظات التوصيل"
            placeholder="تعليمات أو ملاحظات إضافية للتوصيل..."
            value={deliveryNotes}
            onChangeText={setDeliveryNotes}
            style={{ marginTop: spacing.md }}
          />

          <AppButton 
            title="تقديم الطلب للمتجر"
            isLoading={isSubmitting}
            style={{ marginTop: spacing.md }}
            onPress={handlePlaceOrder}
          />
        </AppCard>
      )}
      
      <View style={{ height: spacing.xl }} />
    </Screen>
  );
}

const makeStyles = (theme: ReturnType<typeof useTheme>["theme"]) => StyleSheet.create({
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.sm
  },
  errorText: {
    color: theme.muted,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 24
  },
  headerCard: {
    padding: spacing.md,
    marginBottom: spacing.md
  },
  storeHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  storeDetails: {
    flex: 1,
    marginRight: spacing.md,
    gap: 4
  },
  titleRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center"
  },
  shopName: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "right",
    flex: 1,
    marginLeft: 8
  },
  openBadge: {
    backgroundColor: theme.successSoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8
  },
  openBadgeText: {
    color: theme.success,
    fontSize: 10,
    fontWeight: "800"
  },
  shopCategory: {
    color: theme.primary,
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "right"
  },
  shopDesc: {
    color: theme.text,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "right"
  },
  metaRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xs
  },
  locationContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    maxWidth: "50%"
  },
  ratingContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4
  },
  metaText: {
    color: theme.muted,
    fontSize: 11,
    fontWeight: "600"
  },
  imageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.border
  },
  shopImage: {
    width: "100%",
    height: "100%"
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.surfaceAlt,
    alignItems: "center",
    justifyContent: "center"
  },
  sectionTitle: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "right",
    marginBottom: spacing.sm,
    paddingHorizontal: 4
  },
  productCard: {
    padding: spacing.md,
    marginBottom: spacing.sm
  },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  productInfo: {
    flex: 1,
    marginRight: spacing.md,
    gap: 4
  },
  productName: {
    color: theme.text,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "right"
  },
  productDesc: {
    color: theme.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "right"
  },
  productPrice: {
    color: theme.primary,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "right"
  },
  quantityRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md,
    marginTop: 6
  },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: theme.backgroundRaised,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: "center",
    justifyContent: "center"
  },
  qtyText: {
    color: theme.text,
    fontSize: 14,
    fontWeight: "bold"
  },
  productImageWrapper: {
    width: 70,
    height: 70,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.border
  },
  productImage: {
    width: "100%",
    height: "100%"
  },
  productImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.surfaceAlt,
    alignItems: "center",
    justifyContent: "center"
  },
  emptyCard: {
    alignItems: "center",
    padding: spacing.xl,
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  emptyText: {
    color: theme.muted,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center"
  },
  checkoutCard: {
    marginTop: spacing.md,
    padding: spacing.lg,
    borderColor: theme.primary,
    borderWidth: 1,
    gap: spacing.xs
  },
  checkoutTitle: {
    color: theme.text,
    fontSize: 15,
    fontWeight: "900",
    textAlign: "right"
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: spacing.xs
  },
  cartItemRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 2
  },
  cartItemName: {
    color: theme.text,
    fontSize: 13,
    fontWeight: "600"
  },
  cartItemPrice: {
    color: theme.muted,
    fontSize: 13,
    fontWeight: "600"
  },
  totalRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4
  },
  totalLabel: {
    color: theme.text,
    fontSize: 14,
    fontWeight: "800"
  },
  totalPrice: {
    color: theme.primary,
    fontSize: 16,
    fontWeight: "900"
  }
});

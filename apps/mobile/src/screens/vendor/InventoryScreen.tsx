import { useState } from "react";
import { StyleSheet, Text, View, Pressable, ActivityIndicator, FlatList, TextInput, Modal, Alert, Platform, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";

import { apiClient, unwrapApiData } from "../../api/client";
import { AppButton } from "../../components/AppButton";
import { AppCard } from "../../components/AppCard";
import { Screen } from "../../components/Screen";
import { TextField } from "../../components/TextField";
import { useTheme } from "../../context/ThemeContext";
import { useApiResource } from "../../hooks/useApiResource";
import { spacing } from "../../theme/spacing";
import { uploadMedia } from "../../api/upload";

type Product = {
  id: string;
  nameAr: string;
  nameEn?: string;
  description?: string;
  price: number;
  imageUrl?: string;
  inStock: boolean;
  stockQty?: number;
};

export function InventoryScreen() {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const { data, isLoading, reload } = useApiResource<Product[]>("/vendors/products", []);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");

  // Product Add/Edit Form Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [price, setPrice] = useState("");
  const [stockQty, setStockQty] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [inStock, setInStock] = useState(true);

  // Image Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered Products
  const filteredProducts = data.filter(product => 
    product.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.nameEn && product.nameEn.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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

  // Open modal for adding a new product
  const handleAddNew = () => {
    setEditingProduct(null);
    setNameAr("");
    setNameEn("");
    setPrice("");
    setStockQty("");
    setDescription("");
    setImageUrl("");
    setInStock(true);
    setModalVisible(true);
  };

  // Open modal for editing an existing product
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setNameAr(product.nameAr);
    setNameEn(product.nameEn || "");
    setPrice(String(product.price));
    setStockQty(product.stockQty !== undefined ? String(product.stockQty) : "");
    setDescription(product.description || "");
    setImageUrl(product.imageUrl || "");
    setInStock(product.inStock);
    setModalVisible(true);
  };

  // Handle image pick and upload
  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAlert("الإذن مطلوب", "يرجى السماح بالوصول لمعرض الصور لإضافة صورة للمنتج.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setIsUploading(true);
      try {
        const url = await uploadMedia(result.assets[0].uri);
        setImageUrl(url);
      } catch (err: any) {
        showAlert("فشل الرفع", err.message || "تعذر رفع صورة المنتج.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Handle Save (Create or Update Product)
  const handleSaveProduct = async () => {
    if (!nameAr.trim()) {
      showAlert("حقل مطلوب", "اسم المنتج باللغة العربية مطلوب.");
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      showAlert("خطأ في القيمة", "يرجى إدخال سعر صحيح أكبر من الصفر.");
      return;
    }

    const parsedQty = stockQty.trim() ? parseInt(stockQty) : undefined;
    if (parsedQty !== undefined && (isNaN(parsedQty) || parsedQty < 0)) {
      showAlert("خطأ في القيمة", "يرجى إدخال كمية مخزون صحيحة.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        nameAr: nameAr.trim(),
        nameEn: nameEn.trim() || undefined,
        price: parsedPrice,
        stockQty: parsedQty,
        description: description.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        inStock: inStock,
      };

      if (editingProduct) {
        // Update product
        await apiClient.put(`/vendors/products/${editingProduct.id}`, payload);
        showAlert("تمت العملية", "تم تحديث بيانات المنتج بنجاح.");
      } else {
        // Create product
        await apiClient.post("/vendors/products", payload);
        showAlert("تمت العملية", "تم إضافة المنتج الجديد للمخزون بنجاح.");
      }

      setModalVisible(false);
      reload();
    } catch (error: any) {
      showAlert("خطأ", error.message || "حدث خطأ ما أثناء حفظ بيانات المنتج.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = (product: Product) => {
    const performDelete = async () => {
      try {
        await apiClient.delete(`/vendors/products/${product.id}`);
        showAlert("تم الحذف", "تمت إزالة المنتج من المخزون بنجاح.");
        reload();
      } catch (error: any) {
        showAlert("خطأ", error.message || "تعذر حذف المنتج حالياً.");
      }
    };

    if (Platform.OS === "web") {
      const confirmDelete = window.confirm(`هل أنت متأكد من رغبتك في حذف المنتج "${product.nameAr}"؟`);
      if (confirmDelete) performDelete();
    } else {
      Alert.alert(
        "تأكيد الحذف",
        `هل أنت متأكد من رغبتك في حذف المنتج "${product.nameAr}"؟`,
        [
          { text: "إلغاء", style: "cancel" },
          { text: "حذف", style: "destructive", onPress: performDelete }
        ]
      );
    }
  };

  return (
    <Screen title="المخزون" subtitle="إدارة وإضافة المنتجات المعروضة في متجرك للعملاء." showBack={false}>
      
      {/* Top Action & Stats Header */}
      <View style={styles.statsRow}>
        <AppButton 
          title="إضافة منتج جديد +" 
          style={styles.addButton}
          onPress={handleAddNew}
        />
        <View style={styles.badgeWrapper}>
          <Text style={styles.badgeText}>{data.length} منتج مسجل</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={theme.muted} />
        <TextInput
          placeholder="ابحث عن منتج بالمخزون..."
          placeholderTextColor={theme.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={18} color={theme.muted} />
          </Pressable>
        )}
      </View>

      {/* Products list */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onRefresh={reload}
          refreshing={isLoading}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={48} color={theme.muted} style={{ marginBottom: spacing.sm }} />
              <Text style={styles.emptyText}>لا توجد منتجات مسجلة في المخزون حالياً</Text>
              <Text style={styles.emptySubText}>اضغط على زر "إضافة منتج جديد" لبناء مخزون متجرك.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <AppCard style={styles.productCard}>
              <View style={styles.productRow}>
                {/* Product Image */}
                <View style={styles.productImageWrapper}>
                  {item.imageUrl ? (
                    <Image source={item.imageUrl} style={styles.productImage as any} />
                  ) : (
                    <View style={styles.productPlaceholder}>
                      <Ionicons name="image-outline" size={24} color={theme.muted} />
                    </View>
                  )}
                </View>

                {/* Product Details */}
                <View style={styles.productDetails}>
                  <Text style={styles.productName}>{item.nameAr}</Text>
                  {item.nameEn ? <Text style={styles.productNameEn}>{item.nameEn}</Text> : null}
                  <View style={styles.priceRow}>
                    <Text style={styles.productPrice}>{item.price} ج.م</Text>
                    {item.stockQty !== undefined ? (
                      <Text style={styles.stockQty}>المخزون: {item.stockQty} قطع</Text>
                    ) : (
                      <Text style={[styles.stockStatus, { color: item.inStock ? theme.success : theme.danger }]}>
                        {item.inStock ? "متوفر" : "غير متوفر"}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionColumn}>
                  <Pressable style={styles.editBtn} onPress={() => handleEdit(item)}>
                    <Ionicons name="create-outline" size={18} color={theme.primary} />
                  </Pressable>
                  <Pressable style={styles.deleteBtn} onPress={() => handleDeleteProduct(item)}>
                    <Ionicons name="trash-outline" size={18} color={theme.danger} />
                  </Pressable>
                </View>
              </View>
            </AppCard>
          )}
        />
      )}

      {/* Add / Edit Product Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </Pressable>
              <Text style={styles.modalTitle}>{editingProduct ? "تعديل منتج" : "إضافة منتج جديد"}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm} showsVerticalScrollIndicator={false}>
              
              {/* Product Image Selection */}
              <Text style={styles.fieldLabel}>صورة المنتج</Text>
              <Pressable style={styles.imageSelector} onPress={handlePickImage} disabled={isUploading}>
                {imageUrl ? (
                  <View style={styles.selectedImageContainer}>
                    <Image source={imageUrl} style={styles.selectedImage as any} />
                    <View style={styles.changeImageOverlay}>
                      <Text style={styles.changeImageText}>تغيير الصورة</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.imagePlaceholder}>
                    {isUploading ? (
                      <ActivityIndicator size="small" color={theme.primary} />
                    ) : (
                      <>
                        <Ionicons name="camera-outline" size={32} color={theme.primary} />
                        <Text style={styles.imageSelectorText}>رفع صورة المنتج (اختياري)</Text>
                      </>
                    )}
                  </View>
                )}
              </Pressable>

              <TextField 
                label="اسم المنتج (بالعربية)*" 
                placeholder="مثال: شريط لحام، مفتاح كهرباء" 
                value={nameAr} 
                onChangeText={setNameAr} 
              />

              <TextField 
                label="اسم المنتج (بالإنجليزية)" 
                placeholder="مثال: Electrical Tape" 
                value={nameEn} 
                onChangeText={setNameEn} 
              />

              <TextField 
                label="السعر (ج.م)*" 
                placeholder="مثال: 45" 
                keyboardType="numeric"
                value={price} 
                onChangeText={setPrice} 
              />

              <TextField 
                label="كمية المخزون المتاحة" 
                placeholder="مثال: 50 (اتركه فارغاً لتوفر دائم)" 
                keyboardType="numeric"
                value={stockQty} 
                onChangeText={setStockQty} 
              />

              <TextField 
                label="وصف تفصيلي للمنتج" 
                placeholder="اكتب مواصفات المنتج، المقاسات، والشركة المصنعة..." 
                multiline 
                numberOfLines={4} 
                value={description} 
                onChangeText={setDescription} 
              />

              <View style={styles.inStockRow}>
                <Pressable 
                  style={[styles.checkbox, inStock && styles.checkboxActive]}
                  onPress={() => setInStock(!inStock)}
                >
                  {inStock && <Ionicons name="checkmark" size={14} color={theme.primaryText} />}
                </Pressable>
                <Text style={styles.checkboxLabel}>المنتج متوفر بالمخزن حالياً للطلب</Text>
              </View>

              <AppButton 
                title={editingProduct ? "حفظ التعديلات" : "إضافة المنتج"} 
                isLoading={isSubmitting} 
                style={{ marginTop: spacing.md }} 
                onPress={handleSaveProduct} 
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

    </Screen>
  );
}

const makeStyles = (theme: ReturnType<typeof useTheme>["theme"]) => StyleSheet.create({
  statsRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md
  },
  addButton: {
    paddingHorizontal: spacing.md,
    height: 42
  },
  badgeWrapper: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    backgroundColor: theme.primarySoft
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: theme.primary
  },
  searchContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 24,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  searchInput: {
    flex: 1,
    color: theme.text,
    fontSize: 14,
    textAlign: "right",
    padding: 0
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl
  },
  listContainer: {
    paddingBottom: spacing.lg,
    gap: spacing.xs
  },
  productCard: {
    padding: spacing.sm,
    backgroundColor: theme.surface
  },
  productRow: {
    flexDirection: "row-reverse",
    alignItems: "center"
  },
  productImageWrapper: {
    width: 60,
    height: 60,
    borderRadius: spacing.sm,
    overflow: "hidden"
  },
  productImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },
  productPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.backgroundRaised,
    justifyContent: "center",
    alignItems: "center"
  },
  productDetails: {
    flex: 1,
    marginHorizontal: spacing.sm,
    alignItems: "flex-end",
    gap: 2
  },
  productName: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.text,
    textAlign: "right"
  },
  productNameEn: {
    fontSize: 11,
    color: theme.muted,
    textAlign: "right"
  },
  priceRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm
  },
  productPrice: {
    fontSize: 13,
    fontWeight: "bold",
    color: theme.primary
  },
  stockQty: {
    fontSize: 11,
    color: theme.muted
  },
  stockStatus: {
    fontSize: 11,
    fontWeight: "bold"
  },
  actionColumn: {
    flexDirection: "column",
    gap: spacing.xs,
    alignItems: "center"
  },
  editBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.primarySoft,
    justifyContent: "center",
    alignItems: "center"
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.danger + "15",
    justifyContent: "center",
    alignItems: "center"
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
    gap: spacing.xs
  },
  emptyText: {
    color: theme.text,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center"
  },
  emptySubText: {
    color: theme.muted,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: spacing.xl
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
  modalForm: {
    padding: spacing.lg,
    gap: spacing.md
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: theme.text,
    textAlign: "right",
    marginBottom: -spacing.xs
  },
  imageSelector: {
    width: "100%",
    height: 120,
    borderRadius: spacing.sm,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: theme.border,
    backgroundColor: theme.surface,
    overflow: "hidden"
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xs
  },
  imageSelectorText: {
    fontSize: 11,
    color: theme.muted,
    fontWeight: "700"
  },
  selectedImageContainer: {
    flex: 1,
    position: "relative"
  },
  selectedImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },
  changeImageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    paddingVertical: spacing.xs,
    alignItems: "center"
  },
  changeImageText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "bold"
  },
  inStockRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xs
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: theme.border,
    backgroundColor: theme.background,
    justifyContent: "center",
    alignItems: "center"
  },
  checkboxActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary
  },
  checkboxLabel: {
    fontSize: 13,
    color: theme.text,
    fontWeight: "700"
  }
});

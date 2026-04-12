export type GeoOption = { value: string; labelEn: string; labelAr: string };

export const egyptianGovernorates: GeoOption[] = [
  { value: "cairo", labelEn: "Cairo", labelAr: "القاهرة" },
  { value: "giza", labelEn: "Giza", labelAr: "الجيزة" },
  { value: "alexandria", labelEn: "Alexandria", labelAr: "الإسكندرية" },
  { value: "dakahlia", labelEn: "Dakahlia", labelAr: "الدقهلية" },
  { value: "red-sea", labelEn: "Red Sea", labelAr: "البحر الأحمر" },
  { value: "beheira", labelEn: "Beheira", labelAr: "البحيرة" },
  { value: "fayoum", labelEn: "Fayoum", labelAr: "الفيوم" },
  { value: "gharbia", labelEn: "Gharbia", labelAr: "الغربية" },
  { value: "ismailia", labelEn: "Ismailia", labelAr: "الإسماعيلية" },
  { value: "monufia", labelEn: "Monufia", labelAr: "المنوفية" },
  { value: "minya", labelEn: "Minya", labelAr: "المنيا" },
  { value: "qalyubia", labelEn: "Qalyubia", labelAr: "القليوبية" },
  { value: "new-valley", labelEn: "New Valley", labelAr: "الوادي الجديد" },
  { value: "suez", labelEn: "Suez", labelAr: "السويس" },
  { value: "aswan", labelEn: "Aswan", labelAr: "أسوان" },
  { value: "assiut", labelEn: "Assiut", labelAr: "أسيوط" },
  { value: "beni-suef", labelEn: "Beni Suef", labelAr: "بني سويف" },
  { value: "port-said", labelEn: "Port Said", labelAr: "بورسعيد" },
  { value: "damietta", labelEn: "Damietta", labelAr: "دمياط" },
  { value: "sharkia", labelEn: "Sharkia", labelAr: "الشرقية" },
  { value: "south-sinai", labelEn: "South Sinai", labelAr: "جنوب سيناء" },
  { value: "kafr-el-sheikh", labelEn: "Kafr El Sheikh", labelAr: "كفر الشيخ" },
  { value: "matrouh", labelEn: "Matrouh", labelAr: "مطروح" },
  { value: "luxor", labelEn: "Luxor", labelAr: "الأقصر" },
  { value: "qena", labelEn: "Qena", labelAr: "قنا" },
  { value: "north-sinai", labelEn: "North Sinai", labelAr: "شمال سيناء" },
  { value: "sohag", labelEn: "Sohag", labelAr: "سوهاج" }
];

export const majorCities: Record<string, GeoOption[]> = {
  cairo: [
    { value: "new-cairo", labelEn: "New Cairo", labelAr: "القاهرة الجديدة" },
    { value: "nasr-city", labelEn: "Nasr City", labelAr: "مدينة نصر" },
    { value: "heliopolis", labelEn: "Heliopolis", labelAr: "مصر الجديدة" },
    { value: "maadi", labelEn: "Maadi", labelAr: "المعادي" }
  ],
  giza: [
    { value: "6th-october", labelEn: "6th of October", labelAr: "6 أكتوبر" },
    { value: "sheikh-zayed", labelEn: "Sheikh Zayed", labelAr: "الشيخ زايد" },
    { value: "dokki", labelEn: "Dokki", labelAr: "الدقي" },
    { value: "haram", labelEn: "Haram", labelAr: "الهرم" }
  ]
};

export const vendorCategories: GeoOption[] = [
  { value: "electrical", labelEn: "Electrical Supplies", labelAr: "أدوات كهربائية" },
  { value: "plumbing", labelEn: "Plumbing Supplies", labelAr: "أدوات سباكة" },
  { value: "paints", labelEn: "Paints & Hardware", labelAr: "حدائد وبويات" },
  { value: "construction", labelEn: "Construction Materials", labelAr: "مواد بناء" },
  { value: "ac", labelEn: "AC & Heating Parts", labelAr: "قطع غيار تكييف" },
  { value: "furniture", labelEn: "Furniture & Carpentry", labelAr: "أثاث ونجارة" }
];

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
    { value: "maadi", labelEn: "Maadi", labelAr: "المعادي" },
    { value: "shobra", labelEn: "Shobra", labelAr: "شبرا" },
    { value: "zamalek", labelEn: "Zamalek", labelAr: "الزمالك" },
    { value: "downtown", labelEn: "Downtown", labelAr: "وسط البلد" }
  ],
  giza: [
    { value: "6th-october", labelEn: "6th of October", labelAr: "6 أكتوبر" },
    { value: "sheikh-zayed", labelEn: "Sheikh Zayed", labelAr: "الشيخ زايد" },
    { value: "dokki", labelEn: "Dokki", labelAr: "الدقي" },
    { value: "haram", labelEn: "Haram", labelAr: "الهرم" },
    { value: "mohandessin", labelEn: "Mohandessin", labelAr: "المهندسين" },
    { value: "faisal", labelEn: "Faisal", labelAr: "فيصل" },
    { value: "hadayek-ahram", labelEn: "Hadayek Al Ahram", labelAr: "حدائق الأهرام" }
  ],
  alexandria: [
    { value: "alex-city", labelEn: "Alexandria City", labelAr: "مدينة الإسكندرية" },
    { value: "smouha", labelEn: "Smouha", labelAr: "سموحة" },
    { value: "agami", labelEn: "Agami", labelAr: "العجمي" },
    { value: "montaza", labelEn: "Montaza", labelAr: "المنتزة" },
    { value: "borg-arab", labelEn: "Borg El Arab", labelAr: "برج العرب" }
  ],
  dakahlia: [
    { value: "mansoura", labelEn: "Mansoura", labelAr: "المنصورة" },
    { value: "talkha", labelEn: "Talkha", labelAr: "طلخا" },
    { value: "mit-ghamr", labelEn: "Mit Ghamr", labelAr: "ميت غمر" }
  ],
  sharkia: [
    { value: "zagazig", labelEn: "Zagazig", labelAr: "الزقازيق" },
    { value: "10th-ramadan", labelEn: "10th of Ramadan", labelAr: "العاشر من رمضان" },
    { value: "belbeis", labelEn: "Belbeis", labelAr: "بلبيس" }
  ],
  qalyubia: [
    { value: "banha", labelEn: "Banha", labelAr: "بنها" },
    { value: "shubra-kheima", labelEn: "Shubra El Kheima", labelAr: "شبرا الخيمة" },
    { value: "obour", labelEn: "Obour City", labelAr: "مدينة العبور" },
    { value: "qalyub", labelEn: "Qalyub", labelAr: "قليوب" }
  ],
  gharbia: [
    { value: "tanta", labelEn: "Tanta", labelAr: "طنطا" },
    { value: "mahalla", labelEn: "Mahalla El Kubra", labelAr: "المحلة الكبرى" },
    { value: "kafr-zayat", labelEn: "Kafr El Zayat", labelAr: "كفر الزيات" }
  ],
  monufia: [
    { value: "shibin", labelEn: "Shibin El Kom", labelAr: "شبين الكوم" },
    { value: "sadat", labelEn: "Sadat City", labelAr: "مدينة السادات" },
    { value: "menouf", labelEn: "Menouf", labelAr: "منوف" }
  ],
  beheira: [
    { value: "damanhour", labelEn: "Damanhour", labelAr: "دمنهور" },
    { value: "kafr-dawar", labelEn: "Kafr El Dawar", labelAr: "كفر الدوار" },
    { value: "rashid", labelEn: "Rashid", labelAr: "رشيد" }
  ],
  ismailia: [
    { value: "ismailia-city", labelEn: "Ismailia City", labelAr: "مدينة الإسماعيلية" },
    { value: "fayed", labelEn: "Fayed", labelAr: "فايد" },
    { value: "qantara", labelEn: "Qantara", labelAr: "القنطرة" }
  ],
  suez: [
    { value: "suez-city", labelEn: "Suez City", labelAr: "مدينة السويس" },
    { value: "ain-sokhna", labelEn: "Ain Sokhna", labelAr: "العين السخنة" }
  ],
  "port-said": [
    { value: "port-said-city", labelEn: "Port Said City", labelAr: "مدينة بورسعيد" },
    { value: "port-fouad", labelEn: "Port Fouad", labelAr: "بورفؤاد" }
  ],
  damietta: [
    { value: "damietta-city", labelEn: "Damietta City", labelAr: "مدينة دمياط" },
    { value: "new-damietta", labelEn: "New Damietta", labelAr: "دمياط الجديدة" },
    { value: "ras-bar", labelEn: "Ras El Bar", labelAr: "رأس البر" }
  ],
  "red-sea": [
    { value: "hurghada", labelEn: "Hurghada", labelAr: "الغردقة" },
    { value: "safaga", labelEn: "Safaga", labelAr: "سفاجا" },
    { value: "gouna", labelEn: "Gouna", labelAr: "الجونة" },
    { value: "marsa-alam", labelEn: "Marsa Alam", labelAr: "مرسى علم" }
  ],
  matrouh: [
    { value: "marsa-matrouh", labelEn: "Marsa Matrouh", labelAr: "مرسى مطروح" },
    { value: "el-alamein", labelEn: "El Alamein", labelAr: "العلمين" },
    { value: "siwa", labelEn: "Siwa", labelAr: "سيوة" }
  ],
  luxor: [
    { value: "luxor-city", labelEn: "Luxor City", labelAr: "مدينة الأقصر" },
    { value: "esna", labelEn: "Esna", labelAr: "إسنا" }
  ],
  aswan: [
    { value: "aswan-city", labelEn: "Aswan City", labelAr: "مدينة أسوان" },
    { value: "kom-ombo", labelEn: "Kom Ombo", labelAr: "كوم أمبو" },
    { value: "edfu", labelEn: "Edfu", labelAr: "إدفو" }
  ],
  sohag: [
    { value: "sohag-city", labelEn: "Sohag City", labelAr: "مدينة سوهاج" },
    { value: "akhmim", labelEn: "Akhmim", labelAr: "أخميم" },
    { value: "girga", labelEn: "Girga", labelAr: "جرجا" }
  ],
  assiut: [
    { value: "assiut-city", labelEn: "Assiut City", labelAr: "مدينة أسيوط" },
    { value: "dairut", labelEn: "Dairut", labelAr: "ديروط" }
  ],
  minya: [
    { value: "minya-city", labelEn: "Minya City", labelAr: "مدينة المنيا" },
    { value: "mallawi", labelEn: "Mallawi", labelAr: "ملوي" },
    { value: "maghagha", labelEn: "Maghagha", labelAr: "مغاغة" }
  ],
  qena: [
    { value: "qena-city", labelEn: "Qena City", labelAr: "مدينة قنا" },
    { value: "nag-hammadi", labelEn: "Nag Hammadi", labelAr: "نجع حمادي" }
  ],
  fayoum: [
    { value: "fayoum-city", labelEn: "Fayoum City", labelAr: "مدينة الفيوم" },
    { value: "tamiya", labelEn: "Tamiya", labelAr: "طامية" }
  ],
  "beni-suef": [
    { value: "beni-suef-city", labelEn: "Beni Suef City", labelAr: "مدينة بني سويف" },
    { value: "nasser", labelEn: "Nasser", labelAr: "ناصر" }
  ],
  "kafr-el-sheikh": [
    { value: "kafr-el-sheikh-city", labelEn: "Kafr El Sheikh City", labelAr: "مدينة كفر الشيخ" },
    { value: "desouk", labelEn: "Desouk", labelAr: "دسوق" }
  ],
  "south-sinai": [
    { value: "sharm", labelEn: "Sharm El Sheikh", labelAr: "شرم الشيخ" },
    { value: "dahab", labelEn: "Dahab", labelAr: "دهب" },
    { value: "nuweiba", labelEn: "Nuweiba", labelAr: "نويبع" }
  ],
  "north-sinai": [
    { value: "arish", labelEn: "Arish", labelAr: "العريش" },
    { value: "bir-al-abd", labelEn: "Bir Al-Abd", labelAr: "بئر العبد" }
  ],
  "new-valley": [
    { value: "kharga", labelEn: "Kharga", labelAr: "الخارجة" },
    { value: "dakhla", labelEn: "Dakhla", labelAr: "الداخلة" }
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

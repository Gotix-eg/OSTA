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
    { value: "downtown", labelEn: "Downtown", labelAr: "وسط البلد" },
    { value: "helwan", labelEn: "Helwan", labelAr: "حلوان" },
    { value: "ain-shams", labelEn: "Ain Shams", labelAr: "عين شمس" },
    { value: "matareya", labelEn: "Matareya", labelAr: "المطرية" },
    { value: "marg", labelEn: "Al Marg", labelAr: "المرج" },
    { value: "salam", labelEn: "Al Salam City", labelAr: "مدينة السلام" },
    { value: "shorouk", labelEn: "Al Shorouk", labelAr: "الشروق" },
    { value: "badr", labelEn: "Badr City", labelAr: "مدينة بدر" },
    { value: "mokattam", labelEn: "Mokattam", labelAr: "المقطم" },
    { value: "basateen", labelEn: "Basateen", labelAr: "البساتين" },
    { value: "sayeda-zeinab", labelEn: "Sayeda Zeinab", labelAr: "السيدة زينب" },
    { value: "hadayek-kobba", labelEn: "Hadayek El Kobba", labelAr: "حدائق القبة" },
    { value: "abbassia", labelEn: "Abbassia", labelAr: "العباسية" },
    { value: "rod-farag", labelEn: "Rod El Farag", labelAr: "روض الفرج" }
  ],
  giza: [
    { value: "6th-october", labelEn: "6th of October", labelAr: "6 أكتوبر" },
    { value: "sheikh-zayed", labelEn: "Sheikh Zayed", labelAr: "الشيخ زايد" },
    { value: "dokki", labelEn: "Dokki", labelAr: "الدقي" },
    { value: "mohandessin", labelEn: "Mohandessin", labelAr: "المهندسين" },
    { value: "haram", labelEn: "Haram", labelAr: "الهرم" },
    { value: "faisal", labelEn: "Faisal", labelAr: "فيصل" },
    { value: "hadayek-ahram", labelEn: "Hadayek Al Ahram", labelAr: "حدائق الأهرام" },
    { value: "agouza", labelEn: "Agouza", labelAr: "العجوزة" },
    { value: "imbaba", labelEn: "Imbaba", labelAr: "إمبابة" },
    { value: "warraq", labelEn: "Al Warraq", labelAr: "الوراق" },
    { value: "kit-kat", labelEn: "Kit Kat", labelAr: "الكيت كات" },
    { value: "hawamdeya", labelEn: "Hawamdeya", labelAr: "الحوامدية" },
    { value: "badrashein", labelEn: "Al Badrashein", labelAr: "البدرشين" },
    { value: "osseem", labelEn: "Osseem", labelAr: "أوسيم" },
    { value: "kirdasa", labelEn: "Kirdasa", labelAr: "كرداسة" },
    { value: "omrania", labelEn: "Omrania", labelAr: "العمرانية" },
    { value: "talbia", labelEn: "Talbia", labelAr: "الطالبية" },
    { value: "boulaq-dakrour", labelEn: "Boulaq El Dakrour", labelAr: "بولاق الدكرور" }
  ],
  alexandria: [
    { value: "smouha", labelEn: "Smouha", labelAr: "سموحة" },
    { value: "miami", labelEn: "Miami", labelAr: "ميامي" },
    { value: "sidi-bishr", labelEn: "Sidi Bishr", labelAr: "سيدي بشر" },
    { value: "mandara", labelEn: "Al Mandara", labelAr: "المندرة" },
    { value: "asafra", labelEn: "Al Asafra", labelAr: "العصافرة" },
    { value: "victoria", labelEn: "Victoria", labelAr: "فيكتوريا" },
    { value: "stanley", labelEn: "Stanley", labelAr: "ستانلي" },
    { value: "roushdy", labelEn: "Roushdy", labelAr: "رشدي" },
    { value: "gleem", labelEn: "Gleem", labelAr: "جليم" },
    { value: "mansheya", labelEn: "Mansheya", labelAr: "المنشية" },
    { value: "bahary", labelEn: "Bahary", labelAr: "بحري" },
    { value: "agami", labelEn: "Agami", labelAr: "العجمي" },
    { value: "hanoville", labelEn: "Hanoville", labelAr: "هانوفيل" },
    { value: "bitash", labelEn: "Al Bitash", labelAr: "البيطاش" },
    { value: "borg-arab", labelEn: "Borg El Arab", labelAr: "برج العرب" },
    { value: "amreya", labelEn: "Amreya", labelAr: "العامرية" }
  ],
  dakahlia: [
    { value: "mansoura", labelEn: "Mansoura", labelAr: "المنصورة" },
    { value: "talkha", labelEn: "Talkha", labelAr: "طلخا" },
    { value: "mit-ghamr", labelEn: "Mit Ghamr", labelAr: "ميت غمر" },
    { value: "senbellawein", labelEn: "Al Senbellawein", labelAr: "السنبلاوين" },
    { value: "dekernes", labelEn: "Dekernes", labelAr: "دكرنس" },
    { value: "belqas", labelEn: "Belqas", labelAr: "بلقاس" },
    { value: "sherbin", labelEn: "Sherbin", labelAr: "شربين" },
    { value: "manzala", labelEn: "Al Manzala", labelAr: "المنزلة" }
  ],
  sharkia: [
    { value: "zagazig", labelEn: "Zagazig", labelAr: "الزقازيق" },
    { value: "10th-ramadan", labelEn: "10th of Ramadan", labelAr: "العاشر من رمضان" },
    { value: "belbeis", labelEn: "Belbeis", labelAr: "بلبيس" },
    { value: "minya-el-qamh", labelEn: "Minya El Qamh", labelAr: "منيا القمح" },
    { value: "faqus", labelEn: "Faqus", labelAr: "فاقوس" },
    { value: "abu-hammad", labelEn: "Abu Hammad", labelAr: "أبو حماد" },
    { value: "hihya", labelEn: "Hihya", labelAr: "ههيا" },
    { value: "kafr-saqr", labelEn: "Kafr Saqr", labelAr: "كفر صقر" }
  ],
  qalyubia: [
    { value: "banha", labelEn: "Banha", labelAr: "بنها" },
    { value: "shubra-kheima", labelEn: "Shubra El Kheima", labelAr: "شبرا الخيمة" },
    { value: "obour", labelEn: "Obour City", labelAr: "مدينة العبور" },
    { value: "qalyub", labelEn: "Qalyub", labelAr: "قليوب" },
    { value: "khanka", labelEn: "Al Khanka", labelAr: "الخانكة" },
    { value: "qanater", labelEn: "Al Qanater Al Khayreya", labelAr: "القناطر الخيرية" },
    { value: "khusus", labelEn: "Al Khusus", labelAr: "الخصوص" }
  ],
  gharbia: [
    { value: "tanta", labelEn: "Tanta", labelAr: "طنطا" },
    { value: "mahalla", labelEn: "Mahalla El Kubra", labelAr: "المحلة الكبرى" },
    { value: "kafr-zayat", labelEn: "Kafr El Zayat", labelAr: "كفر الزيات" },
    { value: "zifta", labelEn: "Zifta", labelAr: "زفتي" },
    { value: "santa", labelEn: "Al Santa", labelAr: "السنطة" },
    { value: "basyoun", labelEn: "Basyoun", labelAr: "بسيون" },
    { value: "samannoud", labelEn: "Samannoud", labelAr: "سمنود" }
  ],
  monufia: [
    { value: "shibin", labelEn: "Shibin El Kom", labelAr: "شبين الكوم" },
    { value: "menouf", labelEn: "Menouf", labelAr: "منوف" },
    { value: "ashmoun", labelEn: "Ashmoun", labelAr: "أشمون" },
    { value: "bagour", labelEn: "Al Bagour", labelAr: "الباجور" },
    { value: "quesna", labelEn: "Quesna", labelAr: "قويسنا" },
    { value: "sadat", labelEn: "Sadat City", labelAr: "مدينة السادات" }
  ],
  beheira: [
    { value: "damanhour", labelEn: "Damanhour", labelAr: "دمنهور" },
    { value: "kafr-dawar", labelEn: "Kafr El Dawar", labelAr: "كفر الدوار" },
    { value: "rashid", labelEn: "Rashid", labelAr: "رشيد" },
    { value: "edko", labelEn: "Edko", labelAr: "إدكو" },
    { value: "abu-hummus", labelEn: "Abu Hummus", labelAr: "أبو حمص" },
    { value: "itay-barud", labelEn: "Itay El Barud", labelAr: "إيتاي البارود" },
    { value: "kom-hamada", labelEn: "Kom Hamada", labelAr: "كوم حمادة" }
  ],
  ismailia: [
    { value: "ismailia-city", labelEn: "Ismailia City", labelAr: "مدينة الإسماعيلية" },
    { value: "fayed", labelEn: "Fayed", labelAr: "فايد" },
    { value: "qantara-east", labelEn: "Qantara East", labelAr: "القنطرة شرق" },
    { value: "qantara-west", labelEn: "Qantara West", labelAr: "القنطرة غرب" },
    { value: "abu-suwir", labelEn: "Abu Suwir", labelAr: "أبو صوير" }
  ],
  suez: [
    { value: "suez-city", labelEn: "Suez City", labelAr: "مدينة السويس" },
    { value: "arbaeen", labelEn: "Al Arbaeen", labelAr: "الأربعين" },
    { value: "faisal-suez", labelEn: "Faisal", labelAr: "فيصل" },
    { value: "ain-sokhna", labelEn: "Ain Sokhna", labelAr: "العين السخنة" }
  ],
  "port-said": [
    { value: "sharq", labelEn: "Al Sharq", labelAr: "الشرق" },
    { value: "arab", labelEn: "Al Arab", labelAr: "العرب" },
    { value: "zohour", labelEn: "Al Zohour", labelAr: "الزهور" },
    { value: "port-fouad", labelEn: "Port Fouad", labelAr: "بورفؤاد" }
  ],
  damietta: [
    { value: "damietta-city", labelEn: "Damietta City", labelAr: "مدينة دمياط" },
    { value: "new-damietta", labelEn: "New Damietta", labelAr: "دمياط الجديدة" },
    { value: "ras-bar", labelEn: "Ras El Bar", labelAr: "رأس البر" },
    { value: "faraskur", labelEn: "Faraskur", labelAr: "فارسكور" },
    { value: "zarqa", labelEn: "Al Zarqa", labelAr: "الزرقا" }
  ],
  "red-sea": [
    { value: "hurghada", labelEn: "Hurghada", labelAr: "الغردقة" },
    { value: "safaga", labelEn: "Safaga", labelAr: "سفاجا" },
    { value: "gouna", labelEn: "Gouna", labelAr: "الجونة" },
    { value: "marsa-alam", labelEn: "Marsa Alam", labelAr: "مرسى علم" },
    { value: "ras-ghareb", labelEn: "Ras Ghareb", labelAr: "رأس غارب" }
  ],
  matrouh: [
    { value: "marsa-matrouh", labelEn: "Marsa Matrouh", labelAr: "مرسى مطروح" },
    { value: "el-alamein", labelEn: "El Alamein", labelAr: "العلمين" },
    { value: "siwa", labelEn: "Siwa", labelAr: "سيوة" },
    { value: "dabaa", labelEn: "Al Dabaa", labelAr: "الضبعة" },
    { value: "hamam", labelEn: "Al Hamam", labelAr: "الحمام" }
  ],
  luxor: [
    { value: "luxor-city", labelEn: "Luxor City", labelAr: "مدينة الأقصر" },
    { value: "esna", labelEn: "Esna", labelAr: "إسنا" },
    { value: "armant", labelEn: "Armant", labelAr: "أرمنت" },
    { value: "bayadiya", labelEn: "Al Bayadiya", labelAr: "البياضية" }
  ],
  aswan: [
    { value: "aswan-city", labelEn: "Aswan City", labelAr: "مدينة أسوان" },
    { value: "kom-ombo", labelEn: "Kom Ombo", labelAr: "كوم أمبو" },
    { value: "edfu", labelEn: "Edfu", labelAr: "إدفو" },
    { value: "abu-simbel", labelEn: "Abu Simbel", labelAr: "أبو سمبل" }
  ],
  sohag: [
    { value: "sohag-city", labelEn: "Sohag City", labelAr: "مدينة سوهاج" },
    { value: "akhmim", labelEn: "Akhmim", labelAr: "أخميم" },
    { value: "girga", labelEn: "Girga", labelAr: "جرجا" },
    { value: "tahta", labelEn: "Tahta", labelAr: "طهطا" },
    { value: "tima", labelEn: "Tima", labelAr: "طما" },
    { value: "balyana", labelEn: "Al Balyana", labelAr: "البلينا" }
  ],
  assiut: [
    { value: "assiut-city", labelEn: "Assiut City", labelAr: "مدينة أسيوط" },
    { value: "dairut", labelEn: "Dairut", labelAr: "ديروط" },
    { value: "manfalut", labelEn: "Manfalut", labelAr: "منفلوط" },
    { value: "qusiya", labelEn: "Al Qusiya", labelAr: "القوصية" },
    { value: "abnub", labelEn: "Abnub", labelAr: "أبنوب" }
  ],
  minya: [
    { value: "minya-city", labelEn: "Minya City", labelAr: "مدينة المنيا" },
    { value: "mallawi", labelEn: "Mallawi", labelAr: "ملوي" },
    { value: "maghagha", labelEn: "Maghagha", labelAr: "مغاغة" },
    { value: "samalut", labelEn: "Samalut", labelAr: "سمالوط" },
    { value: "abu-qurqas", labelEn: "Abu Qurqas", labelAr: "أبو قرقاص" },
    { value: "beni-mazar", labelEn: "Beni Mazar", labelAr: "بني مزار" }
  ],
  qena: [
    { value: "qena-city", labelEn: "Qena City", labelAr: "مدينة قنا" },
    { value: "nag-hammadi", labelEn: "Nag Hammadi", labelAr: "نجع حمادي" },
    { value: "qus", labelEn: "Qus", labelAr: "قوص" },
    { value: "deshna", labelEn: "Deshna", labelAr: "دشنا" }
  ],
  fayoum: [
    { value: "fayoum-city", labelEn: "Fayoum City", labelAr: "مدينة الفيوم" },
    { value: "itsa", labelEn: "Itsa", labelAr: "إطسا" },
    { value: "tamiya", labelEn: "Tamiya", labelAr: "طامية" },
    { value: "senouris", labelEn: "Senouris", labelAr: "سنورس" },
    { value: "ibshaway", labelEn: "Ibshaway", labelAr: "أبشواي" }
  ],
  "beni-suef": [
    { value: "beni-suef-city", labelEn: "Beni Suef City", labelAr: "مدينة بني سويف" },
    { value: "nasser", labelEn: "Nasser", labelAr: "ناصر" },
    { value: "wasta", labelEn: "Al Wasta", labelAr: "الواسطى" },
    { value: "biba", labelEn: "Biba", labelAr: "ببا" }
  ],
  "kafr-el-sheikh": [
    { value: "kafr-el-sheikh-city", labelEn: "Kafr El Sheikh City", labelAr: "مدينة كفر الشيخ" },
    { value: "desouk", labelEn: "Desouk", labelAr: "دسوق" },
    { value: "fuwwah", labelEn: "Fuwwah", labelAr: "فوه" },
    { value: "metoubes", labelEn: "Metoubes", labelAr: "مطوبس" },
    { value: "baltim", labelEn: "Baltim", labelAr: "بلطيم" }
  ],
  "south-sinai": [
    { value: "sharm", labelEn: "Sharm El Sheikh", labelAr: "شرم الشيخ" },
    { value: "dahab", labelEn: "Dahab", labelAr: "دهب" },
    { value: "nuweiba", labelEn: "Nuweiba", labelAr: "نويبع" },
    { value: "taba", labelEn: "Taba", labelAr: "طابا" },
    { value: "tor", labelEn: "Al Tor", labelAr: "الطور" }
  ],
  "north-sinai": [
    { value: "arish", labelEn: "Arish", labelAr: "العريش" },
    { value: "bir-al-abd", labelEn: "Bir Al-Abd", labelAr: "بئر العبد" },
    { value: "sheikh-zuweid", labelEn: "Sheikh Zuweid", labelAr: "الشيخ زويد" },
    { value: "rafah", labelEn: "Rafah", labelAr: "رفح" }
  ],
  "new-valley": [
    { value: "kharga", labelEn: "Kharga", labelAr: "الخارجة" },
    { value: "dakhla", labelEn: "Dakhla", labelAr: "الداخلة" },
    { value: "farafra", labelEn: "Farafra", labelAr: "الفرافرة" }
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
export const workerProfessions: GeoOption[] = [
  { value: "plumber", labelEn: "Plumber (Plumbing)", labelAr: "سباكة" },
  { value: "electrician", labelEn: "Electrician (Electrical)", labelAr: "كهرباء" },
  { value: "carpenter", labelEn: "Carpenter (Carpentry)", labelAr: "نجارة" },
  { value: "painter", labelEn: "Painter (Painting & Decor)", labelAr: "دهانات وديكور" },
  { value: "ac-technician", labelEn: "AC Technician (AC & Cooling)", labelAr: "تكييف وتبريد" },
  { value: "appliance-repair", labelEn: "Appliance Repair", labelAr: "صيانة أجهزة منزلية" },
  { value: "aluminum", labelEn: "Aluminum Worker (Aluminum)", labelAr: "ألوميتال" },
  { value: "computer-repair", labelEn: "Computer Repair", labelAr: "صيانة كمبيوتر" },
  { value: "networks", labelEn: "Computer Networks", labelAr: "شبكات كمبيوتر" },
  { value: "cctv", labelEn: "Camera Installation (CCTV)", labelAr: "تركيب كاميرات" },
  { value: "cleaning", labelEn: "Cleaning Worker", labelAr: "عامل نظافة" },
  { value: "gypsum", labelEn: "Gypsum Worker", labelAr: "فني جبس" },
  { value: "ceramic", labelEn: "Ceramic Installer", labelAr: "مبلط سيراميك" }
];

import type { Locale } from "./locales";

export const dashboardCopy = {
  ar: {
    client: {
      role: "لوحة العميل",
      title: "مرحبًا بك",
      subtitle: "كل طلباتك ونشاطك ومحفظتك في مكان واحد مع تحديثات واضحة.",
      search: "ابحث في الطلبات أو الفنيين",
      nav: ["الرئيسية", "طلب جديد", "طلباتي", "المتاجر", "المفضلين", "المحفظة", "الإعدادات"],
      stats: ["إجمالي الطلبات", "طلبات نشطة", "ضمانات فعالة", "رصيد المحفظة"],
      requestSection: "الطلبات النشطة",
      recentSection: "آخر الطلبات المكتملة",
      favoritesSection: "الفنيون المفضلون",
      suggestionSection: "خدمات مقترحة حسب منطقتك",
      action: "اطلب خدمة الآن"
    },
    worker: {
      role: "لوحة العامل",
      title: "أهلاً بك",
      subtitle: "تابع الطلبات الجديدة، الأرباح، وتقييمات العملاء من شاشة واحدة.",
      search: "ابحث في الطلبات أو المناطق",
      nav: ["الرئيسية", "طلبات واردة", "نشطة", "الأرباح", "التقييمات", "الإعدادات"],
      stats: ["طلبات جديدة", "مهام نشطة", "أرباح الشهر", "التقييم العام"],
      queueSection: "أفضل الطلبات المتاحة الآن",
      scheduleSection: "خطة الأسبوع",
      earningsSection: "مؤشر الأرباح",
      action: "تحديث التوفر"
    },
    vendor: {
      role: "لوحة المورد",
      title: "أهلاً بك",
      subtitle: "استقبل طلبات قطع الغيار، أرسل عروض أسعارك، وراقب مبيعاتك لحظة بلحظة.",
      search: "ابحث في الطلبات أو البضائع",
      nav: ["الرئيسية", "طلبات البضائع", "الطلبات الجارية", "المخزون", "المحفظة", "الإعدادات"],
      stats: ["طلبات جديدة", "مبيعات الشهر", "طلبات قيد التوصيل", "رصيد المحفظة"],
      queueSection: "طلبات قريبة تنتظر عروضك",
      alertsSection: "عروض تم قبولها",
      financeSection: "ملخص أرباح الشهر",
      action: "تحديث المخزون"
    },
    admin: {
      role: "لوحة المشرف",
      title: "نظرة شاملة على المنصة",
      subtitle: "مراجعة التشغيل، التوثيق، الإيرادات، والشكاوى من مساحة تحكم واحدة.",
      search: "ابحث في العمال أو الطلبات أو البلاغات",
      nav: ["الرئيسية", "توثيق العمال", "العملاء", "الطلبات", "المتاجر", "الصنايعية", "المالية", "إدارة الإعلانات", "التسعير والأسعار", "الإعدادات"],
      stats: ["إيراد إجمالي", "توثيقات معلقة", "شكاوى مفتوحة", "طلبات نشطة"],
      queueSection: "طابور التوثيق",
      alertsSection: "تنبيهات تشغيلية",
      financeSection: "لقطة مالية",
      action: "مراجعة التوثيقات"
    },
    shared: {
      notifications: "إشعارات",
      profile: "الملف الشخصي",
      online: "متصل الآن",
      revenue: "الإيراد",
      completion: "الإنجاز",
      response: "سرعة الرد",
      satisfaction: "رضا العملاء",
      thisWeek: "هذا الأسبوع",
      today: "اليوم"
    }
  },
  en: {
    client: {
      role: "Client Dashboard",
      title: "Welcome back",
      subtitle: "Your requests, wallet, and worker activity live in one clear view.",
      search: "Search requests or workers",
      nav: ["Home", "New Request", "My Requests", "Stores", "Favorites", "Wallet", "Settings"],
      stats: ["Total requests", "Active requests", "Active warranties", "Wallet balance"],
      requestSection: "Active requests",
      recentSection: "Recently completed",
      favoritesSection: "Favorite workers",
      suggestionSection: "Suggested services for your area",
      action: "Book a service"
    },
    worker: {
      role: "Worker Dashboard",
      title: "Welcome",
      subtitle: "Track incoming work, earnings, ratings, and weekly performance in one place.",
      search: "Search jobs or areas",
      nav: ["Home", "Incoming", "Active", "Earnings", "Ratings", "Settings"],
      stats: ["Incoming jobs", "Active jobs", "Monthly earnings", "Overall rating"],
      queueSection: "Best jobs available right now",
      scheduleSection: "Weekly plan",
      earningsSection: "Earnings pulse",
      action: "Update availability"
    },
    vendor: {
      role: "Vendor Dashboard",
      title: "Welcome back",
      subtitle: "Receive material requests, send quotes, and monitor your sales.",
      search: "Search requests or orders",
      nav: ["Home", "Material Requests", "Active Orders", "Inventory", "Wallet", "Settings"],
      stats: ["New requests", "Monthly sales", "Orders in transit", "Wallet balance"],
      queueSection: "Nearby requests waiting for quotes",
      alertsSection: "Accepted quotes",
      financeSection: "Monthly revenue",
      action: "Update inventory"
    },
    admin: {
      role: "Admin Dashboard",
      title: "Platform-wide overview",
      subtitle: "Monitor operations, verifications, revenue, and complaints from one control surface.",
      search: "Search workers, requests, or reports",
      nav: ["Home", "Worker Verification", "Clients", "Requests", "Vendors", "Workers", "Finance", "Ads Manager", "Pricing & Plans", "Settings"],
      stats: ["Total revenue", "Pending verifications", "Open complaints", "Active requests"],
      queueSection: "Verification queue",
      alertsSection: "Operational alerts",
      financeSection: "Finance snapshot",
      action: "Review verifications"
    },
    shared: {
      notifications: "Notifications",
      profile: "Profile",
      online: "Online now",
      revenue: "Revenue",
      completion: "Completion",
      response: "Response speed",
      satisfaction: "Customer satisfaction",
      thisWeek: "This week",
      today: "Today"
    }
  }
} as const satisfies Record<Locale, unknown>;

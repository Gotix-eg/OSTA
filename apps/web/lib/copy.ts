import type { Locale } from "./locales";

export const landingCopy = {
  ar: {
    homeLabel: "الرئيسية",
    localeToggle: "EN",
    nav: ["الخدمات", "المتاجر", "كيف يعمل", "انضم كعامل/تاجر", "تواصل معنا"],
    login: "دخول",
    getStarted: "ابدأ الآن",
    heroEyebrow: "منصة موثوقة للحرفيين المعتمدين في مصر",
    heroTitle: "أُسطفاي في بيتك... بضغطة زر",
    heroSubtitle:
      "اطلب فني موثق يصل إليك بسرعة، مع تسعير واضح وضمان على الخدمة ودفع آمن يحفظ حقك.",
    searchService: "ما الخدمة التي تحتاجها؟",
    searchArea: "المنطقة أو الحي",
    searchAction: "ابحث الآن",
    searchHint: "اقتراحات ذكية حسب نوع الخدمة والمنطقة.",
    verifiedBadge: "عمالة موثقة",
    guaranteeBadge: "ضمان على كل طلب",
    trustTitle: "أرقام تبني الثقة من أول نظرة",
    trustStats: [
      { value: 5000, suffix: "+", label: "عامل موثق" },
      { value: 50000, suffix: "+", label: "خدمة مكتملة" },
      { value: 4.8, suffix: "★", label: "متوسط التقييم" },
      { value: 100, suffix: "%", label: "ضمان رضا" }
    ],
    servicesTitle: "خدماتنا",
    servicesSubtitle: "فئات واضحة، فنيين متاحين، واستجابة سريعة من أقرب أُسطفاي مناسب لطلبك.",
    viewAllServices: "عرض كل الخدمات",
    howTitle: "كيف يعمل OSTAFY؟",
    howSubtitle: "تجربة سهلة مثل أوبر، لكن مصممة خصيصًا للخدمات المنزلية والمهارية.",
    steps: [
      {
        title: "احكي المشكلة",
        description: "اكتب وصفًا سريعًا، أضف صورًا، وحدد مستوى الاستعجال في أقل من دقيقة."
      },
      {
        title: "اختر أُسطاك",
        description: "شاهد التقييمات والخبرة والتوافر قبل ما تؤكد الحجز."
      },
      {
        title: "الشغل يتم",
        description: "تابع وصول الفني وحالة الطلب لحظة بلحظة مع تحديثات واضحة."
      },
      {
        title: "ادفع وقيّم بأمان",
        description: "الدفع يبقى محمي لحد التأكيد، وبعدها تقدر تضيف تقييمك وضمانك."
      }
    ],
    whyTitle: "لماذا أُسطفاي؟",
    whySubtitle: "بناء الثقة هنا مش شعارات، لكنه نظام كامل يحمي العميل والفني معًا.",
    whyCards: [
      ["توثيق أمني من 5 خطوات", "هوية، مستندات، ومراجعة قبل تفعيل أي عامل."],
      ["تسعير عادل وشفاف", "بدون مفاجآت، مع وضوح في التكلفة المتوقعة والنهائية."],
      ["ضمان على كل خدمة", "لو حصلت مشكلة بعد التنفيذ، عندك آلية متابعة وضمان."],
      ["دفع مؤمن بنظام حجز", "فلوسك لا تتحرك إلا بعد بدء وتنفيذ الخدمة بشكل واضح."],
      ["تقييمات حقيقية فقط", "كل تقييم مرتبط بطلب فعلي، وليس مراجعات مجهولة."],
      ["تتبع مباشر للفني", "شوف مكان الوصول وحالة الطلب بدون مكالمات متكررة."]
    ],
    workersTitle: "أفضل الصنايعية",
    workersSubtitle: "وجوه حقيقية، تخصصات مطلوبة، وتقييمات تثبت الجودة.",
    bookNow: "احجز الآن",
    testimonialsTitle: "آراء عملائنا",
    testimonialsSubtitle: "تجارب من بيوت مصرية احتاجت سرعة وثقة وجودة تنفيذ.",
    workerCtaTitle: "حوّل صنعتك لدخل ثابت",
    workerCtaBody:
      "انضم لمنصة تفتح لك طلبات يومية، ساعات مرنة، ودعم مهني يساعدك تكبر شغلك باحتراف.",
    workerBenefits: ["دخل مستمر", "ساعات مرنة", "تدريب مستمر", "دعم فني", "سوق أدوات مهني"],
    workerStats: "انضم إلى 5000+ عامل يحققون متوسط 8000 جنيه شهريًا",
    registerWorker: "سجّل كأُسطفاي",
    downloadTitle: "تطبيق OSTAFY قريبًا",
    downloadBody: "تابع الطلبات والدفع والتواصل من موبايلك بتجربة مصممة للحركة اليومية.",
    comingSoon: "قريبًا",
    faqTitle: "أسئلة شائعة",
    faqSubtitle: "أهم الإجابات قبل أول حجز أو أول تسجيل كعامل.",
    faqs: [
      ["كيف تتم عملية التوثيق؟", "يتم التحقق من الهوية والمستندات والسجل الجنائي والعنوان قبل تفعيل العامل."],
      ["كيف يتم حماية الدفع؟", "يتم احتجاز المبلغ بشكل آمن ولا يطلق إلا بعد اكتمال الخدمة أو حل أي نزاع."],
      ["ماذا لو لم أكن راضيًا؟", "يمكنك فتح شكوى مدعومة بالصور والملاحظات وسيتم مراجعتها من فريق الدعم."],
      ["كيف أصبح عاملًا على المنصة؟", "تسجل الحساب، ترفع المستندات، تختار التخصصات، ثم ترسل الطلب للمراجعة."],
      ["هل توجد رسوم مخفية؟", "لا، يتم توضيح الرسوم والعمولة قبل التأكيد وبشكل واضح في الطلب."],
      ["هل أستطيع اختيار نفس الفني مرة أخرى؟", "نعم، يمكنك حفظ الفنيين المفضلين وإعادة الحجز منهم في أي وقت."]
    ],
    footerBody: "منصة تربط أصحاب البيوت بالصنايعية الموثقين بسرعة وشفافية وتجربة محترمة.",
    footerLinks: {
      quick: "روابط سريعة",
      workers: "للعاملين",
      contact: "تواصل"
    },
    footerItems: {
      quick: ["الخدمات", "كيف يعمل", "عن OSTAFY", "اتصل بنا"],
      workers: ["سجل الآن", "الأسئلة الشائعة", "التدريب", "الدعم"],
      contact: ["support@osta.eg", "+20 100 000 0000", "القاهرة، مصر"]
    },
    footerBottom: "جميع الحقوق محفوظة لـ OSTAFY"
  },
  en: {
    homeLabel: "Home",
    localeToggle: "AR",
    nav: ["Services", "Vendors", "How It Works", "Join as Pro/Vendor", "Contact"],
    login: "Login",
    getStarted: "Get Started",
    heroEyebrow: "A trusted platform for verified skilled workers in Egypt",
    heroTitle: "Your Trusted Worker... One Click Away",
    heroSubtitle:
      "Book a verified pro in minutes with transparent pricing, secure payments, and guaranteed work quality.",
    searchService: "What service do you need?",
    searchArea: "Your area",
    searchAction: "Search",
    searchHint: "Smart suggestions based on service type and neighborhood.",
    verifiedBadge: "Verified workers",
    guaranteeBadge: "Guaranteed on every job",
    trustTitle: "Numbers that build trust instantly",
    trustStats: [
      { value: 5000, suffix: "+", label: "verified workers" },
      { value: 50000, suffix: "+", label: "completed services" },
      { value: 4.8, suffix: "★", label: "average rating" },
      { value: 100, suffix: "%", label: "satisfaction guarantee" }
    ],
    servicesTitle: "Our Services",
    servicesSubtitle: "Clear categories, ready workers, and fast matching to the right specialist near you.",
    viewAllServices: "View All Services",
    howTitle: "How OSTAFY Works",
    howSubtitle: "As smooth as ride-hailing, rebuilt for skilled home services and repairs.",
    steps: [
      {
        title: "Describe the issue",
        description: "Share the problem, add photos, and set urgency in less than a minute."
      },
      {
        title: "Choose your worker",
        description: "Review ratings, experience, and availability before confirming."
      },
      {
        title: "Work gets done",
        description: "Track arrival and job status in real time with clear updates."
      },
      {
        title: "Pay and rate safely",
        description: "Your payment stays protected until the service is completed properly."
      }
    ],
    whyTitle: "Why OSTAFY",
    whySubtitle: "Trust is not a marketing line here. It is built into the full service flow.",
    whyCards: [
      ["5-step worker verification", "Identity, documents, and compliance review before activation."],
      ["Fair transparent pricing", "No hidden costs, with clear estimates before confirmation."],
      ["Work guarantee", "Every service includes post-job warranty support."],
      ["Secure held payments", "Your money is protected until progress is verified."],
      ["Real customer reviews", "Every rating is tied to a real completed request."],
      ["Live worker tracking", "See arrival and request progress without endless calls."]
    ],
    workersTitle: "Top Rated Workers",
    workersSubtitle: "Real profiles, in-demand specialties, and reputation earned on the job.",
    bookNow: "Book Now",
    testimonialsTitle: "What Our Customers Say",
    testimonialsSubtitle: "Stories from households that needed speed, clarity, and reliable execution.",
    workerCtaTitle: "Turn Your Skills Into Income",
    workerCtaBody:
      "Join a platform that brings daily requests, flexible hours, and professional support to help your business grow.",
    workerBenefits: ["Steady income", "Flexible hours", "Training", "Dedicated support", "Tools marketplace"],
    workerStats: "Join 5,000+ workers earning an average of EGP 8,000 per month",
    registerWorker: "Register as a Worker",
    downloadTitle: "OSTAFY App is Coming Soon",
    downloadBody: "Manage requests, payments, and communication from a mobile-first experience built for daily movement.",
    comingSoon: "Coming Soon",
    faqTitle: "Frequently Asked Questions",
    faqSubtitle: "The main answers clients and workers ask before getting started.",
    faqs: [
      ["How does verification work?", "Identity, documents, utility proof, and background checks are reviewed before worker approval."],
      ["How is my payment protected?", "Funds are held securely and only released once the job is completed or a dispute is resolved."],
      ["What if I am not satisfied?", "You can submit a complaint with evidence and our support team will review it."],
      ["How do I become a worker?", "Create an account, upload documents, choose specialties, and submit for review."],
      ["Are there hidden fees?", "No. Commissions and costs are shown clearly before confirmation."],
      ["Can I book the same worker again?", "Yes, you can save favorite workers and rebook them anytime." ]
    ],
    footerBody: "A platform connecting households with verified skilled workers through speed, clarity, and premium service.",
    footerLinks: {
      quick: "Quick Links",
      workers: "For Workers",
      contact: "Contact"
    },
    footerItems: {
      quick: ["Services", "How It Works", "About OSTAFY", "Contact"],
      workers: ["Register", "FAQ", "Training", "Support"],
      contact: ["support@osta.eg", "+20 100 000 0000", "Cairo, Egypt"]
    },
    footerBottom: "All rights reserved by OSTAFY"
  }
} as const;

export const authCopy = {
  ar: {
    intro: "حلول سريعة وموثوقة",
    loginTitle: "سجّل دخولك وابدأ طلبك",
    loginBody: "ادخل رقم الهاتف وكلمة المرور للوصول إلى الطلبات والمحفظة والإشعارات.",
    registerClientTitle: "افتح حساب عميل في دقائق",
    registerWorkerTitle: "ابدأ رحلتك المهنية مع أُسطفاي",
    registerVendorTitle: "كن موردًا معتمدًا مع أُسطفاي",
    forgotPasswordTitle: "استرجاع كلمة المرور",
    forgotPasswordBody: "أدخل بريدك الإلكتروني المسجل وسنرسل لك رمزاً لتغيير كلمة المرور.",
    resetPasswordTitle: "تحديث كلمة المرور",
    resetPasswordBody: "أدخل الرمز المرسل وكلمة المرور الجديدة لإكمال الاستعادة.",
    otpTitle: "تأكيد رمز التحقق",
    otpBody: "لقد أرسلنا رمزاً مكوّناً من 6 أرقام إلى هاتفك لتأكيد الهوية.",
    terms: "أوافق على الشروط وسياسة الخصوصية",
    submit: "متابعة",
    success: "تم تسجيل الدخول بنجاح! جاري تحويلك...",
    timerLabel: "إعادة الإرسال بعد",
    resend: "إعادة إرسال الرمز",
    next: "التالي",
    back: "السابق",
    sendCode: "إرسال الكود",
    update: "تحديث",
    processing: "جاري المعالجة...",
    passwordUpdated: "تم تحديث كلمة المرور!",
    loginNow: "يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة."
  },
  en: {
    intro: "Fast and trusted service workflows",
    loginTitle: "Sign in and continue your request",
    loginBody: "Use your phone and password to access requests, wallet, and notifications.",
    registerClientTitle: "Create a client account in minutes",
    registerWorkerTitle: "Start your professional journey with OSTAFY",
    registerVendorTitle: "Become a trusted vendor with OSTAFY",
    forgotPasswordTitle: "Reset your password",
    forgotPasswordBody: "Enter your registered email and we will send you a code to reset your password.",
    resetPasswordTitle: "Update password",
    resetPasswordBody: "Enter the code sent to your email and your new password.",
    otpTitle: "Verify your code",
    otpBody: "We've sent a 6-digit code to your phone to verify your identity.",
    terms: "I agree to the terms and privacy policy",
    submit: "Continue",
    success: "Signed in successfully! Redirecting...",
    timerLabel: "Resend available in",
    resend: "Resend code",
    next: "Next",
    back: "Back",
    sendCode: "Send Code",
    update: "Update",
    processing: "Processing...",
    passwordUpdated: "Password Updated!",
    loginNow: "You can now login with your new password."
  }
} as const;

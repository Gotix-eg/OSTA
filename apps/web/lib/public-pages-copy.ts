import type { Locale } from "./locales";

export type PublicPageKey = "services" | "how-it-works" | "about" | "contact" | "faq" | "terms" | "privacy" | "careers" | "billing";

export const publicPageCopy = {
  ar: {
    nav: {
      home: "الرئيسية",
      services: "الخدمات",
      vendors: "المتاجر",
      how: "كيف يعمل",
      about: "من نحن",
      contact: "تواصل",
      faq: "أسئلة شائعة",
      dashboards: "الداشبوردات",
      login: "تسجيل الدخول"
    },
    pages: {
      services: {
        eyebrow: "الخدمات",
        title: "خدمات منظمة بطريقة واضحة",
        description: "من الكهرباء والسباكة والتكييف، تقدم أُسطفاي فئات واضحة ومطابقة أسرع مع عمال موثقين ومتاحين.",
        sections: [
          {
            title: "الفئات الأساسية",
            body: "كهرباء، سباكة، نجارة، دهانات، تكييف وأجهزة، ألومنيوم ولحام، وخدمات عامة — كل ده في كتالوج واحد ببيانات واضحة وسرعة في الرد."
          },
          {
            title: "تسعير منظم وشفاف",
            body: "كل طلب بيتضمن تقدير أولي ونطاق واضح وتتبع للتكلفة قبل بدء الشغل — من غير مفاجآت."
          },
          {
            title: "ضمان ومتابعة",
            body: "بعد التنفيذ تقدر تتابع الضمان، تفتح شكوى مدعومة بأدلة، أو تعيد الحجز مع نفس الفني."
          }
        ]
      },
      "how-it-works": {
        eyebrow: "مسار العمل",
        title: "الطلب بيمشي إزاي من أول كليك لحد التسليم",
        description: "المسار بسيط: تصف المشكلة، يتم التطابق مع فني مناسب، تتابع حالة الشغل، وتضع تقييمك وضمانك بعد التنفيذ.",
        sections: [
          {
            title: "١) الوصف",
            body: "عنوان سريع، وصف للمشكلة، صور أو ملاحظات، ومستوى الاستعجال — عشان الفني يفهم الطلب من أوله."
          },
          {
            title: "٢) التطابق",
            body: "المنصة بتقدم فنيين حسب المنطقة والتخصص والتقييم والتوافر — بدون تدوير ومستنيش."
          },
          {
            title: "٣) التنفيذ والتقييم",
            body: "تحديثات مباشرة، دفع محمي، ونظام تقييم مرتبط بطلب حقيقي — مش تعليقات وهمية."
          }
        ]
      },
      about: {
        eyebrow: "عن أُسطفاي",
        title: "أُسطفاي مبني على الثقة قبل أي حجز",
        description: "الهدف هو التقريب بين أصحاب البيوت والعمال الموثقين بتجربة واضحة، زي تطبيقات التنقل بس مصممة للخدمات المنزلية.",
        sections: [
          {
            title: "لماذا الآن",
            body: "سوق الخدمات المنزلية يحتاج وصول أسرع، تسعير أوضح، وحماية أقوى للعميل والفني في نفس الوقت."
          },
          {
            title: "نظام الثقة",
            body: "فحص الهوية، مراجعة المستندات، مسار الشكاوى، محفظة آمنة، وداشبوردات للعميل والفني والإدارة."
          },
          {
            title: "الرؤية على المدى البعيد",
            body: "شبكة واسعة من العمال، عمليات لحظية، ونظام متكامل للتدريب والأدوات والضمانات والنمو المهني."
          }
        ]
      },
      contact: {
        eyebrow: "تواصل معنا",
        title: "كيف تتواصل مع أُسطفاي",
        description: "دعم، شراكات، استفسارات عن الانضمام، أو طلبات الأعمال — كلها من خلال قنوات واضحة ومنظمة.",
        sections: [
          {
            title: "الدعم",
            body: "support@osta.eg — ‎+20 100 000 0000 — القاهرة، مصر."
          },
          {
            title: "للعمال",
            body: "استفسارات التوثيق والانضمام والمستندات أو دعم الأرباح والحساب."
          },
          {
            title: "للشركاء",
            body: "أعمال العقارات وإدارة المنشآت وطلبات الخدمات بالجملة."
          }
        ]
      },
      faq: {
        eyebrow: "مركز المساعدة",
        title: "مركز المساعدة والأسئلة الشائعة",
        description: "إجابات شاملة لجميع استفساراتكم حول كيفية عمل المنصة، توثيق الحسابات، ونظام الاشتراكات والدعم.",
        sections: [
          {
            title: "كيف تعمل منصة أُسطفاي؟",
            body: "أُسطفاي هي منصة رقمية تسهل وتؤمن عملية البحث والربط بين العملاء الذين يبحثون عن صيانة منزلية وبين الأسطوات والصنايعية الموثقين القريبين منهم."
          },
          {
            title: "كيف يتم توثيق حسابات الفنيين (الأسطوات)؟",
            body: "يخضع كل فني على المنصة لفحص صارم يشمل التحقق من بطاقة الرقم القومي، إثبات السكن، المراجعة الأمنية، والمراجعة الفنية لضمان أعلى مستويات الأمان والموثوقية."
          },
          {
            title: "كيف تتم الدفوعات مقابل الخدمات؟",
            body: "يتم الاتفاق على تكلفة الخدمة بين العميل والفني مباشرة. وندعم طرق سداد متعددة تشمل المحافظ الإلكترونية، شبكة InstaPay، الدفع نقداً، أو كروت الدفع المباشر."
          },
          {
            title: "ماذا لو لم أكن راضياً عن الخدمة أو حدث خلاف؟",
            body: "رغم أننا جهة ربط ووساطة، نلتزم بمساعدتكم في حل الخلافات ودياً. وفي حال الضرورة، تقدم المنصة صورة من بيانات وهوية الفني الموثقة للعميل المتضرر للمتابعة القانونية."
          }
        ]
      },
      terms: {
        eyebrow: "شروط الخدمة",
        title: "طبيعة الخدمة وإخلاء المسؤولية",
        description: "شروط وقواعد استخدام منصة أُسطفاي والحدود التنظيمية للتعامل بين العملاء والفنيين.",
        sections: [
          {
            title: "طبيعة الخدمة والربط",
            body: "منصة أُسطفاي هي مجرد وسيط لتوفير وتسهيل الربط بين العملاء والصنايعية (مقدمي الخدمات) فقط. وليس للمنصة أي سلطة إدارية، أو رقابة، أو علاقة عمل مباشرة مع أي من الطرفين، ولا تتدخل في توجيه العمل."
          },
          {
            title: "الضمان الأمني والتحقق من الهوية",
            body: "ينحصر دور المنصة في توفير الضمان الأمني للعملاء من خلال التحقق من مستندات الصنايعية والاحتفاظ بنسخة من هوياتهم الرسمية (مثل صورة بطاقة الرقم القومي). وتلتزم المنصة بتقديم هذه البيانات للعميل عند الطلب لمساعدته في التوصل للفني وحل أي مشكلة قد تطرأ قانونياً أو شخصياً."
          },
          {
            title: "إخلاء المسؤولية عن المدفوعات والتعاملات",
            body: "المنصة والموقع غير مسؤولين تماماً عن عمليات الدفع، أو الاتفاقات المالية، أو جودة الخدمات المؤداة، أو أي نزاعات تنشأ عن التعامل المباشر بين العميل والصنايعي خارج نطاق البيانات الموثقة التي يتم تقديمها للضمان الأمني."
          }
        ]
      },
      privacy: {
        eyebrow: "سياسة الخصوصية",
        title: "سياسة الخصوصية وحماية البيانات الشخصية",
        description: "تلتزم منصة أُسطفاي بالامتثال الكامل لأحكام قانون حماية البيانات الشخصية المصري رقم ١٥١ لسنة ٢٠٢٠ ولائحته التنفيذية لضمان سرية وأمان معلوماتكم.",
        sections: [
          {
            title: "الامتثال للقانون رقم ١٥١ لسنة ٢٠٢٠",
            body: "تخضع كافة عمليات جمع البيانات ومعالجتها وتخزينها ونقلها لأحكام قانون حماية البيانات الشخصية المصري ولائحته التنفيذية لضمان الخصوصية والسرية الكاملة لكافة أطراف المنصة."
          },
          {
            title: "البيانات التي نقوم بجمعها",
            body: "نقوم بجمع البيانات الشخصية الأساسية (مثل الاسم، الهاتف، والعنوان للعملاء) بالإضافة إلى بيانات التوثيق الرسمية والهوية (مثل الرقم القومي للأسطوات) لضمان أمان وموثوقية منصتنا."
          },
          {
            title: "الغرض من المعالجة والأساس القانوني",
            body: "تتم معالجة البيانات بموجب موافقتكم الصريحة أو لتنفيذ العقود وتقديم الخدمة وتسهيل التواصل الآمن والامتثال للمتطلبات التنظيمية ومنع سوء الاستخدام."
          },
          {
            title: "حقوق صاحب البيانات الشخصية",
            body: "تتمتع بكامل الحقوق في الوصول إلى بياناتك، وتصحيحها، أو طلب مسحها (الحق في النسيان)، أو سحب موافقتك على المعالجة، أو التواصل مع مسؤول حماية البيانات الشخصية بالمنصة."
          },
          {
            title: "مشاركة البيانات وسرية النزاعات",
            body: "لا نقوم ببيع أو مشاركة بياناتك مع الغير للأغراض التجارية. يُستثنى من ذلك مشاركة بيانات التوثيق للفني مع العميل المتضرر لتسهيل الإجراءات القانونية عند حدوث نزاع."
          },
          {
            title: "أمن البيانات ومسؤول حماية البيانات (DPO)",
            body: "نتبع أعلى المعايير الفنية والتنظيمية لحماية بياناتكم من التسريب والاختراق، مع التزامنا بإبلاغ مركز حماية البيانات المصري والجهات المعنية خلال ٧٢ ساعة في حال حدوث أي تسريب، وتعيين مسؤول لحماية البيانات للتواصل عبر dpo@ostafy.com."
          }
        ]
      },
      billing: {
        eyebrow: "سياسة الفوترة",
        title: "سياسة الاشتراكات",
        description: "توضح هذه السياسة كيفية شراء الفنيين لرصيد الطلبات وكيفية خصمه عند التواصل مع العملاء على منصة أُسطفاي.",
        sections: [
          {
            title: "الدفع لكل طلب",
            body: "بدلاً من الاشتراك الشهري الثابت، يدفع الفني الآن فقط مقابل الطلبات التي يستلمها فعلياً. تكلفة كل طلب ٢٠ جنيهاً مصرياً تُخصم من رصيد طلباتك."
          },
          {
            title: "باقات الرصيد والأسعار",
            body: "يُشترى رصيد الطلبات في باقات ثابتة: ٥ طلبات (١٠٠ جنيه)، ١٠ طلبات (٢٠٠ جنيه)، ١٥ طلباً (٣٠٠ جنيه)، ٢٠ طلباً (٤٠٠ جنيه)، أو ٢٥ طلباً (٥٠٠ جنيه). كل باقة بسعر ثابت ٢٠ جنيهاً للطلب الواحد دون أي رسوم إضافية."
          },
          {
            title: "متى يُخصم الرصيد",
            body: "يُخصم طلب واحد (٢٠ جنيهاً) من رصيدك فور قيام العميل بمشاركة بيانات التواصل الخاصة به معك. يتم الخصم بغض النظر عن إتمام الصفقة من عدمه، أو سداد العميل لقيمة الخدمة لاحقاً."
          },
          {
            title: "انتهاء الرصيد",
            body: "في حال وصول رصيد طلباتك إلى صفر، يظل بإمكانك تصفح الطلبات المتاحة، لكن لن تتمكن من مراسلة العملاء أو الوصول إلى بيانات تواصلهم حتى تقوم بشراء باقة جديدة."
          },
          {
            title: "سياسة عدم الاسترداد",
            body: "الرصيد المخصوم مقابل طلب تمت مشاركة بياناته غير قابل للاسترداد. أما الرصيد غير المستخدم فيظل صالحاً في حسابك لحين استهلاكه."
          },
          {
            title: "شحن الرصيد",
            body: "يمكنك شراء باقة جديدة في أي وقت من داشبورد الفني باستخدام المحافظ الإلكترونية، إنستاباي، فوري، أو البطاقات البنكية (Visa / MasterCard)."
          }
        ]
      },
      careers: {
        eyebrow: "الوظائف",
        title: "انضم إلى فريق عمل أُسطفاي",
        description: "ابنِ معنا مستقبل الخدمات المنزلية والتقنية في مصر والشرق الأوسط.",
        sections: [
          {
            title: "١) بيئة العمل",
            body: "نوفر بيئة عمل مرنة ومحفزة على الابتكار والنمو المهني المستمر."
          },
          {
            title: "٢) فرص النمو",
            body: "كن جزءًا من فريق سريع النمو يهدف إلى تغيير حياة ملايين العملاء والحرفيين."
          },
          {
            title: "٣) كيفية التقديم",
            body: "أرسل سيرتك الذاتية ومجال تخصصك إلى careers@osta.eg وسنتواصل معك فور توفر فرصة مناسبة."
          }
        ]
      }
    },
    dashboards: {
      eyebrow: "مركز الداشبوردات",
      title: "ادخل على أي داشبورد من مكان واحد",
      description: "عشان ماتدورش على الروابط، عملنالك هاب مباشر للعميل والفني وبريفيو الداشبورد الإداري.",
      cards: [
        {
          title: "داشبورد العميل",
          body: "الطلبات والمحفظة والمفضلة والضمانات وإنشاء الطلبات الجديدة.",
          href: "/client"
        },
        {
          title: "داشبورد الفني",
          body: "الوظائف الواردة والعمل الجاري والأرباح ومتابعة الأداء.",
          href: "/worker"
        },
        {
          title: "داشبورد المورد",
          body: "طلبات قطع الغيار، وعروض البضائع وإدارة المبيعات.",
          href: "/vendor"
        },
        {
          title: "داشبورد الإدارة",
          body: "قائمة التوثيق ونبض المالية وتنبيهات العمليات ولوحات التحكم.",
          href: "/admin"
        }
      ]
    }
  },
  en: {
    nav: {
      home: "Home",
      services: "Services",
      vendors: "Vendors",
      how: "How It Works",
      about: "About",
      contact: "Contact",
      faq: "FAQ",
      dashboards: "Dashboards",
      login: "Login"
    },
    pages: {
      services: {
        eyebrow: "Services",
        title: "Service categories built for clarity",
        description: "From electrical and plumbing to AC work and finishing, Ostafy organizes every service into clear, trusted booking flows.",
        sections: [
          {
            title: "Core categories",
            body: "Electrical, plumbing, carpentry, painting, AC and appliances, welding, and general support all sit inside one clean service catalog."
          },
          {
            title: "Transparent pricing",
            body: "Every request starts with an estimated scope and clearer expectations before work begins."
          },
          {
            title: "Warranty and follow-up",
            body: "After completion, users can review, track warranty coverage, and reopen support paths if needed."
          }
        ]
      },
      "how-it-works": {
        eyebrow: "Workflow",
        title: "How a request moves from click to completion",
        description: "The journey is designed to feel quick and controlled: describe the job, match with the right worker, track progress, and review with confidence.",
        sections: [
          {
            title: "1) Describe",
            body: "Create a focused request with title, details, urgency, and optional media context."
          },
          {
            title: "2) Match",
            body: "The platform lines up workers by area, specialty, rating, and availability."
          },
          {
            title: "3) Execute + review",
            body: "Users follow status live, keep payments protected, and leave reviews tied to real jobs."
          }
        ]
      },
      about: {
        eyebrow: "About Ostafy",
        title: "Ostafy is built around trust before booking",
        description: "The platform connects households with verified skilled workers through a cleaner, faster, and more accountable service model.",
        sections: [
          {
            title: "Why now",
            body: "Home services need faster access, clearer pricing, and stronger protection for both sides of the job."
          },
          {
            title: "Trust system",
            body: "Identity checks, document review, complaint handling, secure wallet flows, and dashboard visibility are part of the foundation."
          },
          {
            title: "Long-term vision",
            body: "A wider worker network, stronger operations, real-time tools, training, and financial workflows that help everyone grow."
          }
        ]
      },
      contact: {
        eyebrow: "Contact",
        title: "How to reach Ostafy",
        description: "Support, onboarding questions, partnerships, or business requests all route through clear channels.",
        sections: [
          {
            title: "Support",
            body: "support@osta.eg - +20 100 000 0000 - Cairo, Egypt."
          },
          {
            title: "For workers",
            body: "Questions around verification, onboarding, documents, earnings, and account readiness."
          },
          {
            title: "For partners",
            body: "Property operations, facilities, and bulk service demand partnerships."
          }
        ]
      },
      faq: {
        eyebrow: "Help Center",
        title: "Help Center & FAQ",
        description: "Find comprehensive answers to your questions about our platform services, provider verification, billing, and support.",
        sections: [
          {
            title: "How does the Ostafy platform work?",
            body: "Ostafy is a digital matching marketplace designed to simplify and secure the connection between clients looking for home maintenance and verified local professional tradesmen."
          },
          {
            title: "How are professional service providers verified?",
            body: "Every craftsman undergoes a background check including national ID verification, address validation, criminal record checks, and professional reviews to ensure safety and quality."
          },
          {
            title: "How are payments for services processed?",
            body: "Pricing is agreed upon directly between the client and the provider. Payments can be settled using mobile cash wallets, InstaPay, cash, or credit/debit cards."
          },
          {
            title: "What happens if there is a dispute or quality issue?",
            body: "While we operate as an intermediary matching platform, we provide dispute assistance and reserve the right to share the verified provider's ID records with the client for legal recourse."
          }
        ]
      },
      terms: {
        eyebrow: "Terms of Service",
        title: "Nature of Service & Disclaimer",
        description: "Rules and guidelines governing the relationship between clients and craftsmen on the Ostafy platform.",
        sections: [
          {
            title: "Nature of Service & Matching",
            body: "Ostafy acts solely as a facilitator/broker to match clients with independent craftsmen. The platform holds no authority, direct management, control, or employment relationship over either the client or the craftsman."
          },
          {
            title: "Security Guarantee & Verification Data",
            body: "The platform's role is limited to performing identity checks on craftsmen and retaining secure copies of their official documents (such as national ID card images) for security. In case of any dispute or issue, Ostafy will provide this data to the client to assist them in contacting and locating the craftsman."
          },
          {
            title: "Financial & Operational Disclaimer",
            body: "The website and platform are entirely exempt from any responsibility or liability regarding payments, pricing agreements, the quality of services performed, or any disputes resulting from direct interactions between the client and the craftsman."
          }
        ]
      },
      privacy: {
        eyebrow: "Privacy Policy",
        title: "Privacy Policy & Personal Data Protection",
        description: "At Ostafy, we are fully committed to complying with the Egyptian Personal Data Protection Law No. 151 of 2020 to guarantee the privacy, confidentiality, and security of your information.",
        sections: [
          {
            title: "Compliance with Law 151 of 2020",
            body: "All data collection, processing, storage, and transfer operations are governed by the Egyptian Personal Data Protection Law and its executive regulations to ensure complete privacy for all users."
          },
          {
            title: "Personal Data We Collect",
            body: "We collect basic contact details (such as name, phone number, and address for clients) along with official identity verification documents (such as national ID card images for professionals) to guarantee platform safety and trust."
          },
          {
            title: "Purpose of Processing & Legal Basis",
            body: "Data is processed based on your explicit consent, to execute service agreements, to facilitate secure professional matching, to comply with regulatory requirements, and to prevent fraudulent activities."
          },
          {
            title: "Your Rights as a Data Subject",
            body: "You possess the full right to access your processed data, request corrections or amendments, request deletion (the right to be forgotten), restrict processing, or withdraw your consent at any time."
          },
          {
            title: "Data Sharing & Dispute Resolution",
            body: "We do not sell, rent, or share your commercial data with third parties. However, in the event of a serious dispute, the platform reserves the right to share the verified professional's identity info with the affected client to facilitate legal action."
          },
          {
            title: "Security Measures & Data Protection Officer (DPO)",
            body: "We adopt state-of-the-art technical and organizational security measures. We commit to notifying the Egyptian Data Protection Center within 72 hours of any data breach, and we have appointed a Data Protection Officer contactable at dpo@ostafy.com."
          }
        ]
      },
      billing: {
        eyebrow: "Billing Policy",
        title: "Order Credit & Billing Policy",
        description: "This policy explains how workers purchase order credits and how each credit is used to unlock a client's contact details on the Ostafy platform.",
        sections: [
          {
            title: "Pay Per Order",
            body: "Instead of a fixed monthly subscription, workers now pay only for the leads they actually receive. Each order costs EGP 20, deducted from your order credit balance."
          },
          {
            title: "Credit Packages & Pricing",
            body: "Order credits are purchased in fixed packages: 5 orders (EGP 100), 10 orders (EGP 200), 15 orders (EGP 300), 20 orders (EGP 400), or 25 orders (EGP 500). Every package works out to a flat EGP 20 per order, no extra fees."
          },
          {
            title: "When You're Charged",
            body: "One order credit (EGP 20) is deducted from your balance the moment a client shares their contact details with you. This charge applies whether or not the job is completed, or the client later pays for the service."
          },
          {
            title: "Running Out of Credits",
            body: "If your order credit balance reaches zero, you can still browse available orders, but you won't be able to message clients or access their contact details until you purchase another package."
          },
          {
            title: "No-Refund Policy",
            body: "Credit deducted for an order where contact details were shared is non-refundable. Unused credits remain valid on your account until you use them."
          },
          {
            title: "Topping Up",
            body: "You can buy a new package at any time from your worker dashboard using Mobile Wallets, InstaPay, Fawry points, or Credit/Debit Cards (Visa/MasterCard)."
          }
        ]
      },
      careers: {
        eyebrow: "Careers",
        title: "Join the Ostafy Team",
        description: "Build the future of home and technical services in Egypt and the Middle East with us.",
        sections: [
          {
            title: "1) Work Environment",
            body: "We provide a flexible work environment that fosters innovation and continuous professional growth."
          },
          {
            title: "2) Growth Opportunities",
            body: "Be part of a fast-growing team aiming to impact the lives of millions of clients and craftspeople."
          },
          {
            title: "3) How to Apply",
            body: "Send your resume and area of expertise to careers@osta.eg and we will reach out as soon as a suitable opportunity opens."
          }
        ]
      }
    },
    dashboards: {
      eyebrow: "Dashboard hub",
      title: "Open any dashboard from one place",
      description: "To make access obvious, this hub links directly to the client, worker, and admin dashboard previews.",
      cards: [
        {
          title: "Client dashboard",
          body: "Requests, wallet, favorites, warranties, and the request creation flow.",
          href: "/client"
        },
        {
          title: "Worker dashboard",
          body: "Incoming jobs, active work, earnings, and performance tracking.",
          href: "/worker"
        },
        {
          title: "Vendor dashboard",
          body: "Material requests, quotes, and active deliveries tracking.",
          href: "/vendor"
        },
        {
          title: "Admin dashboard",
          body: "Verification queue, finance pulse, operations alerts, and control surfaces.",
          href: "/admin"
        }
      ]
    }
  }
} as const satisfies Record<Locale, unknown>;

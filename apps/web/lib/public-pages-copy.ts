import type { Locale } from "./locales";

export type PublicPageKey = "services" | "how-it-works" | "about" | "contact" | "faq" | "terms" | "privacy" | "careers";

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
        eyebrow: "أسئلة شائعة",
        title: "أسئلة مهمة قبل أن تبدأ",
        description: "إجابات عن التوثيق والمدفوعات وحالات عدم الرضا وتسجيل الفني والرسوم.",
        sections: [
          {
            title: "كيف يعمل التوثيق",
            body: "يمر الفني بفحص الهوية والمستندات وإثبات العنوان والمراجعة قبل أن يصبح متاحًا على المنصة."
          },
          {
            title: "كيف يُحمى الدفع",
            body: "يبقى المبلغ محميًا حتى يتضح حالة الشغل أو يُحل أي نزاع بشكل رسمي."
          },
          {
            title: "إذا حدث شيء خطأ",
            body: "في مسار شكاوى مدعوم بالأدلة ومراجعة الإدارة لضمان حفظ حقوق الطرفين."
          }
        ]
      },
      terms: {
        eyebrow: "شروط الخدمة",
        title: "طبيعة الخدمة وإخلاء المسؤولية",
        description: "شروط وقواعد استخدام منصة أُسطفاي والحدود التنظيمية للتعامل بين العملاء والفنيين.",
        sections: [
          {
            title: "١) طبيعة الخدمة والربط",
            body: "منصة أُسطفاي هي مجرد وسيط لتوفير وتسهيل الربط بين العملاء والصنايعية (مقدمي الخدمات) فقط. وليس للمنصة أي سلطة إدارية، أو رقابة، أو علاقة عمل مباشرة مع أي من الطرفين، ولا تتدخل في توجيه العمل."
          },
          {
            title: "٢) الضمان الأمني والتحقق من الهوية",
            body: "ينحصر دور المنصة في توفير الضمان الأمني للعملاء من خلال التحقق من مستندات الصنايعية والاحتفاظ بنسخة من هوياتهم الرسمية (مثل صورة بطاقة الرقم القومي). وتلتزم المنصة بتقديم هذه البيانات للعميل عند الطلب لمساعدته في التوصل للفني وحل أي مشكلة قد تطرأ قانونياً أو شخصياً."
          },
          {
            title: "٣) إخلاء المسؤولية عن المدفوعات والتعاملات",
            body: "المنصة والموقع غير مسؤولين تماماً عن عمليات الدفع، أو الاتفاقات المالية، أو جودة الخدمات المؤداة، أو أي نزاعات تنشأ عن التعامل المباشر بين العميل والصنايعي خارج نطاق البيانات الموثقة التي يتم تقديمها للضمان الأمني."
          }
        ]
      },
      privacy: {
        eyebrow: "سياسة الخصوصية",
        title: "سياسة الخصوصية وحماية البيانات والأمان",
        description: "نلتزم في أُسطفاي بجمع البيانات اللازمة فقط لضمان الأمان والربط بين العملاء والفنيين.",
        sections: [
          {
            title: "١) جمع هويات الفنيين للأمان",
            body: "نقوم بجمع بيانات التحقق الرسمية الخاصة بالفنيين (مثل صورة بطاقة الرقم القومي) بهدف توفير ضمان أمني للعملاء وتسهيل الوصول إليهم عند الحاجة."
          },
          {
            title: "٢) مشاركة البيانات عند حدوث مشكلات",
            body: "يتم تخزين بيانات الهوية بشكل آمن، ولكن تحتفظ المنصة بالحق الكامل في مشاركة صورة بطاقة الفني أو بياناته الموثقة مع العميل المتضرر في حال حدوث أي مشكلة أو نزاع لتسهيل الوصول للفني قانونياً أو ودياً."
          },
          {
            title: "٣) عدم جمع البيانات المالية",
            body: "لا تقوم المنصة بجمع أو تخزين أي بيانات دفع أو بطاقات ائتمانية خاصة بالعملاء أو الفنيين، حيث يقتصر دورنا على تسهيل التواصل وتقديم الضمانات الأمنية الرسمية المذكورة فقط."
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
        eyebrow: "FAQ",
        title: "The main questions before you begin",
        description: "Quick answers around verification, payments, satisfaction handling, worker onboarding, and fees.",
        sections: [
          {
            title: "How verification works",
            body: "Workers pass through identity, document, utility, and review checks before becoming active."
          },
          {
            title: "How payment is protected",
            body: "Funds remain protected until progress is verified or a dispute has been resolved."
          },
          {
            title: "If something goes wrong",
            body: "There is a complaint path with evidence support and admin review so both sides stay protected."
          }
        ]
      },
      terms: {
        eyebrow: "Terms of Service",
        title: "Nature of Service & Disclaimer",
        description: "Rules and guidelines governing the relationship between clients and craftsmen on the Ostafy platform.",
        sections: [
          {
            title: "1) Nature of Service & Matching",
            body: "Ostafy acts solely as a facilitator/broker to match clients with independent craftsmen. The platform holds no authority, direct management, control, or employment relationship over either the client or the craftsman."
          },
          {
            title: "2) Security Guarantee & Verification Data",
            body: "The platform's role is limited to performing identity checks on craftsmen and retaining secure copies of their official documents (such as national ID card images) for security. In case of any dispute or issue, Ostafy will provide this data to the client to assist them in contacting and locating the craftsman."
          },
          {
            title: "3) Financial & Operational Disclaimer",
            body: "The website and platform are entirely exempt from any responsibility or liability regarding payments, pricing agreements, the quality of services performed, or any disputes resulting from direct interactions between the client and the craftsman."
          }
        ]
      },
      privacy: {
        eyebrow: "Privacy Policy",
        title: "Privacy Policy & Security Guarantees",
        description: "At Ostafy, we only collect data essential for verification, security, and connecting clients with craftsmen.",
        sections: [
          {
            title: "1) Verification Data Collection",
            body: "We collect official identity verification files from craftsmen (such as national ID card images) to provide security guarantees for clients and enable reliable contact details."
          },
          {
            title: "2) Data Sharing for Security and Disputes",
            body: "Identity data is stored securely. However, the platform retains the right to share the craftsman's national ID copy and details with the affected client in case of any dispute, facilitating legal or personal resolution."
          },
          {
            title: "3) No Financial Data Storage",
            body: "The platform does not collect, store, or process any payment credentials or credit card details. Our scope is strictly limited to connection facilitation and verification tracking."
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

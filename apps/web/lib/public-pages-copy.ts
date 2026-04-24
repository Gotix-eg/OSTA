import type { Locale } from "./locales";

export type PublicPageKey = "services" | "how-it-works" | "about" | "contact" | "faq";

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
      dashboards: "الداشبوردات"
    },
    pages: {
      services: {
        eyebrow: "الخدمات",
        title: "خدمات منظمة بطريقة واضحة",
        description: "من الكهرباء والسباكة والتكييف، تقدم أُسطى فئات واضحة ومطابقة أسرع مع عمال موثقين ومتاحين.",
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
        eyebrow: "عن أُسطى",
        title: "أُسطى مبني على الثقة قبل أي حجز",
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
        title: "كيف تتواصل مع أُسطى",
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
      dashboards: "Dashboards"
    },
    pages: {
      services: {
        eyebrow: "Services",
        title: "Service categories built for clarity",
        description: "From electrical and plumbing to AC work and finishing, OSTA organizes every service into clear, trusted booking flows.",
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
        eyebrow: "About OSTA",
        title: "OSTA is built around trust before booking",
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
        title: "How to reach OSTA",
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

import type { ServiceCategory } from "./types";

export const serviceCategories: ServiceCategory[] = [
  {
    id: "electrical",
    slug: "electrical",
    icon: "Zap",
    workersAvailable: 920,
    name: { ar: "الكهرباء", en: "Electrical" },
    description: {
      ar: "صيانات منزلية سريعة وتمديدات احترافية للطوارئ والمشروعات الصغيرة.",
      en: "Fast home fixes and professional wiring for emergencies and upgrades."
    },
    services: [
      {
        id: "electrical-emergency",
        slug: "electrical-emergency",
        name: { ar: "طوارئ الكهرباء", en: "Electrical Emergency" },
        description: {
          ar: "حل عاجل لانقطاع الكهرباء والقواطع والماس الكهربائي.",
          en: "Urgent support for outages, breakers, and electrical faults."
        }
      },
      {
        id: "electrical-installation",
        slug: "electrical-installation",
        name: { ar: "تركيب وتمديد", en: "Installation" },
        description: {
          ar: "تركيب مفاتيح ووحدات إنارة وتمديد دوائر جديدة.",
          en: "Install lighting, switches, and new household circuits."
        }
      }
    ]
  },
  {
    id: "plumbing",
    slug: "plumbing",
    icon: "Waves",
    workersAvailable: 1180,
    name: { ar: "السباكة", en: "Plumbing" },
    description: {
      ar: "تسريب؟ انسداد؟ تركيب جديد؟ سباكين موثقين على مدار اليوم.",
      en: "Leaks, clogs, and installations handled by verified pros."
    },
    services: [
      {
        id: "plumbing-repair",
        slug: "plumbing-repair",
        name: { ar: "إصلاحات سباكة", en: "Plumbing Repair" },
        description: {
          ar: "إصلاح المواسير والحنفيات والسخانات ومشكلات الضغط.",
          en: "Repair pipes, faucets, heaters, and pressure issues."
        }
      }
    ]
  },
  {
    id: "carpentry",
    slug: "carpentry",
    icon: "Hammer",
    workersAvailable: 640,
    name: { ar: "النجارة", en: "Carpentry" },
    description: {
      ar: "تفصيل، صيانة، تركيب، وضبط للأبواب والمطابخ والأثاث.",
      en: "Custom builds, repairs, fittings, and furniture care."
    },
    services: [
      {
        id: "carpentry-custom",
        slug: "carpentry-custom",
        name: { ar: "أعمال تفصيل", en: "Custom Carpentry" },
        description: {
          ar: "تفصيل وحدات تخزين، أرفف، وترميم قطع خشبية.",
          en: "Custom shelves, storage units, and wood restoration."
        }
      }
    ]
  },
  {
    id: "painting",
    slug: "painting",
    icon: "Paintbrush",
    workersAvailable: 480,
    name: { ar: "الدهانات", en: "Painting" },
    description: {
      ar: "تشطيبات داخلية وخارجية مع اختيار ألوان يناسب بيتك.",
      en: "Interior and exterior finishes with guided color choices."
    },
    services: [
      {
        id: "painting-finishes",
        slug: "painting-finishes",
        name: { ar: "تشطيبات ودهانات", en: "Finishes & Paint" },
        description: {
          ar: "معجون، صنفرة، دهان، ولمسات نهائية نظيفة.",
          en: "Prep, sanding, coats, and clean polished finishes."
        }
      }
    ]
  },
  {
    id: "ac-appliances",
    slug: "ac-appliances",
    icon: "Snowflake",
    workersAvailable: 520,
    name: { ar: "التكييف والأجهزة", en: "AC & Appliances" },
    description: {
      ar: "صيانة وتركيب وغسيل تكييفات وأجهزة منزلية أساسية.",
      en: "Install, clean, and repair AC systems and home appliances."
    },
    services: [
      {
        id: "ac-maintenance",
        slug: "ac-maintenance",
        name: { ar: "صيانة التكييف", en: "AC Maintenance" },
        description: {
          ar: "تنظيف شامل وكشف أعطال وشحن فريون حسب الحاجة.",
          en: "Deep cleaning, diagnostics, and gas refill when needed."
        }
      }
    ]
  },
  {
    id: "aluminum-welding",
    slug: "aluminum-welding",
    icon: "Wrench",
    workersAvailable: 260,
    name: { ar: "الألوميتال واللحام", en: "Aluminum & Welding" },
    description: {
      ar: "تركيب شبابيك وأبواب وأعمال لحام منزلية وتجارية صغيرة.",
      en: "Windows, doors, and light residential welding jobs."
    },
    services: [
      {
        id: "welding-fabrication",
        slug: "welding-fabrication",
        name: { ar: "تفصيل ولحام", en: "Fabrication & Welding" },
        description: {
          ar: "تفصيل حديد خفيف وصيانة قطع معدنية أساسية.",
          en: "Light metal fabrication and structural repair work."
        }
      }
    ]
  },
  {
    id: "general-services",
    slug: "general-services",
    icon: "ShieldCheck",
    workersAvailable: 710,
    name: { ar: "الخدمات العامة", en: "General Services" },
    description: {
      ar: "نقل، تركيب، فك، وصيانة خفيفة مع سرعة استجابة عالية.",
      en: "Moving, assembly, installations, and light maintenance."
    },
    services: [
      {
        id: "general-helper",
        slug: "general-helper",
        name: { ar: "خدمة متعددة", en: "General Helper" },
        description: {
          ar: "عمالة ماهرة للمهام المنزلية الصغيرة والمتوسطة.",
          en: "Skilled help for small and medium household tasks."
        }
      }
    ]
  }
];

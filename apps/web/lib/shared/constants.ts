import type { ServiceCategory } from "./types";

export const serviceCategories: ServiceCategory[] = [
  {
    id: "carpentry",
    slug: "carpentry",
    icon: "Hammer",
    workersAvailable: 640,
    name: { ar: "نجار", en: "Carpenter" },
    description: {
      ar: "تفصيل، صيانة، تركيب، وضبط للأبواب والمطابخ والأثاث.",
      en: "Custom builds, repairs, fittings, and furniture care."
    },
    services: [
      {
        id: "carpentry-custom",
        slug: "carpentry-custom",
        name: { ar: "أعمال تفصيل وصيانة", en: "Custom Carpentry & Repair" },
        description: {
          ar: "تفصيل وحدات تخزين، أرفف، وترميم قطع خشبية.",
          en: "Custom shelves, storage units, and wood restoration."
        }
      }
    ]
  },
  {
    id: "plumbing",
    slug: "plumbing",
    icon: "Waves",
    workersAvailable: 1180,
    name: { ar: "سباك", en: "Plumber" },
    description: {
      ar: "تسريب؟ انسداد؟ تركيب جديد؟ سباكين موثقين على مدار اليوم.",
      en: "Leaks, clogs, and installations handled by verified pros."
    },
    services: [
      {
        id: "plumbing-repair",
        slug: "plumbing-repair",
        name: { ar: "إصلاحات وتأسيس سباكة", en: "Plumbing Repair & Install" },
        description: {
          ar: "إصلاح المواسير والحنفيات والسخانات ومشكلات الضغط وتأسيس السباكة.",
          en: "Repair pipes, faucets, heaters, and pressure issues."
        }
      }
    ]
  },
  {
    id: "electrical",
    slug: "electrical",
    icon: "Zap",
    workersAvailable: 920,
    name: { ar: "كهربائي", en: "Electrician" },
    description: {
      ar: "صيانات منزلية سريعة وتمديدات احترافية للطوارئ.",
      en: "Fast home fixes and professional wiring for emergencies."
    },
    services: [
      {
        id: "electrical-emergency",
        slug: "electrical-emergency",
        name: { ar: "صيانة وتمديد كهرباء", en: "Electrical Maintenance" },
        description: {
          ar: "حل عاجل لانقطاع الكهرباء وتركيب المفاتيح ووحدات الإنارة.",
          en: "Urgent support for outages, installing lighting and switches."
        }
      }
    ]
  },
  {
    id: "ac-technician",
    slug: "ac-technician",
    icon: "Snowflake",
    workersAvailable: 520,
    name: { ar: "تكييفات", en: "AC Technician" },
    description: {
      ar: "صيانة وتركيب وغسيل تكييفات وشحن فريون.",
      en: "Install, clean, and repair AC systems."
    },
    services: [
      {
        id: "ac-maintenance",
        slug: "ac-maintenance",
        name: { ar: "صيانة تكييفات", en: "AC Maintenance" },
        description: {
          ar: "تنظيف شامل وكشف أعطال وشحن فريون.",
          en: "Deep cleaning, diagnostics, and gas refill."
        }
      }
    ]
  },
  {
    id: "home-appliances",
    slug: "home-appliances",
    icon: "Wrench",
    workersAvailable: 430,
    name: { ar: "صيانة أجهزة منزلية", en: "Home Appliances Repair" },
    description: {
      ar: "إصلاح الثلاجات، الغسالات، البوتاجازات، والأجهزة الأساسية.",
      en: "Repairing fridges, washers, stoves, and essential appliances."
    },
    services: [
      {
        id: "appliances-repair",
        slug: "appliances-repair",
        name: { ar: "إصلاح أجهزة", en: "Appliance Repair" },
        description: {
          ar: "صيانة وتصليح جميع أنواع الأجهزة المنزلية.",
          en: "Maintenance and repair for all types of home appliances."
        }
      }
    ]
  },
  {
    id: "painting",
    slug: "painting",
    icon: "Paintbrush",
    workersAvailable: 480,
    name: { ar: "دهانات", en: "Painter" },
    description: {
      ar: "تشطيبات داخلية وخارجية مع دهانات عالية الجودة.",
      en: "Interior and exterior finishes with high quality paints."
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
    id: "aluminum",
    slug: "aluminum",
    icon: "Wrench",
    workersAvailable: 310,
    name: { ar: "ألوميتال", en: "Aluminum Worker" },
    description: {
      ar: "تفصيل وتركيب وصيانة شبابيك وأبواب ومطابخ ألوميتال.",
      en: "Fabrication and repair of aluminum windows, doors, and kitchens."
    },
    services: [
      {
        id: "aluminum-fabrication",
        slug: "aluminum-fabrication",
        name: { ar: "أعمال ألوميتال", en: "Aluminum Works" },
        description: {
          ar: "تفصيل شبابيك وأبواب ومطابخ.",
          en: "Custom windows, doors, and kitchens."
        }
      }
    ]
  },
  {
    id: "computer-networks",
    slug: "computer-networks",
    icon: "Zap",
    workersAvailable: 150,
    name: { ar: "شبكات كمبيوتر", en: "Computer Networks" },
    description: {
      ar: "تأسيس وصيانة شبكات الإنترنت والراوتر والسيرفرات.",
      en: "Setup and maintain internet networks, routers, and servers."
    },
    services: [
      {
        id: "network-setup",
        slug: "network-setup",
        name: { ar: "تأسيس شبكات", en: "Network Setup" },
        description: {
          ar: "تمديد كابلات وضبط الإعدادات.",
          en: "Cable routing and network configuration."
        }
      }
    ]
  },
  {
    id: "computer-repair",
    slug: "computer-repair",
    icon: "Wrench",
    workersAvailable: 290,
    name: { ar: "صيانات كمبيوتر", en: "Computer Repair" },
    description: {
      ar: "صيانة هاردوير وسوفتوير لأجهزة الكمبيوتر واللاب توب.",
      en: "Hardware and software maintenance for PCs and laptops."
    },
    services: [
      {
        id: "pc-maintenance",
        slug: "pc-maintenance",
        name: { ar: "صيانة حواسيب", en: "PC Maintenance" },
        description: {
          ar: "تنزيل ويندوز، حل مشاكل البطء، وإصلاح الأعطال.",
          en: "OS installation, fixing slowdowns, and repairing faults."
        }
      }
    ]
  },
  {
    id: "camera-installation",
    slug: "camera-installation",
    icon: "ShieldCheck",
    workersAvailable: 340,
    name: { ar: "تركيب كاميرات", en: "Camera Installation" },
    description: {
      ar: "توريد وتركيب وصيانة كاميرات المراقبة وأنظمة الأمان.",
      en: "Supply, install, and maintain security cameras and systems."
    },
    services: [
      {
        id: "cctv-setup",
        slug: "cctv-setup",
        name: { ar: "تركيب كاميرات مراقبة", en: "CCTV Setup" },
        description: {
          ar: "تمديد الكابلات وتركيب الكاميرات وضبط أجهزة التسجيل.",
          en: "Wiring, camera mounting, and DVR/NVR configuration."
        }
      }
    ]
  }
];

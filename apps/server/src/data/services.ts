export const serviceCategories = [
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
  }
] as const;

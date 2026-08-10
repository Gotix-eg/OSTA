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
        id: "electrical-maintenance",
        slug: "electrical-maintenance",
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
  },
  {
    id: "tiling",
    slug: "tiling",
    icon: "Grid",
    workersAvailable: 310,
    name: { ar: "مبلط سيراميك", en: "Ceramic Tiler" },
    description: {
      ar: "تركيب وتجديد أرضيات وحوائط السيراميك والبورسلين والرخام.",
      en: "Installation and repair of ceramic, porcelain, and marble tiles."
    },
    services: [
      {
        id: "tile-setup",
        slug: "tile-setup",
        name: { ar: "تركيب سيراميك وبورسلين", en: "Tile Installation" },
        description: {
          ar: "تركيب البلاط والسيراميك والبورسلين والرخام للأرضيات والحوائط.",
          en: "Laying tiles, porcelain, and marble on floors and walls."
        }
      },
      {
        id: "tile-repair",
        slug: "tile-repair",
        name: { ar: "ترميم وإصلاح سيراميك", en: "Tile Repair" },
        description: {
          ar: "إصلاح البلاط المكسور والترميمات البسيطة للأرضيات والحوائط.",
          en: "Repairing cracked or damaged tiles on floors and walls."
        }
      }
    ]
  },
  {
    id: "plastering",
    slug: "plastering",
    icon: "Layers",
    workersAvailable: 280,
    name: { ar: "محارة", en: "Plasterer" },
    description: {
      ar: "أعمال المحارة والتلييس وتجهيز الحوائط والأسقف للدهانات.",
      en: "Wall plastering, smoothing, and prep work for painting."
    },
    services: [
      {
        id: "plaster-setup",
        slug: "plaster-setup",
        name: { ar: "صنايعي محارة", en: "Wall Plastering" },
        description: {
          ar: "أعمال محارة وتنعيم وتخشين للأسطح وتجهيزها للدهان.",
          en: "Screeding, leveling, and smoothing plaster surfaces."
        }
      },
      {
        id: "plaster-repair",
        slug: "plaster-repair",
        name: { ar: "ترميم وإصلاح محارة", en: "Plaster Repair" },
        description: {
          ar: "معالجة الرطوبة والتشققات وترميم عيوب المحارة القديمة.",
          en: "Repairing damp, cracks, and old plaster issues."
        }
      }
    ]
  },
  {
    id: "ironwork",
    slug: "ironwork",
    icon: "Hammer",
    workersAvailable: 150,
    name: { ar: "حداد", en: "Ironworker" },
    description: {
      ar: "تصنيع وتركيب وصيانة البوابات الحديدية وحمايات النوافذ والشبابيك.",
      en: "Fabrication, installation, and repair of iron gates and window guards."
    },
    services: [
      {
        id: "iron-gates",
        slug: "iron-gates",
        name: { ar: "تركيب وصيانة بوابات حديد", en: "Iron Gates Installation" },
        description: {
          ar: "تصنيع وتركيب وصيانة البوابات الحديدية ومداخل العقارات.",
          en: "Fabricating, installing, and repairing iron gates and entryways."
        }
      },
      {
        id: "window-grills",
        slug: "window-grills",
        name: { ar: "حمايات وشبابيك حديد", en: "Window & Balcony Grills" },
        description: {
          ar: "تصنيع وتركيب حمايات حديدية للنوافذ والبلكونات لزيادة الأمان.",
          en: "Fabrication and installation of iron security grills for windows and balconies."
        }
      }
    ]
  },
  {
    id: "finishing",
    slug: "finishing",
    icon: "Layers",
    workersAvailable: 120,
    name: { ar: "تشطيبات شاملة", en: "Comprehensive Finishing" },
    description: {
      ar: "تشطيب متكامل للشقق والفيلات والمحلات من الطوب الأحمر للتسليم على المفتاح.",
      en: "Turnkey apartment and villa finishing from masonry to final handover."
    },
    services: [
      {
        id: "turnkey-finishing",
        slug: "turnkey-finishing",
        name: { ar: "تشطيب على المفتاح", en: "Turnkey Finishing" },
        description: {
          ar: "تشطيب شقق وفيلات بالكامل شامل الخامات والمصنعيات.",
          en: "Complete apartment and villa finishing including materials and labor."
        }
      },
      {
        id: "renovation-remodeling",
        slug: "renovation-remodeling",
        name: { ar: "تجديد وتطوير منازل", en: "Home Renovation & Remodeling" },
        description: {
          ar: "تجديد الحمامات والمطابخ وتعديل الديكورات والجدران.",
          en: "Renovating bathrooms, kitchens, and modifying layouts or decor."
        }
      }
    ]
  },
  {
    id: "gypsum",
    slug: "gypsum",
    icon: "Layout",
    workersAvailable: 195,
    name: { ar: "جبس بورد وديكور", en: "Gypsum Board" },
    description: {
      ar: "أعمال الجبس بورد والأسقف المعلقة والديكورات الجبسية الحديثة.",
      en: "Gypsum board installation, suspended ceilings, and drywall decoration."
    },
    services: [
      {
        id: "gyp-install",
        slug: "gyp-install",
        name: { ar: "تركيب جبس بورد", en: "Gypsum Installation" },
        description: { ar: "تركيب أسقف معلقة وحوائط جبسية.", en: "Suspended ceiling and drywall installation." }
      }
    ]
  },
  {
    id: "moving",
    slug: "moving",
    icon: "Truck",
    workersAvailable: 340,
    name: { ar: "نقل عفش وتغليف", en: "Furniture Moving" },
    description: {
      ar: "خدمات نقل الأثاث وتغليفه وفكه وتركيبه بأيدي فنيين محترفين.",
      en: "Furniture moving, packaging, disassembly, and assembly."
    },
    services: [
      {
        id: "move-furniture",
        slug: "move-furniture",
        name: { ar: "نقل وتغليف أثاث", en: "Furniture Transport" },
        description: { ar: "نقل عفش وتغليف لحمايته.", en: "Furniture transport and protective packaging." }
      }
    ]
  },
  {
    id: "cleaning",
    slug: "cleaning",
    icon: "Sparkles",
    workersAvailable: 610,
    name: { ar: "تنظيف وتعقيم منازل", en: "Home Cleaning" },
    description: {
      ar: "تنظيف شامل للمنازل والفلل والمكاتب والتعقيم ومكافحة الحشرات.",
      en: "Comprehensive cleaning, sanitization, and pest control."
    },
    services: [
      {
        id: "clean-home",
        slug: "clean-home",
        name: { ar: "تنظيف شقق ومكاتب", en: "Home & Office Cleaning" },
        description: { ar: "تنظيف وتطهير شامل.", en: "Deep home and office cleaning." }
      }
    ]
  },
  {
    id: "car-mechanic",
    slug: "car-mechanic",
    icon: "Settings",
    workersAvailable: 480,
    name: { ar: "ميكانيكي سيارات", en: "Car Mechanic" },
    description: {
      ar: "صيانة وإصلاح أعطال السيارات والكشف بالكمبيوتر.",
      en: "Car repairs, diagnostics, brake servicing, and engine maintenance."
    },
    services: [
      {
        id: "car-repair",
        slug: "car-repair",
        name: { ar: "صيانة وإصلاح سيارات", en: "Car Repair" },
        description: { ar: "كشف أعطال كمبيوتر وصيانة ميكانيكا.", en: "Diagnostics and mechanical repair." }
      }
    ]
  },
  {
    id: "bike-mechanic",
    slug: "bike-mechanic",
    icon: "Settings",
    workersAvailable: 290,
    name: { ar: "ميكانيكي موتوسيكلات", en: "Motorcycle Mechanic" },
    description: {
      ar: "صيانة وإصلاح كافة أنواع الموتوسيكلات والاسكوتر.",
      en: "Maintenance and repair of all motorcycles and scooters."
    },
    services: [
      {
        id: "bike-repair",
        slug: "bike-repair",
        name: { ar: "صيانة موتوسيكلات", en: "Motorcycle Repair" },
        description: { ar: "إصلاح أعطال الموتوسيكلات وتوفير قطع غيار.", en: "Motorcycle fault fixing and tuning." }
      }
    ]
  },
  {
    id: "engine-repair",
    slug: "engine-repair",
    icon: "Hammer",
    workersAvailable: 310,
    name: { ar: "صيانة مواتير", en: "Engine Repair" },
    description: {
      ar: "لف وصيانة مواتير المياه، مواتير المصاعد، والمولدات.",
      en: "Rewinding and repair of water pump motors and generators."
    },
    services: [
      {
        id: "motor-rewind",
        slug: "motor-rewind",
        name: { ar: "لف وصيانة مواتير", en: "Motor Maintenance" },
        description: { ar: "لف مواتير مياه ومضخات.", en: "Motor rewinding and pump repair." }
      }
    ]
  },
  {
    id: "elevators",
    slug: "elevators",
    icon: "Layers",
    workersAvailable: 140,
    name: { ar: "فني مصاعد", en: "Elevator Technician" },
    description: {
      ar: "تركيب وصيانة مصاعد المباني والعمارات.",
      en: "Elevator installation and emergency repair."
    },
    services: [
      {
        id: "elevator-maint",
        slug: "elevator-maint",
        name: { ar: "صيانة مصاعد", en: "Elevator Service" },
        description: { ar: "صيانة دورية وطوارئ للمصاعد.", en: "Periodic maintenance and emergency service." }
      }
    ]
  },
  {
    id: "glass",
    slug: "glass",
    icon: "Layout",
    workersAvailable: 210,
    name: { ar: "فني زجاج ومرايا", en: "Glass & Mirrors" },
    description: {
      ar: "تقطيع وتفصيل الزجاج والمرايا وكبائن الشاور.",
      en: "Custom glass cutting, mirror installation, and shower cabins."
    },
    services: [
      {
        id: "glass-cut",
        slug: "glass-cut",
        name: { ar: "تركيب زجاج ومرايا", en: "Glass Installation" },
        description: { ar: "تفصيل واجهات وكبائن شاور.", en: "Glass facades and shower cabins." }
      }
    ]
  },
  {
    id: "curtains",
    slug: "curtains",
    icon: "Layers",
    workersAvailable: 260,
    name: { ar: "تركيب ستائر وشيدز", en: "Curtains & Blinds" },
    description: {
      ar: "تركيب كافة أنواع الستائر المنزلية والمكتبية.",
      en: "Installation of home and office curtains and blinds."
    },
    services: [
      {
        id: "curtain-install",
        slug: "curtain-install",
        name: { ar: "تركيب ستائر", en: "Curtain Installation" },
        description: { ar: "تركيب ستائر وشيدز كهربائية.", en: "Installing curtains and motorized shades." }
      }
    ]
  },
  {
    id: "flooring",
    slug: "flooring",
    icon: "Grid",
    workersAvailable: 190,
    name: { ar: "تركيب باركيه وأرضيات", en: "Parquet & Flooring" },
    description: {
      ar: "تركيب وصيانة أرضيات الباركيه وHDF والخشب.",
      en: "Installation of parquet, HDF, and wooden flooring."
    },
    services: [
      {
        id: "parquet-install",
        slug: "parquet-install",
        name: { ar: "تركيب باركيه", en: "Parquet Installation" },
        description: { ar: "تركيب وقشط وتلميع الباركيه.", en: "Parquet installation and sanding." }
      }
    ]
  },
  {
    id: "satellite",
    slug: "satellite",
    icon: "Globe",
    workersAvailable: 380,
    name: { ar: "فني دش وستالايت", en: "Satellite & Dish" },
    description: {
      ar: "ضبط وبرمجة أطباق الدش والدش المركزي.",
      en: "Satellite dish alignment and central dish systems."
    },
    services: [
      {
        id: "dish-align",
        slug: "dish-align",
        name: { ar: "ضبط دش ورسيفر", en: "Dish Alignment" },
        description: { ar: "ضبط وتوصيل الدش والرسيفر.", en: "Dish and receiver configuration." }
      }
    ]
  },
  {
    id: "smart-home",
    slug: "smart-home",
    icon: "Zap",
    workersAvailable: 160,
    name: { ar: "انتركم وأنظمة ذكية", en: "Intercom & Smart Home" },
    description: {
      ar: "تركيب أنظمة الانتركم والأقفال الذكية.",
      en: "Audio/video intercom systems and smart home setup."
    },
    services: [
      {
        id: "intercom-install",
        slug: "intercom-install",
        name: { ar: "تركيب انتركم", en: "Intercom Setup" },
        description: { ar: "تركيب أنظمة انتركم وأقفال ذكية.", en: "Intercom and smart lock installation." }
      }
    ]
  },
  {
    id: "insulation",
    slug: "insulation",
    icon: "ShieldCheck",
    workersAvailable: 230,
    name: { ar: "عزل مائي وحراري", en: "Waterproofing & Insulation" },
    description: {
      ar: "عزل الأسطح والحمامات ضد التسريب والعزل الحراري.",
      en: "Roof waterproofing and thermal insulation."
    },
    services: [
      {
        id: "water-proof",
        slug: "water-proof",
        name: { ar: "عزل مائي", en: "Waterproofing" },
        description: { ar: "عزل الأسطح والمباني.", en: "Roof and floor waterproofing." }
      }
    ]
  },
  {
    id: "solar",
    slug: "solar",
    icon: "Zap",
    workersAvailable: 110,
    name: { ar: "طاقة شمسية", en: "Solar Energy" },
    description: {
      ar: "تركيب وصيانة ألواح الطاقة الشمسية والسخانات.",
      en: "Solar panels and solar water heater installation."
    },
    services: [
      {
        id: "solar-panels",
        slug: "solar-panels",
        name: { ar: "تركيب طاقة شمسية", en: "Solar Installation" },
        description: { ar: "تركيب ألواح ومحولات الطاقة الشمسية.", en: "Solar panel and inverter setup." }
      }
    ]
  },
  {
    id: "gardening",
    slug: "gardening",
    icon: "Sparkles",
    workersAvailable: 270,
    name: { ar: "تنسيق حدائق وزراعة", en: "Gardening & Landscape" },
    description: {
      ar: "تنسيق الحدائق وزراعة وتقليم الأشجار وشبكات الري.",
      en: "Garden design, lawn maintenance, and irrigation systems."
    },
    services: [
      {
        id: "landscape-design",
        slug: "landscape-design",
        name: { ar: "تنسيق حدائق", en: "Landscape Design" },
        description: { ar: "زراعة وتنسيق حدائق وشبكات ري.", en: "Garden design and irrigation installation." }
      }
    ]
  },
  {
    id: "upholstery",
    slug: "upholstery",
    icon: "Wrench",
    workersAvailable: 310,
    name: { ar: "تنجيد وتجديد أثاث", en: "Furniture Upholstery" },
    description: {
      ar: "تنجيد وتجديد الأنتريهات والصالونات والكنب.",
      en: "Upholstery renewal, sofa, and salon repairs."
    },
    services: [
      {
        id: "sofa-upholstery",
        slug: "sofa-upholstery",
        name: { ar: "تنجيد أنتريهات وكنب", en: "Sofa Upholstery" },
        description: { ar: "تغيير إسفنج وأقمشة الكنب.", en: "Replacing sofa foam and fabric." }
      }
    ]
  },
  {
    id: "gas",
    slug: "gas",
    icon: "Wrench",
    workersAvailable: 340,
    name: { ar: "غاز طبيعي وسخانات", en: "Gas Piping & Heaters" },
    description: {
      ar: "وصولات الغاز وصيانة سخانات الغاز والبوتاجازات.",
      en: "Gas line extensions, heater repair, and stove connections."
    },
    services: [
      {
        id: "gas-heater",
        slug: "gas-heater",
        name: { ar: "صيانة سخانات غاز", en: "Gas Heater Repair" },
        description: { ar: "إصلاح وتوصيل سخانات الغاز.", en: "Gas heater setup and maintenance." }
      }
    ]
  },
  {
    id: "pools",
    slug: "pools",
    icon: "Waves",
    workersAvailable: 120,
    name: { ar: "صيانة حمامات سباحة", en: "Swimming Pool Care" },
    description: {
      ar: "تنظيف وتعقيم حمامات السباحة وصيانة الفلاتر والمضخات.",
      en: "Pool cleaning, chemical treatment, and pump filter maintenance."
    },
    services: [
      {
        id: "pool-cleaning",
        slug: "pool-cleaning",
        name: { ar: "صيانة مسبح", en: "Pool Cleaning" },
        description: { ar: "تنظيف وتعقيم مسبح وصيانة مضخات.", en: "Pool cleaning and filter service." }
      }
    ]
  },
  {
    id: "car-body",
    slug: "car-body",
    icon: "Settings",
    workersAvailable: 290,
    name: { ar: "سمكري ودوكو سيارات", en: "Auto Body & Painting" },
    description: {
      ar: "سمكرة وتعديل صدمات السيارات ودهان دوكو وتلميع.",
      en: "Car body dent repair, spray painting, and polishing."
    },
    services: [
      {
        id: "dent-repair",
        slug: "dent-repair",
        name: { ar: "سمكرة ودلك سيارات", en: "Dent Repair" },
        description: { ar: "إصلاح صدمات ودهان دوكو.", en: "Auto body repair and spray paint." }
      }
    ]
  },
  {
    id: "car-keys",
    slug: "car-keys",
    icon: "Wrench",
    workersAvailable: 210,
    name: { ar: "مفاتيح وتشفير سيارات", en: "Car Keys & Locksmith" },
    description: {
      ar: "نسخ وتشفير مفاتيح السيارات وفتح المغلقة.",
      en: "Car key duplication, programming, and emergency lockouts."
    },
    services: [
      {
        id: "key-program",
        slug: "key-program",
        name: { ar: "تشفير مفاتيح سيارات", en: "Key Programming" },
        description: { ar: "نسخ مفاتيح وفتح سيارات.", en: "Key duplication and lockout help." }
      }
    ]
  },
  {
    id: "handyman",
    slug: "handyman",
    icon: "Hammer",
    workersAvailable: 530,
    name: { ar: "عامل صيانة عامة", en: "General Handyman" },
    description: {
      ar: "تركيب رفوف وشاشات معالجة الأعطال البسيطة.",
      en: "TV and shelf mounting, drill work, and minor repairs."
    },
    services: [
      {
        id: "mount-tv",
        slug: "mount-tv",
        name: { ar: "صيانة منزلية عامة", en: "Minor Handyman Fixes" },
        description: { ar: "تركيب شاشات وأرفف وإصلاحات خفيفة.", en: "TV mounting and minor fixes." }
      }
    ]
  }
];

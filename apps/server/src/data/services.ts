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
      { id: "elec-fix", slug: "elec-fix", name: { ar: "إصلاح أعطال", en: "Electrical Repair" } },
      { id: "elec-install", slug: "elec-install", name: { ar: "تركيبات جديدة", en: "New Installation" } }
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
      { id: "plumb-leak", slug: "plumb-leak", name: { ar: "إصلاح تسريب", en: "Leak Repair" } },
      { id: "plumb-install", slug: "plumb-install", name: { ar: "تركيب أدوات صحية", en: "Sanitary Installation" } }
    ]
  },
  {
    id: "carpentry",
    slug: "carpentry",
    icon: "Hammer",
    workersAvailable: 450,
    name: { ar: "النجارة", en: "Carpentry" },
    description: {
      ar: "إصلاح أثاث، تركيب أبواب، أو تفصيل غرف جديدة.",
      en: "Furniture repair, door installation, or custom woodworks."
    },
    services: [
      { id: "carp-fix", slug: "carp-fix", name: { ar: "تصليح أثاث", en: "Furniture Repair" } },
      { id: "carp-door", slug: "carp-door", name: { ar: "تركيب أبواب ونوافذ", en: "Doors & Windows" } }
    ]
  },
  {
    id: "ac",
    slug: "ac",
    icon: "Wind",
    workersAvailable: 680,
    name: { ar: "التكييفات", en: "AC Maintenance" },
    description: {
      ar: "شحن فريون، تنظيف فلاتر، وصيانة تكييفات لجميع الأنواع.",
      en: "Freon charging, filter cleaning, and full AC maintenance."
    },
    services: [
      { id: "ac-clean", slug: "ac-clean", name: { ar: "تنظيف وصيانة", en: "Cleaning & Maintenance" } },
      { id: "ac-install", slug: "ac-install", name: { ar: "فك وتركيب تكييف", en: "De-installation & Installation" } }
    ]
  },
  {
    id: "appliances",
    slug: "appliances",
    icon: "Smartphone",
    workersAvailable: 520,
    name: { ar: "صيانة أجهزة", en: "Home Appliances" },
    description: {
      ar: "تصليح غسالات، ثلاجات، بوتاجازات وميكروويف.",
      en: "Repairing washers, fridges, stoves, and microwaves."
    },
    services: [
      { id: "app-washer", slug: "app-washer", name: { ar: "صيانة غسالات", en: "Washer Repair" } },
      { id: "app-fridge", slug: "app-fridge", name: { ar: "صيانة ثلاجات", en: "Fridge Repair" } }
    ]
  },
  {
    id: "painting",
    slug: "painting",
    icon: "Palette",
    workersAvailable: 340,
    name: { ar: "الدهانات", en: "Painting" },
    description: {
      ar: "تجديد دهانات الحوائط، ديكورات حديثة، وورق حائط.",
      en: "Wall repainting, modern decorations, and wallpaper."
    },
    services: [
      { id: "paint-wall", slug: "paint-wall", name: { ar: "دهان حوائط", en: "Wall Painting" } },
      { id: "paint-decor", slug: "paint-decor", name: { ar: "ديكورات جبس", en: "Gypsum Decor" } }
    ]
  },
  {
    id: "aluminum",
    slug: "aluminum",
    icon: "Layout",
    workersAvailable: 210,
    name: { ar: "الوميتال", en: "Aluminum" },
    description: {
      ar: "تصنيع وإصلاح مطابخ ونوافذ الألوميتال.",
      en: "Fabricating and repairing aluminum kitchens and windows."
    },
    services: [
      { id: "alum-window", slug: "alum-window", name: { ar: "نوافذ وشبابيك", en: "Windows & Shutters" } },
      { id: "alum-kitchen", slug: "alum-kitchen", name: { ar: "مطابخ الوميتال", en: "Aluminum Kitchens" } }
    ]
  },
  {
    id: "networks",
    slug: "networks",
    icon: "Globe",
    workersAvailable: 150,
    name: { ar: "الشبكات", en: "Networks" },
    description: {
      ar: "تمديد كابلات إنترنت، تركيب راوتر، وتقوية الإشارة.",
      en: "Ethernet cabling, router setup, and signal boosting."
    },
    services: [
      { id: "net-setup", slug: "net-setup", name: { ar: "تركيب شبكات", en: "Network Setup" } },
      { id: "net-wifi", slug: "net-wifi", name: { ar: "تقوية واي فاي", en: "WiFi Boosting" } }
    ]
  },
  {
    id: "computer",
    slug: "computer",
    icon: "Monitor",
    workersAvailable: 190,
    name: { ar: "صيانة كمبيوتر", en: "Computer Repair" },
    description: {
      ar: "صيانة لابتوب وكمبيوتر، سوفت وير وهاردوير.",
      en: "Laptop and PC repair, software and hardware."
    },
    services: [
      { id: "pc-soft", slug: "pc-soft", name: { ar: "سوفت وير وويندوز", en: "Software & Windows" } },
      { id: "pc-hard", slug: "pc-hard", name: { ar: "صيانة هاردوير", en: "Hardware Repair" } }
    ]
  },
  {
    id: "cameras",
    slug: "cameras",
    icon: "Camera",
    workersAvailable: 130,
    name: { ar: "تركيب كاميرات", en: "Cameras" },
    description: {
      ar: "تركيب أنظمة مراقبة كاميرات حديثة وبرمجتها.",
      en: "Installing and programming modern CCTV systems."
    },
    services: [
      { id: "cam-install", slug: "cam-install", name: { ar: "تركيب جديد", en: "Camera Installation" } },
      { id: "cam-maint", slug: "cam-maint", name: { ar: "صيانة وبرمجة", en: "Maintenance & Config" } }
    ]
  },
  {
    id: "tiling",
    slug: "tiling",
    icon: "Grid",
    workersAvailable: 310,
    name: { ar: "مبلط سيراميك", en: "Ceramic Tiling" },
    description: {
      ar: "تركيب وتجديد أرضيات وحوائط السيراميك والبورسلين والرخام.",
      en: "Installation and repair of ceramic, porcelain, and marble tiles."
    },
    services: [
      { id: "tile-install", slug: "tile-install", name: { ar: "تركيب سيراميك", en: "Tile Installation" } },
      { id: "tile-repair", slug: "tile-repair", name: { ar: "ترميم وإصلاح سيراميك", en: "Tile Repair" } }
    ]
  },
  {
    id: "plastering",
    slug: "plastering",
    icon: "Layers",
    workersAvailable: 280,
    name: { ar: "محارة", en: "Plastering" },
    description: {
      ar: "أعمال المحارة والتلييس وتجهيز الحوائط للدهانات.",
      en: "Wall plastering, smoothing, and prep work for painting."
    },
    services: [
      { id: "plaster-wall", slug: "plaster-wall", name: { ar: "أعمال محارة", en: "Wall Plastering" } },
      { id: "plaster-repair", slug: "plaster-repair", name: { ar: "ترميم محارة حوائط", en: "Plaster Repair" } }
    ]
  },
  {
    id: "ironwork",
    slug: "ironwork",
    icon: "Hammer",
    workersAvailable: 150,
    name: { ar: "حدادة", en: "Ironwork" },
    description: {
      ar: "تصنيع وتركيب وصيانة البوابات الحديدية وحمايات النوافذ والشبابيك.",
      en: "Fabrication, installation, and repair of iron gates and window guards."
    },
    services: [
      { id: "iron-gates", slug: "iron-gates", name: { ar: "تركيب وصيانة بوابات حديد", en: "Iron Gates Installation" } },
      { id: "window-grills", slug: "window-grills", name: { ar: "حمايات وشبابيك حديد", en: "Window & Balcony Grills" } }
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
      { id: "turnkey-finishing", slug: "turnkey-finishing", name: { ar: "تشطيب على المفتاح", en: "Turnkey Finishing" } },
      { id: "renovation-remodeling", slug: "renovation-remodeling", name: { ar: "تجديد وتطوير منازل", en: "Home Renovation & Remodeling" } }
    ]
  },
  {
    id: "gypsum",
    slug: "gypsum",
    icon: "Layout",
    workersAvailable: 195,
    name: { ar: "جبس بورد وديكور", en: "Gypsum Board" },
    description: {
      ar: "أعمال الجبس بورد والأسقف المعلقة والديكورات الجبسية الحديثة بكفاءة عالية.",
      en: "Gypsum board installation, suspended ceilings, and modern drywall decoration."
    },
    services: [
      { id: "gyp-install", slug: "gyp-install", name: { ar: "تركيب جبس بورد", en: "Gypsum Board Installation" } },
      { id: "gyp-decor", slug: "gyp-decor", name: { ar: "ديكورات جبسية أسقف", en: "Gypsum Ceiling Decoration" } }
    ]
  },
  {
    id: "moving",
    slug: "moving",
    icon: "Truck",
    workersAvailable: 340,
    name: { ar: "نقل عفش وتغليف", en: "Furniture Moving" },
    description: {
      ar: "خدمات نقل الأثاث وتغليفه وفكه وتركيبه بأيدي فنيين محترفين وسيارات مجهزة.",
      en: "Furniture moving, packaging, disassembly, and assembly by specialists."
    },
    services: [
      { id: "move-furniture", slug: "move-furniture", name: { ar: "نقل أثاث", en: "Furniture Moving" } },
      { id: "pack-furniture", slug: "pack-furniture", name: { ar: "تغليف عفش", en: "Furniture Packaging" } }
    ]
  },
  {
    id: "cleaning",
    slug: "cleaning",
    icon: "Sparkles",
    workersAvailable: 610,
    name: { ar: "تنظيف وتعقيم منازل", en: "Home Cleaning" },
    description: {
      ar: "تنظيف شامل للمنازل والفلل والمكاتب والتعقيم ومكافحة الحشرات بأفضل المواد.",
      en: "Comprehensive cleaning, sanitization, and pest control for homes and offices."
    },
    services: [
      { id: "clean-home", slug: "clean-home", name: { ar: "تنظيف شقق وفلل", en: "Home & Villa Cleaning" } },
      { id: "pest-control", slug: "pest-control", name: { ar: "رش مبيدات ومكافحة حشرات", en: "Pest Control Services" } }
    ]
  }
] as const;


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
  },
  {
    id: "car-mechanic",
    slug: "car-mechanic",
    icon: "Settings",
    workersAvailable: 480,
    name: { ar: "ميكانيكي سيارات", en: "Car Mechanic" },
    description: {
      ar: "صيانة وإصلاح أعطال السيارات، الكشف بالكمبيوتر، صيانة الفرامل والمحركات.",
      en: "Car repairs, computer diagnostics, brake servicing, and engine maintenance."
    },
    services: [
      { id: "car-repair", slug: "car-repair", name: { ar: "صيانة وإصلاح سيارات", en: "Car Repair" } },
      { id: "car-diagnostics", slug: "car-diagnostics", name: { ar: "كشف كمبيوتر وأعطال", en: "Car Diagnostics" } }
    ]
  },
  {
    id: "bike-mechanic",
    slug: "bike-mechanic",
    icon: "Settings",
    workersAvailable: 290,
    name: { ar: "ميكانيكي موتوسيكلات", en: "Motorcycle Mechanic" },
    description: {
      ar: "صيانة وإصلاح كافة أنواع الموتوسيكلات والاسكوتر وتوفير قطع الغيار.",
      en: "Maintenance and repair of all motorcycles, scooters, and spare parts."
    },
    services: [
      { id: "bike-repair", slug: "bike-repair", name: { ar: "صيانة موتوسيكلات", en: "Motorcycle Repair" } },
      { id: "bike-tuning", slug: "bike-tuning", name: { ar: "ضبط وتعديل موتوسيكلات", en: "Motorcycle Tuning" } }
    ]
  },
  {
    id: "engine-repair",
    slug: "engine-repair",
    icon: "Hammer",
    workersAvailable: 310,
    name: { ar: "صيانة مواتير", en: "Engine Repair" },
    description: {
      ar: "لف وصيانة مواتير المياه، مواتير المصاعد، والمولدات الكهربائية بمختلف القدرات.",
      en: "Rewinding and repair of water pump motors, elevator motors, and generators."
    },
    services: [
      { id: "motor-rewind", slug: "motor-rewind", name: { ar: "لف مواتير مياه وكهرباء", en: "Motor Rewinding" } },
      { id: "pump-repair", slug: "pump-repair", name: { ar: "صيانة مضخات ومواتير", en: "Pump & Motor Maintenance" } }
    ]
  },
  {
    id: "elevators",
    slug: "elevators",
    icon: "Layers",
    workersAvailable: 140,
    name: { ar: "فني مصاعد", en: "Elevator Technician" },
    description: {
      ar: "تركيب وصيانة مصاعد المباني والعمارات، معالجة الأعطال وطوارئ المصاعد.",
      en: "Elevator installation, periodic maintenance, and emergency repair."
    },
    services: [
      { id: "elevator-maint", slug: "elevator-maint", name: { ar: "صيانة وطوارئ مصاعد", en: "Elevator Maintenance & Emergency" } },
      { id: "elevator-install", slug: "elevator-install", name: { ar: "تركيب وتجديد مصاعد", en: "Elevator Installation & Renewal" } }
    ]
  },
  {
    id: "glass",
    slug: "glass",
    icon: "Layout",
    workersAvailable: 210,
    name: { ar: "فني زجاج ومرايا", en: "Glass & Mirrors" },
    description: {
      ar: "تقطيع وتفصيل الزجاج والمرايا، كبائن الشاور، والواجهات الزجاجية.",
      en: "Custom glass cutting, mirror installation, shower cabins, and glass facades."
    },
    services: [
      { id: "glass-cut", slug: "glass-cut", name: { ar: "تركيب زجاج ومرايا", en: "Glass & Mirror Installation" } },
      { id: "shower-cabin", slug: "shower-cabin", name: { ar: "كبائن شاور سيكوريت", en: "Securit Shower Cabins" } }
    ]
  },
  {
    id: "curtains",
    slug: "curtains",
    icon: "Layers",
    workersAvailable: 260,
    name: { ar: "تركيب ستائر وشيدز", en: "Curtains & Blinds" },
    description: {
      ar: "تركيب وتفصيل كافة انواع الستائر، الستائر الكهربائية وشيدز المكاتب.",
      en: "Installation and custom fitting of curtains, blinds, and motorized shades."
    },
    services: [
      { id: "curtain-install", slug: "curtain-install", name: { ar: "تركيب ستائر منزلية", en: "Home Curtain Installation" } },
      { id: "office-blinds", slug: "office-blinds", name: { ar: "ستائر مكاتب وشيدز", en: "Office Blinds & Shades" } }
    ]
  },
  {
    id: "flooring",
    slug: "flooring",
    icon: "Grid",
    workersAvailable: 190,
    name: { ar: "تركيب باركيه وأرضيات", en: "Parquet & Flooring" },
    description: {
      ar: "تركيب وصيانة أرضيات الباركيه، HDF، والأرضيات الخشبية والفينيل.",
      en: "Installation and repair of parquet, HDF, laminate, and vinyl flooring."
    },
    services: [
      { id: "parquet-install", slug: "parquet-install", name: { ar: "تركيب باركيه وHDF", en: "Parquet & HDF Installation" } },
      { id: "parquet-polish", slug: "parquet-polish", name: { ar: "قشط وتلميع خشب", en: "Wood Sanding & Polishing" } }
    ]
  },
  {
    id: "satellite",
    slug: "satellite",
    icon: "Globe",
    workersAvailable: 380,
    name: { ar: "فني دش وستالايت", en: "Satellite & Dish" },
    description: {
      ar: "ضبط وبرمجة أطباق الدش، الدش المركزي، والرسيفر وتمديد الكابلات.",
      en: "Satellite dish alignment, central dish setup, and receiver programming."
    },
    services: [
      { id: "dish-align", slug: "dish-align", name: { ar: "ضبط دش ورسيفر", en: "Dish Alignment & Setup" } },
      { id: "central-dish", slug: "central-dish", name: { ar: "تركيب دش مركزي", en: "Central Satellite System" } }
    ]
  },
  {
    id: "smart-home",
    slug: "smart-home",
    icon: "Zap",
    workersAvailable: 160,
    name: { ar: "انتركم وأنظمة ذكية", en: "Intercom & Smart Home" },
    description: {
      ar: "تركيب أجهزة الانتركم الصوتي والمرئي، الأقفال الذكية، وأنظمة أوتوميشن المنزل.",
      en: "Audio/video intercom systems, smart locks, and home automation."
    },
    services: [
      { id: "intercom-install", slug: "intercom-install", name: { ar: "تركيب صيانة انتركم", en: "Intercom Installation & Repair" } },
      { id: "smart-locks", slug: "smart-locks", name: { ar: "أقفال منزلية ذكية", en: "Smart Lock Installation" } }
    ]
  },
  {
    id: "insulation",
    slug: "insulation",
    icon: "Shield",
    workersAvailable: 230,
    name: { ar: "عزل مائي وحراري", en: "Waterproofing & Insulation" },
    description: {
      ar: "عزل الأسطح والحمامات وحمامات السباحة ضد التسريب والعزل الحراري.",
      en: "Roof, bathroom, and pool waterproofing and thermal insulation."
    },
    services: [
      { id: "water-proof", slug: "water-proof", name: { ar: "عزل مائي للأسطح", en: "Roof Waterproofing" } },
      { id: "heat-proof", slug: "heat-proof", name: { ar: "عزل حراري ورطوبة", en: "Thermal & Damp Proofing" } }
    ]
  },
  {
    id: "solar",
    slug: "solar",
    icon: "Sun",
    workersAvailable: 110,
    name: { ar: "طاقة شمسية", en: "Solar Energy" },
    description: {
      ar: "تركيب وصيانة ألواح الطاقة الشمسية، السخانات الشمسية والمحولات.",
      en: "Installation and maintenance of solar panels, solar heaters, and inverters."
    },
    services: [
      { id: "solar-panels", slug: "solar-panels", name: { ar: "محطات طاقة شمسية", en: "Solar Power Systems" } },
      { id: "solar-heaters", slug: "solar-heaters", name: { ar: "سخانات شمسية", en: "Solar Water Heaters" } }
    ]
  },
  {
    id: "gardening",
    slug: "gardening",
    icon: "Sparkles",
    workersAvailable: 270,
    name: { ar: "تنسيق حدائق وزراعة", en: "Gardening & Landscape" },
    description: {
      ar: "تنسيق وتصميم الحدائق، قص وتقليم الأشجار، شبكات الري والنخيل.",
      en: "Garden design, lawn care, tree trimming, and automated irrigation."
    },
    services: [
      { id: "landscape-design", slug: "landscape-design", name: { ar: "تنسيق وزراعة حدائق", en: "Garden & Landscape Design" } },
      { id: "irrigation-system", slug: "irrigation-system", name: { ar: "شبكات ري وحدائق", en: "Irrigation Systems" } }
    ]
  },
  {
    id: "upholstery",
    slug: "upholstery",
    icon: "Scissors",
    workersAvailable: 310,
    name: { ar: "تنجيد وتجديد أثاث", en: "Furniture Upholstery" },
    description: {
      ar: "تنجيد وتجديد الأنتريهات، الصالونات، الكنب وتغيير الإسفنج والأقمشة.",
      en: "Upholstery renewal, sofa and salon repairs, sponge & fabric replacement."
    },
    services: [
      { id: "sofa-upholstery", slug: "sofa-upholstery", name: { ar: "تنجيد كنب وصالونات", en: "Sofa & Salon Upholstery" } },
      { id: "foam-replace", slug: "foam-replace", name: { ar: "تغيير إسفنج وأقمشة", en: "Foam & Fabric Replacement" } }
    ]
  },
  {
    id: "gas",
    slug: "gas",
    icon: "Flame",
    workersAvailable: 340,
    name: { ar: "غاز طبيعي وسخانات", en: "Gas Piping & Heaters" },
    description: {
      ar: "وصولات الغاز الطبيعي، صيانات سخانات الغاز والبوتاجازات وتعديل المسارات.",
      en: "Natural gas line extensions, gas heater repair, and stove gas connections."
    },
    services: [
      { id: "gas-heater", slug: "gas-heater", name: { ar: "صيانة سخانات غاز", en: "Gas Heater Maintenance" } },
      { id: "gas-piping", slug: "gas-piping", name: { ar: "تعديل وصلات غاز", en: "Gas Line Modification" } }
    ]
  },
  {
    id: "pools",
    slug: "pools",
    icon: "Waves",
    workersAvailable: 120,
    name: { ar: "صيانة حمامات سباحة", en: "Swimming Pool Care" },
    description: {
      ar: "تنظيف وتعقيم حمامات السباحة، صيانة الفلاتر والمضخات والإضاءة.",
      en: "Pool cleaning, chemical treatment, pump filter maintenance, and underwater lighting."
    },
    services: [
      { id: "pool-cleaning", slug: "pool-cleaning", name: { ar: "تنظيف وتعقيم مسبح", en: "Pool Cleaning & Treatment" } },
      { id: "pool-pumps", slug: "pool-pumps", name: { ar: "صيانة فلاتر ومضخات", en: "Pool Pump & Filter Maintenance" } }
    ]
  },
  {
    id: "car-body",
    slug: "car-body",
    icon: "Settings",
    workersAvailable: 290,
    name: { ar: "سمكري ودوكو سيارات", en: "Auto Body & Painting" },
    description: {
      ar: "سمكرة وتعديل صدمات السيارات، دهان دوكو، تلميع وبولش وتصليح المصدات.",
      en: "Car body dent repair, spray painting, detailing, and bumper repair."
    },
    services: [
      { id: "dent-repair", slug: "dent-repair", name: { ar: "سمكرة وتعديل صدمات", en: "Auto Body Dent Repair" } },
      { id: "paint-car", slug: "paint-car", name: { ar: "دهان دوكو وتلميع", en: "Car Spray Painting & Polishing" } }
    ]
  },
  {
    id: "car-keys",
    slug: "car-keys",
    icon: "Key",
    workersAvailable: 210,
    name: { ar: "مفاتيح وتشفير سيارات", en: "Car Keys & Locksmith" },
    description: {
      ar: "نسخ وتشفير مفاتيح السيارات الحديثة، فتح أبواب المغلقة وتغيير الشفرات.",
      en: "Car key duplication, transponder key programming, emergency lockouts."
    },
    services: [
      { id: "key-program", slug: "key-program", name: { ar: "نسخ وتشفير مفاتيح", en: "Key Programming & Duplication" } },
      { id: "car-unlock", slug: "car-unlock", name: { ar: "فتح سيارات مغلقة", en: "Emergency Car Lockout" } }
    ]
  },
  {
    id: "handyman",
    slug: "handyman",
    icon: "Hammer",
    workersAvailable: 530,
    name: { ar: "عامل صيانة عامة", en: "General Handyman" },
    description: {
      ar: "تركيب رفوف، شاشات، لوحات، معالجة الأعطال البسيطة والتثقيب بالمثقاب.",
      en: "Mounting TVs, shelves, artwork, drill work, and minor home maintenance fixes."
    },
    services: [
      { id: "mount-tv", slug: "mount-tv", name: { ar: "تركيب شاشات وأرفف", en: "TV & Shelf Mounting" } },
      { id: "minor-repairs", slug: "minor-repairs", name: { ar: "إصلاحات منزلية خفيفة", en: "Minor Household Repairs" } }
    ]
  }
] as const;


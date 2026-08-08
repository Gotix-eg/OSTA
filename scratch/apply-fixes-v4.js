const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'apps', 'web', 'components', 'landing', 'landing-page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings to \n
content = content.replace(/\r\n/g, '\n');

// 1. Add DEFAULT_CAMPAIGNS below DEFAULT_SLIDES
const slidesEnd = `    isActive: true
  }
];`;

const slidesEndReplacement = `    isActive: true
  }
];

const DEFAULT_CAMPAIGNS = [
  {
    id: "camp-1",
    titleAr: "خصم ٢٠٪ على السباكة",
    titleEn: "20% OFF Plumbing",
    descAr: "احصل على خصم ٢٠٪ لأول طلب خدمة سباكة. كود العرض: OSTA20",
    descEn: "Get 20% off your first plumbing request. Promo: OSTA20",
    link: "/register/client",
    isActive: true
  },
  {
    id: "camp-2",
    titleAr: "معاينة مجانية للمشاريع",
    titleEn: "FREE PROJECT QUOTE",
    descAr: "معاينة مجانية بالكامل للمشاريع والتركيبات الصناعية الكبرى.",
    descEn: "Get a free quote for major industrial installations.",
    link: "/register/client",
    isActive: true
  },
  {
    id: "camp-3",
    titleAr: "فحص أمان الكهرباء",
    titleEn: "Electrical Safety Audit",
    descAr: "احجز فحصاً شاملاً لأمان لوحات ووصلات الكهرباء مجاناً هذا الأسبوع.",
    descEn: "Book a comprehensive electrical safety checkup for free this week.",
    link: "/register/client",
    isActive: true
  }
];`;

if (content.includes(slidesEnd)) {
  content = content.replace(slidesEnd, slidesEndReplacement);
  console.log("DEFAULT_CAMPAIGNS added successfully!");
} else {
  console.error("Could not find slides end target!");
}

// 2. Fallback to DEFAULT_CAMPAIGNS in fetch
const fetchTarget = `    fetch(\`\${baseUrl}/public/campaigns\`)
      .then(r => r.json())
      .then(payload => {
        if (payload.success && Array.isArray(payload.data)) {
          setCampaigns(payload.data);
        }
      })
      .catch(() => {});`;

const fetchReplacement = `    fetch(\`\${baseUrl}/public/campaigns\`)
      .then(r => r.json())
      .then(payload => {
        if (payload.success && Array.isArray(payload.data) && payload.data.length > 0) {
          setCampaigns(payload.data);
        } else {
          setCampaigns(DEFAULT_CAMPAIGNS);
        }
      })
      .catch(() => setCampaigns(DEFAULT_CAMPAIGNS));`;

if (content.includes(fetchTarget)) {
  content = content.replace(fetchTarget, fetchReplacement);
  console.log("Fetch campaigns fallback added successfully!");
} else {
  console.error("Could not find campaigns fetch target!");
}

// 3. Bento Grid Campaign styling
content = content.replace(
  'h3 className="text-white font-black text-3xl md:text-5xl leading-tight max-w-md uppercase"',
  'h3 className="text-white-force font-black text-3xl md:text-5xl leading-tight max-w-md uppercase"'
);
content = content.replace(
  'p className="text-white/70 mt-4 max-w-sm"',
  'p className="text-white-muted-force mt-4 max-w-sm"'
);
content = content.replace(
  'h3 className="text-white font-black text-2xl md:text-3xl"',
  'h3 className="text-white-force font-black text-2xl md:text-3xl"'
);
content = content.replace(
  'p className="text-white/70 mt-2"',
  'p className="text-white-muted-force mt-2"'
);
content = content.replace(
  /li className="flex items-center gap-3 text-white text-sm"/g,
  'li className="flex items-center gap-3 text-white-force text-sm"'
);

// 4. How OSTA Works styling
content = content.replace(
  'h3 className="text-white font-bold text-xl mb-4"',
  'h3 className="text-white-force font-bold text-xl mb-4"'
);
content = content.replace(
  'p className="text-white/60 max-w-xs text-sm leading-relaxed"',
  'p className="text-white-muted-force max-w-xs text-sm leading-relaxed"'
);

// 5. Final CTA styling
content = content.replace(
  'h2 className="text-white font-black text-3xl md:text-5xl mb-6 leading-tight"',
  'h2 className="text-white-force font-black text-3xl md:text-5xl mb-6 leading-tight"'
);
content = content.replace(
  'p className="text-white/60 text-lg leading-relaxed"',
  'p className="text-white-muted-force text-lg leading-relaxed"'
);

// Restore line endings
content = content.replace(/\n/g, '\r\n');

fs.writeFileSync(filePath, content, 'utf8');
console.log("Done applying fixes v4!");

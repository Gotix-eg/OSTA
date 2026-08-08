const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'apps', 'web', 'components', 'landing', 'landing-page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n');

// Update Slide 1 and Slide 2 Image URLs with Stitch assets
const slide1Old = `    id: "slide-1",
    eyebrowAr: "منصة الحرفيين رقم 1 في مصر",
    eyebrowEn: "Egypt's #1 Craftsman Platform",
    titleAr: "اطلب أُسطفاي محترف بنقرة واحدة",
    titleEn: "Hire a Professional Ostafy in Seconds",
    descAr: "أول منصة تجمع أمهر الفنيين والمتاجر الموثقة في مصر. جودة مضمونة، أسعار عادلة، وتجربة مستخدم فاخرة.",
    descEn: "The first platform connecting skilled pros and verified stores in Egypt. Guaranteed quality, fair prices, and a premium experience.",
    imageUrl: "",`;

const slide1New = `    id: "slide-1",
    eyebrowAr: "منصة الحرفيين رقم 1 في مصر",
    eyebrowEn: "Egypt's #1 Craftsman Platform",
    titleAr: "اطلب أُسطفاي محترف بنقرة واحدة",
    titleEn: "Hire a Professional Ostafy in Seconds",
    descAr: "أول منصة تجمع أمهر الفنيين والمتاجر الموثقة في مصر. جودة مضمونة، أسعار عادلة، وتجربة مستخدم فاخرة.",
    descEn: "The first platform connecting skilled pros and verified stores in Egypt. Guaranteed quality, fair prices, and a premium experience.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCIrUayBLXqPcRauhchLQODs6p6MEp_iwn5YyCiLBnlMyY9gJaRuCt5MBn2umVWi2Y7bId9eAYH3IVypdZTY7DzRPgpjiGQBMiaFh4fRAnAButnT-Gi5cKBW7Q4etpfeSpWPCffZ68ttLZbLL4UZF5M24DjuqnMOwBdfnb0-mWVBaDHNdA8P1U-PvGrqLT_CcWpwB0vbzihcY_2Av7-JseigQVNW3nJLM6dAxLc-pCNoDv4eOT-nIMPgSxkSjVWgxh07ot89_ui4E",`;

const slide2Old = `    id: "slide-2",
    eyebrowAr: "ضمان حقيقي ودفع آمن",
    eyebrowEn: "True Guarantee & Secure Pay",
    titleAr: "صيانة منزلية بدون قلق أو مفاجآت",
    titleEn: "Home Maintenance Without Worry",
    descAr: "نظام دفع محتجز بالكامل (Escrow) يحمي أموالك حتى اكتمال العمل ورضاك التام عن الخدمة.",
    descEn: "A secure escrow payment system that protects your money until the work is completed and you are fully satisfied.",
    imageUrl: "",`;

const slide2New = `    id: "slide-2",
    eyebrowAr: "ضمان حقيقي ودفع آمن",
    eyebrowEn: "True Guarantee & Secure Pay",
    titleAr: "صيانة منزلية بدون قلق أو مفاجآت",
    titleEn: "Home Maintenance Without Worry",
    descAr: "نظام دفع محتجز بالكامل (Escrow) يحمي أموالك حتى اكتمال العمل ورضاك التام عن الخدمة.",
    descEn: "A secure escrow payment system that protects your money until the work is completed and you are fully satisfied.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCUjS8cqQCINIOM84jIMf2dYmBT0ln1b8teCxZV19vnToAaTPbpuwJcvOdIoY4CVoKIiP3wxhHAWIUx1LH3Fn2E5A7C_CRnb4Z-V1EnnCgZj1rtmJmzhkKS-Cei1wxR6LKdtJ5-B01h1LI_R_UiWI7slUhfpK0xSOUbS4Pk4Pe6yHWxPC8p6z6Blicrzxq9mF29GthmdUjKgmWQPcHcqGLawfLjxgAHGwF6OW7sGJ8QtC23cWBNawb9fMXzgXuUFjpTY6GYovxVDIg",`;

if (content.includes(slide1Old)) {
  content = content.replace(slide1Old, slide1New);
  console.log("Slide 1 imageUrl updated successfully!");
} else {
  console.error("Slide 1 target not found!");
}

if (content.includes(slide2Old)) {
  content = content.replace(slide2Old, slide2New);
  console.log("Slide 2 imageUrl updated successfully!");
} else {
  console.error("Slide 2 target not found!");
}

// Restore line endings
content = content.replace(/\n/g, '\r\n');

fs.writeFileSync(filePath, content, 'utf8');
console.log("Done updating default slides!");

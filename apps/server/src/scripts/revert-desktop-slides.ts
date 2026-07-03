import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import { prisma } from "../lib/prisma.js";

async function main() {
  const originalSlides = [
    {
      id: "slide-1",
      eyebrowAr: "منصة الحرفيين رقم 1 في مصر",
      eyebrowEn: "Egypt's #1 Craftsman Platform",
      titleAr: "اطلب أُسطفاي محترف بنقرة واحدة",
      titleEn: "Hire a Professional Ostafy in Seconds",
      descAr: "أول منصة تجمع أمهر الفنيين والمتاجر الموثقة في مصر. جودة مضمونة، أسعار عادلة، وتجربة مستخدم فاخرة.",
      descEn: "The first platform connecting skilled pros and verified stores in Egypt. Guaranteed quality, fair prices, and a premium experience.",
      imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2070",
      btn1TextAr: "انضم كصنايعي",
      btn1TextEn: "Join as Pro",
      btn1Link: "/register/worker",
      btn2TextAr: "انضم كمتجر",
      btn2TextEn: "Join as Vendor",
      btn2Link: "/register/vendor",
      isActive: true
    },
    {
      id: "slide-2",
      eyebrowAr: "ضمان حقيقي ودفع آمن",
      eyebrowEn: "True Guarantee & Secure Pay",
      titleAr: "صيانة منزلية بدون قلق أو مفاجآت",
      titleEn: "Home Maintenance Without Worry",
      descAr: "نظام دفع محتجز بالكامل (Escrow) يحمي أموالك حتى اكتمال العمل ورضاك التام عن الخدمة.",
      descEn: "A secure escrow payment system that protects your money until the work is completed and you are fully satisfied.",
      imageUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2070",
      btn1TextAr: "اطلب فني الآن",
      btn1TextEn: "Book Pro Now",
      btn1Link: "/register/client",
      btn2TextAr: "تصفح الخدمات",
      btn2TextEn: "Browse Services",
      btn2Link: "/services",
      isActive: true
    }
  ];

  await prisma.systemSetting.upsert({
    where: { key: "hero_slides" },
    update: { value: JSON.stringify(originalSlides) },
    create: { key: "hero_slides", value: JSON.stringify(originalSlides), type: "json" }
  });

  console.log("Successfully reverted desktop slides in DB to original cinematic black backgrounds.");
}

main().catch(console.error).finally(() => prisma.$disconnect());

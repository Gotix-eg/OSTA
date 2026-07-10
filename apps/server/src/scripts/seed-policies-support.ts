import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import { prisma } from "../lib/prisma.js";

async function main() {
  const privacyPolicy = {
    title: "سياسة الخصوصية وحماية البيانات والأمان",
    description: "نلتزم في أُسطفاي بجمع البيانات اللازمة فقط لضمان الأمان والربط بين العملاء والفنيين.",
    sections: [
      {
        title: "١) جمع هويات الفنيين للأمان",
        body: "نقوم بجمع بيانات التحقق الرسمية الخاصة بالفنيين (مثل صورة بطاقة الرقم القومي) بهدف توفير ضمان أمني للعملاء وتسهيل الوصول إليهم عند الحاجة."
      },
      {
        title: "٢) مشاركة البيانات عند حدوث مشكلات",
        body: "يتم تخزين بيانات الهوية بشكل آمن، ولكن تحتفظ المنصة بالحق الكامل في مشاركة صورة بطاقة الفني أو بياناته الموثقة مع العميل المتضرر في حال حدوث أي مشكلة أو نزاع لتسهيل الوصول للفني قانونياً أو ودياً."
      },
      {
        title: "٣) عدم جمع البيانات المالية",
        body: "لا تقوم المنصة بجمع أو تخزين أي بيانات دفع أو بطاقات ائتمانية خاصة بالعملاء أو الفنيين، حيث يقتصر دورنا على تسهيل التواصل وتقديم الضمانات الأمنية الرسمية المذكورة فقط."
      }
    ]
  };

  const termsOfService = {
    title: "طبيعة الخدمة وإخلاء المسؤولية",
    description: "شروط وقواعد استخدام منصة أُسطفاي والحدود التنظيمية للتعامل بين العملاء والفنيين.",
    sections: [
      {
        title: "١) طبيعة الخدمة والربط",
        body: "منصة أُسطفاي هي مجرد وسيط لتوفير وتسهيل الربط بين العملاء والصنايعية (مقدمي الخدمات) فقط. وليس للمنصة أي سلطة إدارية، أو رقابة، أو علاقة عمل مباشرة مع أي من الطرفين، ولا تتدخل في توجيه العمل."
      },
      {
        title: "٢) الضمان الأمني والتحقق من الهوية",
        body: "ينحصر دور المنصة في توفير الضمان الأمني للعملاء من خلال التحقق من مستندات الصنايعية والاحتفاظ بنسخة من هوياتهم الرسمية (مثل صورة بطاقة الرقم القومي). وتلتزم المنصة بتقديم هذه البيانات للعميل عند الطلب لمساعدته في التوصل للفني وحل أي مشكلة قد تطرأ قانونياً أو شخصياً."
      },
      {
        title: "٣) إخلاء المسؤولية عن المدفوعات والتعاملات",
        body: "المنصة والموقع غير مسؤولين تماماً عن عمليات الدفع، أو الاتفاقات المالية، أو جودة الخدمات المؤداة، أو أي نزاعات تنشأ عن التعامل المباشر بين العميل والصنايعي خارج نطاق البيانات الموثقة التي يتم تقديمها للضمان الأمني."
      }
    ]
  };

  const supportInfo = {
    email: "support@osta.eg",
    phone: "+201009410112",
    whatsapp: "https://wa.me/201009410112",
    facebook: "https://www.facebook.com/2ostafy/",
    instagram: "https://instagram.com/osta.egypt",
    address: "القاهرة، مصر",
    faq: [
      {
        question: "كيف يعمل التوثيق وفحص الهويات في أُسطفاي؟",
        answer: "يمر الفني بفحص الهوية والمستندات وإثبات العنوان والمراجعة قبل أن يصبح متاحًا ومؤهلاً للعمل على المنصة."
      },
      {
        question: "كيف يُحمى الدفع والتعامل المالي؟",
        answer: "يبقى مبلغ الخدمة محمياً ومحفوظاً حتى يكتمل العمل بالكامل وتتأكد جودة الصيانة أو يتم تسوية النزاع رسمياً."
      },
      {
        question: "ماذا تفعل إذا حدث شيء خطأ أو مشكلة مع الفني؟",
        answer: "توفر المنصة نظام شكاوى متكامل مدعوم بالصور والمستندات مع مراجعة إدارية مباشرة لضمان حفظ حقوق الطرفين."
      }
    ]
  };

  console.log("Seeding policies and support info in SystemSetting table...");

  await prisma.systemSetting.upsert({
    where: { key: "privacy_policy" },
    update: { value: JSON.stringify(privacyPolicy), type: "json" },
    create: { key: "privacy_policy", value: JSON.stringify(privacyPolicy), type: "json" }
  });

  await prisma.systemSetting.upsert({
    where: { key: "terms_of_service" },
    update: { value: JSON.stringify(termsOfService), type: "json" },
    create: { key: "terms_of_service", value: JSON.stringify(termsOfService), type: "json" }
  });

  await prisma.systemSetting.upsert({
    where: { key: "support_info" },
    update: { value: JSON.stringify(supportInfo), type: "json" },
    create: { key: "support_info", value: JSON.stringify(supportInfo), type: "json" }
  });

  console.log("Successfully seeded privacy_policy, terms_of_service, and support_info settings!");
}

main().catch(console.error).finally(() => prisma.$disconnect());

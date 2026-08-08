const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'apps', 'web', 'components', 'landing', 'landing-page.tsx');
let content = fs.readFileSync(filePath, 'utf16le');

// 1. Define currentSlide and heroBgImage before the return
const returnTarget = '  return (\r\n    <div className="onyx-shell-bg selection:bg-black selection:text-white overflow-x-hidden">';
const returnReplacement = `  const currentSlide = slides[currentSlideIndex] || slides[0];
  const heroBgImage = (currentSlide && cleanImageUrl(currentSlide.imageUrl)) || "https://lh3.googleusercontent.com/aida/AP1WRLPWTNBI6QHPZstRjBzsdmedQT3X72YzMV1wUJYyabe37kyEjwlG62SdS-6HdpkuM68erjzOO8Sl7fYRrtTuj0nWSH4lhJorjhrnVTdVYMD9-UZp9f1ntjGzPjtYklrkLXZqN97d3BNLFNrgre7enhuKJjgKK19GNUbRzrVFd40xuD6EpwF9PTBqaBIb1VOZkPk65UJV5fMoheg-Id-EfwkvLOAbtD46U9Gdj8YCHlgtwvNCsYoMwmyHNc";

  return (
    <div className="onyx-shell-bg selection:bg-black selection:text-white overflow-x-hidden">`;

if (content.includes(returnTarget)) {
  content = content.replace(returnTarget, returnReplacement);
  console.log("Replaced return statement successfully!");
} else {
  console.error("Could not find return target!");
}

// 2. Replace Hero Section
const heroTarget = `      {/* ── 1. Hero Section (Flat Vibrant Yellow Background) ── */}
      <section className="relative bg-[#f5bd18] py-20 md:py-32 px-margin-mobile md:px-margin-desktop flex flex-col items-center justify-center text-center overflow-hidden min-h-[85vh]">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 border-[40px] border-black rounded-full" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-black rotate-45 transform translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          <span className="inline-flex rounded-full bg-black/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.4em] text-black border border-black/10">
            {isArabic ? "منصة الحرفيين الفاخرة رقم 1 في مصر" : "Egypt's #1 Premium Craftsman Platform"}
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-black leading-tight tracking-tight uppercase">
            {isArabic ? (
              <>
                اطلب <span className="bg-black text-[#f5bd18] px-3 py-1 rounded inline-block">أُسطفاي</span> محترف بنقرة واحدة
              </>
            ) : (
              <>
                Hire a Professional <span className="bg-black text-[#f5bd18] px-3 py-1 rounded inline-block">Ostafy</span> in Seconds
              </>
            )}
          </h1>
          <p className="text-black/85 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            {isArabic 
              ? "الوجهة الرائدة للفنيين المحليين الموثقين. كل معاملة محمية بالكامل لضمان أفضل النتائج أو استرداد أموالك."
              : "The premium destination for verified local tradesmen. Every transaction is escrow-protected, ensuring high-quality results or your money back."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href={\`/\${locale}/register/client\`} 
              className="w-full sm:w-auto bg-black text-[#f5bd18] font-bold text-base px-10 py-4 sticker-shadow hover:scale-105 transition-all uppercase text-center"
            >
              {isArabic ? "اطلب فني الآن" : "Order a Pro"}
            </Link>
            <Link 
              href={\`/\${locale}/register/worker\`} 
              className="w-full sm:w-auto border-2 border-black text-black font-bold text-base px-10 py-4 hover:bg-black hover:text-[#f5bd18] transition-all uppercase text-center"
            >
              {isArabic ? "انضم كفني" : "Join as Pro"}
            </Link>
            <Link 
              href={\`/\${locale}/register/vendor\`} 
              className="w-full sm:w-auto border-2 border-black text-black font-bold text-base px-10 py-4 hover:bg-black hover:text-[#f5bd18] transition-all uppercase text-center"
            >
              {isArabic ? "انضم كمتجر" : "Join as Vendor"}
            </Link>
          </div>
          <div className="pt-8 flex items-center justify-center gap-2">
            <div className="flex -space-x-4">
              {[
                "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=150&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=150&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=150&auto=format&fit=crop"
              ].map((url, i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#f5bd18] bg-black overflow-hidden shadow-md">
                  <img className="w-full h-full object-cover" src={url} alt="" />
                </div>
              ))}
            </div>
            <span className="font-bold text-xs md:text-sm text-black ml-4 uppercase tracking-wide">
              {isArabic ? "أكثر من 50 ألف مستخدم يثقون بنا" : "50K+ TRUSTED USERS ALREADY JOINED"}
            </span>
          </div>
        </div>
      </section>`;

const heroReplacement = `      {/* ── 1. Hero Section (Cinematic Dark Image Background from Stitch) ── */}
      <section className="relative w-full overflow-hidden bg-black min-h-[60vh] py-12 md:h-auto md:min-h-[85vh] md:py-32 px-margin-mobile md:px-margin-desktop flex flex-col items-center justify-center text-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            alt="Master craftsman working" 
            className="w-full h-full object-cover brightness-[0.6] md:brightness-[0.7]" 
            src={heroBgImage}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent md:bg-gradient-to-b md:from-black/60 md:via-black/30 md:to-black/85" />
        </div>

        {/* Desktop Content */}
        <div className="relative z-10 max-w-4xl mx-auto space-y-8 max-md:hidden">
          <span className="inline-flex rounded-full bg-[#f5bd18]/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.4em] text-[#f5bd18] border border-[#f5bd18]/25">
            {isArabic ? "منصة الحرفيين الفاخرة رقم 1 في مصر" : "Egypt's #1 Premium Craftsman Platform"}
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight tracking-tight uppercase">
            {isArabic ? (
              <>
                اطلب <span className="bg-[#f5bd18] text-black px-3 py-1 rounded inline-block">أُسطفاي</span> محترف بنقرة واحدة
              </>
            ) : (
              <>
                Hire a Professional <span className="bg-[#f5bd18] text-black px-3 py-1 rounded inline-block">Ostafy</span> in Seconds
              </>
            )}
          </h1>
          <p className="text-white/95 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-semibold">
            {isArabic 
              ? "الوجهة الرائدة للفنيين المحليين الموثقين. كل معاملة محمية بالكامل لضمان أفضل النتائج أو استرداد أموالك."
              : "The premium destination for verified local tradesmen. Every transaction is escrow-protected, ensuring high-quality results or your money back."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href={\`/\${locale}/register/client\`} 
              className="w-full sm:w-auto bg-[#f5bd18] text-black font-black text-base px-10 py-4 sticker-shadow hover:scale-105 transition-all uppercase text-center rounded-sm"
            >
              {isArabic ? "اطلب فني الآن" : "Order a Pro"}
            </Link>
            <Link 
              href={\`/\${locale}/register/worker\`} 
              className="w-full sm:w-auto border-2 border-white text-white font-black text-base px-10 py-4 hover:bg-white hover:text-black transition-all uppercase text-center rounded-sm"
            >
              {isArabic ? "انضم كفني" : "Join as Pro"}
            </Link>
            <Link 
              href={\`/\${locale}/register/vendor\`} 
              className="w-full sm:w-auto border-2 border-white text-white font-black text-base px-10 py-4 hover:bg-white hover:text-black transition-all uppercase text-center rounded-sm"
            >
              {isArabic ? "انضم كمتجر" : "Join as Vendor"}
            </Link>
          </div>
          <div className="pt-8 flex items-center justify-center gap-2">
            <div className="flex -space-x-4">
              {[
                "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=150&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=150&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=150&auto=format&fit=crop"
              ].map((url, i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#f5bd18] bg-black overflow-hidden shadow-md">
                  <img className="w-full h-full object-cover" src={url} alt="" />
                </div>
              ))}
            </div>
            <span className="font-bold text-xs md:text-sm text-white ml-4 uppercase tracking-wide opacity-90">
              {isArabic ? "أكثر من 50 ألف مستخدم يثقون بنا" : "50K+ TRUSTED USERS ALREADY JOINED"}
            </span>
          </div>
        </div>

        {/* Mobile Content (Matches Stitch OSTA - Home (Mobile) mockup) */}
        <div className="relative z-10 w-full flex-1 flex flex-col justify-end text-start p-4 pb-16 md:hidden">
          <div className="space-y-3">
            {isArabic ? (
              <>
                <h1 className="text-3xl font-extrabold text-white-force uppercase leading-none tracking-tight">
                  قوة صناعية <br/>
                  <span className="text-yellow-force">موثوقية.</span>
                </h1>
                <p className="text-sm text-white-muted-force font-bold leading-tight">
                  أفضل الحرفيين لخدمتك
                </p>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-extrabold text-white-force uppercase leading-none tracking-tight">
                  Industrial Strength <br/>
                  <span className="text-yellow-force">Reliability.</span>
                </h1>
                <p className="text-sm text-white-muted-force font-bold leading-tight">
                  Expert hands for your home.
                </p>
              </>
            )}
          </div>
          <div className="mt-6 w-full">
            <Link 
              href={\`/\${locale}/register/client\`} 
              className="inline-block w-full bg-white text-black font-black py-4 text-center sticker-shadow active:translate-x-1 active:translate-y-1 active:shadow-none transition-all uppercase text-sm"
            >
              {isArabic ? "احجز فني الآن" : "Book a Pro Now"}
            </Link>
          </div>
        </div>
      </section>`;

// Normalize whitespace for comparison
const normalizeText = text => text.replace(/\s+/g, ' ').trim();

const idx = normalizeText(content).indexOf(normalizeText(heroTarget));
if (idx !== -1) {
  // Find standard replacement by splitting lines
  const targetLines = heroTarget.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const fileLines = content.split('\r\n');
  let matchStart = -1;
  for (let i = 0; i < fileLines.length; i++) {
    if (fileLines[i].includes('Hero Section (Flat Vibrant Yellow Background)')) {
      matchStart = i;
      break;
    }
  }
  if (matchStart !== -1) {
    // Find the end section tag
    let matchEnd = -1;
    for (let j = matchStart; j < fileLines.length; j++) {
      if (fileLines[j].includes('</section>') && fileLines[j+2] && fileLines[j+2].includes('Service Categories')) {
        matchEnd = j;
        break;
      }
    }
    if (matchEnd !== -1) {
      fileLines.splice(matchStart, matchEnd - matchStart + 1, heroReplacement);
      content = fileLines.join('\r\n');
      console.log("Replaced Hero section successfully!");
    } else {
      console.error("Could not find Hero section end tag!");
    }
  } else {
    console.error("Could not find Hero section start comment!");
  }
} else {
  console.error("Hero target normalized mismatch!");
}

// 3. Replace Bento Grid campaigns
const bentoTarget = `      {/* ── 3. Sponsored Campaigns (Bento Grid) ── */}
      <section className="py-20 bg-[#f5bd18] px-margin-mobile md:px-margin-desktop">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Large Bento Offer */}
          <div className="md:col-span-2 obsidian-card p-12 flex flex-col justify-between min-h-[400px] relative overflow-hidden group rounded-lg">
            <div className="relative z-10">
              <span className="bg-[#f5bd18] text-black px-4 py-1 text-xs font-black uppercase mb-6 inline-block">
                {isArabic ? "عرض ساخن" : "HOT OFFER"}
              </span>
              <h3 className="text-white font-black text-3xl md:text-5xl leading-tight max-w-md uppercase">
                {isArabic ? "موسم تجديد المنازل قد بدأ" : "Home Renovation Season is Here"}
              </h3>
              <p className="text-white/70 mt-4 max-w-sm">
                {isArabic 
                  ? "احصل على خصم يصل إلى 30% على جميع خدمات النجارة والدهانات هذا الشهر. عرض محدود."
                  : "Get up to 30% off on all carpentry and painting services this month. Limited time offer."}
              </p>
            </div>
            <div className="relative z-10 mt-8">
              <Link 
                href={\`/\${locale}/services\`} 
                className="inline-block bg-[#f5bd18] text-black font-bold px-8 py-3 sticker-shadow group-hover:translate-x-2 transition-transform"
              >
                {isArabic ? "استكشف العرض" : "Explore Offer"}
              </Link>
            </div>
            <div className="absolute right-0 rtl:right-auto left-auto rtl:left-0 bottom-0 w-1/2 h-full opacity-40 pointer-events-none grayscale group-hover:grayscale-0 transition-all">
              <img 
                className="w-full h-full object-cover" 
                src="https://images.unsplash.com/photo-1601058268499-e52658b8bb88?q=80&w=400&auto=format&fit=crop" 
                alt="" 
              />
            </div>
          </div>
          {/* Card 2: Small Bento Material */}
          <div className="obsidian-card p-10 flex flex-col justify-between bg-gradient-to-br from-[#121212] to-black rounded-lg">
            <div>
              <h3 className="text-white font-black text-2xl md:text-3xl">
                {isArabic ? "سوق الخامات" : "Materials Market"}
              </h3>
              <p className="text-white/70 mt-2">
                {isArabic 
                  ? "احصل على قطع الغيار والخامات الأصلية مباشرة من المتاجر المعتمدة."
                  : "Source authentic parts directly from verified vendors."}
              </p>
            </div>
            <ul className="space-y-4 my-8">
              <li className="flex items-center gap-3 text-white text-sm">
                <CheckCircle2 className="h-5 w-5 text-[#f5bd18]" />
                <span>{isArabic ? "علامات تجارية معتمدة" : "Verified Brands"}</span>
              </li>
              <li className="flex items-center gap-3 text-white text-sm">
                <CheckCircle2 className="h-5 w-5 text-[#f5bd18]" />
                <span>{isArabic ? "التسليم في اليوم التالي" : "Next-day Delivery"}</span>
              </li>
            </ul>`;

const bentoReplacement = `      {/* ── 3. Sponsored Campaigns (Bento Grid) ── */}
      <section className="py-12 md:py-20 bg-[#f5bd18] px-margin-mobile md:px-margin-desktop">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Large Bento Offer */}
          <div className="md:col-span-2 obsidian-card p-12 flex flex-col justify-between min-h-[400px] relative overflow-hidden group rounded-lg">
            <div className="relative z-10">
              <span className="bg-[#f5bd18] text-black px-4 py-1 text-xs font-black uppercase mb-6 inline-block">
                {isArabic ? "عرض ساخن" : "HOT OFFER"}
              </span>
              <h3 className="text-white-force font-black text-3xl md:text-5xl leading-tight max-w-md uppercase">
                {isArabic ? "موسم تجديد المنازل قد بدأ" : "Home Renovation Season is Here"}
              </h3>
              <p className="text-white-muted-force mt-4 max-w-sm">
                {isArabic 
                  ? "احصل على خصم يصل إلى 30% على جميع خدمات النجارة والدهانات هذا الشهر. عرض محدود."
                  : "Get up to 30% off on all carpentry and painting services this month. Limited time offer."}
              </p>
            </div>
            <div className="relative z-10 mt-8">
              <Link 
                href={\`/\${locale}/services\`} 
                className="inline-block bg-[#f5bd18] text-black font-bold px-8 py-3 sticker-shadow group-hover:translate-x-2 transition-transform"
              >
                {isArabic ? "استكشف العرض" : "Explore Offer"}
              </Link>
            </div>
            <div className="absolute right-0 rtl:right-auto left-auto rtl:left-0 bottom-0 w-1/2 h-full opacity-40 pointer-events-none grayscale group-hover:grayscale-0 transition-all">
              <img 
                className="w-full h-full object-cover" 
                src="https://images.unsplash.com/photo-1601058268499-e52658b8bb88?q=80&w=400&auto=format&fit=crop" 
                alt="" 
              />
            </div>
          </div>
          {/* Card 2: Small Bento Material */}
          <div className="obsidian-card p-10 flex flex-col justify-between bg-gradient-to-br from-[#121212] to-black rounded-lg">
            <div>
              <h3 className="text-white-force font-black text-2xl md:text-3xl">
                {isArabic ? "سوق الخامات" : "Materials Market"}
              </h3>
              <p className="text-white-muted-force mt-2">
                {isArabic 
                  ? "احصل على قطع الغيار والخامات الأصلية مباشرة من المتاجر المعتمدة."
                  : "Source authentic parts directly from verified vendors."}
              </p>
            </div>
            <ul className="space-y-4 my-8">
              <li className="flex items-center gap-3 text-white-force text-sm">
                <CheckCircle2 className="h-5 w-5 text-[#f5bd18]" />
                <span>{isArabic ? "علامات تجارية معتمدة" : "Verified Brands"}</span>
              </li>
              <li className="flex items-center gap-3 text-white-force text-sm">
                <CheckCircle2 className="h-5 w-5 text-[#f5bd18]" />
                <span>{isArabic ? "التسليم في اليوم التالي" : "Next-day Delivery"}</span>
              </li>
            </ul>`;

if (content.includes(bentoTarget)) {
  content = content.replace(bentoTarget, bentoReplacement);
  console.log("Replaced Bento Grid campaigns successfully!");
} else {
  console.error("Could not find bento target!");
}

// 4. Replace How OSTA Works text elements
const ostaWorksTarget = `                  <h3 className="text-white font-bold text-xl mb-4">
                    {isArabic ? stepItem.titleAr : stepItem.titleEn}
                  </h3>
                  <p className="text-white/60 max-w-xs text-sm leading-relaxed">
                    {isArabic ? stepItem.descAr : stepItem.descEn}
                  </p>`;

const ostaWorksReplacement = `                  <h3 className="text-white-force font-bold text-xl mb-4">
                    {isArabic ? stepItem.titleAr : stepItem.titleEn}
                  </h3>
                  <p className="text-white-muted-force max-w-xs text-sm leading-relaxed">
                    {isArabic ? stepItem.descAr : stepItem.descEn}
                  </p>`;

if (content.includes(ostaWorksTarget)) {
  content = content.replace(ostaWorksTarget, ostaWorksReplacement);
  console.log("Replaced How OSTA Works text successfully!");
} else {
  console.error("Could not find How OSTA Works target!");
}

// 5. Replace Final CTA
const finalCtaTarget = `      {/* ── 7. Final CTA (Huge Obsidian Card) ── */}
      <section className="py-20 px-margin-mobile md:px-margin-desktop bg-[#f9f9f9] hidden md:block">
        <div className="max-w-7xl mx-auto bg-black p-12 md:p-24 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12 rounded-lg border border-white/10">
          <div className="absolute top-0 right-0 w-64 h-64 border-[40px] border-white/5 rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="relative z-10 max-w-xl text-start">
            <h2 className="text-white font-black text-3xl md:text-5xl mb-6 leading-tight">
              {isArabic ? "جاهز لتجربة صيانة استثنائية؟" : "Ready to Experience Professionalism?"}
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">
              {isArabic 
                ? "سجل حسابك كعميل فوراً واطلب الصنايعي المناسب، أو انضم كفني/متجر معتمد لتنمية أعمالك."
                : "Join the hub today and start hiring the best tradesmen in the region or list your services to reach thousands of clients."}
            </p>`;

const finalCtaReplacement = `      {/* ── 7. Final CTA (Huge Obsidian Card) ── */}
      <section className="py-12 md:py-20 px-margin-mobile md:px-margin-desktop bg-[#f9f9f9]">
        <div className="max-w-7xl mx-auto bg-black p-12 md:p-24 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12 rounded-lg border border-white/10">
          <div className="absolute top-0 right-0 w-64 h-64 border-[40px] border-white/5 rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="relative z-10 max-w-xl text-start">
            <h2 className="text-white-force font-black text-3xl md:text-5xl mb-6 leading-tight">
              {isArabic ? "جاهز لتجربة صيانة استثنائية؟" : "Ready to Experience Professionalism?"}
            </h2>
            <p className="text-white-muted-force text-lg leading-relaxed">
              {isArabic 
                ? "سجل حسابك كعميل فوراً واطلب الصنايعي المناسب، أو انضم كفني/متجر معتمد لتنمية أعمالك."
                : "Join the hub today and start hiring the best tradesmen in the region or list your services to reach thousands of clients."}
            </p>`;

if (content.includes(finalCtaTarget)) {
  content = content.replace(finalCtaTarget, finalCtaReplacement);
  console.log("Replaced Final CTA successfully!");
} else {
  console.error("Could not find Final CTA target!");
}

// 6. Make How OSTA Works visible on mobile
const worksSectionTarget = `      {/* ── 5. How OSTA Works (Dark Obsidian Section) ── */}
      <section className="py-20 bg-black px-margin-mobile md:px-margin-desktop overflow-hidden relative hidden md:block">`;
const worksSectionReplacement = `      {/* ── 5. How OSTA Works (Dark Obsidian Section) ── */}
      <section className="py-12 md:py-20 bg-black px-margin-mobile md:px-margin-desktop overflow-hidden relative">`;

if (content.includes(worksSectionTarget)) {
  content = content.replace(worksSectionTarget, worksSectionReplacement);
  console.log("Replaced How OSTA Works section visibility successfully!");
} else {
  console.error("Could not find How OSTA Works section visibility target!");
}

// 7. Make Core Features visible on mobile
const coreFeaturesTarget = `      {/* ── 6. Core Features ── */}
      <section className="py-20 bg-[#f9f9f9] px-margin-mobile md:px-margin-desktop hidden md:block">`;
const coreFeaturesReplacement = `      {/* ── 6. Core Features ── */}
      <section className="py-12 md:py-20 bg-[#f9f9f9] px-margin-mobile md:px-margin-desktop">`;

if (content.includes(coreFeaturesTarget)) {
  content = content.replace(coreFeaturesTarget, coreFeaturesReplacement);
  console.log("Replaced Core Features visibility successfully!");
} else {
  console.error("Could not find Core Features visibility target!");
}

fs.writeFileSync(filePath, content, 'utf16le');
console.log("Done applying fixes!");

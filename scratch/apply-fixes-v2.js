const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'apps', 'web', 'components', 'landing', 'landing-page.tsx');
let content = fs.readFileSync(filePath, 'utf16le');

// Normalize line endings to \n
content = content.replace(/\r\n/g, '\n');

// 1. Define variables before return
const returnTarget = `  return (
    <div className="onyx-shell-bg selection:bg-black selection:text-white overflow-x-hidden">`;

const returnReplacement = `  const currentSlide = slides[currentSlideIndex] || slides[0];
  const heroBgImage = (currentSlide && cleanImageUrl(currentSlide.imageUrl)) || "https://lh3.googleusercontent.com/aida/AP1WRLPWTNBI6QHPZstRjBzsdmedQT3X72YzMV1wUJYyabe37kyEjwlG62SdS-6HdpkuM68erjzOO8Sl7fYRrtTuj0nWSH4lhJorjhrnVTdVYMD9-UZp9f1ntjGzPjtYklrkLXZqN97d3BNLFNrgre7enhuKJjgKK19GNUbRzrVFd40xuD6EpwF9PTBqaBIb1VOZkPk65UJV5fMoheg-Id-EfwkvLOAbtD46U9Gdj8YCHlgtwvNCsYoMwmyHNc";

  return (
    <div className="onyx-shell-bg selection:bg-black selection:text-white overflow-x-hidden">`;

// Find and replace Hero Section using ASCII-only anchors
const heroAnchor = '1. Hero Section (Flat Vibrant Yellow Background)';
const nextAnchor = '2. Service Categories (Electricity, Plumbing, Carpentry, AC, Painting)';

const heroAnchorIdx = content.indexOf(heroAnchor);
const nextAnchorIdx = content.indexOf(nextAnchor);

if (heroAnchorIdx !== -1 && nextAnchorIdx !== -1) {
  const startIdx = content.lastIndexOf('{/*', heroAnchorIdx);
  const endIdx = content.lastIndexOf('{/*', nextAnchorIdx);
  
  if (startIdx !== -1 && endIdx !== -1) {
    const heroReplacement = `{/* ── 1. Hero Section (Cinematic Dark Image Background from Stitch) ── */}
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
              ? "الوجهة الرائدة للفنيين المحليين الموثقين. كل معاملة معاملة محمية بالكامل لضمان أفضل النتائج أو استرداد أموالك."
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
      </section>\n\n      `;
      
      content = content.substring(0, startIdx) + heroReplacement + content.substring(endIdx);
      console.log("Hero Section block replaced successfully!");
  } else {
    console.error("Hero outer comment indices not found!");
  }
} else {
  console.error("Hero anchor comments not found!");
}

if (content.includes(returnTarget)) {
  content = content.replace(returnTarget, returnReplacement);
  console.log("Replaced return statement successfully!");
}

// Replace bento grid class and texts
content = content.replace(
  'section className="py-20 bg-[#f5bd18] px-margin-mobile md:px-margin-desktop"',
  'section className="py-12 md:py-20 bg-[#f5bd18] px-margin-mobile md:px-margin-desktop"'
);
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
// Replace li text-white
content = content.replace(
  /li className="flex items-center gap-3 text-white text-sm"/g,
  'li className="flex items-center gap-3 text-white-force text-sm"'
);

// How OSTA Works visibility and texts
content = content.replace(
  'section className="py-20 bg-black px-margin-mobile md:px-margin-desktop overflow-hidden relative hidden md:block"',
  'section className="py-12 md:py-20 bg-black px-margin-mobile md:px-margin-desktop overflow-hidden relative"'
);
content = content.replace(
  'h3 className="text-white font-bold text-xl mb-4"',
  'h3 className="text-white-force font-bold text-xl mb-4"'
);
content = content.replace(
  'p className="text-white/60 max-w-xs text-sm leading-relaxed"',
  'p className="text-white-muted-force max-w-xs text-sm leading-relaxed"'
);

// Core Features visibility
content = content.replace(
  'section className="py-20 bg-[#f9f9f9] px-margin-mobile md:px-margin-desktop hidden md:block"',
  'section className="py-12 md:py-20 bg-[#f9f9f9] px-margin-mobile md:px-margin-desktop"'
);

// Final CTA visibility and texts
content = content.replace(
  'section className="py-20 px-margin-mobile md:px-margin-desktop bg-[#f9f9f9] hidden md:block"',
  'section className="py-12 md:py-20 px-margin-mobile md:px-margin-desktop bg-[#f9f9f9]"'
);
content = content.replace(
  'h2 className="text-white font-black text-3xl md:text-5xl mb-6 leading-tight"',
  'h2 className="text-white-force font-black text-3xl md:text-5xl mb-6 leading-tight"'
);
content = content.replace(
  'p className="text-white/60 text-lg leading-relaxed"',
  'p className="text-white-muted-force text-lg leading-relaxed"'
);

// Put line endings back to \r\n
content = content.replace(/\n/g, '\r\n');

fs.writeFileSync(filePath, content, 'utf16le');
console.log("Done applying fixes v3!");

import type { Locale } from "./locales";

export type PublicPageKey = "services" | "how-it-works" | "about" | "contact" | "faq";

export const publicPageCopy = {
  ar: {
    nav: {
      home: "el ra2eseya",
      services: "el 5adamat",
      how: "ezay byesht8al",
      about: "men na7no",
      contact: "tawasol",
      faq: "as2ela sha2e3a",
      dashboards: "dashboards"
    },
    pages: {
      services: {
        eyebrow: "el 5adamat",
        title: "5adamat mobawaba b toroq wad7a",
        description: "mn el kahraba llsabaka w el takyif, OSTA by3rd categories wad7a w matching asra3 ma3 3ommal mota2akdeen.",
        sections: [
          {
            title: "el categories el asaseya",
            body: "kahraba, sabaka, negara, dehanat, takyif w agheza, alouminyum w la7am, w 5adamat 3ama b bianat wad7a w speed fi el reply."
          },
          {
            title: "pricing martyab",
            body: "el request byb2a feeh estimate awaly, scope wad7, w tracking lel cost abl ma el sh8l yebda2."
          },
          {
            title: "guarantee w follow-up",
            body: "ba3d el tanfeez t2dar ttba3 el da7man, t3ml complaint, aw t3eed el 7agz ma3 nafs el worker."
          }
        ]
      },
      "how-it-works": {
        eyebrow: "workflow",
        title: "el request bymshi ezay mn awel click le 7d el tasleem",
        description: "masar basit: tsif el moshkela, ytm matching ma3 worker monaseb, tetba3 status el sh8l, thott rating w da7man ba3d el tanfeez.",
        sections: [
          {
            title: "1) describe",
            body: "3onwan saree3, description, sowar aw notes, w level urgency 3ashan el worker yefham el talab mn awelha."
          },
          {
            title: "2) match",
            body: "el manasa bt2addem workers hasab area, specialty, rating, w availability."
          },
          {
            title: "3) execute + review",
            body: "live updates, protected payment, w review system مربoot b talab 7a2i2y mesh comments fake."
          }
        ]
      },
      about: {
        eyebrow: "about OSTA",
        title: "OSTA mabni 3ala el thi2a abl ay 7agz",
        description: "el hadaf enna n2arrab ben as7ab el buyoot w ben 3ommal maharat mota2akdeen b tagroba wad7a zay ride apps, bas lel home services.",
        sections: [
          {
            title: "why now",
            body: "su2 el 5adamat el manzelya me7tag wosool asra3, pricing awda7, w 7emaya aktr lel client w lel worker."
          },
          {
            title: "trust system",
            body: "identity checks, docs review, complaint path, secure wallet, w dashboards lel client, worker, w admin."
          },
          {
            title: "long-term vision",
            body: "network kbira mn el workers, real-time operations, w ecosystem kamel lel training, tools, warranties, w growth."
          }
        ]
      },
      contact: {
        eyebrow: "tawasol",
        title: "ezay towasal ma3 OSTA",
        description: "support, partnerships, onboarding questions, aw business requests - kolaha mn channelat wad7a w organized.",
        sections: [
          {
            title: "support",
            body: "support@osta.eg - +20 100 000 0000 - Cairo, Egypt."
          },
          {
            title: "for workers",
            body: "estefsarat el tawthee2, onboarding, documents, aw support el earnings."
          },
          {
            title: "for partners",
            body: "real estate, facility management, w bulk service operations requests."
          }
        ]
      },
      faq: {
        eyebrow: "faq",
        title: "as2ela mohema abl ma tebda2",
        description: "igabat 3ala verification, payments, dissatisfaction, worker registration, w el fees.",
        sections: [
          {
            title: "how verification works",
            body: "el worker by3dy 3ala identity + docs + utility + review abl ma ytb2a available 3ala el manasa."
          },
          {
            title: "how payment is protected",
            body: "el mabla8 byfdal protected l7ad ma ytbayan status el sh8l aw ytm 7al ay niza3."
          },
          {
            title: "if something goes wrong",
            body: "fe complaints path, evidence support, w admin review 3ashan el rights teb2a ma7fouza."
          }
        ]
      }
    },
    dashboards: {
      eyebrow: "dashboard hub",
      title: "ed5ol 3ala ay dashboard men makan wa7ed",
      description: "3ashan matdawrsh 3ala el routes, 3amaltlak hub mobasher lel client, worker, w admin preview dashboards.",
      cards: [
        {
          title: "client dashboard",
          body: "requests, wallet, favorites, warranties, w request creation flow.",
          href: "/client"
        },
        {
          title: "worker dashboard",
          body: "incoming jobs, active work, earnings, w follow-up 3ala el performance.",
          href: "/worker"
        },
        {
          title: "admin dashboard",
          body: "verification queue, finance pulse, operations alerts, w control views.",
          href: "/admin"
        }
      ]
    }
  },
  en: {
    nav: {
      home: "Home",
      services: "Services",
      how: "How It Works",
      about: "About",
      contact: "Contact",
      faq: "FAQ",
      dashboards: "Dashboards"
    },
    pages: {
      services: {
        eyebrow: "Services",
        title: "Service categories built for clarity",
        description: "From electrical and plumbing to AC work and finishing, OSTA organizes every service into clear, trusted booking flows.",
        sections: [
          {
            title: "Core categories",
            body: "Electrical, plumbing, carpentry, painting, AC and appliances, welding, and general support all sit inside one clean service catalog."
          },
          {
            title: "Transparent pricing",
            body: "Every request starts with an estimated scope and clearer expectations before work begins."
          },
          {
            title: "Warranty and follow-up",
            body: "After completion, users can review, track warranty coverage, and reopen support paths if needed."
          }
        ]
      },
      "how-it-works": {
        eyebrow: "Workflow",
        title: "How a request moves from click to completion",
        description: "The journey is designed to feel quick and controlled: describe the job, match with the right worker, track progress, and review with confidence.",
        sections: [
          {
            title: "1) Describe",
            body: "Create a focused request with title, details, urgency, and optional media context."
          },
          {
            title: "2) Match",
            body: "The platform lines up workers by area, specialty, rating, and availability."
          },
          {
            title: "3) Execute + review",
            body: "Users follow status live, keep payments protected, and leave reviews tied to real jobs."
          }
        ]
      },
      about: {
        eyebrow: "About OSTA",
        title: "OSTA is built around trust before booking",
        description: "The platform connects households with verified skilled workers through a cleaner, faster, and more accountable service model.",
        sections: [
          {
            title: "Why now",
            body: "Home services need faster access, clearer pricing, and stronger protection for both sides of the job."
          },
          {
            title: "Trust system",
            body: "Identity checks, document review, complaint handling, secure wallet flows, and dashboard visibility are part of the foundation."
          },
          {
            title: "Long-term vision",
            body: "A wider worker network, stronger operations, real-time tools, training, and financial workflows that help everyone grow."
          }
        ]
      },
      contact: {
        eyebrow: "Contact",
        title: "How to reach OSTA",
        description: "Support, onboarding questions, partnerships, or business requests all route through clear channels.",
        sections: [
          {
            title: "Support",
            body: "support@osta.eg - +20 100 000 0000 - Cairo, Egypt."
          },
          {
            title: "For workers",
            body: "Questions around verification, onboarding, documents, earnings, and account readiness."
          },
          {
            title: "For partners",
            body: "Property operations, facilities, and bulk service demand partnerships."
          }
        ]
      },
      faq: {
        eyebrow: "FAQ",
        title: "The main questions before you begin",
        description: "Quick answers around verification, payments, satisfaction handling, worker onboarding, and fees.",
        sections: [
          {
            title: "How verification works",
            body: "Workers pass through identity, document, utility, and review checks before becoming active."
          },
          {
            title: "How payment is protected",
            body: "Funds remain protected until progress is verified or a dispute has been resolved."
          },
          {
            title: "If something goes wrong",
            body: "There is a complaint path with evidence support and admin review so both sides stay protected."
          }
        ]
      }
    },
    dashboards: {
      eyebrow: "Dashboard hub",
      title: "Open any dashboard from one place",
      description: "To make access obvious, this hub links directly to the client, worker, and admin dashboard previews.",
      cards: [
        {
          title: "Client dashboard",
          body: "Requests, wallet, favorites, warranties, and the request creation flow.",
          href: "/client"
        },
        {
          title: "Worker dashboard",
          body: "Incoming jobs, active work, earnings, and performance tracking.",
          href: "/worker"
        },
        {
          title: "Admin dashboard",
          body: "Verification queue, finance pulse, operations alerts, and control surfaces.",
          href: "/admin"
        }
      ]
    }
  }
} as const satisfies Record<Locale, unknown>;

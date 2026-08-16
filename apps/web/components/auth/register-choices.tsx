"use client";

import { ArrowRight, ArrowLeft, User, Wrench, Store } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Option = {
  key: string;
  title: string;
  description: string;
  href: string;
};

const icons: Record<string, any> = {
  client: User,
  worker: Wrench,
  vendor: Store,
};

export function RegisterChoices({ options, isArabic }: { options: Option[]; isArabic: boolean }) {
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="grid gap-4">
        {options.map(({ key, title, description, href }) => {
          const isBlocked = key === "client" || key === "vendor";
          const Icon = icons[key];

          return (
            <div
              key={key}
              onClick={(e) => {
                if (isBlocked) {
                  e.preventDefault();
                  setBlockedMessage(isArabic ? "التسجيل غير متاح الآن، وسيكون متاحاً قريباً." : "Registration is not available now and it will be soon.");
                } else {
                  window.location.href = href;
                }
              }}
              className={cn(
                "group relative flex cursor-pointer items-start gap-4 border border-white/10 bg-[#121212] p-5 text-start transition-all hover:border-gold hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_#f5bd18] active:border-gold active:translate-x-1 active:translate-y-1 active:shadow-none duration-200",
                isBlocked && blockedMessage ? "border-gold" : ""
              )}
              style={{
                boxShadow: "4px 4px 0px #000000"
              }}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-white/20 bg-black/40 text-gold transition-colors group-hover:bg-gold group-hover:text-black">
                {Icon && <Icon className="h-6 w-6" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-black uppercase text-white group-hover:text-gold transition-colors flex items-center gap-2">
                  {title}
                  {!isBlocked && (isArabic ? (
                    <ArrowLeft className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  ) : (
                    <ArrowRight className="h-4 w-4 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  ))}
                </h3>
                <p className="mt-1 text-xs text-white/50 leading-relaxed font-semibold">
                  {description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {blockedMessage && (
        <div className="mt-4 border border-gold/30 bg-gold/10 p-4 text-center animate-fadeIn">
          <p className="text-gold font-bold text-sm">
            {blockedMessage}
          </p>
        </div>
      )}
    </div>
  );
}

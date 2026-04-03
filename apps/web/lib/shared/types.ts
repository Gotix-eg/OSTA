export const supportedLocales = ["ar", "en"] as const;

export type Locale = (typeof supportedLocales)[number];

export type LocalizedText = Record<Locale, string>;

export interface ServiceItem {
  id: string;
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
}

export interface ServiceCategory {
  id: string;
  slug: string;
  icon: string;
  workersAvailable: number;
  name: LocalizedText;
  description: LocalizedText;
  services: ServiceItem[];
}

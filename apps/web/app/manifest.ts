import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ostafy - أُسطفاي',
    short_name: 'Ostafy',
    description: 'أول منصة تجمع أمهر الفنيين والمتاجر الموثقة في مصر',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#d4af37', // Gold color
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}

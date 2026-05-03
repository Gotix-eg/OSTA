const fs = require('fs');

async function searchDDG(query) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
  const text = await res.text();
  // We need to parse images
  // DDG HTML uses <img class="image_preview" src="..."> or something similar
  // Let's just find any image url that looks like a real photo
  const matches = text.match(/https?:\/\/[^\s"']+\.(?:jpg|jpeg|png)(?:\?[^\s"']*)?/ig);
  if (matches) {
    console.log(`--- ${query} ---`);
    console.log([...new Set(matches.filter(m => m.includes('unsplash') || m.includes('pexels') || !m.includes('duckduckgo')))].slice(0, 3).join('\n'));
  } else {
    console.log(`No matches for ${query}`);
  }
}

async function main() {
  await searchDDG("cctv security camera installation site:unsplash.com");
  await searchDDG("air conditioner maintenance site:unsplash.com");
  await searchDDG("aluminum window frame installation site:unsplash.com");
}

main();

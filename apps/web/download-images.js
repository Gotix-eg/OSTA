const https = require('https');
const fs = require('fs');

async function downloadDuckDuckGoImage(query, filename) {
  try {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const res = await fetch(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const text = await res.text();
    // DuckDuckGo sometimes has <img class="image_preview" src="...url...">
    // Or we can look for any direct image URL
    // Actually DDG images are protected. 
    // Let's use Wikipedia API to get the main image of an article
  } catch (e) {
    console.error(e);
  }
}

const fs = require('fs');

async function searchPexels(query) {
  const url = `https://www.pexels.com/search/${encodeURIComponent(query)}/`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
  const text = await res.text();
  const matches = text.match(/https:\/\/images\.pexels\.com\/photos\/\d+\/pexels-photo-\d+\.jpeg\?auto=compress&cs=tinysrgb&w=800/g);
  if (matches) {
    console.log(`--- ${query} ---`);
    console.log([...new Set(matches)].slice(0, 3).join('\n'));
  } else {
    console.log(`No matches for ${query}`);
  }
}

async function main() {
  await searchPexels("air conditioner maintenance");
  await searchPexels("cctv camera security");
  await searchPexels("aluminum window frame installation");
}

main();

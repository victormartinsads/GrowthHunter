async function extractGoogleMapsAppInit(niche, location) {
  const query = `${niche} em ${location}`;
  const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}?hl=pt-BR`;
  
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8"
    }
  });

  const html = await res.text();
  
  // Google Maps places in HTML have this format:
  // `)]}'\n[...` or `window.APP_INITIALIZATION_STATE=[...`
  // Let's find all instances of ["0x...", null, null, null, ["Place Name", ...]]
  // Or match strings like `[null,null,"Marcenaria...`
  const matches = [...html.matchAll(/\["0x[0-9a-f]+:[0-9a-f]+",null,null,null,\["([^"]+)"/gi)];
  console.log("MATCH 1 COUNT:", matches.length);

  // Let's also look for Google Maps place names by searching for occurrences of the niche word
  const nicheRegex = new RegExp(`\\["([^"\\]]*${niche}[^"\\]]*)",\\[null,\\[(-?\\d+\\.\\d+),(-?\\d+\\.\\d+)\\]`, "gi");
  const nicheMatches = [...html.matchAll(nicheRegex)];
  console.log("NICHE MATCHES COUNT:", nicheMatches.length);

  // Let's find any array with business info: `["Nome da Empresa", null, null, null, null, [rating, reviews_count]]`
  const ratingMatches = [...html.matchAll(/\["([^"]{4,60})",\[(\d\.\d),(\d+)\],/g)];
  console.log("RATING MATCHES COUNT:", ratingMatches.length, ratingMatches.slice(0, 5).map(m => ({ name: m[1], rating: m[2], reviews: m[3] })));
}

extractGoogleMapsAppInit("marcenaria", "São Paulo, SP");

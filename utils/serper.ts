export async function searchCompany(query: string, serperKey: string) {
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': serperKey, // Uses only the dynamic key passed from the client UI
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: query, num: 5 }),
  });
  return res.json();
}

export async function findOfficialUrl(companyName: string, serperKey: string): Promise<string | null> {
  // Pass the dynamic key down into the core search payload execution
  const data = await searchCompany(companyName, serperKey);
  
  // Pick the first clean organic result link, excluding ads or aggregators if obvious
  return data.organic?.[0]?.link || null;
}
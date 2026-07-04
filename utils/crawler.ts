import * as cheerio from 'cheerio';

interface ScrapeResult {
  url: string;
  htmlText: string;
}

export async function crawlWebsite(targetUrl: string): Promise<string> {
  const visited = new Set<string>();
  const pagesToCrawl: string[] = [targetUrl];
  let combinedText = "";

  const rootDomain = new URL(targetUrl).hostname.replace('www.', '');

  while (pagesToCrawl.length > 0 && visited.size < 5) { // Limit to top 5 internal pages
    const url = pagesToCrawl.shift()!;
    if (visited.has(url)) continue;
    visited.add(url);

    try {
      const res = await fetch(url, { 
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        }, 
        signal: AbortSignal.timeout(5000) 
      });

      // 🛑 CRITICAL SAFETY: Skip page parsing completely if the website blocks the fetch request
      if (!res.ok) {
        console.warn(`Skipping page branch (${res.status}): ${url}`);
        continue;
      }

      const html = await res.text();
      const $ = cheerio.load(html);

      // Extract text content cleanly
      $('script, style, nav, footer, iframe, header, noscript').remove();
      const pageText = $('body').text().replace(/\s+/g, ' ').trim();
      
      // If the body contains zero actionable characters, do not append empty block headers
      if (pageText.length > 50) {
        combinedText += `\n--- Page: ${url} ---\n${pageText.slice(0, 3000)}`;
      }

      // Intelligent Discovery: Find sub-pages like /about, /products, /services
      $('a').each((_, element) => {
        const href = $(element).attr('href');
        if (!href) return;

        try {
          const absoluteUrl = new URL(href, targetUrl);
          const cleanLink = absoluteUrl.origin + absoluteUrl.pathname;
          
          // Filters: Ensure same domain, skip login, skip anchors
          if (
            absoluteUrl.hostname.includes(rootDomain) &&
            !visited.has(cleanLink) &&
            !pagesToCrawl.includes(cleanLink) &&
            !/login|signup|auth|cart|checkout|#/i.test(cleanLink)
          ) {
            // Target high-value pages specifically
            if (/about|product|service|solution|pricing|contact/i.test(cleanLink)) {
              pagesToCrawl.push(cleanLink);
            }
          }
        } catch (_) {}
      });
    } catch (e) {
      console.error(`Failed crawling target sub-node: ${url}`, e);
    }
  }

  // Fallback anchor: If all pages were blocked, provide a message so the pipeline doesn't send blank context
  if (!combinedText.trim()) {
    combinedText = `Could not extract deep internal web page context from target URL tree. Relying strictly on available engine search snippets.`;
  }

  return combinedText;
}
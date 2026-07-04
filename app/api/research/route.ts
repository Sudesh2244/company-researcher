import { NextResponse } from 'next/server';
import { findOfficialUrl, searchCompany } from '@/utils/serper';
import { crawlWebsite } from '@/utils/crawler';
import { analyzeCompanyData } from '@/utils/openrouter';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { input, model, openRouterKey, serperKey } = body;

    // 1. Validation Guards
    if (!input) {
      return NextResponse.json({ error: "Input is required" }, { status: 400 });
    }

    // Strict validation: Force execution to rely exclusively on runtime UI input keys
    if (!openRouterKey || !serperKey) {
      return NextResponse.json(
        { error: "Missing required custom API credentials. Please input your OpenRouter and Serper keys into the configuration panel." },
        { status: 400 }
      );
    }

    let targetUrl = input.trim();
    let queryName = input;

    // Check if input is a raw name or explicit URL string matrix
    const isUrl = /^https?:\/\//i.test(targetUrl);
    
    if (!isUrl) {
      // Pass user-provided Serper key directly into the lookup function
      const resolvedUrl = await findOfficialUrl(queryName, serperKey);
      if (!resolvedUrl) {
        return NextResponse.json({ error: "Could not find a valid website for this company." }, { status: 404 });
      }
      targetUrl = resolvedUrl;
    }

    // 2. Fire concurrent research pipeline using the localized user parameters
    const [searchData, scrapedContent] = await Promise.all([
      searchCompany(`${queryName} corporate headquarters contacts details competitors`, serperKey),
      crawlWebsite(targetUrl) // Web scraping utilities do not require an external third-party credential profile
    ]);

    const snippets = (searchData.organic || []).map((o: any) => o.snippet).join('\n');

    // 3. Run localized AI Processing Payload with custom reasoning keys
    const structuredReport = await analyzeCompanyData(scrapedContent, snippets, model, openRouterKey);
    
    // Normalization safeguard context tracking
    if (!structuredReport.website) {
      structuredReport.website = targetUrl;
    }

    return NextResponse.json(structuredReport);
  } catch (err: any) {
    console.error("Pipeline breakdown encountered: ", err);
    return NextResponse.json({ error: err.message || "Internal Execution Error" }, { status: 500 });
  }
}
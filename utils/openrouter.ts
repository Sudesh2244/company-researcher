export async function analyzeCompanyData(rawWebText: string, searchSnippets: string, model: string, openRouterKey: string) {
  const prompt = `
    You are an elite corporate research analyst. Analyze the provided raw crawled text and search results for a company.
    
    CRITICAL: Respond ONLY with a valid, clean JSON object. Do not include markdown code block syntax (like \`\`\`json).
    
    Expected JSON schema format:
    {
      "companyName": "Official Name",
      "website": "URL",
      "phone": "Phone or Not Found",
      "address": "Address or Not Found",
      "summary": "High-level summary of who they are and their target audience",
      "productsServices": ["Product/Service A", "Product/Service B"],
      "painPoints": ["Quantifiable or structural industry pain point 1", "Pain point 2"],
      "competitors": [
        {"name": "Competitor 1", "website": "https://competitor1.com"},
        {"name": "Competitor 2", "website": "https://competitor2.com"}
      ]
    }

    --- START DATA ---
    Search Snippets: ${searchSnippets}
    Web Scraped Text: ${rawWebText.slice(0, 12000)}
    --- END DATA ---
  `;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openRouterKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4000 
    })
  });

  // 1. Get raw text response first to protect against crash events on HTML responses
  const rawResponseText = await response.text();

  // 2. Handle HTTP Errors safely before parsing anything
  if (!response.ok) {
    console.error("OpenRouter HTTP Error Status:", response.status);
    let detailedMsg = rawResponseText;
    try {
      const parsedError = JSON.parse(rawResponseText);
      detailedMsg = parsedError?.error?.message || JSON.stringify(parsedError);
    } catch {
      // If parsing fails, it's a raw HTML status block page (slice it clean)
      detailedMsg = rawResponseText.slice(0, 200);
    }
    throw new Error(`OpenRouter API Failure (Status ${response.status}): ${detailedMsg}`);
  }

  // 3. Parse output safely now that we know the HTTP request succeeded
  let output;
  try {
    output = JSON.parse(rawResponseText);
  } catch (err) {
    throw new Error("Received malformed JSON wrapper from OpenRouter endpoints.");
  }

  if (!output || !output.choices || output.choices.length === 0) {
    throw new Error("OpenRouter completion structure returned an empty array response.");
  }

  const rawText = output.choices[0].message.content.trim();
  const cleanJson = rawText.replace(/^```json\s*|```$/gi, '').trim();

  // 4. Final Data Content Integrity Verification Parser
  try {
    return JSON.parse(cleanJson);
  } catch (parseError) {
    console.error("Failed to parse OpenRouter output as JSON. Raw text:", rawText);
    throw new Error("OpenRouter generated malformed JSON data. Please retry the execution.");
  }
}
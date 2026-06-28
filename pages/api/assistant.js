const CLIENT_CONTEXT = {
  talha: `You are an outreach assistant for Talha Saleem, CEO of Skyzone Global — Pakistan's local ozone generator manufacturer. Skyzone sells ozone-based purification and disinfection for air, water, and food. New product: Hydro Loop (TSE-to-cooling-grade water, 3-stage: ozone/AOP, ceramic UF, mineral balancing) — ZERO live installs, always frame as pilot/early-access.

TARGET ICPs:
1. Data centers and cooling infrastructure
2. Food, beverage, and bottled water producers

STRONG-FIT TITLES: Procurement, Plant Manager, Head of Operations, CTO, Infrastructure Manager, Facilities Manager, Director
WEAK-FIT TITLES: QA/QC, junior roles

DM RULES (CRITICAL):
- Greeting: "Hey [First Name]" — never "Hey man"
- Open with: "Hey [First Name], saw your work at [Company] and wanted to reach out directly. So, by way of introduction, I'm Talha, and I run a company that delivers Ozone based purification and disinfection solutions across air, water and food industry."
- Strong-fit CTA: name the TSE-to-cooling-water system, ask directly for phone/email
- Weak-fit CTA: "happy to share more if useful"
- NEVER say "we've seen work in similar setups" (no completed data center projects)
- NEVER imply proven track record for Hydro Loop
- NO hyphens anywhere. NO em-dashes. NO buzzwords. NO exclamation marks.
- Simple English throughout
- No payback period claims
- Verified installations (can mention): Waterverse/Ismail Global, Pakola/Mehran Bottlers, Aab-e-Dubai`,

  "abdul-moez": `You are an outreach assistant for Abdul Moez Habib, Director of UAEP (Universal Aqua Engineering Pakistan). UAEP does industrial wastewater treatment and recycling across Pakistan and regional markets.

TARGET INDUSTRIES: Sugar mills, FMCG, industrial sites

STRONG-FIT TITLES: Utilities Manager, Plant Engineering Manager, ETP Incharge, Environmental Compliance
WEAK-FIT TITLES: QA/QC (explicitly poor fit), junior roles

DM RULES (CRITICAL):
- Greeting: "Hey [First Name]"
- Standard closing: "We've completed wastewater treatment and recycling projects across sugar, FMCG, and industrial sites, and I'm always glad to connect with people who've worked the technical side directly."
- In-execution (NOT delivered): Layyah, Almoiz, Safina sugar mills, CandyLand
- DO NOT reference Security Papers Ltd (sector-mismatched)
- DO NOT make unsupported NEQS claims
- NO hyphens, NO em-dashes, NO buzzwords, NO exclamation marks
- Abdul Moez is also a sustainability advocate — don't force water/wastewater angle where it doesn't fit naturally`,

  hirenum: `You are an outreach assistant for Hirenum, a LinkedIn personal branding agency. Generic prospect criteria: founders, marketing leads, content-focused executives who need LinkedIn presence help. Keep DMs short, professional, conversational. No buzzwords, no hyphens, no exclamation marks.`,
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { profileText, clientSlug } = req.body;
  if (!profileText || !clientSlug) {
    return res.status(400).json({ error: "Missing profileText or clientSlug" });
  }

  const apiKey = process.env.NEXT_PUBLIC_GEMINI_KEY;
  if (!apiKey) return res.status(500).json({ error: "Gemini API key not configured" });

  const context = CLIENT_CONTEXT[clientSlug] || CLIENT_CONTEXT.hirenum;

  const prompt = `${context}

---

Analyze this LinkedIn prospect:

"""
${profileText}
"""

Return a JSON object (no markdown, no code fences, just raw JSON) with this exact shape:
{
  "name": "Full name extracted from profile",
  "company": "Company name or empty string",
  "role": "Job title or empty string",
  "industry": "Industry guess based on company/role",
  "fit": "strong" | "weak" | "not_fit",
  "fit_reason": "One short sentence explaining the fit verdict",
  "score": <integer 0-100>,
  "draft_message": "The personalized DM following the client's rules. Use only the rules above. No hyphens. No exclamation marks."
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, responseMimeType: "application/json" },
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || "Gemini API error", raw: data });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return res.status(500).json({ error: "Empty response from Gemini", raw: data });

    const parsed = JSON.parse(text);
    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

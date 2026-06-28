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

  const groqKey = process.env.GROQ_KEY || process.env.NEXT_PUBLIC_GROQ_KEY;
  const openrouterKey = process.env.OPENROUTER_KEY || process.env.NEXT_PUBLIC_OPENROUTER_KEY;
  if (!groqKey && !openrouterKey) {
    return res.status(500).json({ error: "No API key configured (need GROQ_KEY or OPENROUTER_KEY)" });
  }

  const context = CLIENT_CONTEXT[clientSlug] || CLIENT_CONTEXT.hirenum;

  const systemPrompt = `${context}

You must respond with a JSON object (raw JSON, no markdown, no code fences) with this exact shape:
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

  const userPrompt = `Analyze this LinkedIn prospect:\n\n"""\n${profileText}\n"""`;

  const attempts = [];
  if (groqKey) {
    attempts.push(
      { provider: "groq", model: "llama-3.3-70b-versatile", url: "https://api.groq.com/openai/v1/chat/completions", key: groqKey },
      { provider: "groq", model: "llama-3.1-8b-instant", url: "https://api.groq.com/openai/v1/chat/completions", key: groqKey }
    );
  }
  if (openrouterKey) {
    attempts.push(
      { provider: "openrouter", model: "meta-llama/llama-3.3-70b-instruct:free", url: "https://openrouter.ai/api/v1/chat/completions", key: openrouterKey },
      { provider: "openrouter", model: "deepseek/deepseek-chat-v3-0324:free", url: "https://openrouter.ai/api/v1/chat/completions", key: openrouterKey }
    );
  }

  const errors = [];

  for (const { provider, model, url, key } of attempts) {
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      };
      if (provider === "openrouter") {
        headers["HTTP-Referer"] = "https://hirenum-crm.vercel.app";
        headers["X-Title"] = "Pulse CRM";
      }
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.6,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        errors.push(`[${provider}/${model}] ${data.error?.message || "API error"}`);
        continue;
      }

      const text = data.choices?.[0]?.message?.content;
      if (!text) {
        errors.push(`[${provider}/${model}] Empty response`);
        continue;
      }

      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        const match = text.match(/\{[\s\S]*\}/);
        if (!match) {
          errors.push(`[${provider}/${model}] Could not parse JSON`);
          continue;
        }
        try {
          parsed = JSON.parse(match[0]);
        } catch (e) {
          errors.push(`[${provider}/${model}] JSON parse failed: ${e.message}`);
          continue;
        }
      }
      return res.status(200).json({ ...parsed, _model: `${provider}/${model}` });
    } catch (err) {
      errors.push(`[${provider}/${model}] ${err.message}`);
    }
  }

  return res.status(500).json({ error: "All models failed. " + errors.join(" | ") });
}

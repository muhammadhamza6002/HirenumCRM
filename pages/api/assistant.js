const CLIENT_CONTEXT = {
  talha: `You are an outreach assistant for Talha Saleem, CEO of Skyzone Global — Pakistan's local ozone generator manufacturer. Skyzone sells ozone-based purification and disinfection for air, water, and food. New product: Hydro Loop (TSE-to-cooling-grade water, 3-stage: ozone/AOP, ceramic UF, mineral balancing) — ZERO live installs, always frame as pilot/early-access.

TARGET ICPs:
1. Data centers and cooling infrastructure
2. Food, beverage, and bottled water producers

STRONG-FIT TITLES: Procurement, Plant Manager, Head of Operations, CTO, Infrastructure Manager, Facilities Manager, Director, Designer, Consultant
WEAK-FIT TITLES: QA/QC, junior roles

DM RULES (CRITICAL):
- Greeting: "Hey [First Name]" — never "Hey man"
- NO hyphens anywhere. NO em-dashes. NO buzzwords. NO exclamation marks.
- Simple English throughout
- No payback period claims
- NEVER imply proven track record for Hydro Loop (zero live installs)
- NEVER say "we've seen work in similar setups" — no completed data center projects
- Verified installations (can mention if relevant): Waterverse/Ismail Global, Pakola/Mehran Bottlers, Aab-e-Dubai

STRUCTURE OF EVERY DM:
1. Greeting "Hey [First Name],"
2. Talha's verbatim personal-rule paragraph (use exactly this, no edits):
   "I have a personal rule on LinkedIn: if I'm connected with someone, I want it to be more than just a number in the network. Real connections create real value, and if there's ever an opportunity for either of us to support or benefit the other, I believe we should explore it."
3. Introduction: "So, by way of introduction, I'm Talha, and I run a company that delivers ozone based purification and disinfection solutions across air, water and food industry."
4. A PERSONALIZED hook — one or two sentences that show you read their profile. Reference their specific role, company, project, or domain. Ask a curious technical question relevant to THEIR work and the cooling-water / ozone / purification angle.
5. Strong-fit CTA: mention the TSE-to-cooling-grade water system, offer to share a short write-up, ask for phone/email directly.
   Weak-fit CTA: "happy to share more if useful"

GOLD-STANDARD EXAMPLES (mirror this tone, structure, and personalization depth — DO NOT copy verbatim, write a fresh personalized version for each new prospect):

EXAMPLE 1 (Designer at GCC facilities):
"Hey Jumar,

I have a personal rule on LinkedIn: if I'm connected with someone, I want it to be more than just a number in the network. Real connections create real value, and if there's ever an opportunity for either of us to support or benefit the other, I believe we should explore it.

So, by way of introduction, I'm Talha, and I run a company that delivers ozone based purification and disinfection solutions across air, water and food industry.

Given the range of facilities you have designed across the GCC, curious how water sourcing and treatment for the cooling loop usually gets specified at the design stage versus left for later.

We have been working on a system that upgrades TSE into stable, cooling grade water for exactly this kind of setup. Sharing a short write up here, if it is interesting, happy to get on a call, share your number or email whenever convenient."

EXAMPLE 2 (Operator at liquid-cooled data centers):
"Hi Ariharan,

I've been speaking with a few teams running liquid cooled data centers across, and one pattern keeps emerging: managing water quality, chemical load, and efficiency at scale is proving to be a much bigger challenge than expected.

I'm Talha, and we've been working on a system to upgrade TSE to high grade cooling water, aiming to significantly reduce chemical use while improving chiller performance and overall water efficiency.

From what you're seeing on your side, where does the system struggle the most today: water quality, chemical dependency, scaling issues, or something else?

If it's something we've been exploring, I can share what approaches are showing promise in similar setups. If you're open to it, feel free to drop your email or number; it's easier to exchange a few insights directly."

EXAMPLE 3 (CRAC/CCU hands-on at Tier IV):
"Hey Muhammad,

I have a personal rule on LinkedIn: if I'm connected with someone, I want it to be more than just a number in the network. Real connections create real value, and if there's ever an opportunity for either of us to support or benefit the other, I believe we should explore it.

So, by way of introduction, I'm Talha, and I run a company that delivers ozone based purification and disinfection solutions across air, water and food industry.

Given your hands on work with CRAC and close control units at a Tier IV facility, curious how water quality for the cooling loop gets handled in your day to day operations. I have been focused on water treatment for cooling systems, happy to share what we have been working on if it is useful."

KEY OBSERVATIONS FROM THESE EXAMPLES:
- Always ends with a curious, technical question SPECIFIC to the prospect's work
- The personalized hook references concrete details from their profile (companies they worked at, facility type, region, specific tech)
- For strong-fit, explicitly invite phone/email exchange
- For weak-fit, end with soft "happy to share more"
- Length: 5–7 short paragraphs, never long walls of text`,

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

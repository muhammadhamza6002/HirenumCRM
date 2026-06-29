import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

const STAGES = [
  { value: "not_contacted", label: "Not Contacted" },
  { value: "dm_sent", label: "DM Sent" },
  { value: "replied", label: "Replied" },
  { value: "interested", label: "Interested" },
  { value: "converted", label: "Converted / Call Booked" },
  { value: "cold", label: "Cold" },
];

const SENTIMENTS = [
  { value: "", label: "—" },
  { value: "interested", label: "Interested" },
  { value: "neutral", label: "Neutral" },
  { value: "declined", label: "Declined" },
  { value: "referred", label: "Referred Elsewhere" },
];

const SOURCES = [
  { value: "outbound", label: "Outbound DM" },
  { value: "post_engagement", label: "Post Engagement" },
];

function stageColor(stage) {
  const map = {
    not_contacted: "bg-neutral-800 text-muted",
    dm_sent: "bg-teal/15 text-teal",
    replied: "bg-pink/15 text-pink",
    interested: "bg-teal/25 text-teal",
    converted: "bg-teal text-black font-bold",
    cold: "bg-neutral-900 text-neutral-500",
  };
  return map[stage] || "bg-neutral-800 text-muted";
}

function sentimentColor(s) {
  const map = {
    interested: "bg-teal/15 text-teal",
    neutral: "bg-neutral-800 text-muted",
    declined: "bg-pink/15 text-pink",
    referred: "bg-pink/10 text-pink",
  };
  return map[s] || "bg-neutral-900 text-neutral-500";
}

function computeScore({ industry, role }) {
  // simple rule-based score: tweak as needed
  let score = 0;
  const seniorTitles = ["founder", "ceo", "director", "manager", "head", "procurement", "plant"];
  const r = (role || "").toLowerCase();
  if (seniorTitles.some((t) => r.includes(t))) score += 50;
  if (industry && industry.trim() !== "") score += 30;
  score += 20; // base for being a real engaged/contacted person
  return Math.min(score, 100);
}

export default function ProfileDashboard() {
  const router = useRouter();
  const { profile: slug } = router.query;

  const [profile, setProfile] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState("");
  const [editedMessage, setEditedMessage] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [editingContact, setEditingContact] = useState(null);
  const [form, setForm] = useState({
    name: "",
    linkedin_url: "",
    company: "",
    role: "",
    industry: "",
    email: "",
    source: "outbound",
    comment_text: "",
    notes: "",
  });

  useEffect(() => {
    if (!slug) return;
    loadAll();
  }, [slug]);

  async function loadAll() {
    setLoading(true);
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("slug", slug)
      .single();
    setProfile(profileData);

    if (profileData) {
      const { data: contactsData } = await supabase
        .from("contacts")
        .select("*")
        .eq("profile_id", profileData.id)
        .order("created_at", { ascending: false });
      setContacts(contactsData || []);
    }
    setLoading(false);
  }

  async function addContact(e) {
    e.preventDefault();
    if (!profile) return;
    const score = computeScore(form);
    const { error } = await supabase.from("contacts").insert({
      profile_id: profile.id,
      ...form,
      email_source: form.email ? "manual" : null,
      score,
      stage: "not_contacted",
    });
    if (!error) {
      setForm({
        name: "",
        linkedin_url: "",
        company: "",
        role: "",
        industry: "",
        email: "",
        source: "outbound",
        comment_text: "",
        notes: "",
      });
      setShowForm(false);
      loadAll();
    } else {
      alert(error.message);
    }
  }

  async function runAI() {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    setAiError("");
    setAiResult(null);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileText: aiInput, clientSlug: slug }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error || "Something went wrong");
      } else {
        setAiResult(data);
        setEditedMessage(data.draft_message || "");
      }
    } catch (e) {
      setAiError(e.message);
    }
    setAiLoading(false);
  }

  async function saveAIContact(didSend) {
    if (!aiResult || !profile) return;
    const { error } = await supabase.from("contacts").insert({
      profile_id: profile.id,
      name: aiResult.name,
      company: aiResult.company,
      role: aiResult.role,
      industry: aiResult.industry,
      email: aiResult.email || null,
      email_source: aiResult.email ? "apollo" : null,
      source: "outbound",
      score: aiResult.score,
      draft_message: editedMessage,
      notes: `AI fit: ${aiResult.fit} — ${aiResult.fit_reason}`,
      stage: didSend ? "dm_sent" : "not_contacted",
    });
    if (error) {
      alert(error.message);
      return;
    }
    setAiInput("");
    setAiResult(null);
    setEditedMessage("");
    setShowAI(false);
    loadAll();
  }

  async function deleteContact(id) {
    if (!confirm("Delete this contact? This cannot be undone.")) return;
    const { error } = await supabase.from("contacts").delete().eq("id", id);
    if (error) alert(error.message);
    setOpenMenu(null);
    loadAll();
  }

  async function saveEditedContact() {
    if (!editingContact) return;
    const { id, ...fields } = editingContact;
    const { error } = await supabase
      .from("contacts")
      .update({ ...fields, updated_at: new Date() })
      .eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }
    setEditingContact(null);
    loadAll();
  }

  async function updateField(id, field, value) {
    await supabase.from("contacts").update({ [field]: value, updated_at: new Date() }).eq("id", id);
    loadAll();
  }

  const total = contacts.length;
  const byStage = STAGES.reduce((acc, s) => {
    acc[s.value] = contacts.filter((c) => c.stage === s.value).length;
    return acc;
  }, {});
  const engaged = contacts.filter((c) => c.source === "post_engagement").length;
  const highScore = contacts.filter((c) => c.score >= 70).length;

  if (loading) return <div className="p-10 text-muted">Loading…</div>;
  if (!profile)
    return (
      <div className="p-10">
        <p className="text-pink">Profile not found.</p>
        <Link href="/" className="text-teal underline">
          ← Back to profiles
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-bg-dark">
      <nav className="border-b border-border px-8 py-4 flex items-center justify-between sticky top-0 bg-bg-dark/90 backdrop-blur z-30">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-extrabold tracking-tight">
            <span className="text-teal">hirenum</span><span className="text-pink">.</span>
            <span className="text-muted text-sm ml-2 font-medium">CRM</span>
          </Link>
          <Link href="/" className="text-xs text-muted hover:text-teal transition uppercase tracking-wider font-semibold">
            ← All profiles
          </Link>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setShowAI((s) => !s); setShowForm(false); }}
            className="bg-pink hover:bg-pink-hover text-white rounded-pill px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition hover:shadow-pink-glow"
          >
            {showAI ? "Close AI" : "AI Assistant"}
          </button>
          <button
            onClick={() => { setShowForm((s) => !s); setShowAI(false); }}
            className="bg-teal hover:bg-teal-hover text-black rounded-pill px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition"
          >
            {showForm ? "Cancel" : "+ Add Contact"}
          </button>
        </div>
      </nav>

      <div className="px-8 py-10 max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-ink mb-10 tracking-tight">
          {profile.name}<span className="text-pink">.</span>
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-10">
          <StatCard label="Total" value={total} />
          <StatCard label="From Engagement" value={engaged} />
          <StatCard label="DM Sent" value={byStage.dm_sent} accent="teal" />
          <StatCard label="Replied" value={byStage.replied} accent="pink" />
          <StatCard label="Interested" value={byStage.interested} accent="teal" />
          <StatCard label="Converted" value={byStage.converted} accent="teal-strong" />
        </div>

      {showAI && (
        <div className="bg-bg-card border border-border rounded-card p-7 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-pink" />
          <div className="flex items-center gap-3 mb-1">
            <span className="text-pink text-2xl">⚡</span>
            <h2 className="text-2xl font-extrabold text-ink uppercase tracking-tight">
              AI Assistant<span className="text-pink">.</span>
            </h2>
          </div>
          <p className="text-xs text-muted mb-5 ml-9">
            Paste a LinkedIn profile (name, role, company, about, recent activity, Apollo email — whatever you copied). I'll score the fit and draft a DM following <span className="text-teal font-semibold">{profile.name}</span>'s rules.
          </p>

          <textarea
            className="w-full rounded-card px-4 py-3 text-sm font-mono min-h-[160px] mb-4"
            placeholder="Paste LinkedIn profile text here..."
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
          />

          <div className="flex gap-3 mb-4">
            <button
              onClick={runAI}
              disabled={aiLoading || !aiInput.trim()}
              className="bg-pink hover:bg-pink-hover text-white rounded-pill px-6 py-3 text-xs font-bold uppercase tracking-wider transition disabled:opacity-40 hover:shadow-pink-glow"
            >
              {aiLoading ? "Analyzing…" : "Validate & Draft →"}
            </button>
            {aiResult && (
              <button
                onClick={() => { setAiResult(null); setAiInput(""); setEditedMessage(""); }}
                className="text-xs text-muted px-3 hover:text-pink uppercase tracking-wider font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          {aiError && (
            <div className="bg-pink/10 border border-pink/30 text-pink rounded-card p-4 text-sm mb-4">
              {aiError}
            </div>
          )}

          {aiResult && (
            <div className="border-t border-border pt-5 mt-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                <ResultField label="Name" value={aiResult.name} />
                <ResultField label="Company" value={aiResult.company} />
                <ResultField label="Role" value={aiResult.role} />
                <ResultField label="Industry" value={aiResult.industry} />
                <div className="col-span-2 md:col-span-4">
                  <div className="text-[10px] text-muted uppercase tracking-widest font-semibold mb-1 flex items-center gap-2">
                    Email
                    {aiResult.email && <span className="inline-block px-2 py-0.5 rounded-pill text-[10px] font-bold text-black" style={{ backgroundColor: "#FBFF3A" }}>APOLLO</span>}
                  </div>
                  <div className="text-sm font-medium text-ink">{aiResult.email || <span className="text-muted">— (none found in pasted text)</span>}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <span className={`px-3 py-1.5 rounded-pill text-[10px] font-bold uppercase tracking-wider ${
                  aiResult.fit === "strong" ? "bg-teal text-black" :
                  aiResult.fit === "weak" ? "bg-pink/20 text-pink" :
                  "bg-neutral-800 text-muted"
                }`}>
                  {aiResult.fit?.toUpperCase()} FIT
                </span>
                <span className="text-sm text-muted">Score: <span className="text-teal font-bold text-lg">{aiResult.score}</span></span>
                <span className="text-xs text-muted italic">{aiResult.fit_reason}</span>
              </div>

              <div className="mb-4">
                <label className="text-[10px] text-muted uppercase tracking-widest font-semibold block mb-2">Draft Message (edit before sending)</label>
                <textarea
                  className="w-full rounded-card px-4 py-3 text-sm min-h-[180px]"
                  value={editedMessage}
                  onChange={(e) => setEditedMessage(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => saveAIContact(true)}
                  className="bg-teal hover:bg-teal-hover text-black rounded-pill px-5 py-3 text-xs font-bold uppercase tracking-wider transition hover:shadow-teal-glow"
                >
                  I sent the DM → Save as DM Sent
                </button>
                <button
                  onClick={() => saveAIContact(false)}
                  className="border border-border text-muted rounded-pill px-5 py-3 text-xs font-bold uppercase tracking-wider hover:border-muted hover:text-ink transition"
                >
                  Save without sending
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={addContact}
          className="bg-bg-card border border-border rounded-card p-7 mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-teal" />
          <h2 className="text-2xl font-extrabold text-ink uppercase tracking-tight mb-5">
            Add Contact<span className="text-teal">.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <Input label="LinkedIn URL" value={form.linkedin_url} onChange={(v) => setForm({ ...form, linkedin_url: v })} />
            <Input label="Company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
            <Input label="Role / Title" value={form.role} onChange={(v) => setForm({ ...form, role: v })} />
            <Input label="Industry" value={form.industry} onChange={(v) => setForm({ ...form, industry: v })} />
            <Input label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <div>
              <label className="text-[10px] text-muted uppercase tracking-widest font-semibold block mb-2">Source</label>
              <select className="w-full rounded-card px-4 py-2.5 text-sm" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                {SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] text-muted uppercase tracking-widest font-semibold block mb-2">Comment text (if from post engagement)</label>
              <input className="w-full rounded-card px-4 py-2.5 text-sm" value={form.comment_text} onChange={(e) => setForm({ ...form, comment_text: e.target.value })} />
            </div>
            <div className="md:col-span-3 flex justify-end mt-2">
              <button type="submit" className="bg-teal hover:bg-teal-hover text-black rounded-pill px-6 py-3 text-xs font-bold uppercase tracking-wider transition hover:shadow-teal-glow">
                Save Contact →
              </button>
            </div>
          </div>
        </form>
      )}

      {openMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
          <div
            className="fixed z-50 bg-bg-card border border-border rounded-card shadow-2xl py-1 w-36"
            style={{ top: menuPos.top, left: menuPos.left }}
          >
            <button
              onClick={() => {
                const c = contacts.find((x) => x.id === openMenu);
                if (c) setEditingContact({ ...c });
                setOpenMenu(null);
              }}
              className="block w-full text-left px-4 py-2.5 text-xs text-muted hover:text-teal hover:bg-bg-hover uppercase tracking-wider font-semibold transition"
            >
              Edit
            </button>
            <button
              onClick={() => deleteContact(openMenu)}
              className="block w-full text-left px-4 py-2.5 text-xs text-pink hover:bg-pink/10 uppercase tracking-wider font-semibold transition"
            >
              Delete
            </button>
          </div>
        </>
      )}

      {editingContact && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4" onClick={() => setEditingContact(null)}>
          <div className="bg-bg-card border border-border rounded-card p-7 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-extrabold text-ink uppercase tracking-tight mb-6">
              Edit Contact<span className="text-teal">.</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input label="Name" value={editingContact.name || ""} onChange={(v) => setEditingContact({ ...editingContact, name: v })} />
              <Input label="LinkedIn URL" value={editingContact.linkedin_url || ""} onChange={(v) => setEditingContact({ ...editingContact, linkedin_url: v })} />
              <Input label="Company" value={editingContact.company || ""} onChange={(v) => setEditingContact({ ...editingContact, company: v })} />
              <Input label="Role" value={editingContact.role || ""} onChange={(v) => setEditingContact({ ...editingContact, role: v })} />
              <Input label="Industry" value={editingContact.industry || ""} onChange={(v) => setEditingContact({ ...editingContact, industry: v })} />
              <Input label="Email" value={editingContact.email || ""} onChange={(v) => setEditingContact({ ...editingContact, email: v })} />
              <div>
                <label className="text-[10px] text-muted uppercase tracking-widest font-semibold block mb-2">Email Source</label>
                <select className="w-full rounded-card px-4 py-2.5 text-sm"
                  value={editingContact.email_source || ""}
                  onChange={(e) => setEditingContact({ ...editingContact, email_source: e.target.value || null })}>
                  <option value="">— (no email)</option>
                  <option value="apollo">Apollo</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-muted uppercase tracking-widest font-semibold block mb-2">Score</label>
                <input type="number" min="0" max="100" className="w-full rounded-card px-4 py-2.5 text-sm"
                  value={editingContact.score || 0}
                  onChange={(e) => setEditingContact({ ...editingContact, score: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="text-[10px] text-muted uppercase tracking-widest font-semibold block mb-2">Source</label>
                <select className="w-full rounded-card px-4 py-2.5 text-sm"
                  value={editingContact.source || "outbound"}
                  onChange={(e) => setEditingContact({ ...editingContact, source: e.target.value })}>
                  {SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-muted uppercase tracking-widest font-semibold block mb-2">Stage</label>
                <select className="w-full rounded-card px-4 py-2.5 text-sm"
                  value={editingContact.stage || "not_contacted"}
                  onChange={(e) => setEditingContact({ ...editingContact, stage: e.target.value })}>
                  {STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-[10px] text-muted uppercase tracking-widest font-semibold block mb-2">Draft Message</label>
              <textarea className="w-full rounded-card px-4 py-2.5 text-sm min-h-[140px]"
                value={editingContact.draft_message || ""}
                onChange={(e) => setEditingContact({ ...editingContact, draft_message: e.target.value })} />
            </div>
            <div className="mb-6">
              <label className="text-[10px] text-muted uppercase tracking-widest font-semibold block mb-2">Notes</label>
              <textarea className="w-full rounded-card px-4 py-2.5 text-sm min-h-[80px]"
                value={editingContact.notes || ""}
                onChange={(e) => setEditingContact({ ...editingContact, notes: e.target.value })} />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditingContact(null)} className="px-5 py-2.5 text-xs rounded-pill text-muted hover:text-pink uppercase tracking-wider font-bold transition">Cancel</button>
              <button onClick={saveEditedContact} className="bg-teal hover:bg-teal-hover text-black px-6 py-2.5 rounded-pill text-xs font-bold uppercase tracking-wider transition hover:shadow-teal-glow">Save changes</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-bg-card border border-border rounded-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg-hover text-left">
            <tr>
              <th className="px-5 py-4 text-[10px] uppercase tracking-widest text-muted font-bold">Name</th>
              <th className="px-5 py-4 text-[10px] uppercase tracking-widest text-muted font-bold">Company</th>
              <th className="px-5 py-4 text-[10px] uppercase tracking-widest text-muted font-bold">Role</th>
              <th className="px-5 py-4 text-[10px] uppercase tracking-widest text-muted font-bold">Email</th>
              <th className="px-5 py-4 text-[10px] uppercase tracking-widest text-muted font-bold">Source</th>
              <th className="px-5 py-4 text-[10px] uppercase tracking-widest text-muted font-bold">Score</th>
              <th className="px-5 py-4 text-[10px] uppercase tracking-widest text-muted font-bold">Stage</th>
              <th className="px-5 py-4 text-[10px] uppercase tracking-widest text-muted font-bold">Sentiment</th>
              <th className="px-5 py-4 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id} className="border-t border-border hover:bg-bg-hover/40 transition">
                <td className="px-5 py-4">
                  <div className="font-bold text-ink">{c.name}</div>
                  {c.linkedin_url && (
                    <a href={c.linkedin_url} target="_blank" rel="noreferrer" className="text-[10px] text-teal hover:text-teal-hover uppercase tracking-wider font-semibold">
                      profile ↗
                    </a>
                  )}
                </td>
                <td className="px-5 py-4 text-ink font-medium">
                  {c.company || <span className="text-neutral-600">—</span>}
                </td>
                <td className="px-5 py-4 text-muted">
                  {c.role || <span className="text-neutral-600">—</span>}
                </td>
                <td className="px-5 py-4">
                  {c.email ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-ink">{c.email}</span>
                      {c.email_source === "apollo" && (
                        <span className="inline-block px-2 py-0.5 rounded-pill text-[10px] font-bold text-black" style={{ backgroundColor: "#FBFF3A" }}>APOLLO</span>
                      )}
                      {c.email_source === "manual" && (
                        <span className="inline-block px-2 py-0.5 rounded-pill text-[10px] font-bold bg-neutral-800 text-muted">MANUAL</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-neutral-600">—</span>
                  )}
                </td>
                <td className="px-5 py-4 text-muted text-xs uppercase tracking-wider">
                  {SOURCES.find((s) => s.value === c.source)?.label}
                </td>
                <td className="px-5 py-4">
                  <span className={`font-extrabold text-lg ${c.score >= 70 ? "text-teal" : c.score >= 40 ? "text-ink" : "text-muted"}`}>
                    {c.score}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <select
                    className={`rounded-pill px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border-none ${stageColor(c.stage)}`}
                    value={c.stage}
                    onChange={(e) => updateField(c.id, "stage", e.target.value)}
                  >
                    {STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </td>
                <td className="px-5 py-4">
                  <select
                    className={`rounded-pill px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border-none ${sentimentColor(c.sentiment)}`}
                    value={c.sentiment || ""}
                    onChange={(e) => updateField(c.id, "sentiment", e.target.value)}
                  >
                    {SENTIMENTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </td>
                <td className="px-5 py-4">
                  <button
                    onClick={(e) => {
                      if (openMenu === c.id) {
                        setOpenMenu(null);
                        return;
                      }
                      const rect = e.currentTarget.getBoundingClientRect();
                      const menuWidth = 144;
                      const menuHeight = 84;
                      const spaceBelow = window.innerHeight - rect.bottom;
                      const top = spaceBelow < menuHeight + 10 ? rect.top - menuHeight - 4 : rect.bottom + 4;
                      const left = Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8);
                      setMenuPos({ top, left });
                      setOpenMenu(c.id);
                    }}
                    className="text-muted hover:text-teal p-1.5 rounded-pill hover:bg-bg-hover transition"
                    aria-label="Actions"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <circle cx="3" cy="8" r="1.5" />
                      <circle cx="8" cy="8" r="1.5" />
                      <circle cx="13" cy="8" r="1.5" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr>
                <td colSpan={9} className="px-5 py-16 text-center text-muted text-sm">
                  No contacts yet. Add your first one above<span className="text-pink">.</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  const accentMap = {
    teal: "text-teal",
    pink: "text-pink",
    "teal-strong": "text-teal",
  };
  const borderMap = {
    "teal-strong": "border-teal/40 shadow-teal-glow",
  };
  return (
    <div className={`bg-bg-card border rounded-card px-5 py-4 ${borderMap[accent] || "border-border"}`}>
      <div className={`text-3xl font-extrabold ${accentMap[accent] || "text-ink"}`}>{value || 0}</div>
      <div className="text-[10px] text-muted uppercase tracking-widest font-semibold mt-1">{label}</div>
    </div>
  );
}

function ResultField({ label, value }) {
  return (
    <div>
      <div className="text-[10px] text-muted uppercase tracking-widest font-semibold mb-1">{label}</div>
      <div className="text-sm font-bold text-ink">{value || <span className="text-muted font-normal">—</span>}</div>
    </div>
  );
}

function Input({ label, value, onChange, required }) {
  return (
    <div>
      <label className="text-[10px] text-muted uppercase tracking-widest font-semibold block mb-2">{label}</label>
      <input
        className="w-full rounded-card px-4 py-2.5 text-sm"
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

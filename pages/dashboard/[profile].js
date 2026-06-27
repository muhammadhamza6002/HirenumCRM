import { useEffect, useState } from "react";
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
    not_contacted: "bg-slate-100 text-slate-600",
    dm_sent: "bg-blue-100 text-blue-700",
    replied: "bg-amber-100 text-amber-700",
    interested: "bg-purple-100 text-purple-700",
    converted: "bg-emerald-100 text-emerald-700",
    cold: "bg-rose-100 text-rose-700",
  };
  return map[stage] || "bg-slate-100 text-slate-600";
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
  const [form, setForm] = useState({
    name: "",
    linkedin_url: "",
    company: "",
    role: "",
    industry: "",
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
      score,
      stage: form.source === "post_engagement" ? "not_contacted" : "not_contacted",
    });
    if (!error) {
      setForm({
        name: "",
        linkedin_url: "",
        company: "",
        role: "",
        industry: "",
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

  if (loading) return <div className="p-10 text-slate-400">Loading…</div>;
  if (!profile)
    return (
      <div className="p-10">
        <p className="text-rose-500">Profile not found.</p>
        <Link href="/" className="text-accent underline">
          ← Back to profiles
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen px-6 py-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/" className="text-sm text-slate-400 hover:text-accent">
            ← All profiles
          </Link>
          <h1 className="text-2xl font-bold text-ink mt-1">{profile.name}</h1>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
        >
          {showForm ? "Cancel" : "+ Add Contact"}
        </button>
      </div>

      {/* Funnel stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">
        <StatCard label="Total" value={total} />
        <StatCard label="From Engagement" value={engaged} />
        <StatCard label="DM Sent" value={byStage.dm_sent} />
        <StatCard label="Replied" value={byStage.replied} />
        <StatCard label="Interested" value={byStage.interested} />
        <StatCard label="Converted" value={byStage.converted} />
      </div>

      {showForm && (
        <form
          onSubmit={addContact}
          className="bg-white border border-slate-200 rounded-xl p-5 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Input label="Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <Input
            label="LinkedIn URL"
            value={form.linkedin_url}
            onChange={(v) => setForm({ ...form, linkedin_url: v })}
          />
          <Input label="Company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
          <Input label="Role / Title" value={form.role} onChange={(v) => setForm({ ...form, role: v })} />
          <Input label="Industry" value={form.industry} onChange={(v) => setForm({ ...form, industry: v })} />
          <div>
            <label className="text-xs text-slate-500 block mb-1">Source</label>
            <select
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
            >
              {SOURCES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-slate-500 block mb-1">Comment text (if from post engagement)</label>
            <input
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              value={form.comment_text}
              onChange={(e) => setForm({ ...form, comment_text: e.target.value })}
            />
          </div>
          <div className="md:col-span-1 flex items-end">
            <button type="submit" className="bg-ink text-white rounded-lg px-4 py-2 text-sm w-full">
              Save Contact
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Company / Role</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Sentiment</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id} className="border-t border-slate-100">
                <td className="px-4 py-3">
                  <div className="font-medium text-ink">{c.name}</div>
                  {c.linkedin_url && (
                    <a
                      href={c.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-accent underline"
                    >
                      profile
                    </a>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {c.company || "—"} {c.role ? `· ${c.role}` : ""}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {SOURCES.find((s) => s.value === c.source)?.label}
                </td>
                <td className="px-4 py-3">
                  <span className="font-semibold">{c.score}</span>
                </td>
                <td className="px-4 py-3">
                  <select
                    className={`rounded-full px-2 py-1 text-xs font-medium border-none ${stageColor(c.stage)}`}
                    value={c.stage}
                    onChange={(e) => updateField(c.id, "stage", e.target.value)}
                  >
                    {STAGES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select
                    className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                    value={c.sentiment || ""}
                    onChange={(e) => updateField(c.id, "sentiment", e.target.value)}
                  >
                    {SENTIMENTS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No contacts yet. Add your first one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
      <div className="text-2xl font-bold text-ink">{value || 0}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}

function Input({ label, value, onChange, required }) {
  return (
    <div>
      <label className="text-xs text-slate-500 block mb-1">{label}</label>
      <input
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

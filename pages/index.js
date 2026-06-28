import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const router = useRouter();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  function signOut() {
    sessionStorage.removeItem("pulse_auth");
    router.push("/login");
  }

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: true });
      if (!error) setProfiles(data || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="flex items-center justify-between w-full max-w-md mb-2">
        <h1 className="text-3xl font-bold text-ink">Pulse</h1>
        <button onClick={signOut} className="text-xs text-slate-400 hover:text-rose-500 transition">
          Sign out
        </button>
      </div>
      <p className="text-slate-500 mb-10">Select a profile to open its dashboard</p>

      {loading && <p className="text-slate-400">Loading profiles…</p>}

      <div className="grid gap-4 w-full max-w-md">
        {profiles.map((p) => (
          <Link
            key={p.id}
            href={`/dashboard/${p.slug}`}
            className="block rounded-xl border border-slate-200 bg-white px-6 py-5 shadow-sm hover:shadow-md hover:border-accent transition"
          >
            <div className="text-lg font-semibold text-ink">{p.name}</div>
            <div className="text-sm text-slate-400">Open dashboard →</div>
          </Link>
        ))}
        {!loading && profiles.length === 0 && (
          <p className="text-slate-400 text-sm text-center">
            No profiles found. Run supabase_schema.sql in your Supabase project first.
          </p>
        )}
      </div>
    </div>
  );
}

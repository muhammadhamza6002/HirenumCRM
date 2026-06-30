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
    <div className="min-h-screen flex flex-col bg-bg-dark relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-teal/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-pink/5 blur-3xl pointer-events-none" />

      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-border">
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-teal">hirenum</span>
          <span className="text-pink">.</span>
          <span className="text-ink ml-2 text-base font-medium text-muted">CRM</span>
        </h1>
        <button
          onClick={signOut}
          className="text-xs text-muted hover:text-pink transition uppercase tracking-wider font-semibold"
        >
          Sign out
        </button>
      </nav>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="text-center mb-14 max-w-3xl">
          <h2 className="text-5xl md:text-6xl font-extrabold uppercase tracking-tight leading-tight text-ink">
            Who are we building <span className="text-teal">for</span> today<span className="text-pink">.</span>
          </h2>
          <p className="text-muted text-base mt-5">
            Select a profile to open its outreach dashboard.
          </p>
        </div>

        {loading && (
          <div className="grid gap-5 w-full max-w-2xl">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-bg-card rounded-card border border-border animate-pulse" />
            ))}
          </div>
        )}

        <div className="grid gap-5 w-full max-w-2xl">
          {profiles.map((p, idx) => (
            <Link
              key={p.id}
              href={`/dashboard/${p.slug}`}
              className="group block bg-bg-card hover:bg-bg-hover border border-border hover:border-teal rounded-card px-7 py-6 transition-all hover:shadow-teal-glow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted mb-1 font-semibold">
                    Profile {String(idx + 1).padStart(2, "0")}
                  </div>
                  <div className="text-2xl font-extrabold text-ink">
                    {p.name}
                    <span className="text-pink">.</span>
                  </div>
                </div>
                <div className="text-teal text-2xl transition-transform group-hover:translate-x-1">→</div>
              </div>
            </Link>
          ))}
          {!loading && profiles.length === 0 && (
            <p className="text-muted text-sm text-center py-10">
              No profiles found. Run supabase_schema.sql in your Supabase project first.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

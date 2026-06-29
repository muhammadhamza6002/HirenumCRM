import { useEffect, useState } from "react";

export default function Layout({ children }) {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setShowTop(window.scrollY > 320);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {children}

      <footer className="relative border-t border-border mt-20 px-8 pt-16 pb-8 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 relative z-10">
          <div>
            <div className="text-[10px] text-muted uppercase tracking-widest font-bold mb-4">
              Workspace
            </div>
            <ul className="flex flex-col gap-2 text-sm text-muted">
              <li><a href="/" className="hover:text-teal transition">Profiles</a></li>
              <li><a href="/dashboard/hirenum" className="hover:text-teal transition">Hirenum</a></li>
              <li><a href="/dashboard/talha" className="hover:text-teal transition">Talha Saleem</a></li>
              <li><a href="/dashboard/abdul-moez" className="hover:text-teal transition">Abdul Moez Habib</a></li>
            </ul>
          </div>
          <div>
            <div className="text-[10px] text-muted uppercase tracking-widest font-bold mb-4">
              Tools
            </div>
            <ul className="flex flex-col gap-2 text-sm text-muted">
              <li>AI Assistant</li>
              <li>Apollo Email Capture</li>
              <li>Pipeline Stages</li>
            </ul>
          </div>
          <div>
            <div className="text-[10px] text-muted uppercase tracking-widest font-bold mb-4">
              Resources
            </div>
            <ul className="flex flex-col gap-2 text-sm text-muted">
              <li><a href="https://hirenum.com" target="_blank" rel="noreferrer" className="hover:text-teal transition">hirenum.com ↗</a></li>
              <li><a href="https://github.com/muhammadhamza6002/HirenumCRM" target="_blank" rel="noreferrer" className="hover:text-teal transition">GitHub ↗</a></li>
            </ul>
          </div>
          <div>
            <div className="text-[10px] text-muted uppercase tracking-widest font-bold mb-4">
              Contact
            </div>
            <p className="text-sm text-ink font-medium">hello@hirenum.com</p>
            <p className="text-xs text-muted mt-3">©2026 All Rights Reserved<br />by Hirenum<span className="text-pink">.</span></p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-20 select-none pointer-events-none">
          <h2 className="text-[clamp(4rem,18vw,18rem)] font-extrabold leading-none tracking-tighter text-center bg-gradient-to-b from-neutral-700 to-bg-dark bg-clip-text text-transparent">
            HIRENUM
          </h2>
        </div>
      </footer>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-6 right-6 z-50 bg-pink hover:bg-pink-hover text-white rounded-pill pl-4 pr-5 py-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-pink-glow ${
          showTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        aria-label="Back to top"
      >
        <span className="text-base leading-none">⚡</span> Back to top
      </button>
    </>
  );
}

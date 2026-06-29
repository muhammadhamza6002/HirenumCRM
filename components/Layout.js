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

      <footer className="relative border-t border-border mt-20 px-8 pt-10 pb-8 overflow-hidden">
        <div className="max-w-7xl mx-auto select-none pointer-events-none">
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

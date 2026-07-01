import Link from "next/link";
import { useState } from "react";

const BOOKMARKLET = `javascript:(function(){var u=window.location.href;var t=document.body.innerText;var c=u+"\\n\\n"+t;navigator.clipboard.writeText(c).then(function(){alert("\\u2713 Profile copied for Hirenum CRM.\\n\\nSwitch to the CRM and paste into the AI Assistant.")}).catch(function(e){var ta=document.createElement("textarea");ta.value=c;document.body.appendChild(ta);ta.select();document.execCommand("copy");document.body.removeChild(ta);alert("\\u2713 Profile copied for Hirenum CRM.\\n\\nSwitch to the CRM and paste into the AI Assistant.")})})();`;

export default function Tools() {
  const [copied, setCopied] = useState(false);

  function copyBookmarklet() {
    navigator.clipboard.writeText(BOOKMARKLET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-bg-dark">
      <nav className="border-b border-border px-8 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-extrabold tracking-tight">
          <span className="text-teal">hirenum</span><span className="text-pink">.</span>
          <span className="text-muted text-sm ml-2 font-medium">CRM</span>
        </Link>
        <Link href="/" className="text-xs text-muted hover:text-teal transition uppercase tracking-wider font-semibold">
          ← Back
        </Link>
      </nav>

      <div className="px-6 py-14 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-ink mb-3 tracking-tight uppercase">
          Auto-Capture Profiles<span className="text-teal">.</span>
        </h1>
        <p className="text-muted text-sm mb-10">
          One-time setup. After this, capturing any LinkedIn profile takes one click.
        </p>

        <div className="bg-bg-card border border-border rounded-card p-7 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-teal text-black rounded-pill w-7 h-7 flex items-center justify-center text-xs font-extrabold">1</span>
            <h2 className="text-xl font-extrabold text-ink uppercase tracking-tight">Show your bookmarks bar</h2>
          </div>
          <p className="text-muted text-sm ml-10">
            In your browser press <kbd className="bg-neutral-800 text-teal px-2 py-0.5 rounded text-xs font-mono">Ctrl + Shift + B</kbd> (Windows) or <kbd className="bg-neutral-800 text-teal px-2 py-0.5 rounded text-xs font-mono">Cmd + Shift + B</kbd> (Mac) to show the bookmarks bar.
          </p>
        </div>

        <div className="bg-bg-card border border-border rounded-card p-7 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-teal text-black rounded-pill w-7 h-7 flex items-center justify-center text-xs font-extrabold">2</span>
            <h2 className="text-xl font-extrabold text-ink uppercase tracking-tight">Drag the button to your bookmarks bar</h2>
          </div>
          <div className="ml-10">
            <p className="text-muted text-sm mb-4">
              Grab the pink button below and drop it onto your bookmarks bar. That's it — the tool is installed.
            </p>
            <a
              href={BOOKMARKLET}
              onClick={(e) => e.preventDefault()}
              draggable="true"
              className="inline-block bg-pink hover:bg-pink-hover text-white rounded-pill px-6 py-3 text-sm font-bold uppercase tracking-wider transition hover:shadow-pink-glow cursor-move select-none"
            >
              ⚡ Send to Hirenum CRM
            </a>
            <p className="text-[10px] text-muted mt-3 uppercase tracking-widest font-semibold">
              ↑ Drag this button, don't click it
            </p>
          </div>
        </div>

        <div className="bg-bg-card border border-border rounded-card p-7 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-teal text-black rounded-pill w-7 h-7 flex items-center justify-center text-xs font-extrabold">3</span>
            <h2 className="text-xl font-extrabold text-ink uppercase tracking-tight">Use it</h2>
          </div>
          <ol className="text-muted text-sm ml-10 space-y-2 list-decimal list-inside">
            <li>Open any LinkedIn profile</li>
            <li>Click <span className="text-pink font-bold">⚡ Send to Hirenum CRM</span> in your bookmarks bar</li>
            <li>The full profile text plus the URL is copied to your clipboard</li>
            <li>Switch to the CRM, open <span className="text-teal font-bold">AI Assistant</span>, paste (<kbd className="bg-neutral-800 text-teal px-1.5 py-0.5 rounded text-xs font-mono">Ctrl + V</kbd>) — done</li>
          </ol>
        </div>

        <div className="bg-bg-card border border-border rounded-card p-7">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-neutral-800 text-muted rounded-pill w-7 h-7 flex items-center justify-center text-xs font-extrabold">·</span>
            <h2 className="text-lg font-extrabold text-muted uppercase tracking-tight">Can't drag? Copy the code instead</h2>
          </div>
          <div className="ml-10">
            <p className="text-muted text-xs mb-3">
              Right-click your bookmarks bar → Add page → paste the code below as the URL, and name it "Send to Hirenum CRM".
            </p>
            <button
              onClick={copyBookmarklet}
              className="bg-teal hover:bg-teal-hover text-black rounded-pill px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition"
            >
              {copied ? "✓ Copied" : "Copy bookmarklet code"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

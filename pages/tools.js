import Link from "next/link";
import { useState } from "react";

const BOOKMARKLET = `javascript:(function(){var u=window.location.href;var t=document.body.innerText;var html=document.documentElement.outerHTML;var re=/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g;var raw=html.match(re)||[];var seen={};var emails=[];raw.forEach(function(e){var el=e.toLowerCase();if(el.indexOf("linkedin.com")>-1||el.indexOf("noreply")>-1||el.indexOf("no-reply")>-1||el.indexOf("example.com")>-1||el.indexOf("@sentry")>-1)return;if(!seen[el]){seen[el]=1;emails.push(e);}});var eb=emails.length?"\\n\\nEMAILS FOUND: "+emails.join(", ")+"\\n":"";var c=u+eb+"\\n\\n"+t;var msg="\\u2713 Copied "+emails.length+" email"+(emails.length===1?"":"s")+" and full profile.\\n\\nPaste into the CRM AI Assistant.";navigator.clipboard.writeText(c).then(function(){alert(msg)}).catch(function(){var ta=document.createElement("textarea");ta.value=c;document.body.appendChild(ta);ta.select();document.execCommand("copy");document.body.removeChild(ta);alert(msg)})})();`;

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
        <p className="text-muted text-sm mb-3">
          One-time setup. After this, capturing any LinkedIn profile takes one click.
        </p>
        <div className="bg-teal/10 border border-teal/30 rounded-card p-4 text-xs text-muted mb-10">
          <span className="text-teal font-bold uppercase tracking-wider">Reliable path:</span> if you already tried dragging and it opened the CRM login page — that's Chrome blocking <span className="font-mono">javascript:</span> URLs from being dragged. Delete that bookmark and follow the steps below, which install it manually and always work.
        </div>

        <div className="bg-bg-card border border-border rounded-card p-7 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-teal text-black rounded-pill w-7 h-7 flex items-center justify-center text-xs font-extrabold">1</span>
            <h2 className="text-xl font-extrabold text-ink uppercase tracking-tight">Copy the code</h2>
          </div>
          <div className="ml-10">
            <p className="text-muted text-sm mb-4">
              Click the button below to copy the bookmarklet code to your clipboard.
            </p>
            <button
              onClick={copyBookmarklet}
              className="bg-teal hover:bg-teal-hover text-black rounded-pill px-6 py-3 text-xs font-bold uppercase tracking-wider transition hover:shadow-teal-glow"
            >
              {copied ? "✓ Code copied to clipboard" : "Copy bookmarklet code"}
            </button>
          </div>
        </div>

        <div className="bg-bg-card border border-border rounded-card p-7 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-teal text-black rounded-pill w-7 h-7 flex items-center justify-center text-xs font-extrabold">2</span>
            <h2 className="text-xl font-extrabold text-ink uppercase tracking-tight">Show your bookmarks bar</h2>
          </div>
          <p className="text-muted text-sm ml-10">
            In your browser press <kbd className="bg-neutral-800 text-teal px-2 py-0.5 rounded text-xs font-mono">Ctrl + Shift + B</kbd> (Windows) or <kbd className="bg-neutral-800 text-teal px-2 py-0.5 rounded text-xs font-mono">Cmd + Shift + B</kbd> (Mac) to reveal the bookmarks bar.
          </p>
        </div>

        <div className="bg-bg-card border border-border rounded-card p-7 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-teal text-black rounded-pill w-7 h-7 flex items-center justify-center text-xs font-extrabold">3</span>
            <h2 className="text-xl font-extrabold text-ink uppercase tracking-tight">Add a new bookmark manually</h2>
          </div>
          <ol className="text-muted text-sm ml-10 space-y-2 list-decimal list-inside mb-5">
            <li><span className="text-ink font-semibold">Right-click</span> anywhere on the bookmarks bar</li>
            <li>Click <span className="text-teal font-bold">"Add page…"</span> (Chrome/Edge) or <span className="text-teal font-bold">"Add Bookmark"</span> (Firefox/Safari)</li>
            <li>In the <span className="text-ink font-semibold">Name</span> field type: <span className="font-mono bg-neutral-800 text-teal px-2 py-0.5 rounded">⚡ Send to Pulse CRM</span></li>
            <li>In the <span className="text-ink font-semibold">URL</span> field paste (Ctrl+V) the code you copied in Step 1</li>
            <li>Click <span className="text-teal font-bold">Save</span></li>
          </ol>
          <div className="ml-10 bg-pink/10 border border-pink/30 rounded-card p-4 text-xs text-muted">
            <span className="text-pink font-bold uppercase tracking-wider">Important:</span> the URL field must start with <span className="font-mono text-ink">javascript:</span> — if your browser strips that prefix when you paste, click into the URL field, put the cursor at the start, and re-paste. The copy button above copies the full string including <span className="font-mono">javascript:</span>.
          </div>
        </div>

        <div className="bg-bg-card border border-border rounded-card p-7 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-pink text-white rounded-pill w-7 h-7 flex items-center justify-center text-xs font-extrabold">✓</span>
            <h2 className="text-xl font-extrabold text-ink uppercase tracking-tight">How to use it</h2>
          </div>
          <ol className="text-muted text-sm ml-10 space-y-3 list-decimal list-inside">
            <li>Open any LinkedIn profile</li>
            <li>
              <span className="text-ink font-semibold">Click the Apollo extension</span> to reveal their email on the page (if available). Wait for the email to appear.
            </li>
            <li>Click <span className="text-pink font-bold">⚡ Send to Pulse CRM</span> in your bookmarks bar</li>
            <li>A popup confirms: "Copied N emails and full profile"</li>
            <li>Switch to the CRM → open <span className="text-teal font-bold">AI Assistant</span> → paste (<kbd className="bg-neutral-800 text-teal px-1.5 py-0.5 rounded text-xs font-mono">Ctrl + V</kbd>) → Validate & Draft</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

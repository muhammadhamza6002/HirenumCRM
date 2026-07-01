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
              ⚡ Send to Pulse CRM
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
          <ol className="text-muted text-sm ml-10 space-y-3 list-decimal list-inside">
            <li>Open any LinkedIn profile</li>
            <li>
              <span className="text-ink font-semibold">Click the Apollo extension first</span> to reveal their email on the page (if available). Wait for the email to appear.
            </li>
            <li>Now click <span className="text-pink font-bold">⚡ Send to Pulse CRM</span> in your bookmarks bar</li>
            <li>A popup confirms: "Copied N emails and full profile" — everything is on your clipboard</li>
            <li>Switch to the CRM, open <span className="text-teal font-bold">AI Assistant</span>, paste (<kbd className="bg-neutral-800 text-teal px-1.5 py-0.5 rounded text-xs font-mono">Ctrl + V</kbd>) — done</li>
          </ol>

          <div className="ml-10 mt-5 bg-teal/10 border border-teal/30 rounded-card p-4 text-xs text-muted">
            <span className="text-teal font-bold uppercase tracking-wider">Tip:</span> the bookmarklet scans the entire page for email patterns, so any email Apollo has revealed (visible or in hidden containers) will be caught. If Apollo shows nothing, the tool still copies the profile — you just save without an email.
          </div>
        </div>

        <div className="bg-bg-card border border-border rounded-card p-7">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-neutral-800 text-muted rounded-pill w-7 h-7 flex items-center justify-center text-xs font-extrabold">·</span>
            <h2 className="text-lg font-extrabold text-muted uppercase tracking-tight">Can't drag? Copy the code instead</h2>
          </div>
          <div className="ml-10">
            <p className="text-muted text-xs mb-3">
              Right-click your bookmarks bar → Add page → paste the code below as the URL, and name it "Send to Pulse CRM".
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

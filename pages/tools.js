import Link from "next/link";
import { useState } from "react";

const BOOKMARKLET = `javascript:(function(){var u=window.location.href;var t=document.body.innerText;var re=/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g;var seen={};var emails=[];function add(s){if(!s)return;var m=String(s).match(re);if(!m)return;m.forEach(function(e){var el=e.toLowerCase();if(el.indexOf("linkedin.com")>-1||el.indexOf("noreply")>-1||el.indexOf("no-reply")>-1||el.indexOf("example.com")>-1||el.indexOf("sentry")>-1||el.indexOf("bugsnag")>-1||el.indexOf("wixpress")>-1||el.indexOf("sentry.io")>-1)return;if(!seen[el]){seen[el]=1;emails.push(e);}})}function walk(n){if(!n)return;try{if(n.nodeType===3){add(n.textContent);}if(n.attributes){for(var i=0;i<n.attributes.length;i++){add(n.attributes[i].value);}}if(n.shadowRoot){walk(n.shadowRoot);}if(n.tagName==="IFRAME"){try{if(n.contentDocument){walk(n.contentDocument);}}catch(e){}}var kids=n.childNodes||[];for(var j=0;j<kids.length;j++){walk(kids[j]);}}catch(e){}}walk(document);add(document.documentElement.outerHTML);var eb=emails.length?"\\n\\nEMAILS FOUND: "+emails.join(", ")+"\\n":"";var c=u+eb+"\\n\\n"+t;var msg=emails.length>0?("\\u2713 Copied "+emails.length+" email"+(emails.length===1?"":"s")+" and full profile.\\n\\nPaste into the CRM AI Assistant."):"\\u26A0 No email found on page.\\n\\nProfile copied without email. If Apollo shows an email, click it to fully reveal (not just hover) then run this again.";navigator.clipboard.writeText(c).then(function(){alert(msg)}).catch(function(){var ta=document.createElement("textarea");ta.value=c;document.body.appendChild(ta);ta.select();document.execCommand("copy");document.body.removeChild(ta);alert(msg)})})();`;

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
        <div className="bg-pink/10 border border-pink/30 rounded-card p-4 text-xs text-muted mb-10">
          <span className="text-pink font-bold uppercase tracking-wider">Update:</span> the bookmarklet was upgraded to scan Shadow DOM + iframes for Apollo emails. If you installed it earlier, <span className="text-ink font-semibold">delete the old bookmark and drag the new one below</span>.
        </div>

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
            <span className="text-teal font-bold uppercase tracking-wider">Tip:</span> the bookmarklet scans regular DOM, Shadow DOM, and same-origin iframes for email patterns. It filters out LinkedIn system emails and common noise automatically.
          </div>
        </div>

        <div className="bg-bg-card border border-border rounded-card p-7 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-pink text-white rounded-pill w-7 h-7 flex items-center justify-center text-xs font-extrabold">!</span>
            <h2 className="text-xl font-extrabold text-ink uppercase tracking-tight">Apollo email not being caught?</h2>
          </div>
          <ul className="text-muted text-sm ml-10 space-y-3">
            <li>
              <span className="text-ink font-semibold">Click the email in Apollo's panel to fully reveal it.</span> Hovering isn't enough — Apollo often keeps the plaintext hidden until you click. Look for "Access email" or a masked email like <span className="font-mono text-xs">j*****@company.com</span> and click to reveal the real one.
            </li>
            <li>
              <span className="text-ink font-semibold">Wait until the email is visible on the page as text</span> before clicking ⚡ Send to Pulse CRM. If Apollo shows it in a tooltip that disappears when you move the mouse, keep the tooltip open or click into their contact card so the email persists.
            </li>
            <li>
              <span className="text-ink font-semibold">If Apollo just says "No email available",</span> there is nothing to capture — the tool will still copy the profile and warn you. Save the contact without an email; you can add it manually later via Edit.
            </li>
            <li>
              <span className="text-ink font-semibold">Cross-origin iframes</span> (rare) can't be read from the outside. If Apollo renders inside such an iframe, copy the email manually into the CRM Edit modal.
            </li>
          </ul>
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

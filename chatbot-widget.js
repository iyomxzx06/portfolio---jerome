/* Floating chat widget. Add to your portfolio with one line before </body>:
   <script src="chatbot-widget.js" defer></script>
   All styles are prefixed with "cbw-" so they will not clash with your portfolio CSS.
   Designed to match the dark + lime portfolio theme. */
(function () {
  // ---- Edit these ----
  const CONFIG = {
    name: "Jerome",
    greeting: "Hi! I'm Jerome's assistant. Ask me about his work, his services, or how to get in touch.",
    suggestions: ["What do you edit?", "Show me your services", "How can I contact Jerome?"],
    accent: "#c6f432",
    apiUrl: "/api/chat",
  };
  // --------------------

  const css = `
  .cbw, .cbw * { box-sizing: border-box; }
  .cbw { --a: ${CONFIG.accent}; --ink: #10120a; --bg: #0b0c0a; --panel: #151713; --line: #2a2d27; --text: #f3f4f0; --muted: #b9bdb1; position: fixed; right: 16px; bottom: calc(16px + env(safe-area-inset-bottom, 0px)); z-index: 350; font-family: "Segoe UI", system-ui, -apple-system, sans-serif; font-size: 15px; line-height: 1.45; }

  /* Launcher */
  .cbw-fab { position: relative; display: flex; align-items: center; gap: 10px; height: 56px; padding: 0 22px 0 18px; border: 0; border-radius: 999px; background: var(--a); color: var(--ink); font: inherit; font-weight: 800; cursor: pointer; box-shadow: 0 8px 28px rgba(0,0,0,.55), 0 0 34px rgba(198,244,50,.28); transition: transform .2s, box-shadow .25s; overflow: hidden; }
  .cbw-fab::after { content: ""; position: absolute; top: 0; left: -70%; width: 45%; height: 100%; background: linear-gradient(100deg, transparent, rgba(255,255,255,.55), transparent); transform: skewX(-20deg); transition: left .6s; }
  .cbw-fab:hover { transform: translateY(-3px); box-shadow: 0 12px 34px rgba(0,0,0,.6), 0 0 44px rgba(198,244,50,.4); }
  .cbw-fab:hover::after { left: 130%; }
  .cbw-fab svg { width: 24px; height: 24px; flex: none; }
  .cbw-fab-dot { position: absolute; top: 9px; right: 11px; width: 9px; height: 9px; border-radius: 50%; background: #ff4d3d; animation: cbw-blink 1.2s steps(2) infinite; }
  @keyframes cbw-blink { 50% { opacity: .2; } }
  @media (max-width: 480px) { .cbw-fab { width: 56px; padding: 0; justify-content: center; } .cbw-fab-label { display: none; } }

  /* Panel */
  .cbw-panel { position: absolute; right: 0; bottom: 70px; width: 360px; height: 500px; max-height: calc(100vh - 110px); display: flex; flex-direction: column; background: var(--panel); color: var(--text); border: 1px solid #3a4224; border-radius: 18px; overflow: hidden; box-shadow: 0 24px 70px rgba(0,0,0,.65), 0 0 80px rgba(198,244,50,.1); animation: cbw-pop .22s ease-out; }
  .cbw-panel[hidden] { display: none; }
  @keyframes cbw-pop { from { opacity: 0; transform: translateY(10px) scale(.98); } }

  .cbw-head { position: relative; display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 14px 16px; background: var(--panel); border-bottom: 1px solid var(--line); }
  .cbw-head::after { content: ""; position: absolute; left: 0; bottom: -1px; height: 2px; width: 64px; background: var(--a); box-shadow: 0 0 12px var(--a); }
  .cbw-who { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .cbw-avatar { flex: none; width: 38px; height: 38px; border-radius: 50%; background: var(--a); color: var(--ink); display: grid; place-items: center; font-family: "Arial Black", "Segoe UI", sans-serif; font-size: 1.05rem; }
  .cbw-title { font-family: "Arial Black", "Segoe UI", sans-serif; font-size: .95rem; letter-spacing: .01em; line-height: 1.15; }
  .cbw-status { display: flex; align-items: center; gap: 7px; margin-top: 3px; font: 700 .68rem/1 "Courier New", monospace; letter-spacing: .1em; text-transform: uppercase; color: var(--a); }
  .cbw-status i { width: 7px; height: 7px; border-radius: 50%; background: var(--a); box-shadow: 0 0 8px var(--a); }
  .cbw-close { flex: none; width: 36px; height: 36px; border: 1px solid var(--line); border-radius: 50%; background: var(--bg); color: var(--text); font-size: 20px; line-height: 1; cursor: pointer; transition: .2s; }
  .cbw-close:hover { background: var(--a); border-color: var(--a); color: var(--ink); }

  .cbw-msgs { flex: 1; overflow-y: auto; padding: 16px 14px; display: flex; flex-direction: column; gap: 9px; background: var(--bg); scrollbar-width: thin; scrollbar-color: var(--line) transparent; }
  .cbw-m { max-width: 85%; padding: 10px 14px; border-radius: 16px; white-space: pre-wrap; overflow-wrap: anywhere; animation: cbw-in .2s ease-out; }
  @keyframes cbw-in { from { opacity: 0; transform: translateY(6px); } }
  .cbw-bot { align-self: flex-start; background: var(--panel); border: 1px solid var(--line); border-bottom-left-radius: 4px; color: var(--text); }
  .cbw-user { align-self: flex-end; background: var(--a); color: var(--ink); font-weight: 600; border-bottom-right-radius: 4px; }
  .cbw-typing { display: inline-flex; gap: 5px; align-items: center; padding: 14px 16px; }
  .cbw-typing i { width: 7px; height: 7px; border-radius: 50%; background: var(--muted); animation: cbw-bounce 1s infinite ease-in-out; }
  .cbw-typing i:nth-child(2) { animation-delay: .15s; }
  .cbw-typing i:nth-child(3) { animation-delay: .3s; }
  @keyframes cbw-bounce { 0%, 80%, 100% { transform: translateY(0); opacity: .45; } 40% { transform: translateY(-5px); opacity: 1; } }

  .cbw-chips { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 2px; }
  .cbw-chip { border: 1px solid var(--line); background: rgba(255,255,255,.03); color: var(--muted); padding: 7px 13px; border-radius: 999px; font: inherit; font-size: .85rem; font-weight: 600; cursor: pointer; transition: .2s; }
  .cbw-chip:hover { border-color: var(--a); color: var(--a); }

  .cbw-form { display: flex; gap: 8px; padding: 12px; border-top: 1px solid var(--line); background: var(--panel); }
  .cbw-input { flex: 1; min-width: 0; padding: 11px 16px; border: 1px solid var(--line); border-radius: 999px; font: inherit; font-size: 16px; color: var(--text); background: var(--bg); transition: border-color .2s; }
  .cbw-input::placeholder { color: #7d8176; }
  .cbw-input:focus { outline: 0; border-color: var(--a); }
  .cbw-send { flex: none; width: 44px; height: 44px; border: 0; border-radius: 50%; background: var(--a); color: var(--ink); cursor: pointer; display: grid; place-items: center; transition: transform .2s, box-shadow .25s; }
  .cbw-send svg { width: 20px; height: 20px; }
  .cbw-send:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(198,244,50,.35); }
  .cbw-send:disabled { opacity: .45; cursor: wait; }

  .cbw button:focus-visible, .cbw input:focus-visible { outline: 2px solid var(--a); outline-offset: 2px; }

  @media (max-width: 480px) {
    .cbw-panel { position: fixed; left: 8px; right: 8px; width: auto; bottom: calc(84px + env(safe-area-inset-bottom, 0px)); height: min(72vh, 540px); }
  }
  @media (prefers-reduced-motion: reduce) { .cbw *, .cbw *::after { animation: none !important; transition: none !important; } }`;

  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  const root = document.createElement("div");
  root.className = "cbw";
  root.innerHTML = `
    <section class="cbw-panel" id="cbw-panel" role="dialog" aria-label="Chat assistant" hidden>
      <div class="cbw-head">
        <div class="cbw-who">
          <span class="cbw-avatar" aria-hidden="true"></span>
          <div><div class="cbw-title"></div><div class="cbw-status"><i></i>Online</div></div>
        </div>
        <button class="cbw-close" type="button" aria-label="Close chat">&times;</button>
      </div>
      <div class="cbw-msgs" aria-live="polite"></div>
      <form class="cbw-form">
        <input class="cbw-input" placeholder="Type your message..." autocomplete="off" aria-label="Your message" required>
        <button class="cbw-send" type="submit" aria-label="Send message">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/></svg>
        </button>
      </form>
    </section>
    <button class="cbw-fab" type="button" aria-label="Open chat" aria-expanded="false" aria-controls="cbw-panel">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>
      <span class="cbw-fab-label">Chat with me</span>
      <i class="cbw-fab-dot"></i>
    </button>`;
  document.body.appendChild(root);

  const panel = root.querySelector(".cbw-panel");
  const fab = root.querySelector(".cbw-fab");
  const closeBtn = root.querySelector(".cbw-close");
  const msgs = root.querySelector(".cbw-msgs");
  const form = root.querySelector(".cbw-form");
  const input = root.querySelector(".cbw-input");
  const send = root.querySelector(".cbw-send");
  root.querySelector(".cbw-title").textContent = "Chat with " + CONFIG.name;
  root.querySelector(".cbw-avatar").textContent = CONFIG.name.charAt(0).toUpperCase();

  const history = [];
  let chips = null;

  function add(text, who) {
    const d = document.createElement("div");
    d.className = "cbw-m cbw-" + who;
    d.textContent = text;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
    return d;
  }

  function toggle(open) {
    panel.hidden = !open;
    fab.setAttribute("aria-expanded", String(open));
    fab.setAttribute("aria-label", open ? "Close chat" : "Open chat");
    if (open) input.focus();
  }

  async function ask(text) {
    if (chips) { chips.remove(); chips = null; }
    add(text, "user");
    history.push({ role: "user", text });
    send.disabled = true;
    const wait = add("", "bot");
    wait.classList.add("cbw-typing");
    wait.innerHTML = "<i></i><i></i><i></i>";
    try {
      const res = await fetch(CONFIG.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      let data = {};
      try { data = await res.json(); } catch (_) {}
      wait.classList.remove("cbw-typing");
      if (!res.ok) {
        wait.textContent = "Sorry, something went wrong (" + res.status + "). Please try again later.";
      } else {
        wait.textContent = data.reply;
        history.push({ role: "model", text: data.reply });
      }
    } catch (_) {
      wait.classList.remove("cbw-typing");
      wait.textContent = "I can't reach the chat right now. Please try again later.";
    }
    msgs.scrollTop = msgs.scrollHeight;
    send.disabled = false;
    input.focus();
  }

  add(CONFIG.greeting, "bot");
  if (CONFIG.suggestions && CONFIG.suggestions.length) {
    chips = document.createElement("div");
    chips.className = "cbw-chips";
    CONFIG.suggestions.forEach((s) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "cbw-chip";
      b.textContent = s;
      b.addEventListener("click", () => ask(s));
      chips.appendChild(b);
    });
    msgs.appendChild(chips);
  }

  fab.addEventListener("click", () => toggle(panel.hidden));
  closeBtn.addEventListener("click", () => { toggle(false); fab.focus(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) toggle(false); });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || send.disabled) return;
    input.value = "";
    ask(text);
  });
})();
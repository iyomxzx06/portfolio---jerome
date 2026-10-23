/* Floating chat widget. Add to your portfolio with one line before </body>:
   <script src="chatbot-widget.js" defer></script>
   All styles are prefixed with "cbw-" so they will not clash with your portfolio CSS. */
(function () {
  // ---- Edit these ----
  const CONFIG = {
    name: "Jerome",
    greeting: "Hi! Ako ang assistant ni Jerome. May tanong ka ba tungkol sa work, services, o kung paano siya makokontak?",
    accent: "#c6f432",
    apiUrl: "/api/chat",
  };
  // --------------------

  const css = `
  .cbw, .cbw * { box-sizing: border-box; }
  .cbw { --a: ${CONFIG.accent}; --ink: #10120a; position: fixed; right: 16px; bottom: calc(16px + env(safe-area-inset-bottom, 0px)); z-index: 350; font-family: "Segoe UI", system-ui, -apple-system, sans-serif; font-size: 15px; line-height: 1.4; }
  .cbw-fab { width: 56px; height: 56px; border: 0; border-radius: 50%; background: var(--a); color: var(--ink); cursor: pointer; display: grid; place-items: center; box-shadow: 0 6px 22px rgba(0,0,0,.5), 0 0 28px rgba(198,244,50,.25); }
  .cbw-fab svg { width: 26px; height: 26px; }
  .cbw-panel { position: absolute; right: 0; bottom: 70px; width: 340px; height: 460px; max-height: calc(100vh - 110px); display: flex; flex-direction: column; background: #151713; color: #f3f4f0; border: 1px solid #2a2d27; border-radius: 16px; overflow: hidden; box-shadow: 0 16px 50px rgba(0,0,0,.6); }
  .cbw-panel[hidden] { display: none; }
  .cbw-head { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; background: var(--a); color: var(--ink); font-weight: 700; }
  .cbw-close { border: 0; background: transparent; color: var(--ink); font-size: 26px; line-height: 1; cursor: pointer; padding: 0 6px; }
  .cbw-msgs { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 8px; background: #0b0c0a; }
  .cbw-m { max-width: 84%; padding: 9px 12px; border-radius: 12px; white-space: pre-wrap; overflow-wrap: anywhere; }
  .cbw-bot { align-self: flex-start; background: #1b1e18; border: 1px solid #2a2d27; border-bottom-left-radius: 3px; }
  .cbw-user { align-self: flex-end; background: var(--a); color: var(--ink); font-weight: 600; border-bottom-right-radius: 3px; }
  .cbw-form { display: flex; gap: 6px; padding: 10px; border-top: 1px solid #2a2d27; background: #151713; }
  .cbw-input { flex: 1; min-width: 0; padding: 9px 12px; border: 1px solid #2a2d27; border-radius: 10px; font: inherit; font-size: 16px; color: #f3f4f0; background: #0b0c0a; }
  .cbw-send { padding: 0 16px; border: 0; border-radius: 10px; background: var(--a); color: var(--ink); font: inherit; font-weight: 700; cursor: pointer; }
  .cbw-send:disabled { opacity: .5; cursor: wait; }
  .cbw button:focus-visible, .cbw input:focus-visible { outline: 2px solid var(--a); outline-offset: 2px; }
  .cbw .cbw-close:focus-visible { outline-color: var(--ink); }
  @media (max-width: 480px) {
    .cbw-panel { position: fixed; left: 8px; right: 8px; width: auto; bottom: calc(84px + env(safe-area-inset-bottom, 0px)); height: min(70vh, 520px); }
  }`;

  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  const root = document.createElement("div");
  root.className = "cbw";
  root.innerHTML = `
    <section class="cbw-panel" id="cbw-panel" role="dialog" aria-label="Chat assistant" hidden>
      <div class="cbw-head"><span class="cbw-title"></span><button class="cbw-close" type="button" aria-label="Close chat">&times;</button></div>
      <div class="cbw-msgs" aria-live="polite"></div>
      <form class="cbw-form">
        <input class="cbw-input" placeholder="Type your message..." autocomplete="off" required>
        <button class="cbw-send" type="submit">Send</button>
      </form>
    </section>
    <button class="cbw-fab" type="button" aria-label="Open chat" aria-expanded="false" aria-controls="cbw-panel">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>
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

  const history = [];

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

  add(CONFIG.greeting, "bot");
  fab.addEventListener("click", () => toggle(panel.hidden));
  closeBtn.addEventListener("click", () => { toggle(false); fab.focus(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) toggle(false); });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    add(text, "user");
    history.push({ role: "user", text });
    input.value = "";
    send.disabled = true;
    const wait = add("...", "bot");
    try {
      const res = await fetch(CONFIG.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      let data = {};
      try { data = await res.json(); } catch (_) {}
      if (!res.ok) {
        wait.textContent = "Sorry, may problema (" + res.status + "). Subukan ulit mamaya.";
      } else {
        wait.textContent = data.reply;
        history.push({ role: "model", text: data.reply });
      }
    } catch (_) {
      wait.textContent = "Hindi maabot ang chat ngayon. Subukan ulit mamaya.";
    }
    send.disabled = false;
    input.focus();
  });
})();

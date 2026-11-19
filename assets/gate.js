// Simple password gate for the whole site. Not real security: the site is static, so anyone who reads the
// source can get past it. It only keeps casual visitors out. Loaded in the <head> of every page.
//
// To change the password: replace PASSWORD_HASH with the FNV-1a hash of the new password. In the browser
// console of any page, run   ALIFE_GATE_HASH("new password")   and paste the result here.
(function () {
  const PASSWORD_HASH = "7b2eccf6";
  const KEY = "alifegamedev-unlocked";

  const fnv = s => {
    let h = 0x811c9dc5;
    for (const c of s) { h ^= c.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
    return h.toString(16).padStart(8, "0");
  };
  window.ALIFE_GATE_HASH = fnv;

  let unlocked = false;
  try { unlocked = localStorage.getItem(KEY) === PASSWORD_HASH; } catch (e) { /* storage blocked: ask every time */ }
  if (unlocked) return;

  // Hide the page straight away (this runs in <head>, before the body is drawn).
  document.documentElement.classList.add("site-locked");
  const style = document.createElement("style");
  style.textContent = `
    html.site-locked body > :not(.site-gate) { display: none !important; }
    .site-gate { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px 16px; }
    .site-gate form { width: 100%; max-width: 340px; font-family: "IBM Plex Mono", monospace; }
    .site-gate h1 { font-family: "Source Serif 4", Georgia, serif; font-size: 28px; margin: 0 0 6px; }
    .site-gate p { margin: 0 0 18px; color: var(--faint, #6f6a5e); font-size: 14px; }
    .site-gate input { width: 100%; box-sizing: border-box; font: inherit; font-size: 16px; padding: 10px 12px;
      border: 1px solid var(--rule, #d8d1bf); background: var(--paper, #f3efe4); color: var(--ink, #24221d); border-radius: 3px; }
    .site-gate button { margin-top: 10px; width: 100%; font: inherit; font-size: 15px; padding: 10px; cursor: pointer;
      border: 1px solid var(--ink, #24221d); background: var(--ink, #24221d); color: var(--paper, #f3efe4); border-radius: 3px; }
    .site-gate .err { color: #b2402a; min-height: 1.4em; margin: 8px 0 0; }
  `;
  document.head.appendChild(style);

  const show = () => {
    const gate = document.createElement("div");
    gate.className = "site-gate";
    gate.innerHTML = `
      <form autocomplete="off">
        <h1>ALife Game Dev</h1>
        <p>This site is private for now. Enter the password to continue.</p>
        <label for="site-gate-pw" class="visually-hidden" style="position:absolute;left:-9999px">Password</label>
        <input id="site-gate-pw" type="password" placeholder="Password" autofocus>
        <button type="submit">Enter</button>
        <p class="err" role="alert"></p>
      </form>`;
    document.body.prepend(gate);
    const input = gate.querySelector("input"), err = gate.querySelector(".err");
    input.focus();
    gate.querySelector("form").addEventListener("submit", e => {
      e.preventDefault();
      if (fnv(input.value) === PASSWORD_HASH) {
        let saved = false;
        try { localStorage.setItem(KEY, PASSWORD_HASH); saved = localStorage.getItem(KEY) === PASSWORD_HASH; } catch (e2) { /* storage blocked */ }
        if (saved) {
          // reload so pages that measure their layout on load (charts, figures) draw at the right size
          location.reload();
        } else {
          // no storage: unlock this page only, and ask the charts to redraw at their real size
          document.documentElement.classList.remove("site-locked");
          gate.remove();
          window.dispatchEvent(new Event("resize"));
        }
      } else {
        err.textContent = "Wrong password.";
        input.select();
      }
    });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", show);
  else show();
})();

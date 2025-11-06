<script>
/**
 * Появляется ТОЛЬКО на странице с хэшем #0de5d1c4-e756-495c-bbfe-7377041c59e6
 * И сразу исчезает при уходе с этой страницы.
 */

(function () {
  const TARGET_HASH = "#0de5d1c4-e756-495c-bbfe-7377041c59e6";

  let overlay = null;
  let running = false;
  let rafId = null;

  const isTarget = () => (location.hash || "").trim() === TARGET_HASH;

  function createOverlay() {
    const el = document.createElement("div");
    el.setAttribute("data-dev-flag", TARGET_HASH);
    el.textContent = "В разработке";
    el.style.cssText = [
      "position:fixed",
      "left:0",
      "top:0",
      "transform:translate3d(0,0,0)",
      "color:red",
      "font-size:24px",
      "font-weight:700",
      "line-height:1",
      "user-select:none",
      "pointer-events:none",
      "z-index:2147483647",
      "will-change:transform"
    ].join(";");
    document.documentElement.appendChild(el);
    return el;
  }

  function start() {
    if (running) return;
    running = true;

    overlay = document.querySelector('div[data-dev-flag="'+TARGET_HASH+'"]') || createOverlay();

    let x = 40, y = 40, dx = 3.2, dy = 3.2;
    let vw = 0, vh = 0, tw = 0, th = 0;

    function vp() {
      if (window.visualViewport) return { w: Math.floor(visualViewport.width), h: Math.floor(visualViewport.height) };
      const de = document.documentElement;
      return { w: de.clientWidth || innerWidth, h: de.clientHeight || innerHeight };
    }
    function measure() {
      const r = overlay.getBoundingClientRect();
      tw = r.width; th = r.height;
    }
    function update() {
      const v = vp(); vw = v.w; vh = v.h; measure();
      if (x + tw > vw) x = Math.max(0, vw - tw);
      if (y + th > vh) y = Math.max(0, vh - th);
    }
    const onResize = () => update();

    addEventListener("resize", onResize, { passive:true });
    if (window.visualViewport) visualViewport.addEventListener("resize", onResize, { passive:true });
    addEventListener("orientationchange", () => setTimeout(update, 100), { passive:true });

    update();

    (function tick() {
      if (!running) return;
      x += dx; y += dy;

      if (x <= 0) { x = 0; dx = -dx; }
      else if (x + tw >= vw) { x = vw - tw; dx = -dx; }

      if (y <= 0) { y = 0; dy = -dy; }
      else if (y + th >= vh) { y = vh - th; dy = -dy; }

      overlay.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      rafId = requestAnimationFrame(tick);
    })();

    overlay._cleanup = function () {
      if (rafId) cancelAnimationFrame(rafId), rafId = null;
      removeEventListener("resize", onResize);
      if (window.visualViewport) visualViewport.removeEventListener("resize", onResize);
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      overlay = null;
      running = false;
    };
  }

  function stop() {
    if (!running) return;
    if (overlay && overlay._cleanup) overlay._cleanup();
  }

  function onUrlChange() {
    if (isTarget()) start();
    else stop(); // СРАЗУ убираем при уходе с нужной страницы
  }

  // SPA-навигация TgTaps
  (function hookHistory() {
    const _push = history.pushState, _replace = history.replaceState;
    history.pushState = function () { const r = _push.apply(this, arguments); onUrlChange(); return r; };
    history.replaceState = function () { const r = _replace.apply(this, arguments); onUrlChange(); return r; };
    addEventListener("popstate", onUrlChange);
    addEventListener("hashchange", onUrlChange);
  })();

  function boot() {
    onUrlChange();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once:true });
  } else {
    boot();
  }
})();
</script>

<script>
/**
 * Упрямый вариант для TgTaps:
 * - Показывает "В разработке" ТОЛЬКО на странице с хэшем #0de5d1c4-e756-495c-bbfe-7377041c59e6
 * - Если платформа перерисовывает DOM и удаляет узел — мы его возвращаем (watchdog).
 * - Не скрываем сразу при кратковременной смене hash (debounce).
 * - Узел закрепляем в <html> (documentElement), а не в <body>.
 */

(function () {
  const TARGET_HASH = "#0de5d1c4-e756-495c-bbfe-7377041c59e6";
  const HIDE_DEBOUNCE_MS = 3000;   // сколько ждать стабильного НЕсовпадения hash перед скрытием
  const WATCHDOG_INTERVAL = 500;   // как часто проверять, что всё на месте

  let overlay = null;
  let running = false;
  let rafId = null;
  let lastMismatchAt = null;

  // ---- helpers ----
  const isTarget = () => (location.hash || "").trim() === TARGET_HASH;

  function createOverlay() {
    const el = document.createElement("div");
    el.setAttribute("data-dev-flag", TARGET_HASH); // маркер для поиска
    el.textContent = "В разработке";
    // Стили как можно «жёстче», чтобы их сложнее было перебить
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

    // Подстраховка от глобальных reset-стилей: добавим <style> со строгим селектором
    const styleId = "dev-flag-style-"+TARGET_HASH;
    if (!document.getElementById(styleId)) {
      const st = document.createElement("style");
      st.id = styleId;
      st.textContent =
        'html > div[data-dev-flag="'+TARGET_HASH+'"]{position:fixed !important;pointer-events:none !important;z-index:2147483647 !important;}';
      document.head.appendChild(st);
    }

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

    // Сохраняем функцию очистки прямо на overlay
    overlay._cleanup = function() {
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

  // ---- URL hooks ----
  function onUrlChange() {
    if (isTarget()) {
      // как только мы на целевой — сбрасываем «несовпадение»
      lastMismatchAt = null;
      if (!running) start();
    } else {
      if (!lastMismatchAt) lastMismatchAt = Date.now();
      // скрываем только если длительное несоответствие
      if (Date.now() - lastMismatchAt >= HIDE_DEBOUNCE_MS) {
        stop();
      }
    }
  }

  (function hookHistory() {
    const _push = history.pushState, _replace = history.replaceState;
    history.pushState = function () { const r = _push.apply(this, arguments); onUrlChange(); return r; };
    history.replaceState = function () { const r = _replace.apply(this, arguments); onUrlChange(); return r; };
    addEventListener("popstate", onUrlChange);
    addEventListener("hashchange", onUrlChange);
  })();

  // ---- Watchdog: если overlay исчез (перерисовали DOM) — ставим обратно ----
  setInterval(() => {
    if (!isTarget()) return;                // следим только на нужной странице
    if (!running) start();                  // если кто-то «выключил» — включим
    if (!overlay || !overlay.isConnected) { // если узел удалили — пересоздадим
      stop();
      start();
    }
  }, WATCHDOG_INTERVAL);

  // ---- boot ----
  function boot() {
    onUrlChange();
    // Повторные проверки — TgTaps часто устанавливает hash не сразу
    setTimeout(onUrlChange, 400);
    setTimeout(onUrlChange, 1200);
    setTimeout(onUrlChange, 2400);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once:true });
  } else {
    boot();
  }
})();
</script>

// notice.js — максимально совместимый обработчик для #saveContactBtn
(() => {
  'use strict';

  const BTN_SELECTOR = '#saveContactBtn';

  // Простой способ показать, что скрипт точно сработал
  console.log('[notice.js] loaded');

  // Надёжный показ сообщения (alert почти везде проходит)
  const onHit = () => {
    try {
      alert('Контакт сохранён!');
    } catch {
      // На случай, если alert заблокирован — лёгкий тост без внешних стилей
      const t = document.createElement('div');
      t.textContent = 'Контакт сохранён!';
      Object.assign(t.style, {
        position: 'fixed', left: '50%', bottom: '24px',
        transform: 'translateX(-50%)', padding: '10px 14px',
        background: 'rgba(0,0,0,.85)', color: '#fff',
        borderRadius: '10px', fontFamily: 'system-ui,Arial',
        fontSize: '14px', zIndex: '2147483647', opacity: '0',
        transition: 'opacity .18s ease'
      });
      document.body.appendChild(t);
      requestAnimationFrame(() => {
        t.style.opacity = '1';
        setTimeout(() => { t.style.opacity = '0';
          t.addEventListener('transitionend', () => t.remove(), { once: true });
        }, 1600);
      });
    }
  };

  // 1) Делегирование + захват: поймает клик даже если вложенные обработчики стопят всплытие
  const delegatedClick = (e) => {
    const target = e.target && (e.target.closest ? e.target.closest(BTN_SELECTOR) : null);
    if (target) {
      onHit();
    }
  };
  // Вешаем сразу, чтобы ловить клики даже ДО ready
  try { document.addEventListener('click', delegatedClick, { capture: true, passive: true }); }
  catch { document.addEventListener('click', delegatedClick, true); }

  // 2) Прямой обработчик, если кнопка уже есть в DOM в момент готовности
  const attachDirect = () => {
    const btn = document.querySelector(BTN_SELECTOR);
    if (btn && !btn.__noticeBound) {
      btn.addEventListener('click', onHit);
      btn.__noticeBound = true;
      console.log('[notice.js] direct handler attached');
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachDirect, { once: true });
  } else {
    attachDirect();
  }

  // 3) На случай поздней подгрузки/перерисовок — короткий поллер + MutationObserver
  //    (иногда конструкторы часто пересоздают кнопку)
  let tries = 0;
  const poll = setInterval(() => {
    attachDirect();
    if (++tries >= 20) clearInterval(poll); // ~10 секунд
  }, 500);

  const mo = new MutationObserver(() => attachDirect());
  if (document.documentElement) {
    mo.observe(document.documentElement, { childList: true, subtree: true });
  }
})();

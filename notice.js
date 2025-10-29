(() => {
  'use strict';

  // 1) Универсальный "готовность DOM"
  const onReady = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  };

  // 2) Простая "тост"-подсказка без внешнего CSS
  const showNotice = (text = 'Кнопка была нажата!') => {
    const toast = document.createElement('div');
    toast.textContent = text;
    Object.assign(toast.style, {
      position: 'fixed',
      left: '50%',
      bottom: '24px',
      transform: 'translateX(-50%)',
      maxWidth: '90%',
      padding: '10px 14px',
      background: 'rgba(0,0,0,0.85)',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
      fontSize: '14px',
      borderRadius: '10px',
      boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
      opacity: '0',
      transition: 'opacity 180ms ease',
      zIndex: '2147483647'
    });
    document.body.appendChild(toast);
    // плавное появление
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
      }, 1600);
    });
  };

  // 3) Делегирование кликов — сработает для уже существующих и будущих кнопок
  // Ищем элементы с атрибутом data-notice-btn ИЛИ с id="myButton" (на случай, если так легче)
  const BTN_SELECTOR = '[data-notice-btn], #myButton';

  const handleClick = (e) => {
    const btn = e.target.closest?.(BTN_SELECTOR);
    if (!btn) return;
    showNotice('Кнопка была нажата!');
  };

  // 4) Инициализация: навешиваем один общий обработчик на документ
  onReady(() => {
    document.addEventListener('click', handleClick, { passive: true });
    // 5) Если кнопки нет и ты не можешь править HTML — создадим простую кнопку автоматически (опционально)
    if (!document.querySelector(BTN_SELECTOR)) {
      const autoBtn = document.createElement('button');
      autoBtn.type = 'button';
      autoBtn.setAttribute('data-notice-btn', '');
      autoBtn.textContent = 'Нажми меня';
      Object.assign(autoBtn.style, {
        padding: '10px 14px',
        borderRadius: '10px',
        border: '1px solid #ddd',
        cursor: 'pointer',
        margin: '16px',
      });
      document.body.appendChild(autoBtn);
    }
  });

  // 6) На случай, если конструктор подгружает блоки динамически ПОСЛЕ ready:
  // делегирование уже покрывает это, но MutationObserver оставим как «страховку» для очень поздней инициализации body
  if (document.readyState === 'loading') {
    const mo = new MutationObserver(() => {
      if (document.body) {
        mo.disconnect();
        // делегирование уже повешено на ready
      }
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  }
})();

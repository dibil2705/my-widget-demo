// notice.js — генерация vCard по клику на #saveContactBtn
(() => {
  'use strict';

  const BTN_SELECTOR = '#saveContactBtn';

  // --- 1) iOS-детектор (включая iPadOS 13+, который маскируется под Mac) ---
  const isIOS = (() => {
    const ua = navigator.userAgent || '';
    const isIPhoneIPodIPad = /iPhone|iPad|iPod/i.test(ua);
    const isIPadOS13Plus = /Macintosh/i.test(ua) && 'ontouchend' in document;
    return isIPhoneIPodIPad || isIPadOS13Plus;
  })();

  // --- 2) Сборка vCard (v3.0) с корректными CRLF-разделителями ---
  const buildVCard = () => {
    const v = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'N:Babylon;Tamara;;;',
      'FN:Tamara Babylon',
      'TEL;TYPE=CELL:+79187039261',
      'URL:https://wa.me/79187039261?text=',
      'URL:https://www.instagram.com/smile_of_space_?igsh=MXQxOGJjeGtmenBsdw%3D%3D&utm_source=qr',
      'URL:https://vk.com/bibylon',
      'URL:https://t.me/Babylon_11',
      'END:VCARD'
    ].join('\r\n'); // vCard требует CRLF
    return v;
  };

  // --- 3) Действие по клику: iOS -> data: URI, остальные -> Blob + скачивание ---
  const handleClick = () => {
    const vcard = buildVCard();

    if (isIOS) {
      // На iOS лучше открыть data: URI — система предложит добавить контакт
      const dataUri = 'data:text/vcard;charset=utf-8,' + encodeURIComponent(vcard);
      // Чаще надёжнее через location (меньше шансов попасть под попап-блокер)
      window.location.href = dataUri;
      return;
    }

    try {
      const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Tamara_Babylon.vcf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      // Фолбэк: если что-то пошло не так, хотя бы покажем текст (редко нужно)
      console.error('vCard save error:', e);
      alert('Не удалось скачать vCard. Попробуйте другой браузер.');
    }
  };

  // --- 4) Привязка обработчика: прямое навешивание + делегирование + подстраховки ---
  const attachDirect = () => {
    const btn = document.querySelector(BTN_SELECTOR);
    if (btn && !btn.__vcardBound) {
      btn.addEventListener('click', handleClick);
      btn.__vcardBound = true;
    }
  };

  // Делегирование на случай перерисовок и поздней подгрузки
  const delegated = (e) => {
    const t = e.target && e.target.closest ? e.target.closest(BTN_SELECTOR) : null;
    if (t) handleClick();
  };
  try { document.addEventListener('click', delegated, { capture: true, passive: true }); }
  catch { document.addEventListener('click', delegated, true); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachDirect, { once: true });
  } else {
    attachDirect();
  }

  // Поллер на 10 сек., если кнопка появляется позже
  let attempts = 0;
  const poll = setInterval(() => {
    attachDirect();
    if (++attempts >= 20) clearInterval(poll);
  }, 500);

  // Отследим перерисовки (некоторые конструкторы пересоздают узлы)
  const mo = new MutationObserver(() => attachDirect());
  mo.observe(document.documentElement, { childList: true, subtree: true });
})();

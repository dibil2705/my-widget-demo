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
      'URL:https://babylon-tamara.ru',

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


document.addEventListener("DOMContentLoaded", function() {
      const shareBtn = document.getElementById("shareBtn");
      const qrContainer = document.getElementById("qrContainer");
      const qrImage = document.getElementById("qrImage");
      const siteUrl = "https://babylon-tamara.ru";

      shareBtn.addEventListener("click", async () => {
        // Если браузер поддерживает нативное меню «Поделиться» (Safari, iPhone)
        if (navigator.share) {
          try {
            await navigator.share({
              title: "Tamara Babylon",
              url: siteUrl
            });
          } catch (err) {
            console.log("share cancelled");
          }
        } else {
          // Если нет поддержки, показываем QR
          const qrApi = "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=" + encodeURIComponent(siteUrl);
          qrImage.src = qrApi;
          qrContainer.style.display = "block";
        }
      });
    });


      // КНОПКА ПОДЕЛИТЬСЯ qr_____________________________________________________



// share-qr overlay for #shareBtn (works with strict CSP if external JS is allowed)
(() => {
  'use strict';

  const BTN_SELECTOR = '#shareBtn';
  const SITE_URL = 'https://babylon-tamara.ru';
  const QR_SIZE = 240; // px
  const Z = 2147483647;

  // Создание оверлея один раз
  let overlay = null, img = null, box = null, closeBtn = null;
  function ensureOverlay() {
    if (overlay) return overlay;

    overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position: 'fixed', inset: '0', background: 'rgba(0,0,0,.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: String(Z), padding: '20px'
    });

    // клики по фону закрывают
    overlay.addEventListener('click', (e) => { if (e.target === overlay) hideQR(); });

    box = document.createElement('div');
    Object.assign(box.style, {
      background: '#fff', borderRadius: '14px', padding: '16px 16px 22px',
      boxShadow: '0 10px 30px rgba(0,0,0,.35)', textAlign: 'center',
      maxWidth: (QR_SIZE + 32) + 'px', width: '100%', position: 'relative'
    });

    closeBtn = document.createElement('button');
    closeBtn.setAttribute('aria-label', 'Закрыть');
    closeBtn.textContent = '×';
    Object.assign(closeBtn.style, {
      position: 'absolute', top: '6px', right: '10px',
      background: 'transparent', border: 'none', fontSize: '26px',
      lineHeight: '1', cursor: 'pointer', color: '#555'
    });
    closeBtn.addEventListener('click', hideQR);

    const title = document.createElement('div');
    title.textContent = 'Откройте камерой QR';
    Object.assign(title.style, { margin: '6px 0 12px', fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif', fontSize: '16px', color: '#111' });

    img = document.createElement('img');
    img.alt = 'QR';
    Object.assign(img.style, { width: QR_SIZE + 'px', height: QR_SIZE + 'px', display: 'block', margin: '0 auto', borderRadius: '8px' });

    const hint = document.createElement('div');
    hint.textContent = SITE_URL.replace(/^https?:\/\//,'');
    Object.assign(hint.style, { marginTop: '12px', fontSize: '13px', color: '#444', wordBreak: 'break-all' });

    box.appendChild(closeBtn);
    box.appendChild(title);
    box.appendChild(img);
    box.appendChild(hint);
    overlay.appendChild(box);

    return overlay;
  }

  function showQR() {
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=${QR_SIZE}x${QR_SIZE}&data=${encodeURIComponent(SITE_URL)}`;
    ensureOverlay();
    img.src = url;
    document.body.appendChild(overlay);
    // блокируем прокрутку фона
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    // лёгкий fade-in
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity .2s ease';
    requestAnimationFrame(() => overlay.style.opacity = '1');
  }

  function hideQR() {
    if (!overlay || !overlay.parentNode) return;
    overlay.style.opacity = '0';
    setTimeout(() => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }, 200);
  }

  async function handleShareClick() {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Babylon Tamara', url: SITE_URL });
        return;
      } catch (_) { /* отменили — покажем QR */ }
    }
    showQR();
  }

  // Надёжное навешивание (как в вашем коде)
  function bind() {
    const btn = document.querySelector(BTN_SELECTOR);
    if (btn && !btn.__shareBound) {
      btn.addEventListener('click', handleShareClick);
      btn.__shareBound = true;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind, { once: true });
  } else {
    bind();
  }

  // Делегирование и подстраховки на случай перерисовок
  document.addEventListener('click', (e) => {
    const t = e.target && e.target.closest ? e.target.closest(BTN_SELECTOR) : null;
    if (t) handleShareClick();
  }, true);

  let tries = 0;
  const iv = setInterval(() => { bind(); if (++tries > 20) clearInterval(iv); }, 500);
  try {
    const mo = new MutationObserver(bind);
    mo.observe(document.documentElement, { childList: true, subtree: true });
  } catch (_) {}
})();

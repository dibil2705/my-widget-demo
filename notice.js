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

      // УВЕЛИЧЕНИЕ ФОТО_____________________________________________________

(() => {
  'use strict';

  const IMG_SELECTOR = '.carousel .slide img';
  const Z = 2147483647;

  let overlay = null, img = null, caption = null, closeBtn = null, prevBtn = null, nextBtn = null;
  let keydownHandler = null, lastActive = null;
  let currentList = [], currentIndex = 0;
  let fitMode = 'contain';

  // для мобильной блокировки зума
  let gestureBlocker = null;
  let lastTouchEnd = 0;

  // для возврата на место после закрытия
  let savedScrollY = 0;
  let prevDocOverflow = '', prevBodyOverflow = '', prevBodyPadRight = '';
  let prevBodyPos = '', prevBodyTop = '', prevBodyLeft = '', prevBodyRight = '', prevBodyWidth = '';

  function ensureOverlay(){
    if (overlay) return overlay;

    overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position: 'fixed', inset: '0', background: 'rgba(0,0,0,.75)',
      display: 'grid', placeItems: 'center', padding: '24px',
      zIndex: String(Z), cursor: 'zoom-in',
      // критично для мобилок: отключаем жесты браузера прямо на оверлее
      touchAction: 'none'
    });
    overlay.addEventListener('click', e => { if (e.target === overlay) hide(); }, { passive: true });

    const frame = document.createElement('div');
    Object.assign(frame.style, { position:'relative', maxWidth:'min(92vw, 1600px)', maxHeight:'92vh' });

    closeBtn = document.createElement('button');
    closeBtn.setAttribute('aria-label','Закрыть');

    // CHANGE: используем SVG-иконку, чтобы геометрический центр совпадал визуально
    closeBtn.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;

    Object.assign(closeBtn.style, {
      position:'absolute', top:'-8px', right:'-8px', width:'44px', height:'44px',
      padding:'0',                   // CHANGE: гарантируем отсутствие внутренних отступов
      border:'none', borderRadius:'999px',
      background:'rgba(255,255,255,.92)',
      boxShadow:'0 6px 20px rgba(0,0,0,.25)',
      // CHANGE: убираем влияние метрик шрифта на вертикальное выравнивание
      lineHeight:'0',
      // CHANGE: центрируем содержимое кнопки независимо от браузера
      display:'grid', placeItems:'center',
      cursor:'pointer', color:'#111'
    });
    // CHANGE: кликабельность по всей кнопке, но не по самому SVG
    closeBtn.querySelector('svg').style.pointerEvents = 'none';

    closeBtn.addEventListener('click', hide);

    img = document.createElement('img');
    img.alt = '';
    Object.assign(img.style, {
      maxWidth:'92vw', maxHeight:'82vh', borderRadius:'18px',
      boxShadow:'0 18px 44px rgba(0,0,0,.45)', display:'block',
      transition:'transform .2s ease',
      // и на картинке тоже блокируем жесты браузера
      touchAction: 'none'
    });
    img.addEventListener('dblclick', toggleFit);

    caption = document.createElement('div');
    Object.assign(caption.style, {
      marginTop:'12px', textAlign:'center', color:'#f3f4f6',
      font:'600 14px/1.3 system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif',
      textShadow:'0 1px 0 rgba(0,0,0,.35)', wordBreak:'break-word', padding:'0 10px'
    });

    prevBtn = makeArrow('prev');
    nextBtn = makeArrow('next');

    frame.appendChild(img);
    frame.appendChild(closeBtn);
    overlay.appendChild(frame);
    overlay.appendChild(prevBtn);
    overlay.appendChild(nextBtn);
    overlay.appendChild(caption);

    // a11y
    frame.setAttribute('role','dialog');
    frame.setAttribute('aria-modal','true');
    frame.setAttribute('aria-label','Просмотр изображения');

    // CSS-плюшки
    const style = document.createElement('style');
    style.textContent = `
      .carousel .slide img{ cursor: zoom-in; }
      @media (max-width: 640px){
        /* крупнее кликабельные области на телефоне */
        button[aria-label="Предыдущее фото"],
        button[aria-label="Следующее фото"]{ width:56px; height:88px; font-size:30px; }
        [aria-label="Закрыть"]{ width:48px; height:48px; }
      }
      @media (prefers-reduced-motion: reduce){
        [style*="transition"]{ transition: none !important; }
      }
      /* CHANGE: на всякий случай — у SVG блочный рендер для точного центрирования */
      [aria-label="Закрыть"] svg{ display:block; }
    `;
    document.head.appendChild(style);

    return overlay;
  }

  function makeArrow(dir){
    const b = document.createElement('button');
    const isPrev = dir === 'prev';
    b.setAttribute('aria-label', isPrev ? 'Предыдущее фото' : 'Следующее фото');
    b.innerHTML = isPrev ? '&#10094;' : '&#10095;'; // ‹ ›
    Object.assign(b.style, {
      position:'fixed', top:'50%', transform:'translateY(-50%)',
      [isPrev ? 'left' : 'right']:'10px',
      width:'48px', height:'72px', border:'none', borderRadius:'16px',
      background:'rgba(255,255,255,.9)', color:'#111', fontSize:'28px',
      display:'grid', placeItems:'center', cursor:'pointer',
      boxShadow:'0 10px 28px rgba(0,0,0,.25)'
    });
    b.addEventListener('click', () => navigate(isPrev ? -1 : 1));
    return b;
  }

  function show(list, index, alt){
    ensureOverlay();
    currentList = list;
    currentIndex = index;
    fitMode = 'contain';
    updateImage(alt);

    // --- Блокируем фон без "прыжка" (фиксируем body) ---
    savedScrollY = window.scrollY || window.pageYOffset || 0;

    prevDocOverflow = document.documentElement.style.overflow;
    prevBodyOverflow = document.body.style.overflow;
    prevBodyPadRight = document.body.style.paddingRight;
    prevBodyPos = document.body.style.position;
    prevBodyTop = document.body.style.top;
    prevBodyLeft = document.body.style.left;
    prevBodyRight = document.body.style.right;
    prevBodyWidth = document.body.style.width;

    const sw = window.innerWidth - document.documentElement.clientWidth;
    if (sw > 0) document.body.style.paddingRight = sw + 'px';

    // фиксируем body на месте
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity .18s ease';
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.style.opacity = '1');

    lastActive = document.activeElement;
    closeBtn.focus({ preventScroll:true });

    keydownHandler = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); hide(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); navigate(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); navigate(1); }
      else if ((e.key === 'Enter' || e.key === ' ') && document.activeElement === img) { e.preventDefault(); toggleFit(); }
      if (e.key === 'Tab') trapFocus(e);
    };
    document.addEventListener('keydown', keydownHandler, true);

    // свайп
    addSwipe();

    // --- Временная блокировка зума на iOS/мобилках ---
    enableMobileZoomBlock();
  }

  function hide(){
    if (!overlay || !overlay.parentNode) return;
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
      document.removeEventListener('keydown', keydownHandler, true);
      disableMobileZoomBlock();

      // возвращаем стили body/документа и скролл
      document.documentElement.style.overflow = prevDocOverflow;
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.paddingRight = prevBodyPadRight;
      document.body.style.position = prevBodyPos;
      document.body.style.top = prevBodyTop;
      document.body.style.left = prevBodyLeft;
      document.body.style.right = prevBodyRight;
      document.body.style.width = prevBodyWidth;

      // критично: вернуться туда, где были
      window.scrollTo(0, savedScrollY);

      if (lastActive && lastActive.focus) lastActive.focus({ preventScroll:true });
    }, 180);
  }

  function updateImage(altFallback){
    const src = currentList[currentIndex];
    img.src = src;
    img.style.transform = 'scale(1) translate(0,0)';
    img.style.objectFit = 'contain';
    img.style.maxWidth = '92vw';
    img.style.maxHeight = '82vh';
    caption.textContent = altFallback || img.alt || '';

    const hasPrev = currentIndex > 0, hasNext = currentIndex < currentList.length - 1;
    prevBtn.style.display = hasPrev ? '' : 'none';
    nextBtn.style.display = hasNext ? '' : 'none';
  }

  function navigate(step){
    const next = currentIndex + step;
    if (next < 0 || next >= currentList.length) return;
    currentIndex = next;
    updateImage();
  }

  function toggleFit(){
    if (fitMode === 'contain') {
      fitMode = 'actual';
      img.style.objectFit = 'none';
      img.style.maxWidth = 'none';
      img.style.maxHeight = 'none';
      enablePan();
      overlay.style.cursor = 'zoom-out';
    } else {
      fitMode = 'contain';
      img.style.objectFit = 'contain';
      img.style.maxWidth = '92vw';
      img.style.maxHeight = '82vh';
      img.style.transform = 'translate(0,0)';
      disablePan();
      overlay.style.cursor = 'zoom-in';
    }
  }

  function trapFocus(e){
    const focusable = overlay.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  // делегирование: клик по миниатюрам
  document.addEventListener('click', (e) => {
    const pic = e.target && e.target.closest ? e.target.closest(IMG_SELECTOR) : null;
    if (!pic) return;

    const track = pic.closest('.track');
    const imgs = Array.from(track.querySelectorAll('img'));
    const list = imgs.map(n => n.currentSrc || n.src);
    const index = imgs.indexOf(pic);
    const alt = pic.getAttribute('alt') || '';

    show(list, index, alt);
  }, true);

  // свайп
  let startX = 0, startY = 0, isPointer = false;
  function addSwipe(){
    overlay.addEventListener('pointerdown', onDown, { passive: true });
    overlay.addEventListener('pointerup', onUp, { passive: true });
    overlay.addEventListener('pointercancel', onUp, { passive: true });
  }
  function onDown(e){
    if (e.target !== img) return;
    isPointer = true; startX = e.clientX; startY = e.clientY;
  }
  function onUp(e){
    if (!isPointer) return; isPointer = false;
    const dx = e.clientX - startX, dy = e.clientY - startY;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)){
      navigate(dx < 0 ? 1 : -1);
    }
  }

  // панорамирование в режиме 1:1
  let isPanning = false, panX = 0, panY = 0, lastMX = 0, lastMY = 0;
  function enablePan(){
    img.style.cursor = 'grab';
    img.addEventListener('pointerdown', panStart);
    img.addEventListener('pointerup', panEnd);
    img.addEventListener('pointerleave', panEnd);
    img.addEventListener('pointermove', panMove);
  }
  function disablePan(){
    img.style.cursor = '';
    img.removeEventListener('pointerdown', panStart);
    img.removeEventListener('pointerup', panEnd);
    img.removeEventListener('pointerleave', panEnd);
    img.removeEventListener('pointermove', panMove);
    panX = panY = 0; img.style.transform = 'translate(0,0)';
  }
  function panStart(e){ isPanning = true; img.setPointerCapture?.(e.pointerId); lastMX = e.clientX; lastMY = e.clientY; img.style.cursor='grabbing'; }
  function panEnd(e){ isPanning = false; try{ img.releasePointerCapture?.(e.pointerId);}catch(_){ } img.style.cursor='grab'; }
  function panMove(e){
    if (!isPanning) return;
    const dx = e.clientX - lastMX; const dy = e.clientY - lastMY;
    lastMX = e.clientX; lastMY = e.clientY;
    panX += dx; panY += dy;
    img.style.transform = `translate(${panX}px, ${panY}px)`;
  }

  // --- Блокировка зума на мобильных пока открыт оверлей ---
  function enableMobileZoomBlock(){
    // запрет pinch-zoom (Safari iOS понимает gesturestart)
    gestureBlocker = (ev) => { ev.preventDefault(); };
    document.addEventListener('gesturestart', gestureBlocker, { passive: false });

    // запрет двойного тапа (двойной touchend < 300мс)
    overlay.addEventListener('touchend', onOverlayTouchEnd, { passive: false });
  }
  function disableMobileZoomBlock(){
    if (gestureBlocker) document.removeEventListener('gesturestart', gestureBlocker, { passive: false });
    overlay.removeEventListener('touchend', onOverlayTouchEnd, { passive: false });
    lastTouchEnd = 0;
  }
  function onOverlayTouchEnd(e){
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault(); // гасим double-tap zoom
    }
    lastTouchEnd = now;
  }
})();

 //  ОПИСАНИЕ_____________________________________________________

// bio panel toggle — в том же стиле, что и твои другие скрипты
(() => {
  'use strict';

  const BTN_SELECTOR   = '#bioBtn';
  const PANEL_SELECTOR = '#bioPanel';
  const CLOSE_SELECTOR = '#bioClose';

  function openPanel() {
    const panel = document.querySelector(PANEL_SELECTOR);
    if (!panel) return;
    panel.classList.add('bio-open');
    panel.setAttribute('aria-hidden', 'false');
  }

  function closePanel() {
    const panel = document.querySelector(PANEL_SELECTOR);
    if (!panel) return;
    panel.classList.remove('bio-open');
    panel.setAttribute('aria-hidden', 'true');
  }

  function handleToggleClick(e) {
    e && e.preventDefault && e.preventDefault();
    const panel = document.querySelector(PANEL_SELECTOR);
    if (!panel) return;
    if (panel.classList.contains('bio-open')) {
      closePanel();
    } else {
      openPanel();
    }
  }

  function handleCloseClick(e) {
    e && e.preventDefault && e.preventDefault();
    closePanel();
  }

  // навешиваем обработчики на реальные элементы
  function attachDirect() {
    const btn   = document.querySelector(BTN_SELECTOR);
    const close = document.querySelector(CLOSE_SELECTOR);

    if (btn && !btn.__bioBound) {
      btn.addEventListener('click', handleToggleClick);
      btn.__bioBound = true;
    }
    if (close && !close.__bioBound) {
      close.addEventListener('click', handleCloseClick);
      close.__bioBound = true;
    }
  }

  // прямой вызов
  attachDirect();

  // если DOM грузится позже
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachDirect, { once: true });
  }

  // делегирование на случай, если платформа пересоздаёт элементы
  document.addEventListener('click', function (e) {
    const tBtn   = e.target.closest && e.target.closest(BTN_SELECTOR);
    const tClose = e.target.closest && e.target.closest(CLOSE_SELECTOR);

    if (tBtn) {
      handleToggleClick(e);
    } else if (tClose) {
      handleCloseClick(e);
    }
  }, true);

  // поллер на случай ленивой подгрузки
  let tries = 0;
  const iv = setInterval(() => {
    attachDirect();
    if (++tries >= 20) clearInterval(iv);
  }, 500);

  // подстраховка при мутациях DOM
  try {
    const mo = new MutationObserver(attachDirect);
    mo.observe(document.documentElement, { childList: true, subtree: true });
  } catch (_) {}
})();


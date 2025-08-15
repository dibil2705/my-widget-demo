// Telegram WebApp theme sync
(function(){
  const tg = window.Telegram?.WebApp;
  if (tg && tg.colorScheme === 'dark') document.body.classList.add('tg-dark');
  tg?.onEvent?.('themeChanged', () => {
    document.body.classList.toggle('tg-dark', tg.colorScheme === 'dark');
  });
  tg?.ready?.();
})();

// Theme toggle button
const themeBtn = document.getElementById('themeBtn');
if (themeBtn) themeBtn.addEventListener('click', () => document.body.classList.toggle('tg-dark'));

// Reveal on scroll
const ro = new IntersectionObserver((entries)=>{
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } });
},{ threshold: .12 });
document.querySelectorAll('.reveal, .card').forEach(el => ro.observe(el));

// Subtle tilt on cards
document.querySelectorAll('.card').forEach(card=>{
  card.addEventListener('mousemove', e=>{
    const r = card.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width/2)) / r.width;
    const dy = (e.clientY - (r.top + r.height/2)) / r.height;
    card.style.transform = `rotateX(${(-dy*4)}deg) rotateY(${dx*4}deg) translateY(-2px)`;
  });
  card.addEventListener('mouseleave', ()=> card.style.transform='translateY(0)');
});

// Tabs (services)
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tabpane').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    const id = btn.getAttribute('data-tab');
    const pane = document.querySelector(`.tabpane[data-tab="${id}"]`);
    pane?.classList.add('active');
    document.querySelectorAll('.svc').forEach(c=>{
      c.style.outline = c.dataset.tag===id ? '2px solid var(--accent-2)' : 'none';
    });
  });
});

// Open as WebApp (platform page)
const openInTG = document.getElementById('openInTG');
if (openInTG) openInTG.addEventListener('click', () => {
  const tg = window.Telegram?.WebApp;
  if (tg?.openTelegramLink) tg.openTelegramLink('https://t.me');
  else alert('Откройте бота и нажмите кнопку «Открыть мини-приложение».');
});

// Lead form: Telegram sendData or fallback /lead
const form = document.getElementById('leadForm');
if (form) form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const tg = window.Telegram?.WebApp;

  try{
    if (tg?.sendData) {
      tg.sendData(JSON.stringify(data));
      tg.close && tg.close();
    } else {
      await fetch('/lead', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(data)
      });
      alert('Заявка отправлена! Мы скоро свяжемся.');
    }
    form.reset();
  }catch(err){
    console.error(err);
    alert('Не удалось отправить. Попробуйте ещё раз.');
  }
});

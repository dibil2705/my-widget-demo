// notice.js
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('saveContactBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    alert('Контакт сохранён!');
  });
});

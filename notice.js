// notice.js
const waitForButton = setInterval(() => {
  const btn = document.getElementById('saveContactBtn');
  if (btn) {
    clearInterval(waitForButton);
    btn.addEventListener('click', () => {
      alert('Контакт сохранён!');
    });
  }
}, 500);

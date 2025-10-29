document.addEventListener('DOMContentLoaded', function () {
  var btn = document.getElementById('saveContactBtn');
  if (!btn) return;
  // Поставьте здесь ваш реальный URL .vcf (лучше тот же домен)
  var VCF_URL = 'https://dibil2705.github.io/my-widget-demo/Tamara_Babylon.vcf';
  btn.addEventListener('click', function () {
    window.location.href = VCF_URL; // iPhone сразу откроет «Добавить контакт»
  });
});

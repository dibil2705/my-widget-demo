document.getElementById("saveContactBtn").addEventListener("click", function() {
  const vcard =
`BEGIN:VCARD
VERSION:3.0
N:Babylon;Tamara;;;
FN:Tamara Babylon
TEL;TYPE=CELL:+7 918 703-92-61
URL;TYPE=WhatsApp:https://wa.me/79187039261?text=
URL;TYPE=Instagram:https://www.instagram.com/smile_of_space_?igsh=MXQxOGJjeGtmenBsdw%3D%3D&utm_source=qr
URL;TYPE=VK:https://vk.com/bibylon
URL;TYPE=Telegram:https://t.me/Babylon_11
END:VCARD`;

  const blob = new Blob([vcard], { type: "text/vcard" });
  const url = URL.createObjectURL(blob);

  // создаём временную ссылку и кликаем по ней
  const a = document.createElement("a");
  a.href = url;
  a.download = "Tamara_Babylon.vcf";
  document.body.appendChild(a);
  a.click();

  // чистим
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
});

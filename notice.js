(function(){
  // Собираем vCard (CRLF важно для iOS)
  var vcard =
"BEGIN:VCARD\r\n" +
"VERSION:3.0\r\n" +
"N:Babylon;Tamara;;;\r\n" +
"FN:Tamara Babylon\r\n" +
"TEL;TYPE=CELL:+79187039261\r\n" +
"URL:https://wa.me/79187039261?text=\r\n" +
"URL:https://www.instagram.com/smile_of_space_?igsh=MXQxOGJjeGtmenBsdw%3D%3D&utm_source=qr\r\n" +
"URL:https://vk.com/bibylon\r\n" +
"URL:https://t.me/Babylon_11\r\n" +
"END:VCARD\r\n";

  function openAsDataURI() {
    var dataUri = "data:text/vcard;charset=utf-8," + encodeURIComponent(vcard);
    var a = document.createElement("a");
    a.href = dataUri;
    a.target = "_blank"; // для iOS открывает предпросмотр контакта
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function downloadAsBlob() {
    var blob = new Blob([vcard], { type: "text/vcard" }); // Safari поймёт и text/x-vcard
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "Tamara_Babylon.vcf";
    document.body.appendChild(a);
    a.click();
    setTimeout(function(){
      a.remove();
      URL.revokeObjectURL(url);
    }, 1000);
  }

  document.getElementById("saveContactBtn").addEventListener("click", function(){
    var isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    // На iOS надёжнее открыть data:URI (скачивание может игнорироваться)
    if (isIOS) openAsDataURI();
    else downloadAsBlob();
  });
})();

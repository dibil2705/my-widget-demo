(function(){
  function qp(n){var m=new RegExp("[?&]"+n+"=([^&]*)").exec(location.search);return m?decodeURIComponent(m[1].replace(/\+/g,"%20")):null;}
  function meta(n){var el=document.querySelector('meta[name="'+n+'"]');return el&&el.getAttribute("content");}
  function set(el, o){for(var k in o)if(Object.prototype.hasOwnProperty.call(o,k))el.style[k]=o[k];}
  function col(t){if(t==="success")return"#16a34a";if(t==="error")return"#dc2626";if(t==="warning")return"#d97706";return"#2563eb";}
  var msg=(qp("notice")||meta("notice-message")||"Готово!"); if(String(msg).toLowerCase()==="off") return;
  var type=(qp("type")||meta("notice-type")||"info").toLowerCase();
  var dur=parseInt(qp("duration")||meta("notice-duration")||"3000",10); if(!(dur>0)) dur=3000;

  function whenBody(cb){
    if(document.body) return cb();
    function done(){try{cb();}catch(e){}}
    try{var mo=new MutationObserver(function(){if(document.body){mo.disconnect();done();}});mo.observe(document.documentElement||document,{childList:true,subtree:true});}catch(e){}
    document.addEventListener("DOMContentLoaded",done,{once:true});
    window.addEventListener("load",done,{once:true});
    var iv=setInterval(function(){if(document.body){clearInterval(iv);done();}},50);
  }

  function show(){
    var c=document.getElementById("__notice_stack");
    if(!c){c=document.createElement("div");c.id="__notice_stack";set(c,{position:"fixed",top:"16px",right:"16px",display:"flex",flexDirection:"column",gap:"8px",zIndex:String(2147483647),pointerEvents:"none"});(document.body||document.documentElement).appendChild(c);}
    var b=document.createElement("div");
    set(b,{maxWidth:"360px",background:"#1f2937",color:"#fff",borderRadius:"10px",boxShadow:"0 10px 25px rgba(0,0,0,.25)",padding:"12px 14px",display:"grid",gridTemplateColumns:"8px 1fr auto",alignItems:"center",columnGap:"12px",opacity:"0",transform:"translateY(-8px)",pointerEvents:"auto",transition:"opacity .25s ease, transform .25s ease"});
    var s=document.createElement("div"); set(s,{width:"8px",height:"100%",borderRadius:"6px",background:col(type)});
    var t=document.createElement("div"); set(t,{fontFamily:"system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif",fontSize:"14px",lineHeight:"1.4",wordBreak:"break-word"}); t.textContent=String(msg||"");
    var x=document.createElement("button"); x.setAttribute("aria-label","Close"); x.textContent="X"; set(x,{background:"transparent",border:"none",color:"#9ca3af",fontSize:"16px",lineHeight:"1",cursor:"pointer",padding:"4px",marginLeft:"8px"});
    x.onmouseenter=function(){x.style.color="#ffffff"}; x.onmouseleave=function(){x.style.color="#9ca3af"};

    b.appendChild(s); b.appendChild(t); b.appendChild(x); c.appendChild(b);
    setTimeout(function(){b.style.opacity="1";b.style.transform="translateY(0)";},0);

    var closed=false; function close(){if(closed)return;closed=true;b.style.opacity="0";b.style.transform="translateY(-8px)";setTimeout(function(){if(b&&b.parentNode)b.parentNode.removeChild(b);},260);}
    x.addEventListener("click",close);
    var timer=setTimeout(close,dur); b.addEventListener("mouseenter",function(){clearTimeout(timer)}); b.addEventListener("mouseleave",function(){if(!closed)timer=setTimeout(close,1200)});
  }
  whenBody(show);
})();

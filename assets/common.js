'use strict';
window.NESSync = (() => {
  const $ = id => document.getElementById(id);
  const params = new URLSearchParams(location.hash.slice(1) || location.search.slice(1));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const storage = {get:k=>{try{return localStorage.getItem(k);}catch{return null;}},set:(k,v)=>{try{localStorage.setItem(k,v);}catch{}}};
  function random() { const b = new Uint8Array(16); crypto.getRandomValues(b); return Array.from(b,x=>x.toString(16).padStart(2,'0')).join(''); }
  async function api(data, post = false) {
    const abort = new AbortController(); const timer = setTimeout(()=>abort.abort(),6500);
    try {
      const url = new URL('api.php',location.href);
      const opts = {cache:'no-store',signal:abort.signal,credentials:'same-origin',referrerPolicy:'no-referrer'};
      if(post){opts.method='POST';opts.headers={'Content-Type':'application/json'};opts.body=JSON.stringify(data);}
      else {for(const [k,v] of Object.entries(data))url.searchParams.set(k,String(v));url.searchParams.set('_',Date.now());}
      const response = await fetch(url,opts);
      let body; try{body = await response.json();}catch {throw new Error('الخادم لم يُرجع JSON. افتح الصفحة عبر الاستضافة وتحقق من PHP.');}
      if(!response.ok || !body.ok){const error=new Error(body.error || 'تعذّر الاتصال');error.status=response.status;error.body=body;throw error;}
      return body;
    } finally { clearTimeout(timer); }
  }
  function time(value) { if(!value)return '—';const d=new Date(value);if(Number.isNaN(d.getTime()))return '—';return d.toLocaleTimeString('ar-YE',{hour12:false})+'.'+String(d.getMilliseconds()).padStart(3,'0'); }
  const twoFrames = () => new Promise(resolve => requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  let wake = null, wantWake = false;
  function wakeLabel(message) { if($('wakeStatus'))$('wakeStatus').textContent=message; if($('wakeBtn'))$('wakeBtn').textContent=wake?'الشاشة تبقى مفتوحة ✓':'إبقاء الشاشة مفتوحة'; }
  async function keepAwake() {
    wantWake = true;
    if(!('wakeLock' in navigator)){wakeLabel('منع السكون غير مدعوم هنا؛ زِد مهلة إطفاء الشاشة من الإعدادات.');return;}
    if(document.visibilityState !== 'visible' || wake)return;
    try{wake=await navigator.wakeLock.request('screen');wakeLabel('منع سكون الشاشة مفعّل');wake.addEventListener('release',()=>{wake=null;wakeLabel('تحرر منع السكون؛ سيُعاد عند العودة.');});}
    catch{wakeLabel('تعذّر منع السكون. اضغط الزر مجددًا أو زِد مهلة الشاشة.');}
  }
  document.addEventListener('visibilitychange',()=>{if(wantWake && document.visibilityState==='visible')keepAwake();});
  if($('wakeBtn'))$('wakeBtn').addEventListener('click',keepAwake);
  async function copy(value, input) {
    try{await navigator.clipboard.writeText(value);return true;}catch{if(input){input.focus();input.select();try{return document.execCommand('copy');}catch{}}return false;}
  }
  return {$,params,sleep,escape,storage,random,api,time,twoFrames,keepAwake,copy};
})();

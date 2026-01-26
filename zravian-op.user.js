// ==UserScript==
// @name         Zravian OP System GOD MODE (SAFE)
// @namespace    zravian-op-god
// @version      4.0
// @description  Multi-account, multi-villaggio, stats, AI farm (SAFE)
// @match        *://zravian.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  /************ CONFIG ************/
  const TEMPLATES = [
    { name: 'Farm A', troops: { spear: 30, scout: 5 }, x: -10, y: 15, cooldown: 20 },
    { name: 'Farm B', troops: { spear: 40 }, x: -12, y: 18, cooldown: 30 },
    { name: 'Farm C', troops: { spear: 25, scout: 10 }, x: -8, y: 22, cooldown: 25 }
  ];
  const SOUND = true;

  /************ UTILS ************/
  const now = () => Date.now();
  const beep = (f=880,m=120)=>{ if(!SOUND)return; const c=new(AudioContext||webkitAudioContext)(); const o=c.createOscillator(); o.frequency.value=f; o.connect(c.destination); o.start(); setTimeout(()=>o.stop(),m); };

  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

  function getPlayer() {
    return $('.playerName')?.textContent?.trim() || 'default';
  }
  function getVillage() {
    return $('#villageName')?.textContent?.trim() || 'village';
  }

  function load(k,d){ try{return JSON.parse(localStorage.getItem(k))??d}catch{return d} }
  function save(k,v){ localStorage.setItem(k,JSON.stringify(v)) }

  /************ STATE (ACCOUNT + VILLAGE) ************/
  const KEY = `zravian_${getPlayer()}_${getVillage()}`;
  const state = load(KEY, { history:[], last:{}, stats:{} });

  /************ DASHBOARD ************/
  const dash = document.createElement('div');
  dash.style.cssText = 'position:fixed;top:70px;right:10px;width:360px;background:#111;color:#0f0;font:12px monospace;padding:8px;border:1px solid #0f0;z-index:99999';
  dash.innerHTML = `
    <b>🧠 OP GOD MODE</b><br>
    👤 ${getPlayer()}<br>
    🏘 ${getVillage()}<hr>
    <div id="tpl"></div>
    <div id="cd"></div>
    <div id="stats"></div>
    <div id="hist"></div>
  `;
  document.body.appendChild(dash);
  const elTpl=$('#tpl'), elCd=$('#cd'), elStats=$('#stats'), elHist=$('#hist');

  /************ CORE ************/
  function available() {
    const m={}; $$('input[name][max]').forEach(i=>m[i.name]=+i.max||0); return m;
  }
  function canSend(t){ const a=available(); return Object.entries(t.troops).every(([k,v])=>(a[k]||0)>=v); }
  function cdLeft(t){ return Math.max(0,(t.cooldown*60000)-(now()-(state.last[t.name]||0))); }

  function score(t){
    const h=state.stats[t.name]?.count||0;
    return (canSend(t)?10:0) + (cdLeft(t)?0:10) + h;
  }

  function bestTemplate(){
    return TEMPLATES.map((t,i)=>({i,s:score(t)}))
      .sort((a,b)=>b.s-a.s)[0]?.i ?? null;
  }

  function fill(i){
    const t=TEMPLATES[i]; if(!t) return;
    Object.entries(t.troops).forEach(([k,v])=>{ const i=$(`input[name="${k}"]`); if(i)i.value=v; });
    if($('input[name="x"]')) $('input[name="x"]').value=t.x;
    if($('input[name="y"]')) $('input[name="y"]').value=t.y;
    elTpl.textContent=`🧭 ${t.name}`;
    const cd=cdLeft(t);
    elCd.textContent=cd?`⏱ ${Math.ceil(cd/60000)} min`:'✅ Ready';
    beep();
  }

  function updateStats(){
    const total=state.history.length;
    const lastHour=state.history.filter(h=>now()-h<3600000).length;
    elStats.innerHTML=`📊 Raid: ${total} | /h: ${lastHour}`;
    elHist.innerHTML='<b>📜 Ultimi</b><br>'+state.history.slice(-5).map(h=>new Date(h).toLocaleTimeString()).join('<br>');
  }

  /************ HOOK INVIO (LOG ONLY) ************/
  const btn=$('button[type="submit"],input[type="submit"]');
  if(btn) btn.addEventListener('click',()=>{
    const i=bestTemplate(); if(i===null)return;
    const t=TEMPLATES[i];
    state.last[t.name]=now();
    state.history.push(now());
    state.stats[t.name]={count:(state.stats[t.name]?.count||0)+1};
    save(KEY,state);
    updateStats();
  });

  /************ HOTKEY ************/
  document.addEventListener('keydown',e=>{
    if(e.key.toLowerCase()==='n'){
      const i=bestTemplate();
      if(i!==null) fill(i);
      else beep(200,300);
    }
  });

  updateStats();
  const start=bestTemplate();
  if(start!==null) fill(start);
})();

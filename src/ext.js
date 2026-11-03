/* ================================================================
   Koel v2 extension: auth (Supabase), admin, voice, writing practice,
   new games. Loaded after the core script; overrides a few globals.
   ================================================================ */
let UIL=(()=>{try{return localStorage.getItem("koel-ui")||""}catch(e){return""}})();      // app language chosen by the user
const TX=(th,en)=>{if(!UIL)return lang==="th"?en:th;if(UIL==="th")return th;if(UIL!=="en"&&typeof UI18N!=="undefined"&&UI18N[th]&&UI18N[th][UIL])return UI18N[th][UIL];return en};
let PIC=null,STK=null;
if(navigator.standalone)document.body.classList.add("ios-app");
addEventListener("scroll",()=>{const h=$("#hdr");if(h)h.classList.toggle("scrolled",scrollY>4)},{passive:true});

/* ---------- unlock: keep the extra datasets ---------- */
tryUnlock=async function(pw){const o=await decryptData(pw);DATA=o.DATA;ALPHA=o.ALPHA;HANZI=o.HANZI;AIDX=o.AIDX;window.CHARINFO=o.CHARINFO||{};PIC=o.PIC||{scenes:[]};STK=o.STK||{};ALPHA_EN=o.ALPHA_EN||{};UI18N=o.UI18N||{};UIRX=null;applyContentLang();
  try{localStorage.setItem(PWK,pw)}catch(e){};const g=$("#gate");if(g)g.remove();document.body.style.overflow="";UNLOCK_PW=pw;render();afterUnlock()};
let UNLOCK_PW=null,ALPHA_EN={},UI18N={};

/* ---------- shell additions ---------- */
const _render=render;
render=function(){document.body.dataset.tab=tab;_render();applyUI();const rb=$("#railbrand");if(rb&&!rb.firstChild)rb.innerHTML=mascot("idle",34)+"<span>Koel</span>";};
$("#gear").onclick=()=>openSettings();

/* =================== VOICE (item 3) =================== */
const VKEY="koel-voice";
let VS={};try{VS=JSON.parse(localStorage.getItem(VKEY)||"{}")}catch(e){}
const vset=()=>Object.assign({mode:lang==="th"?"f":"app",name:"",rate:1},VS[lang]||{});
function saveV(o){VS[lang]=Object.assign(vset(),o);try{localStorage.setItem(VKEY,JSON.stringify(VS))}catch(e){}}
const FEMALE=/female|woman|หญิง|kanya|narisa|premwadee|achara|pattara|tingting|ting-ting|meijia|mei-jia|sinji|lili|xiaoxiao|xiaoyi|xiaochen|xiaohan|xiaomo|huihui|yaoyao|anna|petra|helena|katja|hedda|amala|marlene|vicki|samantha|karen|moira|tessa|victoria|allison|ava|susan|zira|aria|jenny|serena|fiona|kate|nicky|emma|michelle|sonia|libby|natasha|amelie|amélie|audrey|marie|aurelie|aurélie|julie|hortense|denise|virginie|celine|céline|eloise|vivienne|brigitte|seraphina|elke|gisela|louisa|maja|sara|siri female|flo\b|grandma|sandy|shelley|kathy|princess|zarvox|mei-jia|sin-ji|yuna|alice|joana|monica|paulina|zuzana/i;
const MALE=/\bmale\b|\bman\b|ชาย|niwat|li-mu|limu|yunxi|yunyang|yunjian|yunhao|kangkang|markus|yannick|stefan|conrad|killian|kasper|florian|ralf|alex\b|daniel|fred\b|tom\b|aaron|arthur|rishi|oliver|gordon|david|mark\b|guy\b|ryan|christopher|eric\b|brian|andrew|thomas|nicolas|henri|paul\b|claude|remy|rémy|jacques|alain|maurice|jerome|yves|siri male|eddy|reed|rocko|grandpa|ralph|albert|junior|bruce|jacques|bahh|boing|xander|luca|jorge|diego/i;
const vGender=v=>FEMALE.test(v.name||"")?"f":MALE.test(v.name||"")&&!/female/i.test(v.name)?"m":"";
const vQuality=v=>/premium|enhanced|natural|neural|online|siri|google/i.test(v.name||"")?2:v.localService===false?1:0;
function langVoices(){const code=(DATA[lang]||{}).voice||"en-US",two=code.slice(0,2);lv();
  return voices.filter(v=>(v.lang||"").replace("_","-").toLowerCase().startsWith(two)).sort((a,b)=>{const ea=(a.lang||"").replace("_","-")===code?1:0,eb=(b.lang||"").replace("_","-")===code?1:0;return(vQuality(b)-vQuality(a))||(eb-ea)})}
function pickVoice(g){const vs=langVoices(),cfg=vset();
  if(cfg.name){const n=vs.find(v=>v.name===cfg.name);if(n&&(!g||vGender(n)===g||!vGender(n)))return{v:n,shift:false}}
  if(!g)return{v:vs[0],shift:false};
  const hit=vs.find(v=>vGender(v)===g);if(hit)return{v:hit,shift:false};
  return{v:vs.find(v=>vGender(v)!==(g==="m"?"f":"m"))||vs[0],shift:true};}
const _speak=speak;
let lastSay={t:"",at:0};
speak=function(t,slow){if(!t)return;const now=Date.now();
  if(lang==="th"&&(vset().mode==="f"||vset().mode==="m")&&voiceMissing()&&AIDX[hk(lang+"|"+t)]!=null){return _speak(t,slow)}if(t===lastSay.t&&!!slow===lastSay.s&&now-lastSay.at<1200)return;lastSay={t,s:!!slow,at:now};const m=vset().mode;
  if(m==="f"||m==="m"||(lang==="fr"&&m==="app"&&!AIDX[hk(lang+"|"+t)]))return genderSpeak(t,slow,m==="app"?"":m);
  return _speak(t,slow)};
const VNAME={zh:["จีน","Chinese"],de:["เยอรมัน","German"],en:["อังกฤษ","English"],fr:["ฝรั่งเศส","French"],th:["ไทย","Thai"]};
let noVoiceWarned={};
function voiceMissing(){if(!webTTS)return true;lv();if(!voices.length)return false;const two=((DATA[lang]||{}).voice||"").slice(0,2).toLowerCase();return !voices.some(v=>(v.lang||"").toLowerCase().replace("_","-").startsWith(two))}
function warnNoVoice(){if(noVoiceWarned[lang])return;noVoiceWarned[lang]=1;const n=VNAME[lang]||["",""];
  toast(TX(`เครื่องนี้ยังไม่มีเสียงภาษา${n[0]} เพิ่มได้ฟรี: Mac ไปที่ การตั้งค่าระบบ › การช่วยการเข้าถึง › เนื้อหาที่พูด · iPad/iPhone ไปที่ การตั้งค่า › การช่วยการเข้าถึง › เนื้อหาที่พูด › เสียง`,`This device has no ${n[1]} voice yet. Add one for free in your device's Spoken Content / Text-to-speech settings.`))}
function genderSpeak(t,slow,g){if(voiceMissing())warnNoVoice();
  if(!webTTS){toast("เครื่องนี้ไม่มีเสียงอ่าน");return}
  try{player.pause()}catch(e){}
  const u=new SpeechSynthesisUtterance((lang==="th"?thRespell(t):String(t)).replace(/……|…|\.\.\./g," "));u.lang=DATA[lang].voice;
  const{v,shift}=pickVoice(g);if(v)u.voice=v;const rate=vset().rate||1;u.rate=(slow?.6:.95)*rate;
  if(shift){u.pitch=g==="m"?.7:1.25}
  ttsSpeak(u)}


/* =================== RELIABLE SPEECH =================== */
let ttsKeep=null,ttsUnlocked=false;
function ttsSpeak(u){if(!webTTS)return;ttsKeep=u;   /* keep a reference: Chrome drops utterances that get garbage-collected */
  const go=()=>{try{if(speechSynthesis.paused)speechSynthesis.resume();speechSynthesis.speak(u)}catch(e){}};
  if(speechSynthesis.speaking||speechSynthesis.pending){try{speechSynthesis.cancel()}catch(e){}setTimeout(go,30)}else go()}
function ttsUnlock(){if(ttsUnlocked||!webTTS)return;ttsUnlocked=true;try{const u=new SpeechSynthesisUtterance(" ");u.volume=0;speechSynthesis.speak(u)}catch(e){}}
document.addEventListener("pointerdown",ttsUnlock,{capture:true,once:true});

/* =================== SETTINGS SHEET =================== */
function sheet(html){closeSheet();const bg=document.createElement("div");bg.className="sheet-bg";bg.id="sheet";bg.innerHTML=`<div class="sheet" role="dialog" aria-modal="true">${html}</div>`;
  bg.addEventListener("click",e=>{if(e.target===bg)closeSheet()});document.body.appendChild(bg);return bg}
function closeSheet(){const s=$("#sheet");if(s)s.remove()}
function openSettings(){
  if(!DATA)return;const cfg=vset(),vs=langVoices(),gm=cfg.mode;
  const list=(gm==="f"||gm==="m")?vs.filter(v=>vGender(v)===gm||!vGender(v)):vs;
  const hasG=g=>vs.some(v=>vGender(v)===g);
  const acct=AUTH.user?`<div class="panel" style="display:flex;flex-direction:column;gap:8px"><h3>${TX("บัญชี","Account")}</h3><p class="hint" style="margin:0">${esc(AUTH.user.email||"")} · ${AUTH.role==="admin"?TX("แอดมิน","Admin"):TX("ผู้ใช้งาน","Learner")}</p>
      <p class="hint" style="margin:0">${TX("ความคืบหน้าบันทึกในบัญชี เปิดเครื่องไหนก็เรียนต่อได้ · ใช้ฟรีทั้งหมด","Progress is saved to your account on every device · completely free")}</p>
      <div class="row-flex" style="flex-wrap:wrap">${AUTH.role==="admin"?`<button class="primary" id="s-admin" style="width:auto">${TX("หน้าแอดมิน","Admin page")}</button>`:""}<button class="ghost" id="s-out">${TX("ออกจากระบบ","Sign out")}</button></div></div>`
    :AUTH.ready?`<div class="panel" style="display:flex;flex-direction:column;gap:8px"><h3>${TX("บัญชี","Account")}</h3><p class="hint" style="margin:0">${TX("ยังไม่ได้ล็อกอิน ความคืบหน้าเก็บไว้ในเครื่องนี้เท่านั้น","Not signed in: progress stays on this device")}</p><button class="primary" id="s-in">${TX("ล็อกอิน / สมัครสมาชิก (ฟรี)","Sign in / sign up (free)")}</button></div>`:"";
  sheet(`<div class="row-flex" style="justify-content:space-between"><h3>${TX("ตั้งค่า","Settings")}</h3><button class="x" id="s-x" aria-label="ปิด">×</button></div>
    <button class="gcard" id="s-prof"><span class="gi">${mascot("happy",40)}</span><span><b>${esc(nick()||TX("ผู้เรียน Koel","Koel learner"))}</b><small>${TX("ข้อมูลผู้เรียน ชื่อเล่น และไทม์ไลน์พัฒนาการ ›","Profile, nickname and progress timeline ›")}</small></span></button>
    <div class="panel" style="display:flex;flex-direction:column;gap:10px"><h3>${TX("ภาษาของแอป","App language")}</h3><div class="seg2" role="group">${UI_LANGS.map(([k,n])=>`<button type="button" data-ui="${k}" aria-pressed="${(UIL||"th")===k}">${n}</button>`).join("")}</div><p class="hint" style="margin:0">${TX("ใช้กับหน้าวิธีใช้งาน เมนู และหน้าใหม่ ๆ ส่วนคำแปลบทเรียนยังเป็นภาษาไทย","Used for the guide, menus and new screens. Lesson translations stay in Thai.")}</p></div>
    <div class="panel" style="display:flex;flex-direction:column;gap:10px"><h3>${TX("ใช้งานออฟไลน์","Offline")} ${navigator.onLine?"":`<span class="chip warn">${TX("ออฟไลน์อยู่","offline now")}</span>`}</h3><div id="s-off" style="display:flex;flex-direction:column;gap:10px"></div></div>
    ${lang==="th"?"":`<div class="panel" style="display:flex;flex-direction:column;gap:10px"><h3>${TX("ภาษาของคำแปลและคำอธิบาย","Translations and explanations in")}</h3><div class="seg2" role="group">${[["th","ไทย"],["en","English"]].map(([k,n])=>`<button type="button" data-trl="${k}" aria-pressed="${TRL()===k}">${n}</button>`).join("")}</div><p class="hint" style="margin:0">${TX("คำแปล คำอธิบาย ตัวอย่าง และชื่อหมวดในบทเรียน ตอนนี้มีภาษาไทยและอังกฤษ","Meanings, notes, examples and topic names in lessons. Thai and English are available now.")}</p></div>`}
    <button class="gcard" id="s-onb"><span class="gi">▶</span><span><b>${TX("ดูวิธีเริ่มใช้งานอีกครั้ง","Watch the quick guide again")}</b><small>${TX("แนะนำการใช้แอปสั้น ๆ","How to use Koel")}</small></span></button>
    ${acct}
    <div class="panel" style="display:flex;flex-direction:column;gap:12px"><h3>${TX("เสียงอ่านภาษา"+DATA[lang].name,"Voice for "+({zh:"Chinese",de:"German",en:"English",fr:"French",th:"Thai"})[lang])}</h3>
      <div class="seg2" role="group" aria-label="แบบเสียง">${[["app",lang==="fr"?TX("อัตโนมัติ","Automatic"):TX("เสียงในแอป (เดิม)","Built-in voice")],["f",TX("เสียงผู้หญิง","Female voice")],["m",TX("เสียงผู้ชาย","Male voice")]].map(([k,l])=>`<button data-vm="${k}" aria-pressed="${gm===k}">${l}</button>`).join("")}</div>
      ${gm==="f"||gm==="m"?`${hasG(gm)?"":`<p class="tip" style="margin:0">${TX("เครื่องนี้ยังไม่มีเสียง"+(gm==="m"?"ผู้ชาย":"ผู้หญิง")+"ของภาษานี้ แอปจะปรับโทนเสียงให้แทน ติดตั้งเสียงเพิ่มได้ฟรีในการตั้งค่าเครื่อง (ดูด้านล่าง)","This device has no "+(gm==="m"?"male":"female")+" voice for this language yet, so the app shifts the pitch instead. You can add voices for free in your device settings (see below).")}</p>`}
      <div class="field"><span>${TX("เลือกเสียง","Voice")}</span><div class="vlist" role="radiogroup">${[{name:"",label:TX("ให้แอปเลือกเสียงที่ดีที่สุด","Let the app pick the best voice")}].concat(list.map(v=>({name:v.name,label:v.name.replace(/\s*\(.*\)\s*$/,""),g:vGender(v),q:vQuality(v)===2}))).map(v=>`<button type="button" class="vopt" role="radio" data-vn="${esc(v.name)}" aria-checked="${(cfg.name||"")===v.name}"><span class="vdot"></span><span style="flex:1;min-width:0">${esc(v.label)}${v.q?` <small class="vq">${TX("คุณภาพสูง","high quality")}</small>`:""}</span>${v.g?`<small class="vg">${v.g==="f"?TX("หญิง","female"):TX("ชาย","male")}</small>`:""}${v.name?`<span class="vplay" data-vtest="${esc(v.name)}" aria-label="ฟัง">${ICON_PLAY}</span>`:""}</button>`).join("")}</div></div>`:""}
      <div class="field"><span>${TX("ความเร็วในการพูด","Speaking speed")}</span><div class="seg2" role="group">${[[0.8,TX("ช้า","Slow")],[0.9,TX("ค่อนข้างช้า","A bit slow")],[1,TX("ปกติ","Normal")],[1.1,TX("เร็ว","Fast")]].map(([r,l])=>`<button type="button" data-rate="${r}" aria-pressed="${Math.abs((cfg.rate||1)-r)<.01}">${l}</button>`).join("")}</div></div>
      <button class="ghost" id="s-test">▶ ${TX("ทดลองฟัง","Try it")}</button>
      <p class="hint" style="margin:0">${TX("เสียงฟรีทั้งหมด ใช้เสียงที่มีในเครื่อง ถ้าอยากได้เสียงที่เป็นธรรมชาติขึ้น: iPad/iPhone ไปที่ การตั้งค่า › การช่วยการเข้าถึง › เนื้อหาที่พูด › เสียง แล้วดาวน์โหลดเสียงแบบ Enhanced หรือ Premium (ฟรี) · Mac ไปที่ การตั้งค่าระบบ › การช่วยการเข้าถึง › เนื้อหาที่พูด · Windows/Edge มีเสียง Natural ให้อัตโนมัติ","All voices are free and come from your device. For more natural voices: on iPad/iPhone go to Settings › Accessibility › Spoken Content › Voices and download an Enhanced or Premium voice (free) · on Mac: System Settings › Accessibility › Spoken Content · Windows/Edge has Natural voices built in.")}</p>
    </div>`);
  $("#s-x").onclick=closeSheet;
  offPanel();
  $("#s-prof").onclick=()=>{closeSheet();openProfile()};
  $("#s-onb").onclick=()=>{closeSheet();showOnboarding()};
  document.querySelectorAll("[data-vm]").forEach(b=>b.onclick=()=>{saveV({mode:b.dataset.vm,name:""});openSettings()});
  document.querySelectorAll("[data-vn]").forEach(b=>b.onclick=e=>{const n=b.dataset.vn;saveV({name:n});document.querySelectorAll("[data-vn]").forEach(x=>x.setAttribute("aria-checked",x===b));
    const c=DATA[lang].cards.find(c=>c.g==="s_friend")||DATA[lang].cards[0];speak(c.t)});
  document.querySelectorAll("[data-rate]").forEach(b=>b.onclick=()=>{saveV({rate:+b.dataset.rate});document.querySelectorAll("[data-rate]").forEach(x=>x.setAttribute("aria-pressed",x===b))});
  document.querySelectorAll("[data-ui]").forEach(b=>b.onclick=()=>{setUI(b.dataset.ui);applyContentLang();render();openSettings()});
  document.querySelectorAll("[data-trl]").forEach(b=>b.onclick=()=>{setTRL(b.dataset.trl);openSettings()});
  $("#s-test").onclick=()=>{const c=DATA[lang].cards.find(c=>c.g==="s_friend")||DATA[lang].cards[0];speak(c.t)};
  const so=$("#s-out");if(so)so.onclick=async()=>{await AUTH.sb.auth.signOut();try{localStorage.removeItem(PWK)}catch(e){};location.reload()};
  const si=$("#s-in");if(si)si.onclick=()=>{closeSheet();showAuth()};
  const sa=$("#s-admin");if(sa)sa.onclick=()=>{closeSheet();openAdmin()};
}

/* =================== WRITING PRACTICE (items 4, 5) =================== */
const TH_UP="ัิีึื็่้๊๋์ํ",TH_LO="ุู",TONEM="่้๊๋์";
function strokesBox(st){let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const s of st)for(const[x,y]of s){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}return{x0,x1,y0,y1}}
/* lay out a string of glyphs: returns {strokes:[[pts]], w, h, y0} in one coordinate space */
function layout(str){const out=[];let x=0,base=null,hasUp=false;
  for(const ch of [...String(str)]){
    if(ch===" "){x+=30;base=null;continue}
    const st=STK&&STK[ch];if(!st)continue;const bb=strokesBox(st);
    const isMark=TH_UP.includes(ch)||TH_LO.includes(ch);
    if(isMark&&base){let tr;
      if(TONEM.includes(ch)){const sc=.32,cx=(bb.x0+bb.x1)/2,top=hasUp?-6:6;tr=([px,py])=>[base.cx+base.w*.18+(px-cx)*sc,top+(py-bb.y0)*sc]}
      else{const dx=base.cx-(bb.x0+bb.x1)/2;tr=([px,py])=>[px+dx,py]}
      if(!TONEM.includes(ch)&&TH_UP.includes(ch))hasUp=true;
      for(const s of st)out.push(s.map(tr));continue}
    const dx=x-bb.x0;for(const s of st)out.push(s.map(([px,py])=>[px+dx,py]));
    base={cx:x+(bb.x1-bb.x0)/2,w:bb.x1-bb.x0};hasUp=false;x+=bb.x1-bb.x0+12}
  const bb=strokesBox(out.length?out:[[[0,0],[100,100]]]);return{strokes:out,w:Math.max(x-12,1),bb}}
const canWrite=s=>{const cs=[...String(s)].filter(c=>c!==" ");return STK&&cs.length&&cs.every(c=>STK[c])};
const pathD=pts=>pts.map((p,i)=>(i?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1)).join("");
const isThaiStr=s=>/[฀-๿]/.test(s);
function guides(vb,thai){const[x,,w]=vb;const L=(y,c,d)=>`<line x1="${x}" x2="${x+w}" y1="${y}" y2="${y}" stroke="${c}" stroke-width=".8" ${d?`stroke-dasharray="${d}"`:""}/>`;
  return thai?L(35,"#dfe6f1")+L(75,"#f1c9c4")+L(15,"#eef1f5","3 3")+L(92,"#eef1f5","3 3"):L(20,"#dfe6f1")+L(45,"#dfe6f1","4 3")+L(75,"#f1c9c4")+L(92,"#eef1f5","2 3")}
function viewBoxFor(lo,pad){const bb=lo.bb,thai=true;const x0=Math.min(0,bb.x0)-pad,x1=Math.max(lo.w,bb.x1)+pad,y0=Math.min(0,bb.y0-4),y1=Math.max(100,bb.y1+4);const w=x1-x0,h=y1-y0,s=Math.max(w,h);
  return[x0-(s-w)/2,y0-(s-h)/2,s,s]}
function arrowAt(pts,col){const z=pts[pts.length-1],p=pts[Math.max(0,pts.length-3)],an=Math.atan2(z[1]-p[1],z[0]-p[0]),L=5;
  return`<path d="M${z[0]-L*Math.cos(an-.5)} ${z[1]-L*Math.sin(an-.5)}L${z[0]} ${z[1]}L${z[0]-L*Math.cos(an+.5)} ${z[1]-L*Math.sin(an+.5)}" fill="none" stroke="${col}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`}
function markSVG(ch,size){const st=(STK&&STK[ch])||[];return`<svg class="tmk" viewBox="0 0 100 100" width="${size}" height="${size}" aria-label="${esc(ch)}"><line x1="22" x2="78" y1="86" y2="86" stroke="#bdb8ae" stroke-width="6" stroke-linecap="round"/>${st.map(s=>`<path d="${pathD(s)}" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`).join("")}</svg>`}
/* step thumbnails like the Chinese stroke list */
function stepThumbs(lo,vb,thai){const acc=getComputedStyle(document.body).getPropertyValue("--accent").trim()||"#c33";
  return lo.strokes.map((s,k)=>`<div class="step"><svg viewBox="${vb.join(" ")}" width="78" height="78"><rect x="${vb[0]}" y="${vb[1]}" width="${vb[2]}" height="${vb[3]}" rx="8" fill="#fff"/>${guides(vb,thai)}
    ${lo.strokes.map((q,i)=>`<path d="${pathD(q)}" fill="none" stroke="${i<k?"#9a9389":i===k?acc:"#ece9e2"}" stroke-width="${i===k?6:5}" stroke-linecap="round" stroke-linejoin="round"/>`).join("")}
    <circle cx="${s[0][0]}" cy="${s[0][1]}" r="5.5" fill="#2f8a55"/><text x="${s[0][0]}" y="${s[0][1]+2.6}" font-size="7" text-anchor="middle" fill="#fff" font-weight="800" font-family="sans-serif">${k+1}</text>${arrowAt(s,"#1d1c1a")}</svg>
    <div><b>${TX("ขีด","Stroke")} ${k+1}</b><small>${strokeWords(s)}</small></div></div>`).join("")}
function strokeWords(s){const a=s[0],z=s[s.length-1];let len=0,turn=0;for(let i=1;i<s.length;i++)len+=Math.hypot(s[i][0]-s[i-1][0],s[i][1]-s[i-1][1]);
  const closed=Math.hypot(z[0]-a[0],z[1]-a[1])<6&&len>20;const dx=z[0]-a[0],dy=z[1]-a[1];
  const pos=(a[1]<40?TX("บน","top"):a[1]>65?TX("ล่าง","bottom"):TX("กลาง","middle"))+(a[0]<40?TX("ซ้าย"," left"):a[0]>60?TX("ขวา"," right"):"");
  const dir=closed?TX("วาดวงกลมแล้วกลับมาที่เดิม","draw a circle back to the start"):len<9?TX("จุดหรือขีดสั้น","a dot or short tick"):Math.abs(dx)>Math.abs(dy)*2?(dx>0?TX("ลากไปทางขวา","go right"):TX("ลากไปทางซ้าย","go left")):Math.abs(dy)>Math.abs(dx)*2?(dy>0?TX("ลากลงล่าง","go down"):TX("ลากขึ้นบน","go up")):TX("ลากตามเส้นโค้งไปจนสุด","follow the curve to the end");
  return TX("เริ่มที่จุดเขียว ด้าน","Start at the green dot, ")+pos+" · "+dir}
/* animated demo: draws strokes one after another */
function animate(svgEl,lo,vb,thai,onDone){const acc=getComputedStyle(document.body).getPropertyValue("--accent").trim()||"#c33";
  const sw=thai?6.5:7;
  svgEl.setAttribute("viewBox",vb.join(" "));
  svgEl.innerHTML=`${guides(vb,thai)}${lo.strokes.map(s=>`<path d="${pathD(s)}" fill="none" stroke="#ece9e2" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`).join("")}<g id="anl"></g>`;
  const g=svgEl.querySelector("#anl");let k=0,tok=(svgEl._tok||0)+1;svgEl._tok=tok;
  const one=()=>{if(svgEl._tok!==tok)return;if(k>=lo.strokes.length){onDone&&onDone();return}
    const s=lo.strokes[k];const p=document.createElementNS("http://www.w3.org/2000/svg","path");p.setAttribute("d",pathD(s));p.setAttribute("fill","none");p.setAttribute("stroke",acc);p.setAttribute("stroke-width",sw);p.setAttribute("stroke-linecap","round");p.setAttribute("stroke-linejoin","round");
    g.appendChild(p);const L=p.getTotalLength();p.style.strokeDasharray=L;p.style.strokeDashoffset=L;
    g.insertAdjacentHTML("beforeend",`<circle cx="${s[0][0]}" cy="${s[0][1]}" r="4" fill="#2f8a55"/><text x="${s[0][0]}" y="${s[0][1]+1.9}" font-size="5.2" text-anchor="middle" fill="#fff" font-weight="800" font-family="sans-serif">${k+1}</text>`);
    const dur=Math.max(350,L*14);p.getBoundingClientRect();p.style.transition=`stroke-dashoffset ${dur}ms linear`;p.style.strokeDashoffset=0;k++;setTimeout(one,dur+260)};
  one()}
/* practice: dotted letter, numbered start dot, checks each stroke */
function resample(pts,n){const d=[0];for(let i=1;i<pts.length;i++)d.push(d[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));const L=d[d.length-1]||1,out=[];
  for(let k=0;k<n;k++){const t=L*k/(n-1);let i=1;while(i<d.length-1&&d[i]<t)i++;const a=pts[i-1],b=pts[i]||a,seg=(d[i]-d[i-1])||1,u=Math.min(1,Math.max(0,(t-d[i-1])/seg));out.push([a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u])}return{p:out,L}}
function practice(box,lo,vb,thai,onDone){
  const acc=getComputedStyle(document.body).getPropertyValue("--accent").trim()||"#c33";
  box.innerHTML=`<svg viewBox="${vb.join(" ")}" id="wp-bg"></svg><canvas id="wp-cv"></canvas>`;
  const bg=box.querySelector("svg"),cv=box.querySelector("canvas");let k=0,miss=0,missAll=0;
  const scale=vb[2]/100,sw=(thai?6.5:7)*scale/ (vb[2]/100);
  const draw=hint=>{bg.innerHTML=`${guides(vb,thai)}${lo.strokes.map((s,i)=>i<k?`<path d="${pathD(s)}" fill="none" stroke="${acc}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`:`<path d="${pathD(s)}" fill="none" stroke="#cfcac0" stroke-width="2.4" stroke-dasharray="0.1 4.2" stroke-linecap="round"/>`).join("")}
    ${k<lo.strokes.length?(()=>{const s=lo.strokes[k];return`<path d="${pathD(s)}" fill="none" stroke="#bdb6aa" stroke-width="2.8" stroke-dasharray="0.1 4.2" stroke-linecap="round"/>${hint?`<path d="${pathD(s)}" fill="none" stroke="${acc}" stroke-opacity=".35" stroke-width="7" stroke-linecap="round"/>${arrowAt(s,acc)}`:""}<circle cx="${s[0][0]}" cy="${s[0][1]}" r="4.6" fill="#2f8a55"/><text x="${s[0][0]}" y="${s[0][1]+2.1}" font-size="6" text-anchor="middle" fill="#fff" font-weight="800" font-family="sans-serif">${k+1}</text>`})():""}`};
  draw(false);
  const fit=()=>{const r=box.getBoundingClientRect(),d=devicePixelRatio||1;cv.width=r.width*d;cv.height=r.height*d;const x=cv.getContext("2d");x.setTransform(d,0,0,d,0,0);x.lineCap="round";x.lineJoin="round";x.lineWidth=Math.max(7,r.width/34);x.strokeStyle="#2b2a28"};
  fit();let pts=[],down=false;
  const toG=e=>{const r=cv.getBoundingClientRect();return[vb[0]+(e.clientX-r.left)/r.width*vb[2],vb[1]+(e.clientY-r.top)/r.height*vb[3],e.clientX-r.left,e.clientY-r.top]};
  const clear=()=>{const x=cv.getContext("2d");x.save();x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,cv.width,cv.height);x.restore()};
  cv.onpointerdown=e=>{if(k>=lo.strokes.length)return;down=true;cv.setPointerCapture(e.pointerId);const p=toG(e);pts=[p];const x=cv.getContext("2d");x.beginPath();x.moveTo(p[2],p[3])};
  cv.onpointermove=e=>{if(!down)return;const p=toG(e),q=pts[pts.length-1];pts.push(p);const x=cv.getContext("2d");x.beginPath();x.moveTo(q[2],q[3]);x.lineTo(p[2],p[3]);x.stroke()};
  cv.onpointerup=cv.onpointercancel=()=>{if(!down)return;down=false;clear();if(pts.length<2&&k<lo.strokes.length&&lo.strokes[k].length>2){return}
    const exp=lo.strokes[k],u=resample(pts.map(p=>[p[0],p[1]]),24),v=resample(exp,24);
    const tol=Math.max(11,vb[2]*.12);
    const dist=(A,B)=>A.reduce((s,a,i)=>s+Math.hypot(a[0]-B[i][0],a[1]-B[i][1]),0)/A.length;
    const fw=dist(u.p,v.p),bw=dist(u.p,[...v.p].reverse());
    const shortOk=v.L<8&&Math.hypot(u.p[0][0]-v.p[0][0],u.p[0][1]-v.p[0][1])<tol;
    if(fw<tol||shortOk){k++;miss=0;draw(false);onDone&&onDone({k,n:lo.strokes.length,ok:true,missAll});if(k>=lo.strokes.length)onDone&&onDone({done:true,missAll})}
    else{miss++;missAll++;draw(miss>=2);onDone&&onDone({k,n:lo.strokes.length,ok:false,rev:bw<tol&&bw<fw})}};
  return{reset:()=>{k=0;miss=0;missAll=0;clear();draw(false)},hint:()=>draw(true)}}
function writingPanels(chars,title){
  const thai=chars.some(isThaiStr);
  return`<div class="panel" style="display:flex;flex-direction:column;gap:10px"><div class="row-flex" style="justify-content:space-between;flex-wrap:wrap"><h2>${TX("ขั้นตอนการเขียน","How to write it")}</h2>
    ${chars.length>1?`<div class="filters">${chars.map((g,i)=>`<button data-wc="${i}" aria-pressed="${i===0}">${esc(g)}</button>`).join("")}</div>`:""}</div>
    <svg class="wanim" id="w-anim"></svg>
    <div class="row-flex" style="justify-content:center"><button class="ghost" id="w-play">▶ ${TX("ดูการเขียนอีกครั้ง","Play again")}</button></div>
    <p class="hint" style="margin:0">${TX("จุดสีเขียวคือจุดเริ่ม ตัวเลขคือลำดับขีด ลูกศรคือทิศที่ลาก","Green dot = where to start · number = stroke order · arrow = direction")}${thai?TX(" · ตัวไทยส่วนใหญ่เริ่มที่หัว (วงเล็ก ๆ) แล้วลากต่อเนื่องไม่ยกมือ"," · Most Thai letters start at the small loop (the head) and go in one line"):""}</p>
    <div id="w-steps" class="steps"><div class="stepgrid"></div></div></div>
  <div class="panel" style="display:flex;flex-direction:column;gap:10px"><div class="row-flex" style="justify-content:space-between"><h2>${TX("ฝึกเขียนตามเส้นประ","Trace the dotted letter")}</h2><div class="row-flex" style="gap:6px"><button class="ghost" id="w-hint">${TX("ใบ้","Hint")}</button><button class="ghost" id="w-reset">${TX("เริ่มใหม่","Restart")}</button></div></div>
    <div class="wpaper" id="w-box"></div><div class="stars" id="w-stars"></div>
    <p class="hint" id="w-msg" style="text-align:center;margin:0">${TX("เริ่มที่จุดสีเขียวเลข 1 แล้วลากตามเส้นประทีละขีด","Start at green dot 1 and trace one stroke at a time")}</p></div>`}
function bindWriting(chars){
  let cur=0,pr=null;
  const load=i=>{cur=i;const s=chars[i],lo=layout(s),vb=viewBoxFor(lo,10),thai=isThaiStr(s);
    const an=$("#w-anim");animate(an,lo,vb,thai);$("#w-play").onclick=()=>animate(an,lo,vb,thai);
    $("#w-steps .stepgrid").innerHTML=stepThumbs(lo,vb,thai);
    const msg=$("#w-msg"),stars=$("#w-stars");stars.textContent="";
    pr=practice($("#w-box"),lo,vb,thai,r=>{
      if(r.done){const n=r.missAll===0?3:r.missAll<=2?2:1;stars.textContent="★".repeat(n)+"☆".repeat(3-n);msg.textContent=n===3?TX("เก่งมาก! เขียนถูกทุกขีด","Perfect! Every stroke right"):TX("เขียนครบแล้ว ลองอีกรอบให้ได้ 3 ดาว","Done! Try again for 3 stars");addXP(3);save();return}
      msg.textContent=r.ok?TX(`ถูกต้อง ขีด ${r.k} จาก ${r.n}`,`Good: stroke ${r.k} of ${r.n}`):r.rev?TX("ลากกลับทิศ ลองเริ่มที่จุดสีเขียว","Wrong direction: start at the green dot"):TX("ยังไม่ตรงเส้น ลองใหม่ (ผิด 2 ครั้งจะมีเส้นใบ้)","Not quite. Try again (a hint shows after 2 misses)")});
    $("#w-reset").onclick=()=>{pr.reset();stars.textContent="";msg.textContent=TX("เริ่มที่จุดสีเขียวเลข 1","Start at green dot 1")};
    $("#w-hint").onclick=()=>pr.hint();
    document.querySelectorAll("[data-wc]").forEach(b=>b.setAttribute("aria-pressed",+b.dataset.wc===i))};
  document.querySelectorAll("[data-wc]").forEach(b=>b.onclick=()=>load(+b.dataset.wc));
  load(0)}
/* example word written out (item 4: ตัวอย่างการเขียน) */
function wordDemoHTML(words){const ws=words.filter(w=>canWrite(w[0]));if(!ws.length)return"";
  return`<div class="panel" style="display:flex;flex-direction:column;gap:10px"><h2>${TX("ตัวอย่างการเขียนเป็นคำ","See it in a word")}</h2>
   <div class="exlist">${ws.map((w,i)=>`<button class="exw" data-wd="${i}"><span><b class="han">${esc(w[0])}</b><small>${esc(w[1]||"")}</small></span><span class="iconbtn" data-say="${esc(w[0])}" style="width:34px;height:34px">${ICON_PLAY}</span></button>`).join("")}</div>
   <svg class="wanim word" id="wd-anim"></svg><p class="hint" style="margin:0;text-align:center">${TX("แตะคำเพื่อดูลำดับการเขียนทั้งคำ","Tap a word to watch it written")}</p></div>`}
function bindWordDemo(words){const ws=words.filter(w=>canWrite(w[0]));if(!ws.length)return;
  const show=i=>{const s=ws[i][0],lo=layout(s),bb=lo.bb,thai=isThaiStr(s),x0=Math.min(0,bb.x0)-8,x1=Math.max(lo.w,bb.x1)+8,vb=[x0,Math.min(0,bb.y0-4),x1-x0,Math.max(100,bb.y1+4)-Math.min(0,bb.y0-4)];
    const sv=$("#wd-anim");sv.setAttribute("preserveAspectRatio","xMidYMid meet");animate(sv,lo,vb,thai)};
  document.querySelectorAll("[data-wd]").forEach(b=>b.onclick=e=>{if(e.target.closest("[data-say]"))return;show(+b.dataset.wd)});show(0)}
/* alphabet detail page for all non-Chinese scripts */
const _openAlpha=openAlpha;
openAlpha=function(it,group){
  if(lang==="zh")return _openAlpha(it,group);
  let chars=glyphs(it.c).filter(canWrite);
  if(!chars.length&&canWrite(String(it.c).replace(/\s+/g,"")))chars=[String(it.c).replace(/\s+/g,"")];
  if(chars.some(c=>[...c].length>8))chars=[];
  const exs=it.exs||(it.ex?[[String(it.ex),it.exm||""]]:[]);
  const big=it.tm?markSVG(it.c,150):esc(it.c);
  overlay(group,`<p class="glyph" style="color:var(--ink)">${big}</p>
    <div class="reveal" style="text-align:center">${it.name?`<p class="roman">${esc(it.name)}</p>`:""}${it.rd?`<p class="pron">${TX("เขียนว่า","Written")} ${esc(it.p)} · ${TX("อ่านว่า","read")} <b>${esc(it.rd)}</b></p>`:it.p?`<p class="pron">${TX("อ่านว่า","Read")} ${esc(it.p)}</p>`:""}</div>
    ${it.say?audioBtns(it.say):""}
    ${it.s?`<p class="tip"><b>${TX("เสียง/ความหมาย","Sound")}</b> ${esc(it.s)}</p>`:""}
    ${it.w?`<p class="tip"><b>${TX("วิธีเขียน","How to write")}</b> ${esc(it.w)}</p>`:""}
    ${it.tm?`<div class="panel" style="display:flex;flex-direction:column;gap:8px"><h2>${TX("คำที่ใช้วรรณยุกต์นี้","Words that use this mark")}</h2><div class="exlist">${exs.map(w=>`<button class="exw" data-say="${esc(w[0])}"><span><b>${esc(w[0])}</b><small>${esc(w[1])}</small></span><span class="iconbtn" style="width:34px;height:34px">${ICON_PLAY}</span></button>`).join("")}</div></div>`
      :exs.length?`<div class="exbox"><div style="flex:1;min-width:0"><span class="han">${esc(exs[0][0])}</span><small>${esc(exs[0][1])}</small></div><button class="iconbtn" aria-label="ฟังตัวอย่าง" data-say="${esc(String(exs[0][0]).split(/\s+/)[0])}">${ICON_PLAY}</button></div>`:""}
    ${chars.length?writingPanels(chars):""}
    ${wordDemoHTML(exs.map(w=>[String(w[0]).split(/\s+/)[0],w[1]]))}`);
  if(chars.length)bindWriting(chars);
  bindWordDemo(exs.map(w=>[String(w[0]).split(/\s+/)[0],w[1]]));
  if(it.say)speak(it.say);
};

/* =================== QUIZ POOL (item 7) =================== */
function mixedPool(){const l=shuffle(learnedCards().filter(c=>c.m)).slice(0,10);if(l.length>=6)return l;const ids=new Set(l.map(c=>c.id));
  const un=unseenOrdered().filter(c=>!ids.has(c.id)&&c.m&&c.g!=="mine"),sit=un.filter(c=>/^s_/.test(c.g));
  return l.concat((sit.length>=10?sit:un).slice(0,10-l.length))}

/* =================== GAMES (items 8-11) =================== */
const PW=it=>({zh:it.zh,de:it.de,en:it.en,fr:it.fr,th:it.th})[lang];
const PR=it=>lang==="zh"?it.zhr:lang==="th"?it.thr:"";
const PM=it=>(lang==="th"||TRL()!=="th")?it.en:it.th;
const scenesFor=g=>(PIC.scenes||[]).filter(s=>s.topics.includes(g));
function gameShell(title,body,foot){const el=$("#study");el.hidden=false;document.body.style.overflow="hidden";
  el.innerHTML=`<div class="top"><button class="x" id="gx" aria-label="ออก">×</button><div style="flex:1;font-weight:800;min-width:0">${esc(title)}</div><span class="combo" id="gscore"></span>${musicBtn()}</div><div class="stage" id="stage">${body}</div>${foot?`<div class="foot" id="gfoot">${foot}</div>`:""}`;
  $("#gx").onclick=()=>{GT&&clearInterval(GT);closeStudy()};bindMusic();musicStart();return el}
let GT=null;
function scenePicker(title,cb,extra){
  gameShell(title,`<div class="row-flex">${mascot("happy",64)}<p class="hint" style="flex:1">${TX("เลือกสถานการณ์ที่อยากเล่น","Pick a situation")}</p></div>${extra||""}
   <div class="pickscene">${PIC.scenes.map((s,i)=>`<button data-sc="${i}"><span class="e">${s.items[0].e}${s.items[1].e}</span><b>${esc(lang==="th"?sceneEN[s.key]||s.key:s.th)}</b><small>${s.items.length} ${TX("คำ","words")}</small></button>`).join("")}</div>`);
  document.querySelectorAll("[data-sc]").forEach(b=>b.onclick=()=>cb(PIC.scenes[+b.dataset.sc]))}
const sceneEN={resto:"Restaurant",market:"Market",shop:"Clothes shop",travel:"Travel",city:"In town",hotel:"Hotel",home:"Home",health:"Health",office:"Office & school",nature:"Nature & weather",animals:"Animals",free:"Free time"};
const diffBtns=(cur)=>`<div class="seg2" role="group" id="diff">${[["e",TX("ง่าย","Easy")],["m",TX("กลาง","Medium")],["h",TX("ยาก","Hard")]].map(([k,l])=>`<button data-df="${k}" aria-pressed="${cur===k}">${l}</button>`).join("")}</div>`;
let DIFF="e";
function bindDiff(){document.querySelectorAll("[data-df]").forEach(b=>b.onclick=()=>{DIFF=b.dataset.df;document.querySelectorAll("[data-df]").forEach(x=>x.setAttribute("aria-pressed",x===b))})}
function endScreen(title,score,lines,again,list){
  gameShell(title,`<div class="done"><div class="pkrow">${mascot(score>=70?"win":"happy",120)}</div><div class="xp pop">${score}</div><div style="font-weight:800;font-size:20px">${TX("คะแนน","points")}</div>${lines||""}</div>${list||""}`,
   `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><button class="primary" id="eagain">${TX("เล่นอีกรอบ","Play again")}</button><button class="ghost" id="eclose">${TX("กลับ","Back")}</button></div>`);
  addXP(Math.round(score/5));bump();const s=S();s.tests=(s.tests||[]).concat([{d:Date.now(),title,pct:Math.min(100,score),score,n:0}]).slice(-40);save();
  $("#eagain").onclick=again;$("#eclose").onclick=closeStudy;if(score>=70)confetti()}


/* =================== GAME FEEDBACK: sounds + right/wrong marks =================== */
let AC=null;
function sfx(kind){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume();
  const t=AC.currentTime,g=AC.createGain();g.connect(AC.destination);
  const tone=(f,a,d,type,vol)=>{const o=AC.createOscillator(),v=AC.createGain();o.type=type||"sine";o.frequency.setValueAtTime(f,t+a);v.gain.setValueAtTime(0,t+a);v.gain.linearRampToValueAtTime(vol||.18,t+a+.01);v.gain.exponentialRampToValueAtTime(.0001,t+a+d);o.connect(v);v.connect(g);o.start(t+a);o.stop(t+a+d+.02)};
  if(kind==="ok"){tone(659,0,.18,"triangle");tone(988,.09,.28,"triangle")}
  else if(kind==="bad"){tone(196,0,.22,"square",.07);tone(147,.1,.26,"square",.06)}
  else if(kind==="win"){[523,659,784,1047].forEach((f,i)=>tone(f,i*.09,.3,"triangle",.16))}
  else tone(880,0,.05,"sine",.08)}catch(e){}}
function gfb(ok,msg,at){const st=$("#stage")||$("#study");if(!st)return;let b=$("#gfb");if(!b){b=document.createElement("div");b.id="gfb";b.setAttribute("role","status");b.setAttribute("aria-live","polite");$("#study").appendChild(b)}
  b.className="gfb "+(ok?"ok":"bad");b.innerHTML=`${mascot(ok?"happy":"oops",44)}<b>${ok?"✓":"✗"}</b><span>${msg}</span>`;b.hidden=false;clearTimeout(b._t);b._t=setTimeout(()=>{b.hidden=true},1700);
  if(at){const r=at.getBoundingClientRect(),m=document.createElement("span");m.className="gmark "+(ok?"ok":"bad");m.textContent=ok?"✓":"✗";m.style.left=(r.left+r.width/2)+"px";m.style.top=(r.top+r.height/2)+"px";document.body.appendChild(m);setTimeout(()=>m.remove(),900)}}
/* the classic games get the same sounds */
const _resolveQ=resolveQ;resolveQ=function(ok,timeout){if(T&&T.qs[T.i]&&!T.qs[T.i].done)sfx(ok?"ok":"bad");return _resolveQ(ok,timeout)};
document.addEventListener("click",e=>{const b=e.target.closest("#study button,#onb button");if(b&&!b.closest("[data-fi],[data-fo],[data-i],[data-j],#ws,[data-ci]"))sfx("tap")},true);


/* =================== LIGHT GAME MUSIC (on/off, remembered) =================== */
let musicOn=(()=>{try{return localStorage.getItem("koel-music")!=="0"}catch(e){return true}})(),MUS=null;
function musicStart(){if(!musicOn||MUS)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume()}catch(e){return}
  const out=AC.createGain();out.gain.value=0;out.connect(AC.destination);out.gain.linearRampToValueAtTime(.05,AC.currentTime+1.2);
  const BPM=96,B=60/BPM,mel=[0,4,7,9,7,4,2,4, 0,2,4,7,9,7,4,2],scale=[523.25,587.33,659.25,698.46,783.99,880,987.77,1046.5];
  const PENT=[523.25,587.33,659.25,783.99,880,1046.5],chords=[[261.63,329.63,392],[220,261.63,329.63],[174.61,220,261.63],[196,246.94,293.66]];
  let step=0,next=AC.currentTime+.1;
  const note=(f,t,d,type,v)=>{const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(out);o.start(t);o.stop(t+d+.05)};
  const tick=()=>{while(next<AC.currentTime+.4){const bar=Math.floor(step/8)%4;
      if(step%8===0)chords[bar].forEach(f=>note(f,next,B*7.5,"sine",.35));
      if(step%2===0)note(PENT[(mel[step%16]+bar)%PENT.length],next,B*.9,"triangle",.55);
      if(step%4===2)note(PENT[(step/2+bar*2)%PENT.length]*.5,next,B*.5,"sine",.25);
      step++;next+=B/2}};
  MUS={out,timer:setInterval(tick,120)};tick()}
function musicStop(){if(!MUS)return;const m=MUS;MUS=null;try{m.out.gain.cancelScheduledValues(AC.currentTime);m.out.gain.setValueAtTime(m.out.gain.value,AC.currentTime);m.out.gain.linearRampToValueAtTime(0,AC.currentTime+.4)}catch(e){}setTimeout(()=>{clearInterval(m.timer);try{m.out.disconnect()}catch(e){}},500)}
function musicBtn(){return`<button class="x musicbtn" id="gmusic" aria-pressed="${musicOn}" aria-label="${musicOn?TX("ปิดเพลง","Music off"):TX("เปิดเพลง","Music on")}" title="${musicOn?TX("ปิดเพลง","Music off"):TX("เปิดเพลง","Music on")}">${musicOn?"♫":"<s>♫</s>"}</button>`}
function bindMusic(){const b=$("#gmusic");if(!b)return;b.onclick=e=>{e.stopPropagation();musicOn=!musicOn;try{localStorage.setItem("koel-music",musicOn?"1":"0")}catch(_){}if(musicOn)musicStart();else musicStop();b.outerHTML=musicBtn();bindMusic()}}
const _closeStudy=closeStudy;closeStudy=function(){musicStop();return _closeStudy()};

/* ---- 8. Flashcards by situation ---- */
function flashPicker(){const T=topics(),order=Object.keys(T).filter(g=>g!=="mine");
  gameShell(TX("แฟลชการ์ดตามสถานการณ์","Flashcards by topic"),`<p class="hint">${TX("เลือกชุดการ์ด ดูด้านหน้าแล้วเลือกความหมาย ตอบผิดการ์ดจะพลิกเฉลยพร้อมคำแปล คำอธิบาย และตัวอย่างการใช้","Pick a set. Read the front and choose the meaning; a wrong answer flips the card to show the translation, note and example.")}</p>
   <div class="pickscene">${order.map(g=>`<button data-fg="${g}"><span class="e han" style="font-size:20px;color:var(--accent);font-weight:800">${esc((DATA[lang].icons||{})[g]||"＊")}</span><b>${esc(T[g])}</b><small>${topicCards(g).length} ${TX("ใบ","cards")}</small></button>`).join("")}</div>`);
  document.querySelectorAll("[data-fg]").forEach(b=>b.onclick=()=>startFlash(b.dataset.fg))}
let FC=null;
function startFlash(g){const cs=shuffle(topicCards(g).filter(c=>c.m)).slice(0,12);if(cs.length<4){toast(TX("ชุดนี้มีการ์ดน้อยเกินไป","Not enough cards"));return}
  FC={g,cs,i:0,score:0,right:0,miss:[]};drawFlash()}
function drawFlash(state){const c=FC.cs[FC.i];if(!c)return endFlash();
  if(!state){const pool=shuffle(deck().filter(x=>x.id!==c.id&&x.m&&x.m!==c.m&&x.g===c.g)).slice(0,3);const more=pool.length<3?shuffle(deck().filter(x=>x.m&&x.m!==c.m&&!pool.includes(x))).slice(0,3-pool.length):[];const seen=new Set([c.m]);FC.opts=shuffle([c,...pool,...more].filter(o=>o===c||(!seen.has(o.m)&&seen.add(o.m))));FC.pick=null}
  const done=FC.pick!=null||state==="rev",flip=done;
  gameShell(TX("แฟลชการ์ด: ","Flashcards: ")+topicName(FC.g),`
   <div class="bar"><i style="width:${FC.i/FC.cs.length*100}%"></i></div>
   <div class="fc ${flip?"flip":""}" id="fc"><div class="in">
     <div class="face front"><span class="tag">${TX("ด้านหน้า · แตะเพื่อพลิก","Front · tap to flip")}</span><p class="big han">${esc(c.t)}</p>${lang==="zh"&&c.r?`<p class="roman">${esc(c.r)}</p>`:""}<button class="play" data-say="${esc(c.t)}">${ICON_PLAY} ${TX("ฟัง","Listen")}</button></div>
     <div class="face back"><span class="tag">${TX("เฉลย","Answer")}</span><p class="han" style="font-size:24px;font-weight:800;margin:0">${esc(c.t)}</p>${c.r?`<p class="roman" style="margin:0">${esc(c.r)}</p>`:""}${c.p?`<p class="pron" style="margin:0">${esc(c.p)}</p>`:""}
       <p class="mean" style="margin:4px 0">${esc(c.m)} ${regTag(c)}</p>${c.n?`<p class="tip" style="margin:0"><b>${TX("คำอธิบาย","Note")}</b> ${esc(c.n)}</p>`:""}
       ${c.ex?`<div class="exbox"><div style="flex:1;min-width:0"><span class="han">${esc(c.ex)}</span>${c.exr?`<small>${esc(c.exr)}</small>`:""}<small>${esc(c.exm)}</small></div><button class="iconbtn" data-say="${esc(c.ex)}">${ICON_PLAY}</button></div>`:`<p class="hint" style="margin:0">${TX("ยังไม่มีตัวอย่างประโยค","No example yet")}</p>`}</div></div></div>
   <p class="ask" style="text-align:center;font-size:17px">${TX("แปลว่าอะไร?","What does it mean?")}</p>
   <div class="opts">${FC.opts.map((o,i)=>{let cl="";if(done){if(o.id===c.id)cl="right";else if(FC.pick===i)cl="wrong"}return`<button class="opt ${cl}" data-fo="${i}" ${done?"disabled":""}>${esc(o.m)}</button>`}).join("")}</div>`,
   done?`<p class="fbline" style="color:${FC.pick!=null&&FC.opts[FC.pick].id===c.id?"var(--good)":"var(--again)"}">${FC.pick==null?TX("เปิดเฉลยแล้ว","Answer shown"):FC.opts[FC.pick].id===c.id?TX("ถูกต้อง! +10","Correct! +10"):TX("ยังไม่ใช่ ดูเฉลยด้านบน","Not quite: see the answer above")}</p><button class="primary" id="fnext">${FC.i+1<FC.cs.length?TX("การ์ดต่อไป","Next card"):TX("ดูผล","See results")}</button>`
     :`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><button class="ghost" id="fflip">${TX("พลิกการ์ด","Flip")}</button><button class="ghost" id="frev">${TX("กดเฉลย","Show answer")}</button></div>`);
  $("#gscore").textContent=FC.score;
  $("#fc").onclick=e=>{if(e.target.closest("[data-say]"))return;$("#fc").classList.toggle("flip")};
  const ff=$("#fflip");if(ff)ff.onclick=()=>$("#fc").classList.toggle("flip");
  const fr=$("#frev");if(fr)fr.onclick=()=>{FC.miss.push(c);drawFlash("rev")};
  document.querySelectorAll("[data-fo]").forEach(b=>b.onclick=()=>{FC.pick=+b.dataset.fo;const ok=FC.opts[FC.pick].id===c.id;if(ok){FC.score+=10;FC.right++;sfx("ok")}else{FC.miss.push(c);sfx("bad")}drawFlash("ans")});
  const fn=$("#fnext");if(fn)fn.onclick=()=>{fn.disabled=true;whenQuiet(()=>{FC.i++;drawFlash()},4000)};
  if(!state)speak(c.t)}
function endFlash(){const pct=Math.round(FC.right/FC.cs.length*100),miss=FC.miss;
  endScreen(TX("แฟลชการ์ด","Flashcards"),pct,`<p class="hint">${TX(`ถูก ${FC.right} จาก ${FC.cs.length} ใบ`,`${FC.right} of ${FC.cs.length} right`)}</p>`,()=>startFlash(FC.g),
   miss.length?`<h2>${TX("การ์ดที่ควรทบทวน","Cards to review")}</h2><div class="list">${miss.map(itemHTML).join("")}</div>`:"")}

/* ---- 9. Word search ---- */
const stripArt=w=>String(w).replace(/^(der|die|das|le|la|les|l'|l’)\s*/i,"");
const noAcc=w=>w.normalize("NFD").replace(/[̀-ͯ]/g,"");
function cellsOf(w){w=stripArt(w);if(lang==="zh")return[...w.replace(/\s/g,"")];
  if(lang==="th"){const s=w.replace(/\s/g,"");try{return[...new Intl.Segmenter("th",{granularity:"grapheme"}).segment(s)].map(x=>x.segment)}catch(e){return s.match(/[ก-ฮะาำเแโใไๅฤฦ][ั-ฺ็-๎]*/g)||[...s]}}
  return[...noAcc(w).toUpperCase().replace(/ß/g,"SS").replace(/[^A-Z]/g,"")]}
let WS=null;
function wsStart(sc){const size=lang==="zh"?{e:6,m:7,h:8}[DIFF]:{e:8,m:10,h:12}[DIFF],nw={e:6,m:8,h:10}[DIFF];
  const dirs=DIFF==="e"?[[1,0],[0,1]]:DIFF==="m"?[[1,0],[0,1],[1,1],[1,-1]]:[[1,0],[0,1],[1,1],[1,-1],[-1,0],[0,-1],[-1,-1],[-1,1]];
  let best=null;
  for(let attempt=0;attempt<30&&!best;attempt++){const grid=Array.from({length:size},()=>Array(size).fill(null)),words=[];
    for(const it of shuffle(sc.items.slice())){if(words.length>=nw)break;const cs=cellsOf(PW(it));if(cs.length<2||cs.length>size)continue;
      let placed=false;for(let t=0;t<120&&!placed;t++){const[dx,dy]=dirs[Math.floor(Math.random()*dirs.length)],x=Math.floor(Math.random()*size),y=Math.floor(Math.random()*size),ex=x+dx*(cs.length-1),ey=y+dy*(cs.length-1);
        if(ex<0||ey<0||ex>=size||ey>=size)continue;let ok=true;for(let i=0;i<cs.length;i++){const g=grid[y+dy*i][x+dx*i];if(g&&g!==cs[i]){ok=false;break}}
        if(!ok)continue;for(let i=0;i<cs.length;i++)grid[y+dy*i][x+dx*i]=cs[i];words.push({it,cs,cells:cs.map((_,i)=>[x+dx*i,y+dy*i]),found:false});placed=true}}
    if(words.length>=Math.min(nw,4))best={grid,words}}
  const fill=lang==="zh"||lang==="th"?PIC.scenes.flatMap(s=>s.items.flatMap(it=>cellsOf(PW(it)))):[..."ABCDEFGHIJKLMNOPRSTUEAIO"];
  for(const r of best.grid)for(let i=0;i<r.length;i++)if(!r[i])r[i]=fill[Math.floor(Math.random()*fill.length)];
  WS={sc,size,...best,score:0,t0:Date.now(),sel:null,revealed:false};drawWS();
  clearInterval(GT);GT=setInterval(()=>{const t=$("#gscore");if(t&&WS)t.textContent=Math.floor((Date.now()-WS.t0)/1000)+" "+TX("วิ","s")},500)}
function drawWS(){const W=WS;const hard=DIFF==="h";
  gameShell(TX("หาคำศัพท์: ","Word search: ")+(lang==="th"?sceneEN[W.sc.key]:W.sc.th),`
   <p class="hint" style="text-align:center;margin:0">${TX("ลากนิ้วจากตัวแรกถึงตัวสุดท้ายของคำ (หรือแตะตัวแรกแล้วแตะตัวสุดท้าย)","Drag from the first to the last letter (or tap first, then last)")}${DIFF!=="e"?TX(" · มีแนวทแยง",""):""}${hard?TX(" · คำอาจกลับหลัง"," · words may run backwards"):""}</p>
   <div class="ws" id="ws" style="grid-template-columns:repeat(${W.size},1fr)">${W.grid.map((r,y)=>r.map((ch,x)=>`<button data-x="${x}" data-y="${y}">${esc(ch)}</button>`).join("")).join("")}</div>
   <div class="wlist">${W.words.map((w,i)=>`<span class="${w.found?"ok":""}" data-wi="${i}" data-say="${esc(PW(w.it))}" role="button" tabindex="0" title="${TX("แตะเพื่อฟัง","Tap to hear")}">${w.it.e} ${hard&&!w.found?esc(PM(w.it)):esc(stripArt(PW(w.it)))}</span>`).join("")}</div>`,
   `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><p class="hint" style="margin:0;align-self:center">${TX("เจอแล้ว","Found")} <b>${W.words.filter(w=>w.found).length}/${W.words.length}</b> · ${W.score} ${TX("คะแนน","pts")}</p><button class="ghost" id="wsrev">${TX("กดเฉลย","Show answers")}</button></div>`);
  paintWS();
  const box=$("#ws");let start=null,curEnd=null;
  const cellAt=e=>{const el=document.elementFromPoint(e.clientX,e.clientY);return el&&el.dataset&&el.dataset.x!=null?[+el.dataset.x,+el.dataset.y]:null};
  const line=(a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],n=Math.max(Math.abs(dx),Math.abs(dy));if(!(dx===0||dy===0||Math.abs(dx)===Math.abs(dy)))return null;const sx=Math.sign(dx),sy=Math.sign(dy);return Array.from({length:n+1},(_,i)=>[a[0]+sx*i,a[1]+sy*i])};
  const hi=cells=>{box.querySelectorAll(".sel").forEach(b=>b.classList.remove("sel"));(cells||[]).forEach(([x,y])=>box.querySelector(`[data-x="${x}"][data-y="${y}"]`).classList.add("sel"))};
  box.onpointerdown=e=>{const c=cellAt(e);if(!c)return;e.preventDefault();
    if(W.sel&&!(W.sel[0]===c[0]&&W.sel[1]===c[1])){const l=line(W.sel,c);W.sel=null;hi(null);if(l)check(l);return}
    start=c;curEnd=c;hi([c]);box.setPointerCapture(e.pointerId)};
  box.onpointermove=e=>{if(!start)return;const c=cellAt(e);if(!c)return;curEnd=c;hi(line(start,c)||[start])};
  box.onpointerup=()=>{if(!start)return;const a=start,b=curEnd;start=null;if(a[0]===b[0]&&a[1]===b[1]){W.sel=a;return}hi(null);const l=line(a,b);if(l)check(l)};
  $("#wsrev").onclick=()=>{W.revealed=true;W.words.forEach(w=>w.rev=!w.found);paintWS();setTimeout(endWS,1600)};
  function check(l){const key=l.map(([x,y])=>x+","+y).join("|");
    const hit=W.words.find(w=>!w.found&&(w.cells.map(c=>c.join(",")).join("|")===key||[...w.cells].reverse().map(c=>c.join(",")).join("|")===key));
    if(hit){hit.found=true;sfx("ok");W.score+=10+Math.max(0,20-Math.floor((Date.now()-W.t0)/15000));speak(PW(hit.it));gfb(true,hit.it.e+" "+esc(PW(hit.it))+(PR(hit.it)?" ("+esc(PR(hit.it))+")":"")+" = "+esc(PM(hit.it)));
      if(W.words.every(w=>w.found)){sfx("win");drawWS();setTimeout(endWS,900)}else drawWS()}
    else{sfx("bad");gfb(false,TX("ยังไม่ใช่คำในรายการ ลองหาใหม่","That's not one of the words. Try again"));l.forEach(([x,y])=>{const b=box.querySelector(`[data-x="${x}"][data-y="${y}"]`);b.classList.add("miss");setTimeout(()=>b.classList.remove("miss"),600)})}}}
function paintWS(){const box=$("#ws");if(!box)return;for(const w of WS.words)if(w.found||w.rev)for(const[x,y]of w.cells)box.querySelector(`[data-x="${x}"][data-y="${y}"]`).classList.add(w.found?"found":"rev")}
function endWS(){clearInterval(GT);const W=WS,f=W.words.filter(w=>w.found).length,secs=Math.floor((Date.now()-W.t0)/1000);
  const score=Math.min(100,Math.round(f/W.words.length*80)+(f===W.words.length?Math.max(0,20-Math.floor(secs/20)):0));
  endScreen(TX("หาคำศัพท์","Word search"),score,`<p class="hint">${TX(`เจอ ${f} จาก ${W.words.length} คำ · ${secs} วินาที`,`${f} of ${W.words.length} words · ${secs}s`)}</p>`,()=>wsStart(W.sc),
   `<h2>${TX("คำในรอบนี้","Words")}</h2><div class="list">${W.words.map(w=>`<div class="item"><div class="t han">${w.it.e} ${esc(PW(w.it))}</div><div class="side"><button class="iconbtn" data-say="${esc(PW(w.it))}">${ICON_PLAY}</button></div><div class="s">${esc(PR(w.it))}</div><div class="m">${esc(PM(w.it))}</div></div>`).join("")}</div>`)}

/* ---- 10. Picture–word jigsaw ---- */
const JL="M6 6H176V28C200 20 200 64 176 56V78H6Z",JR="M0 6H194V78H0V56C24 64 24 20 0 28Z";
let JG=null;
function jigStart(sc){const n={e:4,m:6,h:8}[DIFF];const items=shuffle(sc.items.slice()).slice(0,n);
  JG={sc,items,L:shuffle(items.slice()),R:shuffle(items.slice()),done:[],sel:null,err:0,t0:Date.now()};drawJig();
  clearInterval(GT);GT=setInterval(()=>{const t=$("#gscore");if(t&&JG)t.textContent=Math.floor((Date.now()-JG.t0)/1000)+" "+TX("วิ","s")},500)}
function piece(kind,it,label,cls){return`<button class="jp ${kind} ${cls||""}" data-j="${kind}:${JG.items.indexOf(it)}"><svg viewBox="0 0 200 84" preserveAspectRatio="none"><path d="${kind==="pic"?JL:JR}" fill="#fff" stroke="#d9d4ca" stroke-width="2.5"/></svg><span class="lab ${kind==="word"?"han":""}">${label}</span></button>`}
function drawJig(){const J=JG,done=J.done.map(i=>J.items[i]);
  const rows=done.map(it=>piece("pic",it,it.e,"done")+`<div style="margin-left:-12%">${piece("word",it,esc(stripArt(PW(it)))+(DIFF==="e"?`<br><small style="font-weight:400;font-size:12px;color:var(--muted)">${esc(PM(it))}</small>`:""),"done")}</div>`).join("");
  const Lr=J.L.filter(it=>!done.includes(it)),Rr=J.R.filter(it=>!done.includes(it));
  gameShell(TX("จิ๊กซอว์: ","Jigsaw: ")+(lang==="th"?sceneEN[J.sc.key]:J.sc.th),`
   <p class="hint" style="text-align:center;margin:0">${TX("แตะชิ้นภาพ แล้วแตะชิ้นคำที่ตรงกัน ชิ้นจะต่อกันเป็นจิ๊กซอว์","Tap a picture piece, then the matching word piece to join them")}</p>
   <div class="jg">${rows}${Array.from({length:Math.max(Lr.length,Rr.length)},(_,i)=>(Lr[i]?piece("pic",Lr[i],Lr[i].e,J.sel==="pic:"+J.items.indexOf(Lr[i])?"sel":""):"<div></div>")+(Rr[i]?`<div style="margin-left:-12%">${piece("word",Rr[i],esc(stripArt(PW(Rr[i]))),J.sel==="word:"+J.items.indexOf(Rr[i])?"sel":"")}</div>`:"<div></div>")).join("")}</div>`,
   `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><p class="hint" style="margin:0;align-self:center">${TX("ต่อแล้ว","Joined")} <b>${J.done.length}/${J.items.length}</b></p><button class="ghost" id="jrev">${TX("กดเฉลย","Show answers")}</button></div>`);
  document.querySelectorAll(".jp:not(.done)").forEach(b=>b.onclick=()=>{const[k,i]=b.dataset.j.split(":");
    if(!J.sel||J.sel.split(":")[0]===k){J.sel=b.dataset.j;drawJig();return}
    const[k0,i0]=J.sel.split(":");J.sel=null;
    if(i0===i){J.done.push(+i);sfx("ok");gfb(true,J.items[+i].e+" = "+esc(PW(J.items[+i]))+" · "+esc(PM(J.items[+i])));speak(PW(J.items[+i]));if(J.done.length===J.items.length){drawJig();setTimeout(endJig,800)}else drawJig()}
    else{J.err++;sfx("bad");const a=J.items[+i0],c2=J.items[+i];gfb(false,TX("ยังไม่ใช่ ","Not a match: ")+(k==="word"?a.e+" ≠ "+esc(stripArt(PW(c2))):esc(stripArt(PW(a)))+" ≠ "+c2.e));b.classList.add("bad");setTimeout(()=>drawJig(),650)}});
  $("#jrev").onclick=()=>{J.revealed=true;J.items.forEach((_,i)=>{if(!J.done.includes(i))J.done.push(i)});drawJig();setTimeout(endJig,1800)}}
function endJig(){clearInterval(GT);if(!JG.revealed)sfx("win");const J=JG,secs=Math.floor((Date.now()-J.t0)/1000);
  const score=J.revealed?20:Math.max(30,100-J.err*10-Math.max(0,secs-J.items.length*6));
  endScreen(TX("จิ๊กซอว์ภาพ-คำ","Picture jigsaw"),score,`<p class="hint">${TX(`ต่อผิด ${J.err} ครั้ง · ${secs} วินาที`,`${J.err} mistakes · ${secs}s`)}</p>`,()=>jigStart(J.sc),
   `<h2>${TX("คำในรอบนี้","Words")}</h2><div class="list">${J.items.map(it=>`<div class="item"><div class="t han">${it.e} ${esc(PW(it))}</div><div class="side"><button class="iconbtn" data-say="${esc(PW(it))}">${ICON_PLAY}</button></div><div class="s">${esc(PR(it))}</div><div class="m">${esc(PM(it))}</div></div>`).join("")}</div>`)}

/* ---- 11. Find the object (levels, easy -> hard) ---- */
const FOK="koel-find";
const foSave=()=>{let o={};try{o=JSON.parse(localStorage.getItem(FOK)||"{}")}catch(e){}return o};
function foLevels(){const o=foSave()[lang]||{},n=PIC.scenes.length;
  gameShell(TX("หาของในภาพ","Find it!"),`<div class="row-flex">${mascot("think",64)}<p class="hint" style="flex:1">${TX("ฟังหรืออ่านคำศัพท์ แล้วแตะของในภาพให้ถูก ด่านแรก ๆ มีคำแปลช่วย ด่านหลัง ๆ ของเยอะขึ้น เล็กลง และต้องฟังอย่างเดียว","Read or listen to the word and tap that thing in the picture. Later levels have more, smaller things and audio only.")}</p></div>
   <div class="lvls">${PIC.scenes.map((s,i)=>{const st=o[i]||0,open=i===0||o[i-1]>0;return`<button class="lvl-b ${open&&!st?"cur":""}" data-lv="${i}" ${open?"":"disabled"}><span class="e">${open?s.items[2].e:"🔒"}</span><b>${i+1}</b><small>${esc(lang==="th"?sceneEN[s.key]:s.th)}</small><small style="color:#f2b51d">${"★".repeat(st)}${"☆".repeat(3-st)}</small></button>`}).join("")}</div>`);
  document.querySelectorAll("[data-lv]").forEach(b=>b.onclick=()=>foStart(+b.dataset.lv))}
let FO=null;
function foStart(k){const sc=PIC.scenes[k],lvl=k+1;
  const own=shuffle(sc.items.slice()).slice(0,Math.min(16,7+lvl));
  const others=shuffle(PIC.scenes.filter(s=>s!==sc).flatMap(s=>s.items)).slice(0,Math.max(0,lvl*2-4));
  const all=shuffle(own.concat(others));
  const ar=innerWidth>=640?.75:1.25;                 /* container height / width */
  let cols=Math.max(4,Math.ceil(Math.sqrt(all.length/ar)*1.05)),rows=Math.ceil(all.length/cols);
  while(cols*rows<all.length)rows++;
  const cw=100/cols,ch=100/rows,size=Math.min(12-lvl*.4,cw*.6,ch*ar*.6);
  const cells=shuffle([...Array(cols*rows).keys()]).slice(0,all.length),pos=cells.map(c=>{const cx=c%cols,cy=Math.floor(c/cols),fw=size*1.55,fh=size*1.55/ar;
    return{x:cx*cw+Math.random()*Math.max(0,cw-fw),y:cy*ch+Math.random()*Math.max(0,ch-fh)}});
  FO={k,lvl,sc,all,pos,size,targets:shuffle(own.slice()).slice(0,5),ti:0,hearts:3,miss:0,found:[],t0:Date.now(),mode:lvl<=4?"both":lvl<=8?"word":"audio",tries:0};
  drawFO();speakTarget();
  clearInterval(GT);GT=setInterval(()=>{const t=$("#gscore");if(t&&FO)t.textContent="♥".repeat(FO.hearts)+"♡".repeat(3-FO.hearts)},400)}
function speakTarget(){const t=FO.targets[FO.ti];if(t)speak(PW(t))}
function drawFO(){const F=FO,t=F.targets[F.ti],sc=F.sc,rot=8+F.lvl*3;
  const ask=F.mode==="audio"&&F.tries<2?`<button class="play" id="fo-say">${ICON_PLAY} ${TX("ฟังอีกครั้ง","Listen again")}</button><span class="hint">${TX("ฟังแล้วหาให้เจอ","Listen and find it")}</span>`
   :`<b class="han">${esc(PW(t))}</b>${PR(t)?`<span class="roman" style="font-size:15px">${esc(PR(t))}</span>`:""}${F.mode==="both"?`<span class="hint">= ${esc(PM(t))}</span>`:""}<button class="iconbtn" id="fo-say">${ICON_PLAY}</button>`;
  gameShell(TX("ด่าน ","Level ")+F.lvl+" · "+(lang==="th"?sceneEN[sc.key]:sc.th),`
   <div class="fo-ask">${TX("หา: ","Find: ")}${ask}</div>
   <div class="fo" id="fo" style="background:linear-gradient(160deg,${sc.bg[0]},${sc.bg[1]})">
     ${sc.deco.map((d,i)=>`<span class="deco" style="left:${[6,62,30,78][i%4]}%;top:${[8,14,64,70][i%4]}%;font-size:${70+i*14}px">${d}</span>`).join("")}
     ${F.all.map((it,i)=>F.found.includes(it)?"":`<button class="it" data-fi="${i}" aria-label="${esc(PW(it))}" style="left:${F.pos[i].x}%;top:${F.pos[i].y}%;font-size:calc(${F.size/100} * min(100vw - 32px, 720px) * .86);transform:rotate(${Math.round((Math.random()*2-1)*Math.min(rot,24))}deg)">${it.e}</button>`).join("")}
   </div>`,
   `<div class="row-flex" style="justify-content:space-between"><span class="hint">${TX("ข้อ","Item")} ${F.ti+1}/${F.targets.length} · ${TX("พลาดได้ 3 ครั้ง","3 hearts")}</span><button class="ghost" id="fo-rev">${TX("กดเฉลย","Show me")}</button></div>`);
  $("#fo-say").onclick=speakTarget;
  $("#fo-rev").onclick=()=>{const i=F.all.indexOf(t);const b=document.querySelector(`[data-fi="${i}"]`);if(b){b.style.outline="4px solid var(--hard)";b.style.borderRadius="12px"}F.hearts=Math.max(0,F.hearts-1);setTimeout(()=>{if(FO!==F)return;F.found.push(t);nextFO()},1200)};
  document.querySelectorAll("[data-fi]").forEach(b=>b.onclick=()=>{const it=F.all[+b.dataset.fi];
    if(it===t){b.classList.add("hit");sfx("ok");gfb(true,TX("ถูกต้อง! ","Correct! ")+it.e+" = "+esc(PW(it))+" · "+esc(PM(it)),b);speak(PW(it));F.found.push(it);setTimeout(()=>whenQuiet(()=>{if(FO===F)nextFO()}),300)}
    else{F.hearts--;F.miss++;F.tries++;sfx("bad");b.classList.add("miss");gfb(false,TX("ยังไม่ใช่ นั่นคือ ","Not that one: it's ")+it.e+" "+esc(PW(it))+" · "+TX("เหลือหัวใจ ","hearts left ")+Math.max(0,F.hearts),b);speak(PW(it));setTimeout(()=>b.classList.remove("miss"),600);const hs=$("#gscore");if(hs)hs.textContent="♥".repeat(Math.max(0,F.hearts))+"♡".repeat(3-Math.max(0,F.hearts));if(F.hearts<=0)setTimeout(()=>{if(FO===F)endFO()},500);else if(F.mode==="audio"&&F.tries===2)drawFO()}})}
function nextFO(){FO.ti++;FO.tries=0;if(FO.ti>=FO.targets.length||FO.hearts<=0)return endFO();drawFO();speakTarget()}
function endFO(){clearInterval(GT);const F=FO,ok=F.hearts>0,stars=ok?F.hearts:0;sfx(ok?"win":"bad");
  if(ok){const o=foSave();o[lang]=o[lang]||{};o[lang][F.k]=Math.max(o[lang][F.k]||0,stars);try{localStorage.setItem(FOK,JSON.stringify(o))}catch(e){}}
  const score=ok?50+stars*15+(F.lvl>8?5:0):Math.round(F.found.length*8);
  endScreen(TX("หาของในภาพ ด่าน ","Find it! Level ")+F.lvl,score,`<div class="stars">${"★".repeat(stars)}${"☆".repeat(3-stars)}</div><p class="hint">${ok?TX("ผ่านด่าน! ด่านต่อไปเปิดแล้ว","Level cleared! Next level unlocked"):TX("หัวใจหมด ลองใหม่อีกครั้งนะ","Out of hearts. Try again!")}</p>`,()=>foStart(F.k),
   `${ok&&F.k+1<PIC.scenes.length?`<button class="primary" id="fo-next">${TX("ไปด่านต่อไป","Next level")} ${F.lvl+1} →</button>`:""}<button class="ghost" id="fo-map">${TX("ดูด่านทั้งหมด","All levels")}</button>
   <h2>${TX("คำในด่านนี้","Words in this level")}</h2><div class="list">${F.targets.map(it=>`<div class="item"><div class="t han">${it.e} ${esc(PW(it))}</div><div class="side"><button class="iconbtn" data-say="${esc(PW(it))}">${ICON_PLAY}</button></div><div class="s">${esc(PR(it))}</div><div class="m">${esc(PM(it))}</div></div>`).join("")}</div>`);
  const nx=$("#fo-next");if(nx)nx.onclick=()=>foStart(F.k+1);$("#fo-map").onclick=foLevels}

/* ---- game menu ---- */
const _viewGame=viewGame;
viewGame=function(){_viewGame();const v=$("#view"),box=v.firstElementChild;
  const add=`<div class="sec">${TX("เกมใหม่ เล่นได้ทุกภาษา","New games")}</div><div class="gamegrid">
   <button class="gcard" id="g-flash"><span class="gi">🃏</span><span><b>${TX("แฟลชการ์ดตามสถานการณ์","Flashcards by topic")}</b><small>${TX("ตอบผิดพลิกเฉลย พร้อมคำแปล คำอธิบาย ตัวอย่างการใช้","Wrong answers flip to show meaning, note and example")}</small></span></button>
   <button class="gcard" id="g-ws"><span class="gi">🔎</span><span><b>${TX("หาคำศัพท์ที่ซ่อนอยู่","Word search")}</b><small>${TX("12 สถานการณ์ · มีคะแนนและปุ่มเฉลย","12 situations · score and answers")}</small></span></button>
   <button class="gcard" id="g-jig"><span class="gi">🧩</span><span><b>${TX("ต่อจิ๊กซอว์ภาพกับคำ","Picture–word jigsaw")}</b><small>${TX("จับชิ้นภาพกับคำให้ต่อกันพอดี","Join each picture to its word")}</small></span></button>
   <button class="gcard" id="g-find"><span class="gi">🖼️</span><span><b>${TX("หาของในภาพ","Find it!")}</b><small>${TX("12 ด่าน จากง่ายไปยาก","12 levels, easy to hard")}</small></span></button></div><div class="sec">${TX("เกมเดิม","More games")}</div>`;
  const first=box.children[1];first.insertAdjacentHTML("beforebegin",add);
  $("#g-flash").onclick=flashPicker;
  $("#g-ws").onclick=()=>scenePicker(TX("หาคำศัพท์ที่ซ่อนอยู่","Word search"),wsStart,`<div class="row-flex" style="justify-content:space-between;flex-wrap:wrap"><span class="hint">${TX("ระดับ","Level")}</span>${diffBtns(DIFF)}</div>`)||bindDiff();
  $("#g-jig").onclick=()=>scenePicker(TX("ต่อจิ๊กซอว์ภาพกับคำ","Picture–word jigsaw"),jigStart,`<div class="row-flex" style="justify-content:space-between;flex-wrap:wrap"><span class="hint">${TX("จำนวนชิ้น","Pieces")}</span>${diffBtns(DIFF)}</div>`)||bindDiff();
  $("#g-find").onclick=foLevels;
  const gt=$("#g-test");if(gt){gt.disabled=false;gt.querySelector("small").textContent=TX("สุ่ม 10 ข้อ อ่าน ฟัง จับคู่ (ถ้ายังเรียนไม่ครบ จะใช้ประโยคพื้นฐาน)","10 random questions");gt.onclick=()=>startTest(mixedPool(),"ทดสอบรวม")}};

/* games inside each situation (library topic page) */
const _viewLib=viewLib;
viewLib=function(){_viewLib();if(!libTopic||!topics()[libTopic])return;const rv=$("#t-rev");if(!rv)return;const sc=scenesFor(libTopic)[0];
  rv.parentElement.insertAdjacentHTML("beforebegin",`<div class="filters" style="gap:8px"><button id="lt-flash">🃏 ${TX("แฟลชการ์ดชุดนี้","Flashcards")}</button>${sc?`<button id="lt-ws">🔎 ${TX("หาคำศัพท์","Word search")}</button><button id="lt-jig">🧩 ${TX("จิ๊กซอว์","Jigsaw")}</button><button id="lt-find">🖼️ ${TX("หาของในภาพ","Find it")}</button>`:""}</div>`);
  $("#lt-flash").onclick=()=>startFlash(libTopic);
  if(sc){$("#lt-ws").onclick=()=>wsStart(sc);$("#lt-jig").onclick=()=>jigStart(sc);$("#lt-find").onclick=()=>foStart(PIC.scenes.indexOf(sc))}};

/* =================== AUTH + ADMIN (item 13, Supabase) =================== */
const AUTH={sb:null,user:null,role:"user",ready:false};
function loadSB(){if(window.supabase)return Promise.resolve();return new Promise((ok,no)=>{const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";s.onload=ok;s.onerror=no;document.head.appendChild(s)})}
async function initSB(){if(!KOEL_CFG.supabaseUrl||!KOEL_CFG.supabaseKey)return false;
  try{await loadSB();AUTH.sb=supabase.createClient(KOEL_CFG.supabaseUrl,KOEL_CFG.supabaseKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});AUTH.ready=true;return true}catch(e){return false}}
async function loadProfile(){let user=null;try{const r=await AUTH.sb.auth.getUser();user=r.data&&r.data.user}catch(e){}
  if(!user){try{const{data:{session}}=await AUTH.sb.auth.getSession();user=session&&session.user}catch(e){}}
  AUTH.user=user||null;if(!user)return null;try{localStorage.setItem("koel-prof-"+user.id,JSON.stringify({role:AUTH.role,status:AUTH.status,nick:AUTH.nick,onb:AUTH.onboarded}))}catch(e){}
  if(!navigator.onLine){try{const c=JSON.parse(localStorage.getItem("koel-prof-"+user.id)||"null");if(c){AUTH.role=c.role||"user";AUTH.status=c.status||"active";AUTH.nick=c.nick;AUTH.onboarded=c.onb!==false}}catch(e){}return user}
  try{const{data}=await AUTH.sb.from("profiles").select("role,status,display_name,onboarded").eq("id",user.id).maybeSingle();if(data){AUTH.role=data.role||"user";AUTH.status=data.status||"active";AUTH.onboarded=data.onboarded!==true?false:true;if(data.display_name)AUTH.nick=data.display_name;try{localStorage.setItem("koel-prof-"+user.id,JSON.stringify({role:AUTH.role,status:AUTH.status,nick:AUTH.nick,onb:AUTH.onboarded}))}catch(e){}}}catch(e){}
  return user}
async function contentKey(){try{const{data,error}=await AUTH.sb.from("app_secrets").select("value").eq("key","content_pw").maybeSingle();if(error)return null;return data&&data.value}catch(e){return null}}
function authBox(mode,msg,ok){const g=$("#gate")||Object.assign(document.createElement("div"),{id:"gate"});if(!g.parentNode)document.body.appendChild(g);document.body.style.overflow="hidden";
  g.innerHTML=`<form class="gbox auth" id="aform" autocomplete="on">${mascot(msg?"oops":"idle",110)}<h1>Koel</h1><p class="hint">เรียนจีน เยอรมัน อังกฤษ ฝรั่งเศส ไทย แบบพูดได้จริง · ใช้ฟรี</p>
   ${mode==="reset"?"":`<div class="tabs2"><button type="button" data-am="in" aria-pressed="${mode==="in"}">เข้าสู่ระบบ</button><button type="button" data-am="up" aria-pressed="${mode==="up"}">สมัครสมาชิก</button></div>`}
   ${mode==="up"?`<label class="glab" for="a-name">ชื่อที่แสดง</label><input id="a-name" autocomplete="nickname" placeholder="เช่น นก">`:""}
   <label class="glab" for="a-email">อีเมล</label><input id="a-email" type="email" autocomplete="email" required placeholder="you@example.com">
   ${mode==="reset"?"":`<label class="glab" for="a-pw">รหัสผ่าน</label><input id="a-pw" type="password" minlength="6" autocomplete="${mode==="up"?"new-password":"current-password"}" required placeholder="อย่างน้อย 6 ตัว">`}
   <p class="gerr" role="alert">${msg||""}</p>${ok?`<p class="ok">${ok}</p>`:""}
   <button class="primary" type="submit">${mode==="in"?"เข้าสู่ระบบ":mode==="up"?"สมัครสมาชิกฟรี":"ส่งลิงก์ตั้งรหัสใหม่"}</button>
   ${mode==="in"?`<button type="button" class="linkbtn" id="a-forgot">ลืมรหัสผ่าน?</button>`:mode==="reset"?`<button type="button" class="linkbtn" data-am="in">กลับไปเข้าสู่ระบบ</button>`:""}
   <p class="copy">© 2026 Koel สงวนลิขสิทธิ์</p></form>`;
  g.querySelectorAll("[data-am]").forEach(b=>b.onclick=()=>authBox(b.dataset.am));
  const fg=$("#a-forgot");if(fg)fg.onclick=()=>authBox("reset");
  $("#aform").onsubmit=async e=>{e.preventDefault();const btn=g.querySelector('button[type="submit"]');btn.disabled=true;btn.textContent="กำลังดำเนินการ…";
    const email=$("#a-email").value.trim(),pw=$("#a-pw")&&$("#a-pw").value;const redirect=location.origin+location.pathname;
    try{
      if(mode==="reset"){const{error}=await AUTH.sb.auth.resetPasswordForEmail(email,{redirectTo:redirect});if(error)throw error;return authBox("in","","ส่งลิงก์ตั้งรหัสผ่านใหม่ไปที่อีเมลแล้ว")}
      if(mode==="up"){const{data,error}=await AUTH.sb.auth.signUp({email,password:pw,options:{emailRedirectTo:redirect,data:{display_name:($("#a-name")||{}).value||""}}});if(error)throw error;
        if(!data.session)return authBox("in","","สมัครแล้ว กรุณายืนยันอีเมลจากกล่องจดหมาย แล้วกลับมาเข้าสู่ระบบ")}
      else{const{error}=await AUTH.sb.auth.signInWithPassword({email,password:pw});if(error)throw error}
      await signedIn()}
    catch(err){const m=String(err&&err.message||err);authBox(mode,/Invalid login/i.test(m)?"อีเมลหรือรหัสผ่านไม่ถูกต้อง":/confirm/i.test(m)?"ยังไม่ได้ยืนยันอีเมล ตรวจกล่องจดหมายก่อนนะ":/registered|exists/i.test(m)?"อีเมลนี้สมัครแล้ว ลองเข้าสู่ระบบ":/fetch|network/i.test(m)?"เชื่อมต่อไม่ได้ ตรวจอินเทอร์เน็ตแล้วลองใหม่":"ทำรายการไม่สำเร็จ: "+m)}};
  eyeify($("#a-pw"));
  setTimeout(()=>{const i=$("#a-email");if(i)i.focus()},50)}
function showAuth(){authBox("in")}
const EYE_ON='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
const EYE_OFF='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18"/><path d="M10.6 5.1A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.2M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';
function eyeify(inp){if(!inp||inp.dataset.eye)return;inp.dataset.eye=1;const w=document.createElement("div");w.className="pwwrap";inp.parentNode.insertBefore(w,inp);w.appendChild(inp);
  const b=document.createElement("button");b.type="button";b.className="pweye";b.setAttribute("aria-label","แสดงรหัสผ่าน");b.innerHTML=EYE_ON;w.appendChild(b);
  b.onclick=()=>{const show=inp.type==="password";inp.type=show?"text":"password";b.innerHTML=show?EYE_OFF:EYE_ON;b.setAttribute("aria-label",show?"ซ่อนรหัสผ่าน":"แสดงรหัสผ่าน");b.setAttribute("aria-pressed",show);inp.focus()}}
function newPasswordBox(){const g=$("#gate")||Object.assign(document.createElement("div"),{id:"gate"});if(!g.parentNode)document.body.appendChild(g);
  g.innerHTML=`<form class="gbox auth" id="npf">${mascot("idle",100)}<h1>ตั้งรหัสผ่านใหม่</h1><input id="np" type="password" minlength="6" required placeholder="รหัสผ่านใหม่ อย่างน้อย 6 ตัว" autocomplete="new-password"><p class="gerr" id="nperr"></p><button class="primary">บันทึก</button></form>`;
  eyeify($("#np"));
  $("#npf").onsubmit=async e=>{e.preventDefault();const{error}=await AUTH.sb.auth.updateUser({password:$("#np").value});if(error){$("#nperr").textContent=error.message;return}g.remove();await signedIn()}}
/* fall back to the original password screen (also how the admin seeds the content key) */
function codeGate(msg){gateBoot().then(()=>{const h=$("#gate h1");if(h&&msg)h.insertAdjacentHTML("afterend",`<p class="hint">${msg}</p>`);
  eyeify($("#gpw"))})}
async function signedIn(){idleT=0;touchActive();await loadProfile();
  if(AUTH.status==="blocked"){await AUTH.sb.auth.signOut();return authBox("in","บัญชีนี้ถูกระงับ ติดต่อผู้ดูแล")}
  if(DATA){afterUnlock();return}
  let saved=null;try{saved=localStorage.getItem(PWK)}catch(e){}
  const key=await contentKey();
  try{await tryUnlock(key||saved);return}catch(e){}
  if(AUTH.role==="admin")return codeGate("แอดมิน: ใส่รหัสเนื้อหาครั้งแรกครั้งเดียว ระบบจะบันทึกให้ผู้ใช้ทุกคนอัตโนมัติ");
  notReady()}
function notReady(){const g=$("#gate")||Object.assign(document.createElement("div"),{id:"gate"});if(!g.parentNode)document.body.appendChild(g);document.body.style.overflow="hidden";
  g.innerHTML=`<div class="gbox">${mascot("think",110)}<h1>Koel</h1><p class="hint">ระบบกำลังเตรียมบทเรียน ลองใหม่อีกครั้งในอีกสักครู่ หรือแจ้งผู้ดูแลระบบ</p><button class="primary" id="nr-retry">ลองใหม่</button><button class="linkbtn" id="nr-out">ออกจากระบบ</button></div>`;
  $("#nr-retry").onclick=()=>location.reload();$("#nr-out").onclick=async()=>{await AUTH.sb.auth.signOut();location.reload()}}
let syncedOnce=false;
async function afterUnlock(){
  setTimeout(maybeOnboard,50);
  if(!AUTH.ready||!AUTH.user)return;
  if(AUTH.role==="admin"&&UNLOCK_PW){try{const k=await contentKey();if(!k)await AUTH.sb.from("app_secrets").upsert({key:"content_pw",value:UNLOCK_PW})}catch(e){}}
  if(syncedOnce)return;syncedOnce=true;
  const uid=AUTH.user.id;
  dbDoc={get:async()=>{const{data,error}=await AUTH.sb.from("progress").select("data").eq("user_id",uid).maybeSingle();if(error)throw error;return{exists:!!data,data:()=>({json:JSON.stringify(data?data.data:{})})}},
         set:async o=>{const{error}=await AUTH.sb.from("progress").upsert({user_id:uid,data:JSON.parse(o.json),updated_at:new Date().toISOString()});if(error)throw error}};
  try{const snap=await dbDoc.get();if(snap.exists){const o=JSON.parse(snap.data().json||"{}");if(o&&o.updated){store=merge(store,o);try{localStorage.setItem(LS,JSON.stringify(store))}catch(e){}if(!$("#study")||$("#study").hidden)render()}}
    pending=true;await push()}catch(e){setSync("local")}
  try{await AUTH.sb.from("profiles").update({last_seen:new Date().toISOString()}).eq("id",uid)}catch(e){}
}
async function openAdmin(){if(AUTH.role!=="admin")return;
  const el=overlay("หน้าแอดมิน",`<p class="hint">กำลังโหลดรายชื่อผู้ใช้…</p>`);
  const[{data:ps,error},{data:pr}]=await Promise.all([AUTH.sb.from("profiles").select("*").order("created_at",{ascending:false}),AUTH.sb.from("progress").select("user_id,updated_at")]);
  if(error){$("#stage").innerHTML=`<p class="tip">โหลดข้อมูลไม่ได้: ${esc(error.message)} · ตรวจว่ารัน supabase/schema.sql แล้ว</p>`;return}
  const last=Object.fromEntries((pr||[]).map(r=>[r.user_id,r.updated_at])),wk=Date.now()-7*DAY;
  const act=ps.filter(p=>new Date(last[p.id]||p.last_seen||0)>wk).length,nw=ps.filter(p=>new Date(p.created_at)>wk).length;
  const d=t=>t?new Date(t).toLocaleDateString(LOC(),{day:"numeric",month:"short",year:"2-digit"}):"–";
  $("#stage").innerHTML=`<div class="kpis"><div class="st"><b>${ps.length}</b><small>ผู้ใช้ทั้งหมด</small></div><div class="st"><b>${act}</b><small>ใช้งาน 7 วันล่าสุด</small></div><div class="st"><b>${nw}</b><small>สมัครใหม่ 7 วัน</small></div><div class="st"><b>${ps.filter(p=>p.role==="admin").length}</b><small>แอดมิน</small></div></div>
   <div class="row-flex" style="justify-content:space-between;flex-wrap:wrap"><h2>ผู้ใช้งาน</h2><input id="ad-q" placeholder="ค้นหาอีเมลหรือชื่อ" style="border:1px solid var(--line);border-radius:10px;padding:8px 10px;font:inherit;min-width:0"></div>
   <div class="panel tablewrap" style="padding:6px 10px"><table class="atable"><thead><tr><th>อีเมล / ชื่อ</th><th>สิทธิ์</th><th>สถานะ</th><th>สมัคร</th><th>เรียนล่าสุด</th></tr></thead><tbody>
   ${ps.map(p=>`<tr data-row="${esc((p.email||"")+" "+(p.display_name||""))}"><td><b>${esc(p.email||"")}</b><br><small class="muted">${esc(p.display_name||"")}</small></td>
     <td><select data-uid="${p.id}" data-f="role" ${p.id===AUTH.user.id?"disabled":""}><option value="user" ${p.role==="user"?"selected":""}>ผู้ใช้</option><option value="admin" ${p.role==="admin"?"selected":""}>แอดมิน</option></select></td>
     <td><select data-uid="${p.id}" data-f="status" ${p.id===AUTH.user.id?"disabled":""}><option value="active" ${p.status!=="blocked"?"selected":""}>ใช้งานได้</option><option value="blocked" ${p.status==="blocked"?"selected":""}>ระงับ</option></select></td>
     <td>${d(p.created_at)}</td><td>${d(last[p.id]||p.last_seen)}</td></tr>`).join("")}</tbody></table></div>
   <p class="hint">แอปใช้ฟรีทั้งหมด หน้านี้ใช้ดูผู้ใช้ เปลี่ยนสิทธิ์แอดมิน และระงับบัญชีที่ไม่เหมาะสม</p>`;
  $("#ad-q").oninput=e=>{const q=e.target.value.toLowerCase();document.querySelectorAll("[data-row]").forEach(r=>r.hidden=q&&!r.dataset.row.toLowerCase().includes(q))};
  document.querySelectorAll("select[data-uid]").forEach(s=>s.onchange=async()=>{const{error}=await AUTH.sb.from("profiles").update({[s.dataset.f]:s.value}).eq("id",s.dataset.uid);toast(error?"บันทึกไม่สำเร็จ: "+error.message:"บันทึกแล้ว")});
}



/* =================== LEARNER PROFILE: nickname, stats, timeline =================== */
const LCOL={zh:"#cf3b2a",de:"#c08a12",en:"#2463c9",fr:"#7a3fb8",th:"#16846b"},LNAMES={th:{zh:"จีน",de:"เยอรมัน",en:"อังกฤษ",fr:"ฝรั่งเศส",th:"ไทย"},en:{zh:"Chinese",de:"German",en:"English",fr:"French",th:"Thai"},zh:{zh:"中文",de:"德语",en:"英语",fr:"法语",th:"泰语"},de:{zh:"Chinesisch",de:"Deutsch",en:"Englisch",fr:"Französisch",th:"Thai"},fr:{zh:"chinois",de:"allemand",en:"anglais",fr:"français",th:"thaï"}};
const LTH=new Proxy({},{get:(_,k)=>(LNAMES[UIL||"th"]||LNAMES.th)[k]});
function nick(){if(AUTH.nick!=null)return AUTH.nick;try{return localStorage.getItem("koel-nick")||""}catch(e){return""}}
function langStats(l){const s=store[l]||{},cards=Object.values(s.cards||{}),log=s.log||{},tests=s.tests||[];
  const dk=dayKey(Date.now()),yk=dayKey(Date.now()-DAY),streak=(s.lastDay===dk||s.lastDay===yk)?s.streak||0:0;
  return{learned:cards.length,known:cards.filter(c=>c.k||c.b>=2).length,xp:s.xpTotal||0,streak,tests,days:Object.keys(log).length,goal:s.goal,log}}
async function openProfile(){
  const el=overlay("ข้อมูลผู้เรียน",`<p class="hint">กำลังโหลด…</p>`);
  const per=Object.fromEntries(LANGS.map(l=>[l,langStats(l)])),act=LANGS.filter(l=>per[l].learned||per[l].xp);
  const tot={learned:0,known:0,xp:0,tests:0,days:new Set()};for(const l of LANGS){const p=per[l];tot.learned+=p.learned;tot.known+=p.known;tot.xp+=p.xp;tot.tests+=p.tests.length;Object.keys(p.log).forEach(d=>tot.days.add(d))}
  const best=Math.max(0,...LANGS.map(l=>per[l].streak));
  /* last 30 days, stacked by language */
  const days=[...Array(30)].map((_,i)=>{const t=Date.now()-(29-i)*DAY;return{k:dayKey(t),d:new Date(t)}});
  const vals=days.map(d=>LANGS.map(l=>per[l].log[d.k]||0)),mx=Math.max(20,...vals.map(v=>v.reduce((a,b)=>a+b,0)));
  const W=600,H=170,bw=W/30;
  const chart=`<svg viewBox="0 0 ${W} ${H+22}" style="width:100%;height:auto" role="img" aria-label="XP รายวัน 30 วันล่าสุด">${days.map((d,i)=>{let y=H;return LANGS.map((l,j)=>{const h=vals[i][j]/mx*(H-8);if(!h)return"";y-=h;return`<rect x="${i*bw+2}" y="${y}" width="${bw-4}" height="${h}" rx="3" fill="${LCOL[l]}"><title>${d.d.toLocaleDateString(LOC(),{day:"numeric",month:"short"})} · ${LTH[l]} ${vals[i][j]} XP</title></rect>`}).join("")+(i%7===1||i===29?`<text x="${i*bw+bw/2}" y="${H+16}" font-size="11" text-anchor="middle" fill="#6b6862">${d.d.toLocaleDateString(LOC(),{day:"numeric",month:"short"})}</text>`:"")}).join("")}<line x1="0" x2="${W}" y1="${H}" y2="${H}" stroke="#e6e3dc"/></svg>`;
  /* timeline events */
  const ev=[];
  for(const l of LANGS){const p=per[l];
    if(p.goal&&p.goal.start)ev.push({t:p.goal.start,ic:"🎯",l,txt:`เริ่มเรียน${LTH[l]} ตั้งเป้า ${p.goal.m} เดือน`});
    for(const x of p.tests)ev.push({t:x.d,ic:x.pct>=75?"🏆":"📝",l,txt:`${x.title}`,chip:x.pct+"%"});
    const ds=Object.keys(p.log).sort((a,b)=>new Date(a)-new Date(b));let run=0;
    for(const d of ds){const xp=p.log[d];if(xp>=60)ev.push({t:new Date(d).getTime()+43200000,ic:"🔥",l,txt:`เรียน${LTH[l]}ได้ ${xp} XP ในวันเดียว`})}
    for(const m of [10,50,100,250,500,1000])if(p.learned>=m)ev.push({t:null,ic:"⭐",l,txt:`เรียนครบ ${m} ประโยค/คำในภาษา${LTH[l]}`,ms:m});}
  const dated=ev.filter(e=>e.t).sort((a,b)=>b.t-a.t).slice(0,40),miles=ev.filter(e=>!e.t).sort((a,b)=>b.ms-a.ms);
  let lastDay="";
  const tl=dated.map(e=>{const d=new Date(e.t).toLocaleDateString(LOC(),{weekday:"short",day:"numeric",month:"short",year:"2-digit"}),head=d!==lastDay?`<div class="sec">${d}</div>`:"";lastDay=d;
    return head+`<div class="tl-row"><span class="tl-ic" style="background:color-mix(in srgb,${LCOL[e.l]} 14%,#fff)">${e.ic}</span><span style="flex:1;min-width:0">${esc(e.txt)}<small style="display:block;color:${LCOL[e.l]};font-weight:700">${LTH[e.l]}</small></span>${e.chip?`<span class="chip ${parseInt(e.chip)>=75?"ok":"warn"}">${e.chip}</span>`:""}</div>`}).join("");
  $("#stage").innerHTML=`
   <div class="panel" style="display:flex;flex-direction:column;gap:12px"><div class="row-flex">${mascot("happy",72)}<div style="min-width:0"><h2 style="font-size:22px">${esc(nick()||"ผู้เรียน Koel")}</h2><p class="hint" style="margin:0">${AUTH.user?esc(AUTH.user.email||""):"ยังไม่ได้ล็อกอิน (เก็บในเครื่องนี้)"}${AUTH.user&&AUTH.user.created_at?" · เริ่มใช้ "+new Date(AUTH.user.created_at).toLocaleDateString(LOC(),{day:"numeric",month:"short",year:"numeric"}):""}</p></div></div>
     <form class="row-flex" id="nk-f" style="gap:8px"><label class="field" style="flex:1;margin:0">ชื่อเล่น<input id="nk" maxlength="30" value="${esc(nick())}" placeholder="เช่น นก"></label><button class="primary" style="width:auto;align-self:flex-end;padding:11px 18px">บันทึก</button></form></div>
   <div class="kpis"><div class="st"><b class="flame">${best}</b><small>วันติดต่อกันสูงสุดตอนนี้</small></div><div class="st"><b>${tot.days.size}</b><small>วันที่เรียน</small></div><div class="st"><b>${tot.learned}</b><small>ประโยค/คำที่เรียนแล้ว</small></div><div class="st"><b>${tot.known}</b><small>จำได้แม่น</small></div><div class="st"><b>${tot.xp}</b><small>XP สะสม</small></div><div class="st"><b>${tot.tests}</b><small>ครั้งที่เล่นเกม/สอบ</small></div></div>
   <div class="panel" style="display:flex;flex-direction:column;gap:8px"><h2>พัฒนาการ 30 วันล่าสุด</h2>${chart}<div class="row-flex" style="flex-wrap:wrap;gap:10px">${LANGS.map(l=>`<span class="hint"><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:${LCOL[l]};margin-right:4px"></i>${LTH[l]}</span>`).join("")}</div></div>
   <div class="panel" style="display:flex;flex-direction:column;gap:10px"><h2>แต่ละภาษา</h2>${act.length?act.map(l=>{const p=per[l],tot2=(DATA[l].cards||[]).length;return`<div style="display:grid;gap:4px"><div class="row-flex" style="justify-content:space-between"><b style="color:${LCOL[l]}">ภาษา${LTH[l]}</b><span class="hint">${p.learned}/${tot2} · ${p.xp} XP${p.goal?" · เป้า "+p.goal.m+" เดือน":""}</span></div><div class="bar"><i style="width:${tot2?Math.round(p.learned/tot2*100):0}%;background:${LCOL[l]}"></i></div></div>`}).join(""):`<p class="hint">ยังไม่ได้เริ่มเรียน เริ่มที่หน้า "วันนี้" ได้เลย</p>`}</div>
   ${miles.length?`<div class="panel" style="display:flex;flex-direction:column;gap:8px"><h2>ความสำเร็จ</h2><div class="row-flex" style="flex-wrap:wrap;gap:8px">${miles.map(e=>`<span class="chip ok" style="font-size:13.5px;padding:5px 12px">${e.ic} ${esc(e.txt)}</span>`).join("")}</div></div>`:""}
   <div class="panel" style="display:flex;flex-direction:column;gap:6px"><h2>ไทม์ไลน์การเรียน</h2>${tl||`<p class="hint">ยังไม่มีกิจกรรม เรียนหรือเล่นเกมแล้วจะขึ้นที่นี่</p>`}</div>`;
  $("#nk-f").onsubmit=async e=>{e.preventDefault();const v=$("#nk").value.trim();AUTH.nick=v;try{localStorage.setItem("koel-nick",v)}catch(_){}
    if(AUTH.user){const{error}=await AUTH.sb.from("profiles").update({display_name:v}).eq("id",AUTH.user.id);toast(error?"บันทึกในบัญชีไม่สำเร็จ เก็บไว้ในเครื่องแล้ว":"บันทึกชื่อเล่นแล้ว")}else toast("บันทึกชื่อเล่นแล้ว");
    openProfile()}}

/* =================== ONBOARDING: new users, once, after login (animated "how to start" + language pick) =================== */
const UI_LANGS=[["th","ไทย"],["en","English"],["zh","中文"],["de","Deutsch"],["fr","Français"]];
const TABS_I18N={th:["วันนี้","สถานการณ์","ตัวอักษร","เกม"],en:["Today","Topics","Alphabet","Games"],zh:["今天","情景","字母","游戏"],de:["Heute","Themen","Alphabet","Spiele"],fr:["Aujourd'hui","Thèmes","Alphabet","Jeux"]};
function setUI(k){UIL=k;try{localStorage.setItem("koel-ui",k)}catch(e){}applyUI()}
function applyUI(){const T=TABS_I18N[UIL||"th"]||TABS_I18N.th;["today","lib","alpha","game"].forEach((id,i)=>{const b=$("#tab-"+id);if(b&&b.lastChild)b.lastChild.textContent=T[i]});document.documentElement.lang=UIL||"th"}
const ONB_I18N={
 th:{pick:"เลือกภาษาที่ใช้ในแอป",pickp:"ใช้แสดงวิธีใช้งานและเมนู เปลี่ยนได้ทีหลังที่ ⚙️",skip:"ข้ามไปเลือกภาษาที่จะเรียน",next:"ถัดไป ›",back:"‹ ย้อนกลับ",
   t0:"เริ่มต้นใช้งาน",h0:n=>`สวัสดี${n?" "+n:""} ฉันคือ Koel`,p0:"เพื่อนเรียนภาษาที่พูดได้จริง จีน เยอรมัน อังกฤษ ฝรั่งเศส และไทย ใช้ฟรีทั้งหมด มาดูวิธีใช้ 3 ขั้นสั้น ๆ",
   t1:"ขั้นที่ 1",h1:"เลือกภาษาและเป้าหมาย",p1:"แตะภาษาด้านบนของแอป แล้วเลือกว่าอยากคุยได้ใน 3 หรือ 6 เดือน แอปจะจัดประโยคใหม่ให้พอดีทุกวัน",
   t2:"ขั้นที่ 2",h2:"ฟัง เขียน แล้วเล่นเกม",p2:"กด \"เริ่มเลย\" ในหน้าวันนี้ ฟังเสียง (เลือกเสียงผู้หญิงหรือผู้ชายได้ที่ ⚙️) ฝึกเขียนตามเส้นประ แล้วทบทวนด้วยเกม",
   t3:"ขั้นที่ 3",h3:"เรียนวันละนิด ทุกวัน",p3:"ความคืบหน้าบันทึกในบัญชีอัตโนมัติ เปิดมือถือ iPad หรือคอมก็เรียนต่อได้ ระบบจะเรียกประโยคที่ใกล้ลืมกลับมาให้ทวนเอง",
   t4:"พร้อมแล้ว",h4:"อยากเริ่มเรียนภาษาอะไรก่อน",p4:"เลือก 1 ภาษา เปลี่ยนหรือเรียนเพิ่มได้ทุกเมื่อจากแถบภาษาด้านบน",
   m:{learn:"อยากเรียนภาษาอะไร",within:"อยากคุยได้ภายใน",months:"เดือน",newp:"ประโยคใหม่ 1/5",mean:"ยินดีที่ได้รู้จัก",listen:"ฟัง",write:"เขียน",game:"เกม",today:"วันนี้",streak:"วันติดต่อกัน",due:"ทบทวน 12 · ใหม่ 5",start:"เริ่มเลย"},
   L:{zh:"ภาษาจีน",de:"ภาษาเยอรมัน",en:"ภาษาอังกฤษ",fr:"ภาษาฝรั่งเศส",th:"ภาษาไทย"}},
 en:{pick:"Choose the app language",pickp:"Used for this guide and the menus. You can change it later in ⚙️",skip:"Skip to choosing a language",next:"Next ›",back:"‹ Back",
   t0:"Getting started",h0:n=>`Hi${n?" "+n:""}, I'm Koel`,p0:"Your buddy for languages you can really speak: Chinese, German, English, French and Thai. All free. Here's how it works in 3 short steps.",
   t1:"Step 1",h1:"Pick a language and a goal",p1:"Tap a language at the top of the app, then choose to speak it in 3 or 6 months. Koel plans the right number of new phrases each day.",
   t2:"Step 2",h2:"Listen, write, then play",p2:"Press \"Start\" on the Today page. Listen (pick a female or male voice in ⚙️), trace letters along the dotted lines, and review with games.",
   t3:"Step 3",h3:"A little every day",p3:"Your progress saves to your account automatically, so you can continue on a phone, iPad or computer. Phrases you are about to forget come back for review.",
   t4:"Ready",h4:"Which language do you want to learn first?",p4:"Pick one. You can switch or add more any time from the language bar at the top.",
   m:{learn:"What do you want to learn?",within:"Speak it within",months:"months",newp:"New phrase 1/5",mean:"Pleased to meet you",listen:"Listen",write:"Write",game:"Play",today:"Today",streak:"day streak",due:"Review 12 · New 5",start:"Start"},
   L:{zh:"Chinese",de:"German",en:"English",fr:"French",th:"Thai"}},
 zh:{pick:"选择应用语言",pickp:"用于本指南和菜单，之后可在 ⚙️ 中更改",skip:"跳过，去选择学习语言",next:"下一步 ›",back:"‹ 返回",
   t0:"开始使用",h0:n=>`你好${n?"，"+n:""}！我是 Koel`,p0:"陪你学会真正能说的语言：中文、德语、英语、法语和泰语，全部免费。三步就能上手。",
   t1:"第 1 步",h1:"选择语言和目标",p1:"点击顶部的语言，再选择想在 3 个月或 6 个月内开口说。Koel 会每天为你安排合适数量的新句子。",
   t2:"第 2 步",h2:"听、写，再玩游戏",p2:"在“今天”页面点击“开始”。听发音（可在 ⚙️ 中选择女声或男声），沿虚线练习书写，再用游戏复习。",
   t3:"第 3 步",h3:"每天学一点",p3:"学习进度会自动保存到账号，手机、iPad 或电脑都能接着学。快要忘记的句子会自动回来复习。",
   t4:"准备好了",h4:"想先学哪种语言？",p4:"选一种即可，之后随时可以在顶部语言栏切换或增加。",
   m:{learn:"想学什么语言",within:"多久能开口说",months:"个月",newp:"新句子 1/5",mean:"很高兴认识你",listen:"听",write:"写",game:"游戏",today:"今天",streak:"天连续学习",due:"复习 12 · 新 5",start:"开始"},
   L:{zh:"中文",de:"德语",en:"英语",fr:"法语",th:"泰语"}},
 de:{pick:"App-Sprache wählen",pickp:"Für diese Anleitung und die Menüs. Später in ⚙️ änderbar",skip:"Überspringen und Sprache wählen",next:"Weiter ›",back:"‹ Zurück",
   t0:"Los geht's",h0:n=>`Hallo${n?" "+n:""}, ich bin Koel`,p0:"Dein Begleiter für Sprachen, die du wirklich sprichst: Chinesisch, Deutsch, Englisch, Französisch und Thai. Alles kostenlos. So geht's in 3 kurzen Schritten.",
   t1:"Schritt 1",h1:"Sprache und Ziel wählen",p1:"Tippe oben auf eine Sprache und wähle, ob du sie in 3 oder 6 Monaten sprechen willst. Koel plant jeden Tag passend viele neue Sätze.",
   t2:"Schritt 2",h2:"Hören, schreiben, spielen",p2:"Tippe auf der Seite „Heute“ auf „Start“. Hör zu (weibliche oder männliche Stimme in ⚙️), schreib entlang der gestrichelten Linien und wiederhole mit Spielen.",
   t3:"Schritt 3",h3:"Jeden Tag ein bisschen",p3:"Dein Fortschritt wird automatisch im Konto gespeichert, auf Handy, iPad oder Computer. Sätze, die du bald vergisst, kommen zur Wiederholung zurück.",
   t4:"Bereit",h4:"Welche Sprache möchtest du zuerst lernen?",p4:"Wähle eine. Wechseln oder weitere hinzufügen kannst du jederzeit oben in der Sprachleiste.",
   m:{learn:"Was möchtest du lernen?",within:"Sprechen in",months:"Monaten",newp:"Neuer Satz 1/5",mean:"Freut mich",listen:"Hören",write:"Schreiben",game:"Spielen",today:"Heute",streak:"Tage in Folge",due:"Wiederholen 12 · Neu 5",start:"Start"},
   L:{zh:"Chinesisch",de:"Deutsch",en:"Englisch",fr:"Französisch",th:"Thai"}},
 fr:{pick:"Choisissez la langue de l'app",pickp:"Pour ce guide et les menus. Modifiable plus tard dans ⚙️",skip:"Passer au choix de la langue",next:"Suivant ›",back:"‹ Retour",
   t0:"Pour commencer",h0:n=>`Bonjour${n?" "+n:""}, je suis Koel`,p0:"Votre compagnon pour des langues qu'on parle vraiment : chinois, allemand, anglais, français et thaï. Entièrement gratuit. Voici comment faire en 3 étapes.",
   t1:"Étape 1",h1:"Choisir une langue et un objectif",p1:"Touchez une langue en haut de l'app, puis choisissez de la parler en 3 ou 6 mois. Koel prévoit le bon nombre de nouvelles phrases chaque jour.",
   t2:"Étape 2",h2:"Écouter, écrire, puis jouer",p2:"Appuyez sur « Commencer » sur la page Aujourd'hui. Écoutez (voix féminine ou masculine dans ⚙️), tracez les lettres en pointillés et révisez avec des jeux.",
   t3:"Étape 3",h3:"Un peu chaque jour",p3:"Votre progression est enregistrée automatiquement dans votre compte : continuez sur téléphone, iPad ou ordinateur. Les phrases que vous allez oublier reviennent en révision.",
   t4:"C'est prêt",h4:"Quelle langue voulez-vous apprendre d'abord ?",p4:"Choisissez-en une. Vous pourrez changer ou en ajouter à tout moment depuis la barre des langues en haut.",
   m:{learn:"Que voulez-vous apprendre ?",within:"Parler en",months:"mois",newp:"Nouvelle phrase 1/5",mean:"Enchanté",listen:"Écouter",write:"Écrire",game:"Jouer",today:"Aujourd'hui",streak:"jours de suite",due:"Réviser 12 · Nouveau 5",start:"Commencer"},
   L:{zh:"Chinois",de:"Allemand",en:"Anglais",fr:"Français",th:"Thaï"}}};
const LEARN_NATIVE=[["zh","中文"],["de","Deutsch"],["en","English"],["fr","Français"],["th","ไทย"]];
const onbKey=()=>"koel-onb-"+((AUTH.user&&AUTH.user.id)||"local");
function needOnboarding(){try{if(localStorage.getItem(onbKey()))return false}catch(e){}
  if(AUTH.user)return AUTH.onboarded===false;
  return !LANGS.some(l=>store[l]&&(store[l].goal||Object.keys(store[l].cards||{}).length))}
function markOnboarded(){try{localStorage.setItem(onbKey(),"1")}catch(e){}
  if(AUTH.user){AUTH.onboarded=true;AUTH.sb.from("profiles").update({onboarded:true}).eq("id",AUTH.user.id).then(()=>{},()=>{})}}
function showOnboarding(){if($("#onb"))return;
  const el=document.createElement("div");el.id="onb";el.setAttribute("role","dialog");el.setAttribute("aria-label","Koel");document.body.appendChild(el);document.body.style.overflow="hidden";
  const name=esc(nick()||(AUTH.user&&AUTH.user.user_metadata&&AUTH.user.user_metadata.display_name)||"");
  let i=0,timer=null,t0=0,raf=0;
  const X=()=>ONB_I18N[UIL||"th"]||ONB_I18N.th;
  const SL=[
   {dur:0,ui:true},
   {dur:4600,tag:"t0",h:x=>x.h0(name),p:"p0",art:()=>`<div class="onb-hero">${mascot("happy",220)}</div>`},
   {dur:5200,tag:"t1",h:x=>x.h1,p:"p1",art:x=>`<div class="onb-phone"><div class="t">${x.m.learn}</div><div class="g">${LEARN_NATIVE.map((l,k)=>`<div class="c${k===2?" tap":""}">${l[1]}</div>`).join("")}</div><div class="t" style="margin-top:6px">${x.m.within}</div><div class="g"><div class="c"><b class="num">3</b><br>${x.m.months}</div><div class="c tap2"><b class="num">6</b><br>${x.m.months}</div></div></div><div class="onb-pk">${mascot("idle",110)}</div>`},
   {dur:5200,tag:"t2",h:x=>x.h2,p:"p2",art:x=>`<div class="onb-phone"><div class="hint lead">${x.m.newp}</div><div class="big">Nice to meet you.</div><div class="hint">/naɪs tə miːt juː/</div><div style="text-align:center;font-weight:700">${x.m.mean}</div><div class="g" style="grid-template-columns:repeat(3,1fr);margin-top:6px"><div class="c tile" style="animation-delay:.6s">🎧<br>${x.m.listen}</div><div class="c tile" style="animation-delay:.9s">✍️<br>${x.m.write}</div><div class="c tile" style="animation-delay:1.2s">🧩<br>${x.m.game}</div></div><div class="xp">+10 XP</div></div><div class="onb-pk">${mascot("talk",110)}</div>`},
   {dur:4800,tag:"t3",h:x=>x.h3,p:"p3",art:x=>`<div class="onb-phone"><div class="t">${x.m.today}</div><div class="c" style="display:flex;align-items:center;gap:10px;text-align:left"><b style="font-size:28px;color:#e46a1f">7</b><span>${x.m.streak}</span></div><div class="c" style="text-align:left">${x.m.due}</div><div class="c tap startc">${x.m.start}</div></div><div class="onb-pk">${mascot("win",110)}</div>`},
   {dur:0,tag:"t4",h:x=>x.h4,p:"p4",art:x=>`<div class="onb-langs">${LEARN_NATIVE.map((l,k)=>`<button data-l="${l[0]}" style="animation-delay:${k*0.08}s"><b>${l[1]}</b><small>${x.L[l[0]]}</small></button>`).join("")}</div>`}];
  const finish=lg=>{clearTimeout(timer);cancelAnimationFrame(raf);markOnboarded();if(lg){lang=lg;try{localStorage.setItem(LS+"-lang",lg)}catch(e){}tab="today"}el.remove();document.body.style.overflow="";render();scrollTo(0,0)};
  const draw=()=>{clearTimeout(timer);cancelAnimationFrame(raf);const s=SL[i],x=X(),last=i===SL.length-1;
    const body=s.ui?`<div class="onb-art"><div class="onb-hero">${mascot("idle",200)}</div></div><div class="onb-txt"><span class="onb-tag">Koel</span><h2>${x.pick}</h2><p>${x.pickp}</p><div class="onb-langs ui">${UI_LANGS.map(([k,n],j)=>`<button data-ui="${k}" aria-pressed="${(UIL||"")===k}" style="animation-delay:${j*0.06}s"><b>${n}</b></button>`).join("")}</div></div>`
      :`<div class="onb-art">${s.art(x)}</div><div class="onb-txt"><span class="onb-tag">${x[s.tag]}</span><h2>${s.h(x)}</h2><p>${x[s.p]}</p></div>`;
    el.innerHTML=`<div class="onb-bars">${SL.map((_,k)=>`<i><b style="width:${k<i?100:0}%"></b></i>`).join("")}</div>
     <div class="onb-top">${mascot("idle",36)}${last||s.ui?"":`<button class="onb-skip" id="onb-skip">${x.skip}</button>`}</div>
     <div class="onb-body">${body}</div>
     <div class="onb-nav"><button class="ghost" id="onb-back" ${i?"":'style="visibility:hidden"'}>${x.back}</button>${last||s.ui?"":`<button class="primary" id="onb-next">${x.next}</button>`}</div>`;
    const bar=el.querySelectorAll(".onb-bars b")[i];
    if(s.dur){t0=performance.now();const tick=()=>{const p=Math.min(1,(performance.now()-t0)/s.dur);bar.style.width=p*100+"%";if(p<1)raf=requestAnimationFrame(tick)};tick();timer=setTimeout(()=>{i++;draw()},s.dur)}
    else bar.style.width="100%";
    const n=$("#onb-next");if(n)n.onclick=()=>{i++;draw()};
    $("#onb-back").onclick=()=>{if(i){i--;draw()}};
    const sk=$("#onb-skip");if(sk)sk.onclick=()=>{i=SL.length-1;draw()};
    el.querySelectorAll("[data-ui]").forEach(b=>b.onclick=()=>{setUI(b.dataset.ui);try{localStorage.removeItem("koel-trl")}catch(e){}applyContentLang();i=1;draw()});
    el.querySelectorAll("[data-l]").forEach(b=>b.onclick=()=>finish(b.dataset.l))};
  draw()}
function maybeOnboard(){if(DATA&&needOnboarding())showOnboarding()}


/* =================== AUTO LOGOUT after 1 hour without use =================== */
const IDLE_MS=60*60*1000,IDLE_KEY="koel-last-active";
let idleT=0;
function touchActive(){const n=Date.now();if(n-idleT<15000)return;idleT=n;try{localStorage.setItem(IDLE_KEY,String(n))}catch(e){}}
["pointerdown","keydown","touchstart","wheel"].forEach(ev=>addEventListener(ev,touchActive,{passive:true,capture:true}));
function idleTooLong(){let l=0;try{l=+localStorage.getItem(IDLE_KEY)||0}catch(e){}return l>0&&Date.now()-l>IDLE_MS}
async function idleLogout(){if(!AUTH.user)return;try{await AUTH.sb.auth.signOut()}catch(e){}
  try{localStorage.removeItem(PWK);localStorage.removeItem(IDLE_KEY)}catch(e){}
  AUTH.user=null;dbDoc=null;syncedOnce=false;closeSheet();const st=$("#study");if(st)st.hidden=true;const ob=$("#onb");if(ob)ob.remove();
  authBox("in","","ออกจากระบบอัตโนมัติ เพราะไม่ได้ใช้งานเกิน 1 ชั่วโมง เข้าสู่ระบบอีกครั้งเพื่อเรียนต่อ")}
setInterval(()=>{if(AUTH.user&&idleTooLong())idleLogout()},60000);
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"&&AUTH.user&&idleTooLong())idleLogout()});



/* =================== TRANSLATION LANGUAGE + WHOLE-APP INTERFACE LANGUAGE =================== */
const LOC=()=>({th:"th-TH",en:"en-GB",zh:"zh-CN",de:"de-DE",fr:"fr-FR"})[UIL||"th"]||"th-TH";window.LOC=LOC;
const TRL=()=>{let v="";try{v=localStorage.getItem("koel-trl")||""}catch(e){}return v||(UIL&&UIL!=="th"?"en":"th")};
function setTRL(v){try{localStorage.setItem("koel-trl",v)}catch(e){}applyContentLang();render()}
function applyContentLang(){if(!DATA)return;const en=TRL()==="en";
  for(const L of ["zh","de","en","fr"]){const d=DATA[L];if(!d)continue;
    if(!d._topics_th)d._topics_th=Object.assign({},d.topics);
    d.topics=en&&d.topics_en?Object.assign({},d._topics_th,d.topics_en):Object.assign({},d._topics_th);
    for(const c of d.cards){if(!c._th)c._th={m:c.m,n:c.n,exm:c.exm,p:c.p};
      if(en&&c.en){c.m=c.en.m||c._th.m;c.n=c.en.n;c.exm=c.en.exm;c.p=""}else Object.assign(c,c._th)}
    if(!ALPHA["_th_"+L])ALPHA["_th_"+L]=ALPHA[L];
    ALPHA[L]=en&&ALPHA_EN[L]?ALPHA_EN[L]:ALPHA["_th_"+L]}
  const CI=window.CHARINFO||{};for(const k in CI){const v=CI[k];if(!v._th)v._th={p:v.p,m:v.m};if(en){v.p="";v.m=""}else{v.p=v._th.p;v.m=v._th.m}}}
/* interface text: translate what the core screens print in Thai, for any app language other than Thai */
let UIRX=null;
function uiTr(t){if(!UIL||UIL==="th")return null;const k=t.replace(/\s+/g," ").trim();if(!k||!/[฀-๿]/.test(k))return null;
  const hit=UI18N[k];if(hit)return hit[UIL]||hit.en;
  const pm=k.match(/^อ่านว่า\s+(.+)$/);if(pm&&!/[\u0E00-\u0E7F]/.test(pm[1])&&UI18N["อ่านว่า"])return(UI18N["อ่านว่า"][UIL]||"Read")+" "+pm[1];
  if(!UIRX){UIRX=Object.keys(UI18N).filter(x=>x.includes("{n}")).map(x=>[new RegExp("^"+x.replace(/[.*+?^${}()|[\]\\]/g,"\\$&").replace(/\\\{n\\\}/g,"(\\d[\\d,.]*)")+"$"),x])}
  for(const[rx,x]of UIRX){const m=k.match(rx);if(m){let i=1;return(UI18N[x][UIL]||UI18N[x].en).replace(/\{n\}/g,()=>m[i++])}}return null}
const UI_SKIP=".han,[data-say],.big,.word-now,.ws,.chain,.glyph,.acell b,.onb-langs b,.exw b,.item .t,.gapline,.mean.han,.fo-ask b,.jp.word .lab,.wlist";
function uiTranslate(root){if(!UIL||UIL==="th"||!root)return;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;const todo=[];
  while(n=w.nextNode()){const pe=n.parentElement;if(!pe||pe.closest("script,style")||pe.closest(UI_SKIP))continue;if(lang==="th"&&pe.closest(".item,.reveal,.opt,.exbox,.msg"))continue;const r=uiTr(n.textContent);if(r!=null)todo.push([n,r])}
  for(const[n,r]of todo){const lead=n.textContent.match(/^\s*/)[0],tail=n.textContent.match(/\s*$/)[0];n.textContent=lead+r+tail}
  (root.querySelectorAll?root:document).querySelectorAll("[placeholder],[aria-label],[title]").forEach(e=>{for(const a of["placeholder","aria-label","title"]){const v=e.getAttribute(a);if(v){const r=uiTr(v);if(r!=null)e.setAttribute(a,r)}}})}
let uiPend=false;
new MutationObserver(()=>{if(uiPend||!UIL||UIL==="th")return;uiPend=true;requestAnimationFrame(()=>{uiPend=false;uiTranslate(document.body)})}).observe(document.documentElement,{childList:true,subtree:true,characterData:false});
const _toast=toast;toast=function(m){const r=uiTr(String(m));return _toast(r!=null?r:m)};

/* =================== THAI: one female voice, correct readings =================== */
const TH_READ={"สลัด":"สะลัด","สระ":"สะระ"};
function thRespell(t){let s=String(t);for(const k in TH_READ)s=s.split(k).join(TH_READ[k]);return s}


/* =================== WAIT FOR SPEECH BEFORE MOVING ON =================== */
let SPK_END=0;
player.addEventListener("play",()=>{SPK_END=Date.now()+15000});
["ended","pause","error"].forEach(ev=>player.addEventListener(ev,()=>{SPK_END=Date.now()}));
function speakingNow(){return(!player.paused&&!player.ended)||(webTTS&&(speechSynthesis.speaking||speechSynthesis.pending))}
function whenQuiet(fn,max){const t0=Date.now(),lim=max||7000;let seen=false;
  const chk=()=>{const busy=speakingNow();if(busy)seen=true;
    if((!busy&&(seen||Date.now()-t0>350))||Date.now()-t0>lim){setTimeout(fn,seen?250:0);return}setTimeout(chk,80)};chk()}

const _nextStudy=next;next=function(){whenQuiet(()=>_nextStudy(),4000)};
const _nextQ=nextQ;nextQ=function(){if(T&&T.i<0)return _nextQ();whenQuiet(()=>_nextQ(),4000)};
/* =================== OFFLINE =================== */
addEventListener("offline",()=>toast(TX("ออฟไลน์อยู่ ยังเรียนต่อได้ ความคืบหน้าจะซิงก์เมื่อกลับมาออนไลน์","You're offline. Keep learning: progress syncs when you're back online.")));
addEventListener("online",()=>{toast(TX("กลับมาออนไลน์แล้ว กำลังซิงก์","Back online, syncing"));if(dbDoc){pending=true;push()}});
const OFFC="koel-offline";
function offFiles(l){const f=(ACHUNKS[l]||[]).map(i=>"a"+i+".js");if(l==="zh"){for(const i of new Set(Object.values(SIDX)))f.push("k"+i+".js");f.push("hw.js")}return f}
async function offState(l){if(!("caches" in window))return{have:0,n:0};const c=await caches.open(OFFC),f=offFiles(l);let have=0;for(const x of f)if(await c.match(x))have++;return{have,n:f.length}}
async function offDownload(l,onp){const c=await caches.open(OFFC),f=offFiles(l);let k=0;
  for(const x of f){if(!(await c.match(x))){const r=await fetch(x,{cache:"no-cache"});if(!r.ok)throw new Error(x);await c.put(x,r)}k++;onp(k,f.length)}}
async function offPanel(){const box=$("#s-off");if(!box)return;
  if(!("caches" in window)||!("serviceWorker" in navigator)){box.innerHTML=`<p class="hint" style="margin:0">${TX("เบราว์เซอร์นี้ยังไม่รองรับการใช้งานออฟไลน์","This browser can't work offline")}</p>`;return}
  const st=await offState(lang),mb=Math.round(st.n*0.42),done=st.n&&st.have===st.n;
  box.innerHTML=`<p class="hint" style="margin:0">${TX("หลังเปิดแอปครั้งแรก แอปเปิดได้แม้ไม่มีเน็ต บทเรียน เกม และการฝึกเขียนใช้ได้ครบ ความคืบหน้าจะซิงก์เข้าบัญชีเมื่อกลับมาออนไลน์","After the first visit the app opens without internet: lessons, games and writing all work, and progress syncs when you're back online.")}</p>
   ${st.n?`<div class="bar"><i id="off-bar" style="width:${Math.round(st.have/st.n*100)}%"></i></div>
   <button class="${done?"ghost":"primary"}" id="off-dl" ${done?"disabled":""}>${done?TX("✓ เสียงภาษา"+DATA[lang].name+" พร้อมใช้ออฟไลน์แล้ว","✓ "+DATA[lang].name+" audio is ready offline"):TX(`ดาวน์โหลดเสียงภาษา${DATA[lang].name}ไว้ใช้ออฟไลน์ (ประมาณ ${mb} MB)`,`Download audio for offline use (about ${mb} MB)`)}</button>`
   :`<p class="hint" style="margin:0">${TX("ภาษานี้ใช้เสียงของเครื่อง ใช้ออฟไลน์ได้เลย ไม่ต้องดาวน์โหลด","This language uses your device's voice, which works offline")}</p>`}`;
  const b=$("#off-dl");if(b)b.onclick=async()=>{b.disabled=true;try{await offDownload(lang,(k,n)=>{const br=$("#off-bar");if(br)br.style.width=Math.round(k/n*100)+"%";b.textContent=TX(`กำลังดาวน์โหลด ${k}/${n}`,`Downloading ${k}/${n}`)});toast(TX("ดาวน์โหลดเสร็จ ใช้ออฟไลน์ได้แล้ว","Done: ready offline"))}catch(e){toast(TX("ดาวน์โหลดไม่ครบ ตรวจอินเทอร์เน็ตแล้วลองใหม่","Download stopped. Check the connection and try again"))}offPanel()}}

/* =================== BOOT =================== */
(async function boot(){
  const sbOk=await initSB();
  if(!sbOk){let saved=null;try{saved=localStorage.getItem(PWK)}catch(e){}
    if(saved){try{await tryUnlock(saved);return}catch(e){}}
    const g=Object.assign(document.createElement("div"),{id:"gate"});document.body.appendChild(g);document.body.style.overflow="hidden";
    g.innerHTML=`<div class="gbox">${mascot("oops",110)}<h1>Koel</h1><p class="hint">เชื่อมต่ออินเทอร์เน็ตไม่ได้ ตรวจการเชื่อมต่อแล้วลองใหม่</p><button class="primary" onclick="location.reload()">ลองใหม่</button></div>`;return}
  const isRecovery=/type=recovery/.test(location.hash);
  const{data:{session}}=await AUTH.sb.auth.getSession();
  AUTH.sb.auth.onAuthStateChange((ev)=>{if(ev==="PASSWORD_RECOVERY")newPasswordBox()});
  if(isRecovery&&session)return newPasswordBox();
  if(session&&idleTooLong()){try{await AUTH.sb.auth.signOut()}catch(e){}try{localStorage.removeItem(PWK);localStorage.removeItem(IDLE_KEY)}catch(e){}return authBox("in","","ออกจากระบบอัตโนมัติ เพราะไม่ได้ใช้งานเกิน 1 ชั่วโมง")}
  if(session){await loadProfile();let saved=null;try{saved=localStorage.getItem(PWK)}catch(e){}
    if(saved){try{await tryUnlock(saved)}catch(e){}}
    return signedIn()}
  showAuth();
})();

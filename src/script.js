//----------------------------------------------------------
// Load Word
//----------------------------------------------------------
let currentText = localStorage.getItem("typoWord") || "산은 산이요 물은 물이로다";
const container = document.getElementById("typo-container");

// 전체 글자 span들을 담는 배열
let parts = [];
let timings = new Map();

//----------------------------------------------------------
// Hangul Tools
//----------------------------------------------------------
const BASE = 0xac00;

const CHO = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
const JUNG = [
  "ㅏ","ㅐ","ㅑ","ㅒ","ㅓ","ㅔ","ㅕ","ㅖ",
  "ㅗ","ㅘ","ㅙ","ㅚ","ㅛ",
  "ㅜ","ㅝ","ㅞ","ㅟ","ㅠ",
  "ㅡ","ㅢ","ㅣ"
];
const JONG = [
  "","ㄱ","ㄲ","ㄳ","ㄴ","ㄵ","ㄶ","ㄷ","ㄹ","ㄺ","ㄻ","ㄼ","ㄽ","ㄾ","ㄿ",
  "ㅀ","ㅁ","ㅂ","ㅄ","ㅅ","ㅆ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"
];

function isHangul(ch){
  const c = ch.charCodeAt(0);
  return c >= 0xac00 && c <= 0xd7a3;
}

function splitHangul(ch){
  if (!isHangul(ch)) return { cho: ch, jung:"", jong:"" };
  const code = ch.charCodeAt(0) - BASE;
  const jong = code % 28;
  const jung = ((code - jong) / 28) % 21;
  const cho = (((code - jong) / 28) - jung) / 21;
  return { cho: CHO[cho], jung: JUNG[jung], jong: JONG[jong] };
}

function randomJong(){
  return ["ㄱ","ㄴ","ㄹ","ㅁ","ㅂ","ㅇ"][Math.floor(Math.random()*6)];
}

//----------------------------------------------------------
// Hangul Cycles (modern ↔ archaic)
//----------------------------------------------------------
const CHO_CYCLES = [
  ["ㄱ","ᄀ","ㆆ"], ["ㄲ","ᄀ","ㆆ"], ["ㄴ","ᄂ","ᅀ"], ["ㄷ","ᄃ","ㆆ"],
  ["ㄸ","ᄃ","ㆆ"], ["ㄹ","ᄅ","ᅀ"], ["ㅁ","ᄆ","ᅌ"], ["ㅂ","ᄇ","ㆆ"],
  ["ㅃ","ᄇ","ㆆ"], ["ㅅ","ᄼ","ᄽ"], ["ㅆ","ᄼ","ᄽ"], ["ㅇ","ᅌ","ᅀ"],
  ["ㅈ","ᄌ","ᅀ"], ["ㅉ","ᄌ","ᅀ"], ["ㅊ","ᄎ","ㆆ"], ["ㅋ","ㆆ","ᄀ"],
  ["ㅌ","ㆆ","ᄃ"], ["ㅍ","ㆆ","ᄇ"], ["ㅎ","ㆆ","ᅀ"]
];
const JUNG_CYCLES = [
  ["ㅏ","ㆍ","ᆞ"], ["ㅐ","ㆍ","ᆞ"], ["ㅑ","ㆍ","ᆞ"], ["ㅒ","ㆍ","ᆞ"],
  ["ㅓ","ㆍ","ᆞ"], ["ㅔ","ㆍ","ᆞ"], ["ㅕ","ㆍ","ᆞ"], ["ㅖ","ㆍ","ᆞ"],
  ["ㅗ","ㆍ","ᆞ"], ["ㅘ","ㆍ","ᆞ"], ["ㅙ","ㆍ","ᆞ"], ["ㅚ","ㆍ","ᆞ"],
  ["ㅛ","ㆍ","ᆞ"], ["ㅜ","ㆍ","ᆞ"], ["ㅝ","ㆍ","ᆞ"], ["ㅞ","ㆍ","ᆞ"],
  ["ㅟ","ㆍ","ᆞ"], ["ㅠ","ㆍ","ᆞ"], ["ㅡ","ㆍ","ᆞ"], ["ㅢ","ㆍ","ᆞ"],
  ["ㅣ","ᅵᅵ","ㆍ"]
];
const JONG_CYCLES = [
  ["","ㄱ","ᄀ","ㆆ"], ["ㄲ","ᄀ","ㆆ"], ["ㄳ","ㄱ","ᄀ","ㆆ"],
  ["ㄴ","ᄂ","ᅀ"], ["ㄵ","ㄴ","ᅀ"], ["ㄶ","ㄴ","ᅀ"],
  ["ㄷ","ᄃ","ㆆ"], ["ㄹ","ᄅ","ᅀ"], ["ㄺ","ㄹ","ᄀ","ㆆ"],
  ["ㄻ","ㄹ","ᄆ","ᅌ"], ["ㄼ","ㄹ","ᄇ","ㆆ"], ["ㄽ","ㄹ","ᄼ","ᄽ"],
  ["ㄾ","ㄹ","ㆆ","ᄃ"], ["ㄿ","ㄹ","ㆆ","ᄇ"], ["ㅀ","ㄹ","ㆆ","ᅀ"],
  ["ㅁ","ᄆ","ᅌ"], ["ㅂ","ᄇ","ㆆ"], ["ㅄ","ㅂ","ᄼ","ᄽ"],
  ["ㅅ","ᄼ","ᄽ"], ["ㅆ","ᄼ","ᄽ"], ["ㅇ","ᅌ","ᅀ"],
  ["ㅈ","ᄌ","ᅀ"], ["ㅊ","ᄎ","ㆆ"], ["ㅋ","ㆆ","ᄀ"],
  ["ㅌ","ㆆ","ᄃ"], ["ㅍ","ㆆ","ᄇ"], ["ㅎ","ㆆ","ᅀ"]
];

const CYCLE_CHO = {}; CHO_CYCLES.forEach(g=>g.forEach(c=>CYCLE_CHO[c]=g));
const CYCLE_JUNG = {}; JUNG_CYCLES.forEach(g=>g.forEach(c=>CYCLE_JUNG[c]=g));
const CYCLE_JONG = {}; JONG_CYCLES.forEach(g=>g.forEach(c=>CYCLE_JONG[c]=g));

//----------------------------------------------------------
// Microphone Detection
//----------------------------------------------------------
let audioContext=null, analyser=null, dataArray=null, micStream=null;
let speaking=false, micOn=false;

const micBtn = document.getElementById("btn-mic");
if (micBtn) micBtn.onclick = toggleMic;

async function toggleMic(){
  if (!micOn) await startMic();
  else stopMic();
}

async function startMic(){
  try{
    micStream = await navigator.mediaDevices.getUserMedia({audio:true});
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const src = audioContext.createMediaStreamSource(micStream);

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    dataArray = new Uint8Array(analyser.fftSize);
    src.connect(analyser);

    micOn = true;
    micBtn.textContent="🎤 마이크 끄기";
  }catch(e){ console.log(e); }
}

function stopMic(){
  if(micStream) micStream.getTracks().forEach(t=>t.stop());
  micStream=null; analyser=null; dataArray=null;
  speaking=false; micOn=false;
  micBtn.textContent="🎤 마이크 켜기";
}

function detect(){
  if (!analyser || !dataArray){
    speaking=false;
    requestAnimationFrame(detect);
    return;
  }

  analyser.getByteTimeDomainData(dataArray);
  let sum=0;
  for(let i=0;i<dataArray.length;i++){
    const v=(dataArray[i]-128)/128;
    sum+=v*v;
  }
  const volume=Math.sqrt(sum/dataArray.length);
  speaking = volume>0.035;

  requestAnimationFrame(detect);
}
detect();

//----------------------------------------------------------
// Ghost
//----------------------------------------------------------
function leaveGhost(el){
  const rect = el.getBoundingClientRect();
  const g = document.createElement("span");
  g.className = "part-ghost";
  g.textContent = el.textContent;
  g.style.left = rect.left+"px";
  g.style.top = rect.top+"px";
  g.style.fontSize = getComputedStyle(el).fontSize;
  document.body.appendChild(g);
  requestAnimationFrame(()=> g.style.opacity=0);
  setTimeout(()=> g.remove(),1400);
}

//----------------------------------------------------------
// Character transform
//----------------------------------------------------------
function nextFromMap(map, ch){
  const arr = map[ch];
  if (!arr) return {next:ch, arr:null};
  const idx = arr.indexOf(ch);
  return {next:arr[(idx+1)%arr.length], arr};
}

function transformVisual(el){
  const s = 1 + Math.random()*0.35;
  const rot = (Math.random()*10)-5;
  const ty = (Math.random()*10)-5;
  el.style.transform = `scale(${s}) rotate(${rot}deg) translateY(${ty}px)`;
  el.style.opacity = 0.85 + Math.random()*0.15;
}

function isArchaicChar(type, ch){
  let map=null;
  if(type==="cho") map=CYCLE_CHO;
  else if(type==="jung") map=CYCLE_JUNG;
  else if(type==="jong") map=CYCLE_JONG;
  if(!map) return false;
  const arr = map[ch];
  if(!arr) return false;
  return arr.indexOf(ch) > 0;
}

function transformChar(ch, type){
  if(!speaking) return ch;

  const archaicChance=0.03;

  if(type==="cho"){
    const {next, arr} = nextFromMap(CYCLE_CHO, ch);
    if(!arr) return ch;
    return Math.random()<archaicChance? next : arr[0];
  }

  if(type==="jung"){
    const {next, arr} = nextFromMap(CYCLE_JUNG, ch);
    if(!arr) return ch;
    return Math.random()<0.05? next : arr[0];
  }

  if(type==="jong"){
    const {next, arr} = nextFromMap(CYCLE_JONG, ch);
    if(ch!=="" && Math.random()<0.18) return "";
    if(ch==="" && Math.random()<0.18) return randomJong();
    if(!arr) return ch;
    return Math.random()<archaicChance? next : arr[0];
  }

  return ch;
}

//----------------------------------------------------------
// GPT-like Random Sentence Generator
//----------------------------------------------------------
function choice(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

function generateSentence(){
  const nouns = ["언어","기억","목소리","파장","시간","몸","문장","꿈","그림자","빛","파편","침묵","조각","손","눈","숨"];
  const places = ["공기 속에","몸 안에서","밤 사이에","빈 공간에","균열 속에"];
  const verbs = ["흐른다","부서진다","다시 태어난다","사라진다","겹쳐진다","흔들린다","깨어난다"];
  const adjs = ["조용히","느리게","갑자기","잔혹하게","부드럽게","무심하게"];
  const endings = ["그리고 아무도 모른다","너만 본다","우리는 따라간다"];

  const patterns = [
    () => `${choice(nouns)}는 ${choice(places)} ${choice(adjs)} ${choice(verbs)}`,
    () => `${choice(nouns)}와 ${choice(nouns)} 사이에 ${choice(nouns)}가 남는다`,
    () => `${choice(nouns)}는 끝났고 ${choice(nouns)}만 다시 시작된다`,
    () => `${choice(nouns)}를 잃고 ${choice(nouns)}를 얻는다`,
    () => `${choice(nouns)}가 조용히 넘어가고 ${choice(endings)}`
  ];

  return choice(patterns)();
}

//----------------------------------------------------------
// Build Word (render text into parts)
//----------------------------------------------------------
function buildWord(text){
  container.innerHTML="";
  parts=[];
  timings=new Map();
  currentText=text;
  localStorage.setItem("typoWord", text);

  [...text].forEach(ch=>{
    const syl=document.createElement("div");
    syl.className="syllable";

    if(!isHangul(ch)){
      const p=makePart(ch,syl,"");
      parts.push(p);
      container.appendChild(syl);
      return;
    }

    const {cho,jung,jong} = splitHangul(ch);
    const pc = makePart(cho,syl,"cho");
    const pj = makePart(jung,syl,"jung");
    const pk = makePart(jong,syl,"jong");
    parts.push(pc,pj,pk);
    container.appendChild(syl);
  });

  parts.forEach(el=>{
    timings.set(el,{
      interval:50+Math.random()*120,
      nextTime:performance.now()+Math.random()*300
    });

    el.addEventListener("click", ()=> onPartClick());
  });
}

function makePart(text, wrap, type){
  const el=document.createElement("span");
  el.className="part";
  el.textContent=text;
  el.dataset.type=type;
  wrap.appendChild(el);
  return el;
}

//----------------------------------------------------------
// Fragment Effects
//----------------------------------------------------------
function fragmentElement(el){
  const rect=el.getBoundingClientRect();
  for(let i=0;i<10;i++){
    const p=document.createElement("span");
    p.textContent=el.textContent;
    p.className="part-ghost";
    p.style.left=rect.left+"px";
    p.style.top=rect.top+"px";
    p.style.fontSize=getComputedStyle(el).fontSize;
    document.body.appendChild(p);

    const dx=(Math.random()*400)-200;
    const dy=(Math.random()*400)-200;
    const rot=(Math.random()*720)-360;

    p.style.transition="all 0.8s ease-out";
    requestAnimationFrame(()=>{
      p.style.transform=`translate(${dx}px,${dy}px) rotate(${rot}deg)`;
      p.style.opacity=0;
    });
    setTimeout(()=>p.remove(),900);
  }
}

function fragmentAll(){
  parts.forEach(el=> fragmentElement(el));
}

//----------------------------------------------------------
// Collapse Control (Random Reset to Home)
//----------------------------------------------------------
let collapseLimit = Math.floor(7 + Math.random()*9);
let clickCount = 0;

function triggerCollapseAndReturnHome(){
  fragmentAll();

  setTimeout(()=>{
    container.innerHTML="";

    for(let i=0;i<40;i++){
      const d=document.createElement("div");
      d.className="part-ghost";
      d.textContent=["■","□","▣","▤","▥"][Math.floor(Math.random()*5)];
      d.style.left=(window.innerWidth/2)+"px";
      d.style.top=(window.innerHeight/2)+"px";
      d.style.fontSize=(40+Math.random()*90)+"px";
      document.body.appendChild(d);

      const dx=(Math.random()*1200)-600;
      const dy=(Math.random()*1200)-600;
      d.style.transition="all 1.3s cubic-bezier(0.19, 1, 0.22, 1)";
      requestAnimationFrame(()=>{
        d.style.transform=`translate(${dx}px,${dy}px) rotate(${Math.random()*720}deg)`;
        d.style.opacity=0;
      });
      setTimeout(()=>d.remove(),1500);
    }

  },300);

  setTimeout(()=>{
    window.location.href="index.html";
  },1600);
}

//----------------------------------------------------------
// onPartClick – full interaction
//----------------------------------------------------------
function onPartClick(){
  clickCount++;

  if(clickCount >= collapseLimit){
    triggerCollapseAndReturnHome();
    return;
  }

  fragmentAll();

  setTimeout(()=>{
    const newSentence = generateSentence();
    buildWord(newSentence);
  },850);
}

//----------------------------------------------------------
// Animate Loop
//----------------------------------------------------------
function animate(){
  const now=performance.now();

  parts.forEach(el=>{
    const type=el.dataset.type;
    if(!type) return;

    const t=timings.get(el);
    if(!t) return;
    if(now<t.nextTime) return;

    t.nextTime = now + t.interval + Math.random()*80;

    const cur=el.textContent;
    const next=transformChar(cur,type);
    if(cur!==next){
      leaveGhost(el);
      el.textContent=next;
    }

    if(isArchaicChar(type,el.textContent)) el.classList.add("archaic");
    else el.classList.remove("archaic");

    transformVisual(el);
  });

  requestAnimationFrame(animate);
}

//----------------------------------------------------------
// Init
//----------------------------------------------------------
buildWord(currentText);
animate();

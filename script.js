"use strict";

/* ── Canvas refs ── */
const skyC    = document.getElementById('sky-canvas');
const skyCtx  = skyC.getContext('2d');
const dustC   = document.getElementById('dust-canvas');
const dustCtx = dustC.getContext('2d');
const vCanvas = document.getElementById('violin-canvas');
const vCtx    = vCanvas.getContext('2d');

function resizeCanvases() {
  const w = window.innerWidth, h = window.innerHeight;
  skyC.width = w;   skyC.height = h;
  dustC.width = w;  dustC.height = h;
  if (vCanvas.offsetWidth > 0 && vCanvas.offsetHeight > 0) {
    vCanvas.width  = vCanvas.offsetWidth;
    vCanvas.height = vCanvas.offsetHeight;
  }
}

/* ── Sky ── */
function lerp(a,b,t){ return a+(b-a)*t; }

const clouds = Array.from({length:5},()=>({
  x:     Math.random()*1400-200,
  y:     55+Math.random()*240,
  w:     160+Math.random()*200,
  h:     48+Math.random()*48,
  speed: 0.10+Math.random()*0.08,
  alpha: 0.28+Math.random()*0.22,
}));

function drawClouds(offsetX){
  clouds.forEach(cl=>{
    const x=((cl.x-offsetX*cl.speed)%(skyC.width+400))-200;
    skyCtx.save();
    skyCtx.globalAlpha=cl.alpha;
    skyCtx.filter='blur(20px)';
    skyCtx.fillStyle='rgba(255,253,248,.88)';
    skyCtx.beginPath();
    skyCtx.ellipse(x+cl.w/2,cl.y,cl.w/2,cl.h/2,0,0,Math.PI*2);
    skyCtx.fill();
    skyCtx.filter='blur(9px)';
    skyCtx.fillStyle='rgba(255,255,255,.55)';
    skyCtx.beginPath();
    skyCtx.ellipse(x+cl.w/2-cl.w*.12,cl.y-cl.h*.18,cl.w*.34,cl.h*.44,0,0,Math.PI*2);
    skyCtx.fill();
    skyCtx.restore();
  });
}

function drawSky(scrollY){
  const maxS=Math.max(document.body.scrollHeight-window.innerHeight,1);
  const t=Math.min(scrollY/maxS,1);
  const grad=skyCtx.createLinearGradient(0,0,0,skyC.height);
  grad.addColorStop(0,`rgb(${Math.round(lerp(184,232,t))},${Math.round(lerp(207,210,t))},${Math.round(lerp(232,180,t))})`);
  grad.addColorStop(.5,`rgb(${Math.round(lerp(210,240,t))},${Math.round(lerp(228,222,t))},${Math.round(lerp(242,192,t))})`);
  grad.addColorStop(1,`rgb(${Math.round(lerp(232,245,t))},${Math.round(lerp(222,210,t))},${Math.round(lerp(208,170,t))})`);
  skyCtx.fillStyle=grad;
  skyCtx.fillRect(0,0,skyC.width,skyC.height);
  drawClouds(scrollY*0.15);
}

/* ── Dust Particles ── */
let mouseX=window.innerWidth/2, mouseY=window.innerHeight/2;
function makeP(){
  return{x:Math.random()*window.innerWidth,y:Math.random()*window.innerHeight,
    r:.7+Math.random()*1.8,vx:(Math.random()-.5)*.15,vy:-.06-Math.random()*.18,
    alpha:.1+Math.random()*.3,life:Math.random(),speed:.002+Math.random()*.003};
}
const particles=Array.from({length:38},makeP);
function drawDust(){
  dustCtx.clearRect(0,0,dustC.width,dustC.height);
  particles.forEach(p=>{
    p.life+=p.speed;
    if(p.life>1){const f=makeP();f.x=Math.random()*dustC.width;f.y=dustC.height+10;f.life=0;Object.assign(p,f);}
    const dx=p.x-mouseX,dy=p.y-mouseY,d=Math.sqrt(dx*dx+dy*dy);
    if(d<60&&d>0){p.vx+=(dx/d)*.05;p.vy+=(dy/d)*.03;}
    p.vx*=.982;p.vy*=.982;p.x+=p.vx;p.y+=p.vy;
    if(p.x<0)p.x=dustC.width;if(p.x>dustC.width)p.x=0;
    const fade=Math.sin(p.life*Math.PI),a=p.alpha*fade;
    const g=dustCtx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*4);
    g.addColorStop(0,`rgba(255,238,175,${a})`);g.addColorStop(1,'rgba(255,238,175,0)');
    dustCtx.beginPath();dustCtx.arc(p.x,p.y,p.r*4,0,Math.PI*2);
    dustCtx.fillStyle=g;dustCtx.fill();
  });
}
document.addEventListener('mousemove',e=>{mouseX=e.clientX;mouseY=e.clientY;});
document.addEventListener('touchmove',e=>{mouseX=e.touches[0].clientX;mouseY=e.touches[0].clientY;},{passive:true});

/* ── Violin Waves ── */
let vTime=0, scene4Active=false;
const waveLines=[
  {amp:22,freq:.011,speed:.011,y:.32,color:'rgba(185,148,88,.20)',width:1.8},
  {amp:32,freq:.008,speed:.011,y:.48,color:'rgba(200,165,100,.24)',width:2.0},
  {amp:18,freq:.015,speed:.011,y:.64,color:'rgba(180,140,78,.16)',width:1.4},
  {amp:26,freq:.010,speed:.011,y:.78,color:'rgba(195,158,92,.18)',width:1.6},
];
function drawViolinWaves(){
  if(!scene4Active||vCanvas.width===0||vCanvas.height===0)return;
  vCtx.clearRect(0,0,vCanvas.width,vCanvas.height);
  vTime+=.4;
  waveLines.forEach(wl=>{
    const yB=vCanvas.height*wl.y;
    vCtx.beginPath();vCtx.strokeStyle=wl.color;vCtx.lineWidth=wl.width;
    vCtx.lineJoin='round';vCtx.lineCap='round';
    for(let x=0;x<=vCanvas.width;x+=2){
      const y=yB+Math.sin(x*wl.freq+vTime*wl.speed*45)*wl.amp+Math.sin(x*wl.freq*1.6+vTime*wl.speed*35)*wl.amp*.35;
      x===0?vCtx.moveTo(x,y):vCtx.lineTo(x,y);
    }
    vCtx.stroke();
  });
}

/* ── Scroll-based Image Animation (Scene 6) ── */
let scene6Revealed = false;
function checkScene6Scroll() {
  const scene6 = document.getElementById('scene-6');
  if (!scene6 || scene6Revealed) return;

  const rect = scene6.getBoundingClientRect();
  const windowH = window.innerHeight;

  // عندما تظهر المشهد 6 بنسبة 20% في الشاشة
  if (rect.top < windowH * 0.8) {
    const flowersBg = scene6.querySelector('.flowers-bg');
    if (flowersBg) {
      flowersBg.classList.add('scroll-reveal');
      scene6Revealed = true;
    }
  }
}

/* ── IntersectionObserver ── */
const scenes = document.querySelectorAll('.scene');
const observer = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('visible');
      if(e.target.id==='scene-4') scene4Active=true;
    } else if(e.target.id==='scene-4') scene4Active=false;
  });
},{threshold:.18});
scenes.forEach(s=>observer.observe(s));

/* ── Main Loop ── */
let scrollY=0;
window.addEventListener('scroll',()=>{
  scrollY=window.scrollY;
  checkScene6Scroll();
},{passive:true});

function loop(){drawSky(scrollY);drawDust();drawViolinWaves();requestAnimationFrame(loop);}
window.addEventListener('resize',resizeCanvases);
resizeCanvases();
loop();

/* ── Audio ── */
let audioCtx=null,masterGain=null,musicOn=false,musicStarted=false,chunkTimer=null;
function buildAudio(){
  try{audioCtx=new(window.AudioContext||window.webkitAudioContext)();}
  catch(e){console.warn('Audio unavailable');return;}
  const sr=audioCtx.sampleRate;
  masterGain=audioCtx.createGain();
  masterGain.gain.setValueAtTime(0,audioCtx.currentTime);
  masterGain.gain.linearRampToValueAtTime(.09,audioCtx.currentTime+10);
  const silk=audioCtx.createBiquadFilter();silk.type='lowpass';silk.frequency.value=2400;silk.Q.value=.35;
  const comp=audioCtx.createDynamicsCompressor();comp.threshold.value=-26;comp.knee.value=20;comp.ratio.value=4;comp.attack.value=.18;comp.release.value=1.4;
  masterGain.connect(silk);silk.connect(comp);comp.connect(audioCtx.destination);
  function makeRev(secs,decay){
    const rev=audioCtx.createConvolver(),len=sr*secs,buf=audioCtx.createBuffer(2,len,sr);
    for(let ch=0;ch<2;ch++){const d=buf.getChannelData(ch),pre=Math.floor(sr*.035);
      for(let i=0;i<len;i++){if(i<pre){d[i]=0;continue;}const t=(i-pre)/(len-pre);d[i]=(Math.random()*2-1)*Math.pow(1-t,decay);}}
    rev.buffer=buf;return rev;
  }
  const rev=makeRev(6,1.6),revG=audioCtx.createGain();revG.gain.value=.62;
  const revLp=audioCtx.createBiquadFilter();revLp.type='lowpass';revLp.frequency.value=1600;
  masterGain.connect(rev);rev.connect(revG);revG.connect(revLp);revLp.connect(comp);
  function note(freq,when,dur,vel){
    const env=audioCtx.createGain();env.gain.setValueAtTime(0,when);
    env.gain.linearRampToValueAtTime(vel,when+.14);env.gain.setTargetAtTime(vel*.38,when+.14,.55);
    env.gain.setTargetAtTime(.0001,when+dur*.5,dur*.95);env.connect(masterGain);
    const o1=audioCtx.createOscillator();o1.type='sine';o1.frequency.value=freq;
    const o2=audioCtx.createOscillator();o2.type='sine';o2.frequency.value=freq*2;
    const g2=audioCtx.createGain();g2.gain.value=.10;
    o1.connect(env);o2.connect(g2);g2.connect(env);
    const end=when+dur+3;o1.start(when);o1.stop(end);o2.start(when);o2.stop(end);
  }
  function pad(freq,when,dur,vel){
    const env=audioCtx.createGain();env.gain.setValueAtTime(0,when);
    env.gain.linearRampToValueAtTime(vel,when+4.5);env.gain.setTargetAtTime(vel*.55,when+4.5,2.2);
    env.gain.setTargetAtTime(.0001,when+dur-4,4.5);env.connect(masterGain);
    [-4,0,3].forEach((cents,i)=>{
      const o=audioCtx.createOscillator();o.type='sine';o.frequency.value=freq;o.detune.value=cents;
      const g=audioCtx.createGain();g.gain.value=[.45,.72,.45][i];o.connect(g);g.connect(env);
      o.start(when);o.stop(when+dur+5);
    });
  }
  const P={G3:196,A3:220,B3:246.94,D4:293.66,E4:329.63,G4:392,A4:440,B4:493.88,D5:587.33,E5:659.25};
  const B=60/38;
  const pA=[[P.G4,0,4,.050],[P.A4,4,3,.044],[P.B4,7,4,.048],[P.D5,11,5,.053],[P.E5,16,4,.046],[P.D5,20,3,.042],[P.B4,23,5,.048],[P.G4,28,8,.050]];
  const pB=[[P.E5,0,3,.044],[P.D5,3,4,.046],[P.B4,7,3,.042],[P.A4,10,4,.044],[P.G4,14,3,.040],[P.A4,17,3,.042],[P.B4,20,4,.044],[P.G4,24,8,.050]];
  const cA=[P.G3,P.B3,P.D4,P.G4],cB=[P.E4*.5,P.G3,P.B3,P.E4];
  let cycle=0;
  function schedChunk(){
    if(!musicOn)return;
    const now=audioCtx.currentTime+.12,ph=cycle%2,mel=ph===0?pA:pB,ch=ph===0?cA:cB;
    mel.forEach(([f,bs,bd,v])=>note(f,now+bs*B,bd*B,v));
    ch.forEach((f,i)=>pad(f,now+i*.75,36*B*.88,.015-i*.0018));
    cycle++;chunkTimer=setTimeout(schedChunk,36*B*1000-600);
  }
  schedChunk();
}

/* ── Start Experience ── */
function startExperience(){
  document.getElementById('start-overlay').classList.add('hidden');
  setTimeout(()=>{
    const h=document.getElementById('scroll-hint');
    h.classList.add('show');setTimeout(()=>h.classList.remove('show'),4000);
  },2200);
  if(!musicStarted){musicStarted=true;musicOn=true;buildAudio();}
}

window.addEventListener('scroll',()=>document.getElementById('scroll-hint').classList.remove('show'),{once:true,passive:true});

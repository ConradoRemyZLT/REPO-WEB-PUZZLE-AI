/* PUZZLE AI · web — interacción y movimiento
   Todo corre con requestAnimationFrame y transform/opacity (60 fps).
   Respeta prefers-reduced-motion. */
(function(){
'use strict';
var D=document,H=D.documentElement,W=window;
var RM=W.matchMedia&&W.matchMedia('(prefers-reduced-motion: reduce)').matches;
var FINE=W.matchMedia&&W.matchMedia('(pointer:fine)').matches;
function $(s,c){return (c||D).querySelector(s)}
function $$(s,c){return Array.prototype.slice.call((c||D).querySelectorAll(s))}
function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}

/* ---------- idioma ---------- */
function setLang(l){
  H.classList.toggle('en',l==='en');H.lang=l;store('pz_lang',l);
  D.title=l==='en'?'Puzzle AI · Trustworthy artificial intelligence':'Puzzle AI · Inteligencia artificial confiable';
  buildDots();rot.reset();
}
$$('.lang button').forEach(function(b){b.addEventListener('click',function(){setLang(b.getAttribute('data-lang'))})});
H.lang=H.classList.contains('en')?'en':'es';

/* ---------- loader ---------- */
function hideLoader(){var l=$('#loader');if(l&&!l.classList.contains('out')){l.classList.add('out');D.body.classList.add('ready');W.dispatchEvent(new Event('pz:loaded'));if(!H.classList.contains('locked'))reveal.kick()}}
W.addEventListener('pz:unlock',function(){W.scrollTo(0,0);setTimeout(function(){reveal.kick();onScroll()},250)});
W.addEventListener('load',function(){setTimeout(hideLoader,350)});
setTimeout(hideLoader,4000);

/* ---------- split de títulos ---------- */
$$('[data-split]').forEach(function(el){
  var words=el.textContent.trim().split(/\s+/),i=0;
  el.innerHTML=words.map(function(w){return '<span class="w"><span style="--i:'+(i++)+'">'+w.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</span></span>'}).join(' ');
});

/* ---------- reveal al scrollear ---------- */
var reveal=(function(){
  var els=$$('[data-r],[data-split]');
  if(RM||!('IntersectionObserver' in W)){els.forEach(function(e){e.classList.add('in')});return{kick:function(){}}}
  var io=new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:.08});
  return{kick:function(){els.forEach(function(e){io.observe(e)})}};
})();

/* ---------- contadores ---------- */
(function(){
  var els=$$('[data-count]');
  function run(el){
    var to=+el.getAttribute('data-count'),suf=el.getAttribute('data-suf')||'',t0=null,dur=1600;
    if(RM){el.textContent=to+suf;return}
    function f(t){if(!t0)t0=t;var p=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-p,4);el.textContent=Math.round(to*e)+suf;if(p<1)requestAnimationFrame(f)}
    requestAnimationFrame(f);
  }
  if(!('IntersectionObserver' in W)){els.forEach(run);return}
  var io=new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting){run(e.target);io.unobserve(e.target)}})},{threshold:.6});
  els.forEach(function(e){io.observe(e)});
})();

/* ---------- palabra rotativa con scramble ---------- */
var rot=(function(){
  var el=$('[data-rot-es]'),i=0,timer=null,chars='abcdefghijklmnopqrstuvwxyz#%&*/<>01';
  if(!el)return{reset:function(){}};
  function list(){return el.getAttribute(H.classList.contains('en')?'data-rot-en':'data-rot-es').split('|')}
  function scramble(to){
    if(RM){el.textContent=to;return}
    var from=el.textContent,len=Math.max(from.length,to.length),f=0,frames=26;
    (function step(){
      var out='';for(var k=0;k<len;k++){var p=f/frames,rev=k/len;out+=p>rev?(to[k]||''):(Math.random()<.5?chars[Math.random()*chars.length|0]:(from[k]||''))}
      el.textContent=out;if(++f<=frames)requestAnimationFrame(step);else el.textContent=to;
    })();
  }
  function tick(){var l=list();i=(i+1)%l.length;scramble(l[i])}
  function reset(){clearInterval(timer);i=0;el.textContent=list()[0];timer=setInterval(tick,2600)}
  reset();return{reset:reset};
})();

/* ---------- header, progreso, parallax, secciones ---------- */
var hdr=$('#hdr'),prog=$('#progress'),wa=$('#wa'),lastY=0,ticking=false;
var par=RM?[]:$$('[data-par]');
var tl=$('#tl'),steps=$('#steps'),sections=$$('main > section[id]');
function progressIn(el,a,b){var r=el.getBoundingClientRect(),vh=W.innerHeight;return Math.max(0,Math.min(1,(vh*a-r.top)/(r.height+vh*(a-b))))}
function onScroll(){
  var y=W.scrollY,vh=W.innerHeight,dh=D.documentElement.scrollHeight-vh;
  prog.style.transform='scaleX('+(dh>0?y/dh:0)+')';
  hdr.classList.toggle('scrolled',y>40);
  hdr.classList.toggle('hide',y>lastY&&y>vh*.8&&!D.body.classList.contains('menu-open'));
  wa.classList.toggle('on',y>vh*.9);
  lastY=y;
  for(var i=0;i<par.length;i++){
    var el=par[i],r=el.parentElement.getBoundingClientRect();
    if(r.bottom<-200||r.top>vh+200)continue;
    var k=+el.getAttribute('data-par'),c=(r.top+r.height/2-vh/2);
    el.style.transform='translate3d(0,'+(c*k).toFixed(1)+'px,0)';
  }
  if(tl){var p=progressIn(tl,.8,.4);tl.style.setProperty('--p',p.toFixed(3));$$('.tl-it',tl).forEach(function(it,j,a){it.classList.toggle('on',p>=j/(a.length-1)-.01)})}
  if(steps){var q=progressIn(steps,.85,.45);steps.style.setProperty('--p',q.toFixed(3));$$('.step',steps).forEach(function(s,j,a){s.classList.toggle('on',q>=j/(a.length-1)-.01)})}
  // sección activa
  var act=null;for(var s=0;s<sections.length;s++){var rr=sections[s].getBoundingClientRect();if(rr.top<=vh*.45&&rr.bottom>vh*.45){act=sections[s];break}}
  if(act){
    $$('#dotnav a').forEach(function(a){a.classList.toggle('on',a.getAttribute('href')==='#'+act.id)});
    $$('.menu a').forEach(function(a){a.classList.toggle('on',a.getAttribute('href')==='#'+act.id)});
    var light=act.classList.contains('light')||act.classList.contains('soft');
    $('#dotnav').classList.toggle('on-light',light);
  }
  ticking=false;
}
W.addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(onScroll)}},{passive:true});
W.addEventListener('resize',function(){requestAnimationFrame(onScroll)});

/* ---------- dotnav ---------- */
function buildDots(){
  var n=$('#dotnav'),en=H.classList.contains('en');n.innerHTML='';
  sections.forEach(function(s){var a=D.createElement('a');a.href='#'+s.id;a.innerHTML='<span>'+(s.getAttribute(en?'data-label-en':'data-label-es')||s.id)+'</span>';a.setAttribute('aria-label',s.getAttribute(en?'data-label-en':'data-label-es')||s.id);n.appendChild(a)});
  onScroll();
}
buildDots();

/* ---------- menú móvil ---------- */
$('.burger').addEventListener('click',function(){D.body.classList.toggle('menu-open')});
$$('#mnav a').forEach(function(a){a.addEventListener('click',function(){D.body.classList.remove('menu-open')})});

/* ---------- spotlight, tilt y botones magnéticos (solo mouse) ---------- */
if(FINE&&!RM){
  $$('.spot').forEach(function(el){el.addEventListener('pointermove',function(e){var r=el.getBoundingClientRect();el.style.setProperty('--mx',(e.clientX-r.left)+'px');el.style.setProperty('--my',(e.clientY-r.top)+'px')})});
  $$('[data-tilt]').forEach(function(el){
    el.addEventListener('pointermove',function(e){var r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.transform='perspective(900px) rotateX('+(-y*7).toFixed(2)+'deg) rotateY('+(x*9).toFixed(2)+'deg) translateZ(0)'});
    el.addEventListener('pointerleave',function(){el.style.transform=''});
  });
  $$('.mag').forEach(function(el){
    el.addEventListener('pointermove',function(e){var r=el.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;el.style.transform='translate('+(x*.18).toFixed(1)+'px,'+(y*.3).toFixed(1)+'px)'});
    el.addEventListener('pointerleave',function(){el.style.transform=''});
  });
}

/* ---------- ecosistema: resaltado cruzado + órbita ---------- */
(function(){
  var orbit=$('#orbit');if(!orbit)return;
  $$('.link',orbit).forEach(function(p){var l=p.getTotalLength?p.getTotalLength():300;p.style.setProperty('--len',l)});
  if('IntersectionObserver' in W){var io=new IntersectionObserver(function(e){if(e[0].isIntersecting){orbit.classList.add('in');io.disconnect()}},{threshold:.3});io.observe(orbit)}else orbit.classList.add('in');
  $$('[data-k]').forEach(function(el){
    var k=el.getAttribute('data-k');
    el.addEventListener('mouseenter',function(){$$('[data-k="'+k+'"]').forEach(function(x){x.classList.add('hl')})});
    el.addEventListener('mouseleave',function(){$$('[data-k="'+k+'"]').forEach(function(x){x.classList.remove('hl')})});
  });
  var g=$('#orb-rot');if(!g||RM)return;var a=0,vis=false;
  new IntersectionObserver(function(e){vis=e[0].isIntersecting}).observe(orbit);
  (function spin(){if(vis){a=(a+.12)%360;g.setAttribute('transform','rotate('+a.toFixed(2)+' 300 300)')}requestAnimationFrame(spin)})();
})();

/* ---------- hero: malla de ondas (como las texturas de la marca) ---------- */
(function(){
  var c=$('#wave');if(!c)return;var x=c.getContext('2d'),w,h,dpr,t=0,mx=0,my=0,tmx=0,tmy=0,vis=true;
  var LINES=W.innerWidth<640?34:58,PTS=W.innerWidth<640?70:120;
  function size(){dpr=Math.min(W.devicePixelRatio||1,2);w=c.clientWidth;h=c.clientHeight;c.width=w*dpr;c.height=h*dpr;x.setTransform(dpr,0,0,dpr,0,0)}
  size();W.addEventListener('resize',size);
  W.addEventListener('pointermove',function(e){tmx=e.clientX/w-.5;tmy=e.clientY/h-.5},{passive:true});
  new IntersectionObserver(function(e){vis=e[0].isIntersecting}).observe(c);
  var cols=[[126,167,140],[44,131,167],[94,113,186],[160,120,230]];
  function col(f){var i=Math.min(cols.length-2,Math.floor(f*(cols.length-1))),k=f*(cols.length-1)-i,a=cols[i],b=cols[i+1];return [a[0]+(b[0]-a[0])*k|0,a[1]+(b[1]-a[1])*k|0,a[2]+(b[2]-a[2])*k|0]}
  function frame(){
    if(vis){
      mx+=(tmx-mx)*.04;my+=(tmy-my)*.04;
      x.clearRect(0,0,w,h);
      var cx=w*(w<900?.5:.62),cy=h*.52,R=Math.min(w,h)*(w<900?.42:.5);
      x.globalCompositeOperation='lighter';
      for(var l=0;l<LINES;l++){
        var f=l/(LINES-1),cc=col(f),v=f*Math.PI*2;
        x.beginPath();
        for(var p=0;p<=PTS;p++){
          var u=p/PTS*Math.PI*2;
          // superficie tipo cinta torsionada
          var tw=Math.sin(u*2+t*.6+v*.5)*.35+mx*.6;
          var rr=R*(0.62+0.22*Math.sin(u*3+t*.4+v)+0.12*Math.cos(v*2+t*.3));
          var X=Math.cos(u)*rr, Y=Math.sin(u)*rr*.55, Z=Math.sin(u*2+v+t*.5)*R*.35*tw;
          var ry=.6+mx*.5+Math.sin(t*.15)*.2, rx=-.35+my*.4;
          var X2=X*Math.cos(ry)+Z*Math.sin(ry), Z2=-X*Math.sin(ry)+Z*Math.cos(ry);
          var Y2=Y*Math.cos(rx)-Z2*Math.sin(rx), Z3=Y*Math.sin(rx)+Z2*Math.cos(rx);
          var s=900/(900+Z3);
          var px=cx+X2*s, py=cy+Y2*s+Math.sin(v+t)*6;
          if(p===0)x.moveTo(px,py);else x.lineTo(px,py);
        }
        x.strokeStyle='rgba('+cc[0]+','+cc[1]+','+cc[2]+','+(0.10+0.16*Math.sin(f*Math.PI))+')';
        x.lineWidth=1;x.stroke();
      }
      x.globalCompositeOperation='source-over';
      t+=RM?0:.012;
    }
    if(!RM)requestAnimationFrame(frame);
  }
  frame();
})();

/* ---------- Data Hub: campo de puntos (red de cómputo) ---------- */
(function(){
  var c=$('#dots');if(!c||RM)return;var x=c.getContext('2d'),w,h,dpr,pts=[],vis=false,mx=-999,my=-999;
  function size(){dpr=Math.min(W.devicePixelRatio||1,2);w=c.clientWidth;h=c.clientHeight;c.width=w*dpr;c.height=h*dpr;x.setTransform(dpr,0,0,dpr,0,0);
    var n=Math.round(w*h/14000);pts=[];for(var i=0;i<n;i++)pts.push({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.25,vy:(Math.random()-.5)*.25})}
  size();W.addEventListener('resize',size);
  c.parentElement.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect();mx=e.clientX-r.left;my=e.clientY-r.top});
  new IntersectionObserver(function(e){vis=e[0].isIntersecting}).observe(c);
  (function f(){
    if(vis){x.clearRect(0,0,w,h);
      for(var i=0;i<pts.length;i++){var p=pts[i];p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>w)p.vx*=-1;if(p.y<0||p.y>h)p.vy*=-1;
        var dm=Math.hypot(p.x-mx,p.y-my);x.fillStyle=dm<160?'rgba(126,167,140,.9)':'rgba(140,155,220,.45)';x.fillRect(p.x,p.y,1.6,1.6);
        for(var j=i+1;j<pts.length;j++){var q=pts[j],d=Math.hypot(p.x-q.x,p.y-q.y);if(d<110){x.strokeStyle='rgba(94,113,186,'+(.16*(1-d/110))+')';x.beginPath();x.moveTo(p.x,p.y);x.lineTo(q.x,q.y);x.stroke()}}}
    }
    requestAnimationFrame(f);
  })();
})();

/* ---------- videos que se cargan y reproducen al entrar en pantalla ---------- */
(function(){
  $$('video[data-src]').forEach(function(v){
    var loaded=false;
    function load(){if(!loaded){v.src=v.getAttribute('data-src');loaded=true}}
    if(!('IntersectionObserver' in W)){load();return}
    new IntersectionObserver(function(e){
      if(e[0].isIntersecting){load();if(!RM||v.id==='reel'){var p=v.play();if(p&&p.catch)p.catch(function(){})}}
      else if(loaded)v.pause();
    },{rootMargin:'200px 0px',threshold:.15}).observe(v);
  });
  var r=$('#reel'),b=$('.phone .snd');
  if(r&&b)b.addEventListener('click',function(){r.muted=!r.muted;if(!r.muted){r.currentTime=0;r.play()}b.innerHTML=r.muted?ICO_MUTE:ICO_SOUND});
})();

/* ---------- galerías ---------- */
$$('[data-gal]').forEach(function(g){
  var tr=$('.gtrack',g),sl=$$('.gslide',g),dots=$('.gdots',g),cnt=$('.gcount',g),i=0,n=sl.length,timer;
  sl.forEach(function(_,k){var b=D.createElement('button');b.type='button';b.setAttribute('aria-label',(k+1)+'/'+n);b.addEventListener('click',function(){go(k)});dots.appendChild(b)});
  function go(k){i=(k+n)%n;tr.style.transform='translate3d('+(-i*100)+'%,0,0)';$$('button',dots).forEach(function(b,j){b.classList.toggle('on',j===i)});cnt.textContent=String(i+1).padStart(2,'0')+' / '+String(n).padStart(2,'0');restart()}
  function restart(){clearInterval(timer);if(!RM)timer=setInterval(function(){go(i+1)},5200)}
  $('.gprev',g).addEventListener('click',function(){go(i-1)});
  $('.gnext',g).addEventListener('click',function(){go(i+1)});
  var sx=null;g.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});
  g.addEventListener('touchend',function(e){if(sx===null)return;var dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>40)go(i+(dx<0?1:-1));sx=null});
  sl.forEach(function(s){s.addEventListener('click',function(){lb($('img',s).src)})});
  go(0);
});

/* ---------- lightbox ---------- */
var LB=$('#lb');
function lb(src){$('img',LB).src=src;LB.classList.add('on')}
LB.addEventListener('click',function(){LB.classList.remove('on')});
D.addEventListener('keydown',function(e){if(e.key==='Escape'){LB.classList.remove('on');D.body.classList.remove('menu-open')}});
$$('[data-lb]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();lb(a.getAttribute('href'))})});

/* ---------- año ---------- */
var yr=$('#yr');if(yr)yr.textContent=new Date().getFullYear();
onScroll();
})();

/* PUZZLE AI · acceso privado
   Mismo esquema y mismas credenciales que el gate de ZLT-WEB-V2 (zltdev/presentacion):
   ni los mails ni la clave viajan en claro: sha256(SALT + mail + ":" + clave).
   Es un login del lado del navegador: frena a quien entra por la URL, no a quien lea el código.
   Para sumar o quitar usuarios, copiar SALT y USERS del gate.js de ZLT (deben coincidir). */
(function(){
  var SALT="zlt-gate-v1-2026";
  var USERS=[
    "df08d8ce0b3e5cc4a02a8a75d5f8459512e02183001d65dd7d64864f66e4bdbb",
    "ebcba71f4ffdd4b8a250dd8fc2ee6e550910a1bea2359fdcdbe0593ce6eb4245",
    "04337204d3c2067b342c52edf3f9c5aba1618d2e2c2e815964552599eaceddf5",
    "fc5dde996f7c480eb025478f7e0a9b8988b16bbf3f6f8837e7da0f586bb3354c",
    "7655a20b7bffe0750c2207be8cad0fb872102078c86ef605d04948e98492c85d",
    "00dfd62886f061cf6fd17606a3ac26f2bbf7fbcd605af4915da99fe7f94e0efd",
    "2de7532ce50b12d616d2ab74dea6e64ac20ac214c050b898b8521a7d6dd09eae"
  ];
  var KEY="pz_gate_ok",H=document.documentElement,g=document.getElementById('gate');
  if(!g)return;
  if(!H.classList.contains('locked')){g.parentNode.removeChild(g);return}
  var en=function(){return H.classList.contains('en')};
  var f=g.querySelector('form'),u=g.querySelector('#gu'),pw=g.querySelector('#gp'),eye=g.querySelector('.g-eye'),err=g.querySelector('.g-err'),btn=g.querySelector('button[type=submit]');
  async function sha256(t){var b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));return Array.from(new Uint8Array(b)).map(function(x){return x.toString(16).padStart(2,'0')}).join('')}
  eye.addEventListener('click',function(){var s=pw.type==='password';pw.type=s?'text':'password';eye.classList.toggle('on',s);eye.setAttribute('aria-label',s?'Ocultar contraseña':'Mostrar contraseña');pw.focus()});
  f.addEventListener('submit',async function(e){
    e.preventDefault();err.textContent='';g.classList.remove('shake');
    var mail=u.value.trim().toLowerCase();
    if(!mail||!pw.value){err.textContent=en()?'Please fill in both fields.':'Completá los dos campos.';return}
    btn.disabled=true;btn.classList.add('busy');
    var h;try{h=await sha256(SALT+mail+':'+pw.value)}catch(x){h=''}
    btn.disabled=false;btn.classList.remove('busy');
    if(USERS.indexOf(h)===-1){
      err.textContent=en()?'Incorrect email or password.':'Email o contraseña incorrectos.';
      void g.offsetWidth;g.classList.add('shake');pw.value='';pw.focus();return;
    }
    try{sessionStorage.setItem(KEY,'1')}catch(x){}
    g.classList.add('ok');
    setTimeout(function(){
      H.classList.remove('locked');g.classList.add('out');
      window.dispatchEvent(new Event('pz:unlock'));
      setTimeout(function(){if(g.parentNode)g.parentNode.removeChild(g)},1300);
    },550);
  });
  window.addEventListener('pz:loaded',function(){setTimeout(function(){u.focus({preventScroll:true})},500)});
})();

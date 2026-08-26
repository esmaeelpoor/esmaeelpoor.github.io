(function(){
const mount=document.getElementById('site-header');if(!mount)return;
fetch('/header.html',{cache:'no-cache'}).then(function(r){if(!r.ok)throw new Error('Header load failed: '+r.status);return r.text();}).then(function(markup){
mount.innerHTML=markup;

/* Keep the shared header permanently visible at the top of the viewport.
   The mount keeps the same height so page content does not jump underneath it. */
const sharedHeader=mount.querySelector('.shared-site-header');
function syncFixedHeader(){
  if(!sharedHeader)return;
  sharedHeader.style.position='fixed';
  sharedHeader.style.top='0';
  sharedHeader.style.right='0';
  sharedHeader.style.left='0';
  sharedHeader.style.width='100%';
  sharedHeader.style.zIndex='1000';
  mount.style.height=sharedHeader.offsetHeight+'px';
}
syncFixedHeader();
window.addEventListener('resize',syncFixedHeader);

const nav=mount.querySelector('.shared-header__nav');const toggle=mount.querySelector('.shared-header__toggle');
function closeMenu(){if(!nav||!toggle)return;nav.classList.remove('is-open');toggle.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');}
if(nav&&toggle){toggle.addEventListener('click',function(){const open=nav.classList.toggle('is-open');toggle.classList.toggle('is-open',open);toggle.setAttribute('aria-expanded',open?'true':'false');});nav.querySelectorAll('a').forEach(function(a){a.addEventListener('click',closeMenu);});document.addEventListener('keydown',function(e){if(e.key==='Escape')closeMenu();});}
const path=(window.location.pathname||'/').replace(/\/index\.html$/,'/');const hash=window.location.hash||'';let active='home';
if(path.indexOf('/experience/')===0)active='experience';else if(path.indexOf('/publishing/')===0)active='publishing';else if(path==='/'||path===''){if(hash==='#about')active='about';else if(hash==='#brand-dna')active='dna';else if(hash==='#timeline-ai')active='timeline';else if(hash==='#portfolio')active='portfolio';else if(hash==='#contact')active='contact';}
const item=mount.querySelector('[data-nav="'+active+'"]');if(item)item.classList.add('is-active');
window.addEventListener('hashchange',function(){if(path!=='/'&&path!=='')return;mount.querySelectorAll('[data-nav]').forEach(function(i){i.classList.remove('is-active');});const map={'#about':'about','#brand-dna':'dna','#timeline-ai':'timeline','#portfolio':'portfolio','#contact':'contact'};const key=map[window.location.hash]||'home';const i=mount.querySelector('[data-nav="'+key+'"]');if(i)i.classList.add('is-active');});
}).catch(function(err){console.error(err);});
})();
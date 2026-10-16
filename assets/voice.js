(function(){
var cur=document.currentScript,base=cur.src.replace(/voice\.js.*$/,'')+'voice/',audio=null,SS=window.sessionStorage;
function g(k){try{return SS.getItem(k)}catch(e){return null}}function s(k,v){try{SS.setItem(k,v)}catch(e){}}
var ICON='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9H3z"/><path d="M16 8a5 5 0 0 1 0 8M18.5 5.5a9 9 0 0 1 0 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
function reset(){document.querySelectorAll('.say-btn').forEach(function(b){b.setAttribute('aria-pressed','false');b.lastChild.textContent=b.dataset.label})}
function stop(user){if(audio){audio.pause();audio=null}reset();if(user)s('wtm-voice-off','1')}
function play(k,btn,auto){stop();var a=audio=new Audio(base+k+'.mp3');a.onended=function(){stop()};a.onerror=function(){stop()};
 return a.play().then(function(){document.querySelectorAll('.say-btn').forEach(function(b){b.setAttribute('aria-pressed','true');b.lastChild.textContent='Stop'});s('wtm-voice-off','');return true})
 .catch(function(){audio=null;return false})}
function make(k,fab){var b=document.createElement('button');b.type='button';b.className='say-btn'+(fab?' say-fab':'');b.dataset.say=k;b.dataset.label=fab?'Listen':'Hear this page';
 b.setAttribute('aria-pressed','false');b.innerHTML=ICON+'<span>'+b.dataset.label+'</span>';
 b.addEventListener('click',function(){if(b.getAttribute('aria-pressed')==='true'){stop(true)}else{play(k,b)}});return b}
document.addEventListener('DOMContentLoaded',function(){
 document.querySelectorAll('.say-slot').forEach(function(x){x.replaceWith(make(x.dataset.say,false))});
 var m=document.querySelector('meta[name=wtm-voice]');if(!m)return;var k=m.content;
 if(!document.querySelector('.hero-art .say-btn'))document.body.appendChild(make(k,true));
 window.addEventListener('pagehide',function(){stop()});
 if(g('wtm-voice-off')==='1'||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 play(k).then(function(ok){if(ok)return;
  var t=document.createElement('div');t.className='say-toast';t.textContent='Tap anywhere to hear the welcome';document.body.appendChild(t);
  var go=function(){document.removeEventListener('pointerdown',go);document.removeEventListener('keydown',go);document.removeEventListener('touchend',go);t.remove();if(g('wtm-voice-off')!=='1')play(k)};
  document.addEventListener('pointerdown',go,{once:true});document.addEventListener('keydown',go,{once:true});document.addEventListener('touchend',go,{once:true});
  setTimeout(function(){t.remove()},9000)})});
})();
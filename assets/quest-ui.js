/* Math Mountain UI: map, camps, hearts, stars, climb. Needs quest.js and a course file. */
(function(g){var Q=g.Q,$=function(s,r){return (r||document).querySelector(s)};
var CUT=[0,6,14,24,33],TH;
function rank(t){var r=TH.ranks[0];CUT.forEach(function(c,i){if(t>=c)r=TH.ranks[i]});return r}
function stars(n){return '★'.repeat(n)+'☆'.repeat(3-n)}
Q.mount=function(root,slug){var def=Q.C[slug];TH=Q.theme?Q.theme(slug):null;var UN=TH.unit,UP=TH.pl,plan=Q.plan(def),key='wtm_q_'+slug,S;
 try{S=JSON.parse(localStorage.getItem(key))||{}}catch(e){S={}}S.s=S.s||[];
 var save=function(){try{localStorage.setItem(key,JSON.stringify(S))}catch(e){}};
 var total=function(){return S.s.reduce(function(a,b){return a+(b||0)},0)};
 var open=function(i){return i===1||(S.s[i-2]||0)>=1};
 var run=null;
 root.innerHTML='<div class="qm"><div class="qm-top"><span><small>Course</small><b>'+def.short+'</b></span><span><small>Stars</small><b id="qmS">0/'+plan.length*3+'</b></span><span><small>Rank</small><b id="qmR"></b></span></div><div id="qmV"></div></div>';
 var V=$('#qmV',root);
 function top(){$('#qmS',root).textContent=total()+'/'+plan.length*3;$('#qmR',root).textContent=rank(total())}
 function mountain(){
  var pts=Q.routePts(TH,plan.length),nodes=plan.map(function(c,k){return[pts[k][0],pts[k][1],c]});
  var svg='<svg class="qm-map" viewBox="0 0 600 380" role="img" aria-label="'+TH.world+' map with '+plan.length+' '+UP.toLowerCase()+'">'+Q.sceneInner(slug);
  nodes.forEach(function(nd){var c=nd[2],on=open(c.i),st=S.s[c.i-1]||0,fill=!on?'#9aa6b8':st?'#1fa463':'#FDBB0B';
   svg+='<g class="qm-n'+(on?'':' lk')+'" data-i="'+c.i+'" tabindex="'+(on?0:-1)+'" role="button" aria-label="'+UN+' '+c.i+(on?'':' locked')+'"><circle cx="'+nd[0]+'" cy="'+nd[1]+'" r="'+(c.summit?15:12)+'" fill="'+fill+'" stroke="#0C1A33" stroke-width="2.5"/><text x="'+nd[0]+'" y="'+(nd[1]+4)+'" text-anchor="middle" font-size="'+(c.summit?13:12)+'" font-weight="800" fill="'+(on?'#0C1A33':'#fff')+'" font-family="Nunito,sans-serif">'+(c.summit?'⚑':c.i)+'</text>'+(st?'<text x="'+nd[0]+'" y="'+(nd[1]-16)+'" text-anchor="middle" font-size="10" fill="#FDBB0B" stroke="#0C1A33" stroke-width=".6" paint-order="stroke">'+stars(st)+'</text>':'')+'</g>'});
  return svg+'</svg>'}
 function home(){run=null;top();var next=1;while(next<plan.length&&(S.s[next-1]||0)>=1)next++;
  var h='<div class="qm-home"><h2>'+TH.world+'</h2><p>'+(TH.blurb||def.intro)+'</p><p class="qm-rk">'+rank(total())+' · '+total()+' of '+plan.length*3+' stars</p>'+mountain()+'<div class="qm-list">';
  plan.forEach(function(c){var on=open(c.i),st=S.s[c.i-1]||0;h+='<button type="button" class="qm-c'+(c.summit?' sm':'')+(on?'':' lk')+(c.i===next&&!st?' cur':'')+'" data-i="'+c.i+'"'+(on?'':' disabled')+'><b>'+(on?(c.summit?'⚑':c.i):'🔒')+'</b><span><strong>'+(c.summit?TH.top+': mixed challenge':c.name)+'</strong><small>'+c.blurb+'</small></span><em>'+(st?stars(st):on?'Open':'')+'</em></button>'});
  V.innerHTML=h+'</div><p class="qm-note">Each '+UN.toLowerCase()+' is a little harder. Three hearts each. Win one star to unlock the next.</p></div>';
  V.querySelectorAll('[data-i]').forEach(function(e){e.addEventListener('click',function(){var i=+e.getAttribute('data-i');if(open(i))camp(i)});e.addEventListener('keydown',function(ev){if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();e.dispatchEvent(new Event('click'))}})})}
 function camp(i){var c=plan[i-1];run={c:c,qs:Q.campQuestions(def,c),k:0,hearts:3,miss:0,hint:0,streak:0,best:0};ask()}
 function trailSvg(k,n){var W=320,H=78,pts=[],i,x,y,sk=TH.sky;for(i=0;i<n;i++){x=30+i*(W-90)/Math.max(1,n-1);y=64-i*(40/Math.max(1,n-1));pts.push([x,y])}
  var d='M12 70 '+pts.map(function(p){return 'L'+p[0].toFixed(1)+' '+p[1].toFixed(1)}).join(' ')+' L'+(W-34)+' 26';
  var dark=/^#0|^#1/.test(sk[0]);
  var o='<svg viewBox="0 0 '+W+' '+H+'" role="img"><defs><linearGradient id="qsk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+sk[0]+'"/><stop offset="1" stop-color="'+sk[1]+'"/></linearGradient></defs><rect width="'+W+'" height="'+H+'" rx="14" fill="url(#qsk)"/><path d="M0 78C60 40 110 66 170 46S270 36 320 56V78z" fill="'+TH.far+'" opacity=".55"/><path d="M0 78C80 62 140 74 210 62S290 58 320 70V78z" fill="'+TH.far+'" opacity=".8"/><path d="'+d+'" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="'+d+'" fill="none" stroke="#0C1A33" stroke-width="1.6" stroke-dasharray="1 6" stroke-linecap="round"/>';
  pts.forEach(function(p,j){var st=j<k?'#1fa463':j===k?'#FDBB0B':'#fff';o+='<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="'+(j===k?9:7)+'" fill="'+st+'" stroke="#0C1A33" stroke-width="2"/>'+(j<k?'<path d="M'+(p[0]-3.2).toFixed(1)+' '+p[1].toFixed(1)+'l2.4 2.6 4.2-5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>':'<text x="'+p[0].toFixed(1)+'" y="'+(p[1]+3.6).toFixed(1)+'" font-size="10" font-weight="800" text-anchor="middle" font-family="Fredoka,sans-serif" fill="#0C1A33">'+(j+1)+'</text>')});
  return o+'<path d="M'+(W-34)+' 26V8" stroke="#0C1A33" stroke-width="2"/><path d="M'+(W-34)+' 8l15 5-15 5z" fill="#E52421"/></svg>'}
 function ask(){var r=run,q=r.qs[r.k],c=r.c;r.locked=false;r.hinted=false;
  var pg='';for(var j=0;j<c.q;j++)pg+='<i class="'+(j<r.k?'d':j===r.k?'c':'')+'"></i>';
  var hearts='';for(var h=0;h<3;h++)hearts+=h<r.hearts?'♥':'♡';
  var pct=r.k/c.q*100;
  V.innerHTML='<div class="qm-play"><div class="qm-bar"><button type="button" class="qm-back" id="qmBack">← '+TH.map+'</button><span class="qm-camp">'+(c.summit?TH.top:UN+' '+c.i)+' · '+q.u+'</span><span class="qm-h" aria-label="'+r.hearts+' hearts">'+hearts+'</span></div>'+
  '<div class="qm-climb" aria-label="Question '+(r.k+1)+' of '+c.q+'">'+trailSvg(r.k,c.q)+'</div>'+(q.fig?'<div class="qm-fig">'+q.fig+'</div>':'')+'<div class="qm-q">'+q.q+'</div><div class="qm-opts">'+q.opts.map(function(o,j){return '<button type="button" class="qo" data-j="'+j+'"><kbd>'+(j+1)+'</kbd><span>'+o.l+'</span></button>'}).join('')+'</div>'+
  '<div class="qm-act"><button type="button" class="qm-hint" id="qmHint"'+(q.hint?'':' hidden')+'>Show a clue</button></div><p class="qm-msg" id="qmMsg" aria-live="polite"></p><div class="qm-why" id="qmWhy" hidden></div><div class="qm-act"><button type="button" class="qm-next" id="qmNext" hidden>Next</button></div></div>';
  $('#qmBack',V).onclick=function(){home()};
  $('#qmHint',V).onclick=function(){if(r.locked)return;r.hinted=true;$('#qmMsg',V).innerHTML='<b>Clue:</b> '+q.hint+' <small>(a clue caps this at 2 stars)</small>'};
  V.querySelectorAll('.qo').forEach(function(b){b.onclick=function(){choose(+b.getAttribute('data-j'))}});
  var m=V.querySelector('.qm-q');if(g.renderMathInElement){}}
 function choose(j){var r=run;if(r.locked)return;r.locked=true;var q=r.qs[r.k],ok=q.opts[j].ok,bs=V.querySelectorAll('.qo');
  bs.forEach(function(b,x){b.disabled=true;if(q.opts[x].ok)b.classList.add('ok')});if(!ok)bs[j].classList.add('no');
  var msg=$('#qmMsg',V);
  if(ok){r.streak++;if(r.hinted)r.hint=1;msg.textContent=r.streak>=3?'Correct! Grip streak of '+r.streak+'.':'Correct!'}else{r.streak=0;r.hearts--;r.miss++;msg.textContent='Not quite. Here is how it works:'}
  var w=$('#qmWhy',V);w.innerHTML=q.why||'';w.hidden=!q.why;
  var last=r.k+1>=r.c.q,dead=r.hearts<=0,nx=$('#qmNext',V);nx.textContent=dead?'See result':last?'Finish':'Next question';nx.hidden=false;nx.focus();
  nx.onclick=function(){if(dead)return end(false);if(last)return end(true);r.k++;ask()};
  var hh=V.querySelector('.qm-h');var hs='';for(var h=0;h<3;h++)hs+=h<r.hearts?'♥':'♡';hh.textContent=hs}
 function end(win){var r=run,c=r.c,st=win?Math.max(1,3-r.miss):0;if(win&&r.hint)st=Math.min(st,2);
  var prev=S.s[c.i-1]||0;if(st>prev){S.s[c.i-1]=st;save()}top();
  var nxt=win&&c.i<plan.length;
  V.innerHTML='<div class="qm-end"><h2>'+(win?(c.summit?TH.win:UN+' '+c.i+' done!'):TH.lose)+'</h2><p class="qm-st">'+(win?stars(st):'♡♡♡')+'</p><p>'+(win?(r.miss?r.miss+' slip'+(r.miss>1?'s':'')+' on the way. Every explanation you read makes the next one easier.':'A perfect run with no slips.'):'Out of hearts. Read the explanations and try again. The questions change every time.')+'</p><p><strong>'+rank(total())+'</strong> · '+total()+' of '+plan.length*3+' stars</p><p>'+(nxt?'<button type="button" class="qm-next" id="qmGo">Camp '+(c.i+1)+' →</button> ':'')+'<button type="button" class="qm-next alt" id="qmAgain">'+(win?'Play it again':'Try again')+'</button> <button type="button" class="qm-next alt" id="qmMap">'+TH.map+'</button></p><div class="qm-cta"><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="#FDBB0B"/><circle cx="24" cy="19" r="7" fill="#0C1A33"/><path d="M10 40c2-9 8-13 14-13s12 4 14 13z" fill="#0C1A33"/><path d="M33 8l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1z" fill="#E52421"/></svg><div><b>Stuck on this course?</b><span>Get a live tutor for this course.</span></div><a class="qm-cta-b" href="/education/#book-demo">First class free</a></div></div>';
  var go=$('#qmGo',V);if(go){go.onclick=function(){camp(c.i+1)};go.focus()}$('#qmAgain',V).onclick=function(){camp(c.i)};$('#qmMap',V).onclick=home}
 document.addEventListener('keydown',function(e){if(!run||e.target&&/INPUT|TEXTAREA/.test(e.target.tagName))return;
  if(/^[1-4]$/.test(e.key)&&!run.locked){var b=V.querySelectorAll('.qo')[+e.key-1];if(b)b.click()}});
 home()};
})(window);

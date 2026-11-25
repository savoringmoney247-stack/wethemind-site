/* We The Mind games: friendly step-by-step coach. */
(function(){
var S=window.COACH||[],K=window.COACH_KEY||'wtm_coach',c=document.getElementById('coach');if(!c||!S.length)return;
var i=0,ct=document.getElementById('ct'),cd=document.getElementById('cd'),cn=document.getElementById('cn'),nx=document.getElementById('cx'),pv=document.getElementById('cp'),sk=document.getElementById('cc'),op=document.getElementById('coachOpen');
function seen(){try{return localStorage.getItem(K)==='1'}catch(e){return false}}
function mark(){try{localStorage.setItem(K,'1')}catch(e){}}
function show(){cn.textContent=(i+1)+'/'+S.length;ct.textContent='Step '+(i+1)+': '+S[i][0];cd.textContent=S[i][1];pv.disabled=i===0;nx.textContent=i===S.length-1?'Got it, let me play!':'Next'}
function open(){i=0;c.hidden=false;show();c.scrollIntoView({block:'nearest',behavior:'smooth'})}
function close(){c.hidden=true;mark()}
nx.onclick=function(){if(i<S.length-1){i++;show()}else close()};
pv.onclick=function(){if(i>0){i--;show()}};
sk.onclick=close;op.onclick=function(){c.hidden?open():close()};
if(!seen())open();
})();

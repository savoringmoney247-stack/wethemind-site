(function(){
var d=document;
function $(s,r){return (r||d).querySelector(s)}
function $$(s,r){return [].slice.call((r||d).querySelectorAll(s))}
/* exam filter chips */
var nav=$("#popular-maths-links");
if(nav){var g={"sat-math-tutor":"us","ap-calculus-tutor":"us","gcse-maths-tutor":"uk","a-level-maths-tutor":"uk","ib-maths-tutor":"intl","igcse-maths-tutor":"intl","cbse-maths-class-9-10":"india"};
$$(".exc",nav).forEach(function(a){var h=(a.getAttribute("href")||"").replace(/\/$/,"");a.dataset.g=g[h]||"all"});
var bar=$(".pr-chips",nav);
if(bar){bar.hidden=false;$$("button",bar).forEach(function(b){b.onclick=function(){$$("button",bar).forEach(function(x){x.classList.remove("on")});b.classList.add("on");var k=b.dataset.k;$$(".exc",nav).forEach(function(a){a.style.display=(k==="all"||a.dataset.g===k)?"":"none"})}})}}
/* class finder */
var qz=$("#pr-quiz");
if(qz){var ans={},qs=$$(".pr-q",qz),dots=$$(".pr-dots i",qz),res=$(".pr-res",qz),i=0;
var map={"SAT":["SAT","/education/sat-math-tutor/","SAT Math"],"ACT":["ACT","/education/","ACT Math"],"AP":["AP Courses","/education/ap-calculus-tutor/","AP Calculus"],"IGCSE":["IGCSE (Cambridge)","/education/igcse-maths-tutor/","IGCSE Maths"],"GCSE":["Other — I'll specify below","/education/gcse-maths-tutor/","GCSE Maths"],"ALEVEL":["A-Levels","/education/a-level-maths-tutor/","A-Level Maths"],"IB":["IB Diploma","/education/ib-maths-tutor/","IB Maths"],"CBSE":["CBSE","/education/cbse-maths-class-9-10/","CBSE Maths"],"OTHER":["","/education/","your subject"]};
function show(n){qs.forEach(function(q,k){q.classList.toggle("on",k===n)});dots.forEach(function(x,k){x.classList.toggle("on",k<=n)})}
$$(".pr-opts button",qz).forEach(function(b){b.onclick=function(){var q=b.closest(".pr-q");ans[q.dataset.n]=b.dataset.v;i++;if(i<qs.length){show(i)}else{finish()}}});
function finish(){qs.forEach(function(q){q.classList.remove("on")});var m=map[ans.exam]||map.OTHER;var u="/education/?exam="+encodeURIComponent(m[0])+"&grade="+encodeURIComponent(ans.grade)+"&goal="+encodeURIComponent(ans.goal)+"&topic="+encodeURIComponent(m[2])+"#book-demo";$("#pr-rt",qz).textContent="Try "+m[2]+" tutoring, "+ans.goal.toLowerCase();$("#pr-ra",qz).href=m[1];$("#pr-rb",qz).href=u;res.classList.add("on")}
$(".pr-redo",qz).onclick=function(){i=0;ans={};res.classList.remove("on");show(0)};show(0)}
/* prefill booking form from the class finder */
var f=$("#demo-form");
if(f&&location.search){try{var p=new URLSearchParams(location.search),e=p.get("exam"),gr=p.get("grade"),go=p.get("goal"),t=p.get("topic");
var c=$("#curriculum");if(c&&e){$$("option",c).forEach(function(o){if(o.value===e||o.textContent===e)c.value=o.value})}
var gi=$("#grade");if(gi&&gr&&!gi.value)gi.value=gr;
var n=$("#notes");if(n&&(t||go)&&!n.value)n.value=[t,go].filter(Boolean).join(" — ")}catch(x){}}
/* ask-a-question box */
var af=$("#ask-form");
if(af){var ok=$("#ask-ok");
function flush(){try{var a=JSON.parse(localStorage.getItem("wtm_pending")||"[]");if(!a.length)return;localStorage.setItem("wtm_pending","[]");a.forEach(function(it){var fd=new FormData();for(var k in it.p)fd.append(k,it.p[k]);fetch(it.e,{method:"POST",mode:"no-cors",keepalive:true,body:fd}).catch(function(){try{var b=JSON.parse(localStorage.getItem("wtm_pending")||"[]");b.push(it);localStorage.setItem("wtm_pending",JSON.stringify(b))}catch(x){}})})}catch(x){}}
addEventListener("online",flush);addEventListener("load",flush);
var st=$("input[name=form_started_at]",af);if(st)st.value=Date.now();
af.addEventListener("submit",function(ev){ev.preventDefault();var ep=af.getAttribute("data-endpoint"),fd=new FormData(af),q={};fd.forEach(function(v,k){q[k]=v});af.style.display="none";ok.style.display="block";fetch(ep,{method:"POST",mode:"no-cors",keepalive:true,body:fd}).catch(function(){try{var a=JSON.parse(localStorage.getItem("wtm_pending")||"[]");a.push({e:ep,p:q});localStorage.setItem("wtm_pending",JSON.stringify(a))}catch(x){}})})}
})();

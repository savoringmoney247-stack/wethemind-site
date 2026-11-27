(function(){var has=[].some.call(document.scripts,function(s){return !s.src&&s.textContent.indexOf("nav-dropdown-toggle")>-1});if(has)return;
function init(){[].forEach.call(document.querySelectorAll(".nav-dropdown"),function(dd){var b=dd.querySelector(".nav-dropdown-toggle");if(!b)return;b.addEventListener("click",function(e){e.stopPropagation();var o=dd.classList.toggle("open");b.setAttribute("aria-expanded",o)});});
document.addEventListener("click",function(e){[].forEach.call(document.querySelectorAll(".nav-dropdown.open"),function(d){if(!d.contains(e.target))d.classList.remove("open")})});
document.addEventListener("keydown",function(e){if(e.key=="Escape")[].forEach.call(document.querySelectorAll(".nav-dropdown.open"),function(d){d.classList.remove("open")})})}
if(document.readyState!="loading")init();else document.addEventListener("DOMContentLoaded",init)})();
(function(){
if(window.__wtmS)return;window.__wtmS=1;
var idx=null,box,inp,list,btn,sel=-1,res=[];
function css(){var s=document.createElement("style");s.textContent=
".ss-btn{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;border:2px solid #0C1A33;background:#fff;color:#0C1A33;cursor:pointer;padding:0;margin-right:8px;flex:none}.ss-btn:hover{background:#FFF7E0}@media(max-width:520px){.ss-btn{width:34px;height:34px;margin-right:2px}.nav-cta .nav-login{display:none}}.ss-btn.ss-fixed{position:fixed;top:12px;right:12px;z-index:9998}"+
".ss-ov{position:fixed;inset:0;background:rgba(12,26,51,.6);z-index:99999;display:none;align-items:flex-start;justify-content:center;padding:8vh 16px 16px}.ss-ov.on{display:flex}"+
".ss-box{background:#fff;border-radius:18px;width:100%;max-width:620px;box-shadow:0 20px 60px #0006;overflow:hidden;font-family:Nunito,sans-serif;color:#0C1A33}"+
".ss-in{display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid #eee3c8}.ss-in input{flex:1;border:0;outline:0;font:600 1.1rem Nunito,sans-serif;color:#0C1A33;min-width:0;background:transparent}.ss-in kbd{font:700 .7rem Nunito;border:1px solid #d9d2c3;border-radius:6px;padding:2px 6px;color:#6b6558}"+
".ss-list{max-height:55vh;overflow:auto;margin:0;padding:6px;list-style:none}.ss-list a{display:block;padding:10px 12px;border-radius:10px;text-decoration:none;color:#0C1A33}.ss-list a b{display:block;font:600 1rem Fredoka,sans-serif}.ss-list a span{display:block;font-size:.85rem;color:#6b6558;margin-top:2px}.ss-list a.on,.ss-list a:hover{background:#FFF7E0}.ss-list a i{font-style:normal;font-size:.72rem;color:#E52421;font-weight:700}"+
".ss-empty{padding:18px;color:#6b6558;text-align:center}.ss-hint{padding:10px 18px 14px;color:#6b6558;font-size:.85rem}.ss-hint a{color:#E52421;font-weight:700;margin-right:12px}";
document.head.appendChild(s)}
function load(cb){if(idx)return cb();fetch("/assets/search-index.json").then(function(r){return r.json()}).then(function(j){idx=j;cb()}).catch(function(){idx=[];cb()})}
function norm(s){return (s||"").toLowerCase().replace(/[^a-z0-9 ]+/g," ")}
function score(e,w){var t=norm(e.t),d=norm(e.d),k=norm(e.k),sc=0;for(var i=0;i<w.length;i++){var x=w[i],hit=0;if(t.indexOf(x)>-1){hit=t.indexOf(x)==0?6:4}else if(k.indexOf(x)>-1){hit=2}else if(d.indexOf(x)>-1){hit=1.5}if(!hit)return 0;sc+=hit}return sc}
function search(q){var w=norm(q).split(" ").filter(Boolean);if(!w.length)return[];var r=[];idx.forEach(function(e){var s=score(e,w);if(s)r.push([s,e])});r.sort(function(a,b){return b[0]-a[0]});return r.slice(0,8).map(function(x){return x[1]})}
function path(u){return u==="/"?"Home":u.replace(/^\/|\/$/g,"").split("/")[0]}
function draw(){var q=inp.value.trim();if(!q){list.innerHTML='<li class="ss-hint">Try: SAT, AP Calculus, prices, games, worksheets<br><br><a href="/education/pricing/">Prices</a><a href="/education/sat-practice/">Free SAT practice</a><a href="/games/">Games</a><a href="/courses/">Courses</a><a href="/portal/">Login</a></li>';res=[];return}
res=search(q);sel=res.length?0:-1;
if(!res.length){list.innerHTML='<li class="ss-empty">No match. Try another word, or <a href="/contact/" style="color:#E52421;font-weight:700">ask us</a>.</li>';return}
list.innerHTML=res.map(function(e,i){return '<li><a class="'+(i==0?"on":"")+'" href="'+e.u+'"><b>'+e.t.replace(/</g,"&lt;")+' <i>'+path(e.u)+'</i></b>'+(e.d?'<span>'+e.d.replace(/</g,"&lt;")+'</span>':'')+'</a></li>'}).join("")}
function mark(){var a=list.querySelectorAll("a");for(var i=0;i<a.length;i++)a[i].className=i==sel?"on":"";if(a[sel])a[sel].scrollIntoView({block:"nearest"})}
function open(){if(!box)build();box.classList.add("on");load(function(){draw();inp.focus()})}
function close(){box&&box.classList.remove("on")}
function build(){css();box=document.createElement("div");box.className="ss-ov";box.setAttribute("role","dialog");box.setAttribute("aria-label","Search We The Mind");
box.innerHTML='<div class="ss-box"><div class="ss-in"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0C1A33" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input type="search" placeholder="Search the whole site…" aria-label="Search" autocomplete="off"><kbd>Esc</kbd></div><ul class="ss-list"></ul></div>';
document.body.appendChild(box);inp=box.querySelector("input");list=box.querySelector("ul");
box.addEventListener("mousedown",function(e){if(e.target===box)close()});
inp.addEventListener("input",draw);
inp.addEventListener("keydown",function(e){if(e.key=="ArrowDown"&&res.length){e.preventDefault();sel=(sel+1)%res.length;mark()}else if(e.key=="ArrowUp"&&res.length){e.preventDefault();sel=(sel-1+res.length)%res.length;mark()}else if(e.key=="Enter"&&res[sel]){location.href=res[sel].u}});
}
function btnInit(){css();btn=document.createElement("button");btn.type="button";btn.className="ss-btn";btn.setAttribute("aria-label","Search the site");
btn.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>';
btn.onclick=open;var cta=document.querySelector(".nav-cta");if(cta)cta.insertBefore(btn,cta.firstChild);else{btn.className+=" ss-fixed";document.body.appendChild(btn)}}
document.addEventListener("keydown",function(e){if((e.key=="/"&&!/input|textarea|select/i.test((e.target.tagName||"")))||((e.ctrlKey||e.metaKey)&&e.key=="k")){e.preventDefault();open()}else if(e.key=="Escape")close()});
if(document.readyState!="loading")btnInit();else document.addEventListener("DOMContentLoaded",btnInit);
})();

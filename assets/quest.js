/* We The Mind: Math Mountain engine. Question generators live in q-*.js and register with Q.add(). */
(function(g){
var Q=g.Q=g.Q||{};Q.C={};
/* ---------- helpers ---------- */
var ri=Q.ri=function(a,b){return a+Math.floor(Math.random()*(b-a+1))};
var pick=Q.pick=function(a){return a[ri(0,a.length-1)]};
var shuf=Q.shuf=function(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=ri(0,i),t=a[i];a[i]=a[j];a[j]=t}return a};
Q.gcd=function gcd(a,b){a=Math.abs(a);b=Math.abs(b);return b?gcd(b,a%b):a};
var rd=Q.rd=function(v,d){d=d==null?3:d;var m=Math.pow(10,d);return Math.round(v*m)/m};
var n=Q.n=function(v){if(typeof v==='string')return v;v=rd(v);var s=String(v);if(s==='-0')s='0';return s.replace('-','−')};
Q.sgn=function(v,first){var a=Math.abs(v);return first?(v<0?'−':'')+n(a):(v<0?' − ':' + ')+n(a)};
Q.sup=function(e){return '<sup>'+e+'</sup>'};
Q.fr=function(a,b){var G=Q.gcd(a,b)||1;a/=G;b/=G;if(b<0){a=-a;b=-b}if(b===1)return n(a);return (a<0?'−':'')+'<span class="fr"><i>'+Math.abs(a)+'</i><i>'+b+'</i></span>'};
Q.ft=function(a,b){var G=Q.gcd(a,b)||1;a/=G;b/=G;if(b<0){a=-a;b=-b}return b===1?n(a):n(a)+'/'+b};
/* polynomial in x from descending coefficients; vars like 'x' */
Q.poly=function(c,v){v=v||'x';var out='',d=c.length-1;for(var i=0;i<c.length;i++){var k=c[i],e=d-i;if(!k)continue;var a=Math.abs(k),t;
 if(e===0)t=n(a);else{t=(a===1?'':n(a))+v+(e>1?'<sup>'+e+'</sup>':'')}
 out+=out===''?(k<0?'−':'')+t:(k<0?' − ':' + ')+t}return out||'0'};
Q.ev=function(c,x){var r=0;for(var i=0;i<c.length;i++)r=r*x+c[i];return r};
Q.dpoly=function(c){var d=c.length-1,o=[];for(var i=0;i<d;i++)o.push(c[i]*(d-i));return o.length?o:[0]};
Q.ipoly=function(c){var d=c.length,o=[];for(var i=0;i<c.length;i++)o.push(c[i]/(d-i));o.push(0);return o};
/* ---------- svg figures ---------- */
var NAVY='#0C1A33',RED='#E52421',BLUE='#2a6fd6',GRN='#1fa463',YEL='#FDBB0B';
Q.col={navy:NAVY,red:RED,blue:BLUE,green:GRN,yel:YEL};
Q.svg=function(w,h,inner,cls){return '<svg class="fig '+(cls||'')+'" viewBox="0 0 '+w+' '+h+'" role="img" aria-hidden="true">'+inner+'</svg>'};
Q.txt=function(x,y,t,o){o=o||{};return '<text x="'+rd(x,1)+'" y="'+rd(y,1)+'" font-size="'+(o.s||12)+'" fill="'+(o.c||NAVY)+'" text-anchor="'+(o.a||'middle')+'" font-weight="'+(o.w||600)+'" font-family="Nunito,system-ui,sans-serif"'+(o.h?' stroke="#fff" stroke-width="3" paint-order="stroke" stroke-linejoin="round"':'')+'>'+t+'</text>'};
Q.line=function(x1,y1,x2,y2,c,w,dash){return '<line x1="'+rd(x1,1)+'" y1="'+rd(y1,1)+'" x2="'+rd(x2,1)+'" y2="'+rd(y2,1)+'" stroke="'+(c||NAVY)+'" stroke-width="'+(w||2)+'"'+(dash?' stroke-dasharray="'+dash+'"':'')+' stroke-linecap="round"/>'};
Q.dot=function(x,y,c,r){return '<circle cx="'+rd(x,1)+'" cy="'+rd(y,1)+'" r="'+(r||3.5)+'" fill="'+(c||RED)+'"/>'};
Q.path=function(pts,o){o=o||{};return '<path d="M'+pts.map(function(p){return rd(p[0],1)+' '+rd(p[1],1)}).join('L')+(o.close?'Z':'')+'" fill="'+(o.fill||'none')+'" stroke="'+(o.stroke||NAVY)+'" stroke-width="'+(o.w==null?2:o.w)+'" stroke-linejoin="round"'+(o.dash?' stroke-dasharray="'+o.dash+'"':'')+(o.op?' fill-opacity="'+o.op+'"':'')+'/>'};
/* plot: o={xmin,xmax,ymin,ymax,w,h,fns:[{f,c,dash,w}],pts:[[x,y,'open'|'',label]],segs:[[x1,y1,x2,y2,c,dash]],shade:{f,g,a,b,c},txt:[[x,y,t]],xs:step,ys:step,noTicks} */
Q.plot=function(o){var W=o.w||320,H=o.h||220,m=28,x0=o.xmin,x1=o.xmax,y0=o.ymin,y1=o.ymax;
 var X=function(x){return m+(x-x0)/(x1-x0)*(W-2*m)},Y=function(y){return H-m-(y-y0)/(y1-y0)*(H-2*m)};
 var s='<rect x="0" y="0" width="'+W+'" height="'+H+'" fill="#fff"/>';
 var step=function(a,b){var r=(b-a)/6,p=Math.pow(10,Math.floor(Math.log(r)/Math.LN10)),f=r/p;return (f<1.5?1:f<3.5?2:f<7.5?5:10)*p};
 var xs=o.xs||step(x0,x1),ys=o.ys||step(y0,y1),k;
 for(k=Math.ceil(x0/xs)*xs;k<=x1+1e-9;k+=xs)s+=Q.line(X(k),m,X(k),H-m,'#e6dcc6',1);
 for(k=Math.ceil(y0/ys)*ys;k<=y1+1e-9;k+=ys)s+=Q.line(m,Y(k),W-m,Y(k),'#e6dcc6',1);
 var ax=Math.min(Math.max(0,x0),x1),ay=Math.min(Math.max(0,y0),y1);
 s+=Q.line(m,Y(ay),W-m,Y(ay),NAVY,1.6)+Q.line(X(ax),m,X(ax),H-m,NAVY,1.6);
 if(!o.noTicks){for(k=Math.ceil(x0/xs)*xs;k<=x1+1e-9;k+=xs){if(Math.abs(k)>1e-9)s+=Q.txt(X(k),Y(ay)+14,n(rd(k,2)),{s:11,c:'#4a5568',w:700,h:1})}
  for(k=Math.ceil(y0/ys)*ys;k<=y1+1e-9;k+=ys){if(Math.abs(k)>1e-9)s+=Q.txt(X(ax)-6,Y(k)+4,n(rd(k,2)),{s:11,c:'#4a5568',a:'end',w:700,h:1})}}
 var samp=function(f,a,b){var pts=[],N=240,prev=null,seg=[];for(var i=0;i<=N;i++){var x=a+(b-a)*i/N,y;try{y=f(x)}catch(e){y=NaN}
   var bad=!isFinite(y)||y>y1+(y1-y0)*0.6||y<y0-(y1-y0)*0.6;if(!bad&&prev!==null&&Math.abs(y-prev)>(y1-y0)*0.7)bad=true;
   if(bad){if(seg.length>1)pts.push(seg);seg=[];prev=isFinite(y)?y:null;if(isFinite(y)&&!(y>y1+(y1-y0)*0.6||y<y0-(y1-y0)*0.6)){seg=[[X(x),Y(y)]]}}else{seg.push([X(x),Y(y)]);prev=y}}
  if(seg.length>1)pts.push(seg);return pts};
 if(o.shade){var sh=o.shade,N=80,top=[],bot=[];for(var i=0;i<=N;i++){var x=sh.a+(sh.b-sh.a)*i/N;top.push([X(x),Y(sh.f(x))]);bot.push([X(x),Y(sh.g?sh.g(x):0)])}
  s+=Q.path(top.concat(bot.reverse()),{close:1,fill:sh.c||YEL,op:.45,stroke:'none',w:0})}
 (o.fns||[]).forEach(function(F){samp(F.f,F.a!=null?F.a:x0,F.b!=null?F.b:x1).forEach(function(seg){s+=Q.path(seg,{stroke:F.c||BLUE,w:F.w||2.4,dash:F.dash})})});
 (o.rects||[]).forEach(function(R){var hh=R[2];s+='<rect x="'+rd(X(R[0]),1)+'" y="'+rd(Math.min(Y(hh),Y(0)),1)+'" width="'+rd(X(R[1])-X(R[0]),1)+'" height="'+rd(Math.abs(Y(hh)-Y(0)),1)+'" fill="'+(R[3]||YEL)+'" fill-opacity=".5" stroke="'+NAVY+'" stroke-width="1.2"/>'});
 (o.segs||[]).forEach(function(S){s+=Q.line(X(S[0]),Y(S[1]),X(S[2]),Y(S[3]),S[4]||RED,S[6]||2,S[5])});
 (o.vl||[]).forEach(function(v){s+=Q.line(X(v[0]),m,X(v[0]),H-m,v[1]||RED,1.6,'5 4')});
 (o.pts||[]).forEach(function(P){var cx=X(P[0]),cy=Y(P[1]);s+='<circle cx="'+rd(cx,1)+'" cy="'+rd(cy,1)+'" r="4" fill="'+(P[2]==='open'?'#fff':RED)+'" stroke="'+RED+'" stroke-width="2"/>';if(P[3])s+=Q.txt(cx+8,cy-7,P[3],{a:'start',s:11})});
 (o.txt||[]).forEach(function(T){s+=Q.txt(X(T[0]),Y(T[1]),T[2],{s:T[3]||12,c:T[4]||NAVY})});
 s+='<rect x="'+m+'" y="'+m+'" width="'+(W-2*m)+'" height="'+(H-2*m)+'" fill="none" stroke="#cfc6b0" stroke-width="1"/>';
 return Q.svg(W,H,s,'plot')};
/* wrong numeric answers: candidates first, then nudges around the answer */
Q.wn=function(ans,c,fmt){fmt=fmt||n;var seen={},o=[],key=function(v){return String(rd(v,4))};seen[key(ans)]=1;
 (c||[]).forEach(function(v){if(isFinite(v)&&!seen[key(v)]){seen[key(v)]=1;o.push(fmt(v))}});
 var base=Math.max(1,Math.abs(rd(ans,0))>9?Math.round(Math.abs(ans)/8):1),k=1;
 while(o.length<5&&k<40){[ans+k*base,ans-k*base,ans*2,ans/2,-ans].forEach(function(v){if(o.length<7&&isFinite(v)&&!seen[key(v)]){seen[key(v)]=1;o.push(fmt(v))}});k++}
 return o};
Q.tidy=function(s){return s.replace(/ \+ (-|\u2212)/g,' \u2212 ').replace(/\(x \+ 0\)/g,'x').replace(/ [+\u2212] 0x(?![\w\u00b2])/g,'').replace(/(^|[^\d.\w\/])1([a-z])(?![a-z])/g,'$1$2')};
/* ---------- registry ---------- */
Q.U={};Q.add=function(slug,def){Q.C[slug]=def;def.units.forEach(function(u){Q.U[slug+'.'+u.id]=u})};
/* build one question from a unit: validates and shuffles options */
Q.make=function(unit,t,tries){tries=tries||0;var r,i;
 try{r=unit.gen(Math.max(1,Math.min(10,t)),Q)}catch(e){r=null;if(Q.DEBUG)throw e}
 var ok=r&&r.q&&r.a!=null&&r.w&&r.w.length;
 if(ok){var seen={},ws=[];seen[String(r.a)]=1;r.w.forEach(function(w){w=String(w);if(!seen[w]&&w!==''&&!/NaN|undefined|Infinity/.test(w)){seen[w]=1;ws.push(w)}});
  if(ws.length>=3&&!/NaN|undefined|Infinity/.test(String(r.a)+r.q+(r.why||''))){ws=shuf(ws).slice(0,3);var opts=shuf([{l:String(r.a),ok:1}].concat(ws.map(function(w){return{l:w,ok:0}})));
   var fx=function(x){return Q.tidy(String(x==null?'':x).replace(/(^|[\s(,=\u27e8\u00b1])-(?=\d)/g,'$1\u2212'))};opts.forEach(function(o){o.l=fx(o.l)});
   return{q:fx(r.q).replace(/^Factor:/,'Factor completely:'),fig:r.fig||'',opts:opts,why:fx(r.why),hint:fx(r.hint),u:unit.name}}}
 if(tries>30){if(Q.DEBUG)throw new Error('bad question in '+unit.id);return null}
 return Q.make(unit,t,tries+1)};
/* ---------- camp plan ---------- */
var CAMPS=12,PER=5,BOSS=8;
Q.plan=function(def){var U=def.units.length,out=[];
 for(var i=1;i<=CAMPS;i++){var summit=i===CAMPS,ui=summit?-1:Math.min(U-1,Math.floor((i-1)*U/(CAMPS-1))),
   same=0;if(!summit)for(var j=1;j<i;j++)if(Math.min(U-1,Math.floor((j-1)*U/(CAMPS-1)))===ui)same++;
  out.push({i:i,summit:summit,u:ui,name:summit?'Summit: mixed challenge':def.units[ui].name+(same?' '+['','II','III','IV'][same]:''),
   blurb:summit?'Questions from every unit at the hardest level.':def.units[ui].blurb,tier:1+(i-1)*9/(CAMPS-1),q:summit?BOSS:PER})}
 return out};
Q.campQuestions=function(def,camp){var qs=[],used={},k=0;
 for(var j=0;j<camp.q&&k<80;){k++;var unit=camp.summit?def.units[ri(0,def.units.length-1)]:def.units[camp.u],
   t=camp.summit?ri(8,10):Math.round(camp.tier+(j-(camp.q-1)/2)*0.45),m=Q.make(unit,t);
  var key=k<45?m.q:m.q+m.opts.map(function(o){return o.l}).join();if(!m||used[key])continue;used[key]=1;qs.push(m);j++}
 return qs};
})(typeof window!=='undefined'?window:global);

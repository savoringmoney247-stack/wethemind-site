/* AP Calculus AB and BC question sets. Short text, a picture where it helps. */
(function(g){var Q=g.Q,ri=Q.ri,pick=Q.pick,n=Q.n,P=Q.poly,ft=Q.ft,wn=Q.wn,pl=Q.plot;
function U(id,name,blurb,gen){return{id:id,name:name,blurb:blurb,gen:gen}}
var field=Q.field,polar=Q.polar,PI='π',TH='θ';
function ex(k){return 'e<sup>'+(k===1?'':k===-1?'−':n(k))+'x</sup>'}
/* ---------- shared AB units ---------- */
var limits=U('lim','Limits and continuity','Read limits from graphs, factor, and check continuity.',function(t){
 if(t<=2){var a=ri(1,4),c=pick([-1,0,3,5]),y=2*a;
  return{q:'What is the limit of f(x) as x → '+a+'?',fig:pl({xmin:-1,xmax:7,ymin:-1,ymax:9,fns:[{f:function(x){return x+a}}],pts:[[a,y,'open'],[a,c,'']],txt:[]}),a:n(y),w:wn(y,[c,a,a+1]).concat(['Does not exist']),why:'Follow the line to the hole: '+n(y)+'. The dot is not the limit.',hint:'Look at where the line is heading, not at the filled dot.'}}
 if(t<=4){var p=ri(1,5),q=ri(1,6);while(q===p)q=ri(1,6);var a2=q-p;
  return{q:'lim<sub>x→−'+p+'</sub> (x + '+p+')(x + '+q+') / (x + '+p+') = ?',a:n(a2),w:wn(a2,[q,p,-p,0]),why:'Cancel (x + '+p+'). Plug in x = −'+p+': '+q+' − '+p+' = '+n(a2)+'.',hint:'Cancel the common factor first.'}}
 if(t<=5){var xa=ri(1,3),m1=ri(1,2),m2=-ri(1,2),b1=ri(0,2),L=m1*xa+b1,Rr=ri(3,6),b2=Rr-m2*xa;
  return{q:'Find the limit as x → '+xa+' from the <b>left</b>.',fig:pl({xmin:0,xmax:6,ymin:-1,ymax:8,fns:[{f:function(x){return m1*x+b1},b:xa},{f:function(x){return m2*x+b2},a:xa,c:Q.col.green}],pts:[[xa,L,'open'],[xa,Rr,'']]}),a:n(L),w:wn(L,[Rr,(L+Rr)/2,'Does not exist']),why:'Left piece heads to '+n(L)+'. (The right piece heads to '+n(Rr)+'.)',hint:'Use only the part of the graph left of x = '+xa+'.'}}
 if(t<=6){var A=ri(2,6),B=ri(1,5),C=ri(2,6),D=ri(1,5);var mode=ri(0,2);
  if(mode===0)return{q:'lim<sub>x→∞</sub> ('+A+'x² + '+B+'x) / ('+C+'x² − '+D+') = ?',a:ft(A,C),w:wn(A/C,[A,C,0,B/D]).concat(['∞']).map(function(x){return x}),why:'Same degree: divide the leading terms, '+A+'/'+C+'.',hint:'Compare the highest powers.'};
  if(mode===1)return{q:'lim<sub>x→∞</sub> ('+A+'x + '+B+') / ('+C+'x² + 1) = ?',a:'0',w:['∞',ft(A,C),n(A),n(B),'1'],why:'Bottom grows faster, so it goes to 0.',hint:'Which power of x is bigger, top or bottom?'};
  return{q:'lim<sub>x→∞</sub> ('+A+'x³ + '+B+') / ('+C+'x² + 1) = ?',a:'∞',w:['0',ft(A,C),n(A),'1',n(B)],why:'Top grows faster, so it goes to ∞.',hint:'Which power of x is bigger, top or bottom?'}}
 if(t<=7){var k=ri(2,7),mm=ri(1,4);while(mm===k)mm=ri(1,4);var v=ft(k,mm);
  return{q:'lim<sub>x→0</sub> sin('+k+'x) / ('+(mm===1?'':mm)+'x) = ?',a:v,w:wn(k/mm,[1,k,mm,mm/k,0]).concat([ft(mm,k)]),why:'sin(u)/u → 1. Result: '+k+'/'+mm+'.',hint:'Use sin(u)/u → 1.'}}
 if(t<=9&&Math.random()<.5){var a3=ri(1,3),kk=ri(2,5),m=ri(1,3),Lv=a3*a3+ri(1,3),d=Lv-kk*a3;
  return{q:'f(x) = x² + '+(Lv-a3*a3)+' for x &lt; '+a3+', and f(x) = '+kk+'x '+(d<0?'− '+(-d):'+ '+d)+' for x ≥ '+a3+'. Is f continuous at x = '+a3+'? Pick the best answer.',a:'Yes: both pieces equal '+Lv,w:['No: left is '+Lv+', right is '+(kk*a3+d+1),'No: the formulas differ','Only if the formulas match'],why:'Left: '+Lv+'. Right: '+kk+'·'+a3+(d<0?' − '+(-d):' + '+d)+' = '+Lv+'. Equal, so continuous.',hint:'Compare the left value, right value and f('+a3+').'}}
 if(t<=9){var lo=ri(1,3),hi=lo+ri(2,3),fl=-ri(1,5),fh=ri(3,8);var ok=ri(fl+1,fh-1);if(ok===0)ok=1;
  return{q:'f is continuous. f('+lo+') = '+n(fl)+' and f('+hi+') = '+fh+'. Which value must f reach on ['+lo+', '+hi+']?',fig:pl({xmin:0,xmax:hi+2,ymin:fl-2,ymax:fh+2,fns:[{f:function(x){return fl+(fh-fl)*(x-lo)/(hi-lo)},a:lo,b:hi,dash:'4 3'}],pts:[[lo,fl,''],[hi,fh,'']]}),a:n(ok),w:wn(ok,[fh+2,fl-2,fh+4]).slice(0,4),why:'IVT: every value between '+n(fl)+' and '+fh+' is reached.',hint:'Pick a value between the two ends.'}}
 var kk2=ri(2,6),aa=ri(1,3),LL=aa*aa+1,dd=ri(0,3),kv=(LL-dd)/aa;
 return{q:'f(x) = x² + 1 if x &lt; '+aa+'; f(x) = kx + '+dd+' if x ≥ '+aa+'. Find k so f is continuous.',a:ft(LL-dd,aa),w:wn((LL-dd)/aa,[LL,aa,LL+dd,(LL+dd)/aa]),why:'Left = '+LL+'. Right = '+aa+'k + '+dd+'. So k = '+ft(LL-dd,aa)+'.',hint:'Make left and right equal at x = '+aa+'.'}});

var deriv=U('der','Derivative rules','Power, product, quotient and trig rules, and reading slopes.',function(t){
 if(t<=2){var a=ri(1,3),x0=pick([-1,1,2]),s=2*x0;
  return{q:'Slope of the tangent to y = x² at x = '+n(x0)+'?',fig:pl({xmin:-3,xmax:3,ymin:-1,ymax:9,fns:[{f:function(x){return x*x}},{f:function(x){return s*(x-x0)+x0*x0},c:Q.col.red,dash:'5 3',w:2}],pts:[[x0,x0*x0,'']]}),a:n(s),w:wn(s,[x0,x0*x0,s+2]),why:'y′ = 2x. At x = '+n(x0)+': '+n(s)+'.',hint:'Slope = derivative.'}}
 if(t<=4){var c=[ri(1,5),ri(-6,6),ri(-5,5)],pw=ri(2,3);var co=pw===2?c:[ri(1,4),ri(-3,3),ri(-6,6),ri(-5,5)];var d=Q.dpoly(co);
  var wrong=[P(co.slice(0,-1)),P(Q.dpoly(Q.dpoly(co))),P(d.map(function(x,i){return i===0?x+1:x})),P(co.map(function(x,i){return i<co.length-1?x*(co.length-1-i)+1:x}))];
  return{q:'d/dx ['+P(co)+'] = ?',a:P(d),w:wrong,why:'Power rule: bring down the power, subtract 1.',hint:'x<sup>n</sup> → n x<sup>n−1</sup>'}}
 if(t<=5){var p=ri(2,4),q=ri(1,5),c0=ri(1,3);var val=2*c0*(c0+q)+c0*c0+p*1;/* f=(x^2+p)(x+q) => f'=2x(x+q)+(x^2+p) */val=2*c0*(c0+q)+(c0*c0+p);
  return{q:'f(x) = (x² + '+p+')(x + '+q+'). Find f′('+c0+').',a:n(val),w:wn(val,[2*c0*1+0,(c0*c0+p)*1,(2*c0)*1+0,2*c0*(c0+q)]),why:'Product rule: f′g + fg′ = '+(2*c0)+'·'+(c0+q)+' + '+(c0*c0+p)+'·1 = '+n(val)+'.',hint:'(uv)′ = u′v + uv′'}}
 if(t<=6){var a2=ri(1,5),c1=ri(1,3);var num=a2,den=(c1+a2)*(c1+a2);
  return{q:'f(x) = x / (x + '+a2+'). Find f′('+c1+').',a:ft(num,den),w:wn(num/den,[1/(c1+a2),a2/(c1+a2),c1/den,(c1+a2)/den]).concat([ft(den,num)]),why:'Quotient rule gives '+a2+'/(x + '+a2+')². At x = '+c1+': '+ft(num,den)+'.',hint:'(u/v)′ = (u′v − uv′)/v²'}}
 if(t<=7){var A=ri(2,6),B=ri(2,6);var f=function(a,b){return (a===1?'':n(a))+'cos x'+(b<0?' − ':' + ')+Math.abs(b)+'sin x'};
  return{q:'d/dx ['+A+' sin x − '+B+' cos x] = ?',a:A+' cos x + '+B+' sin x',w:[A+' cos x − '+B+' sin x','−'+A+' cos x + '+B+' sin x','−'+A+' cos x − '+B+' sin x',A+' sin x + '+B+' cos x'],why:'sin′ = cos, cos′ = −sin.',hint:'Two facts: (sin x)′ = cos x, (cos x)′ = −sin x.'}}
 if(t<=8){var N=ri(2,4),a3=ri(1,4),r=N*Math.pow(a3,N-1);
  return{q:'lim<sub>h→0</sub> ((' +a3+' + h)'+(N>1?'<sup>'+N+'</sup>':'')+' − '+Math.pow(a3,N)+') / h = ?',a:n(r),w:wn(r,[Math.pow(a3,N),N,N*a3,Math.pow(a3,N-1)]),why:'This is the derivative of x<sup>'+N+'</sup> at '+a3+': '+N+'·'+a3+'<sup>'+(N-1)+'</sup> = '+n(r)+'.',hint:'It is the definition of a derivative.'}}
 if(t<=9){var x1=ri(1,3),c2=ri(1,4),y1=x1*x1*x1+c2,sl=3*x1*x1;var b0=y1-sl*x1;
  return{q:'Tangent line to y = x³ + '+c2+' at x = '+x1+'?',fig:pl({xmin:-1,xmax:4,ymin:-2,ymax:Math.max(20,y1+6),fns:[{f:function(x){return x*x*x+c2}},{f:function(x){return sl*(x-x1)+y1},c:Q.col.red,dash:'5 3'}],pts:[[x1,y1,'']]}),a:'y = '+sl+'x '+(b0<0?'− '+(-b0):'+ '+b0),w:['y = '+sl+'x + '+(y1),'y = '+(2*x1)+'x '+((y1-2*x1*x1)<0?'− '+(-(y1-2*x1*x1)):'+ '+(y1-2*x1*x1)),'y = '+y1+'x '+(b0<0?'− '+(-b0):'+ '+b0),'y = '+sl+'x '+(-b0<0?'− '+(b0):'+ '+(-b0))],why:'Slope 3x² = '+sl+'. Point ('+x1+', '+y1+'). So y = '+sl+'x '+(b0<0?'− '+(-b0):'+ '+b0)+'.',hint:'Slope f′(a), through (a, f(a)).'}}
 var f2=ri(1,6),f1=ri(2,7),g2=ri(-4,6),g1=ri(2,7),ans=f1*g2+f2*g1;if(g2===0)g2=2;ans=f1*g2+f2*g1;
 return{q:'f(2) = '+f2+', f′(2) = '+f1+', g(2) = '+g2+', g′(2) = '+g1+'. Find (fg)′(2).',a:n(ans),w:wn(ans,[f1*g1,f2*g2,f1*g2-f2*g1,f1*g1+f2*g2]),why:'f′g + fg′ = '+f1+'·'+n(g2)+' + '+f2+'·'+g1+' = '+n(ans)+'.',hint:'(fg)′ = f′g + fg′'}});

var chain=U('chn','Chain rule and implicit','Chain rule, implicit slopes, inverse functions.',function(t){
 if(t<=3){var a=ri(2,5),b=ri(1,6),N=ri(2,5),c=N*a;
  return{q:'d/dx ('+a+'x + '+b+')<sup>'+N+'</sup> = ?',a:c+'('+a+'x + '+b+')<sup>'+(N-1)+'</sup>',w:[N+'('+a+'x + '+b+')<sup>'+(N-1)+'</sup>','('+a+'x + '+b+')<sup>'+(N-1)+'</sup>',N+'('+a+'x + '+b+')<sup>'+N+'</sup>',c+'('+a+'x + '+b+')<sup>'+N+'</sup>'],why:'Outside derivative × inside derivative: '+N+'(…)<sup>'+(N-1)+'</sup>·'+a+'.',hint:'Do not forget the inside derivative.'}}
 if(t<=5){var k=ri(2,7),m=ri(0,2);var w=m===0?'sin':m===1?'e':'ln';
  if(m===0)return{q:'d/dx sin('+k+'x) = ?',a:k+' cos('+k+'x)',w:['cos('+k+'x)','−'+k+' cos('+k+'x)',k+' sin('+k+'x)','−cos('+k+'x)'],why:'cos('+k+'x) times '+k+'.',hint:'Chain rule.'};
  if(m===1)return{q:'d/dx e<sup>'+k+'x</sup> = ?',a:k+'e<sup>'+k+'x</sup>',w:['e<sup>'+k+'x</sup>',k+'e<sup>'+(k-1)+'x</sup>','xe<sup>'+k+'x</sup>',(k)+'x e<sup>'+(k-1)+'x</sup>'],why:'e<sup>u</sup> stays, times u′ = '+k+'.',hint:'Chain rule.'};
  return{q:'d/dx ln('+k+'x) = ?',a:'1/x',w:['1/('+k+'x)',k+'/x','1/'+k+'x²',k+'x'],why:'(1/'+k+'x)·'+k+' = 1/x.',hint:'u′/u'}}
 if(t<=7){var tr=pick([[3,4,5],[5,12,13],[6,8,10],[8,15,17]]),x=tr[0],y=tr[1],r=tr[2];
  return{q:'x² + y² = '+(r*r)+'. Find dy/dx at ('+x+', '+y+').',fig:Q.svg(200,200,'<circle cx="100" cy="100" r="80" fill="#fff8e8" stroke="#0C1A33" stroke-width="2.5"/>'+Q.line(100,20,100,180,'#cfc6b0',1)+Q.line(20,100,180,100,'#cfc6b0',1)+Q.dot(100+80*x/r,100-80*y/r,Q.col.red,5)+Q.line(100,100,100+80*x/r,100-80*y/r,Q.col.blue,2,'4 3')+Q.txt(100+80*x/r+8,100-80*y/r-8,'('+x+', '+y+')',{a:'start',s:11})),a:ft(-x,y),w:wn(-x/y,[x/y,-y/x,y/x,-x,x*y]).concat([ft(-y,x)]).slice(0,5),why:'2x + 2y·y′ = 0, so y′ = −x/y = '+ft(-x,y)+'.',hint:'Differentiate both sides. y′ appears with y.'}}
 if(t<=8){var a2=ri(1,4);var vv=Q.fr(1,1+a2*a2),aa=ft(1,1+a2*a2);
  return{q:'d/dx arctan x at x = '+a2+'?',a:aa,w:wn(1/(1+a2*a2),[1/(a2*a2),1/a2,a2/(1+a2*a2),1+a2*a2,1/(1-a2*a2)]).concat([]),why:'(arctan x)′ = 1/(1 + x²) = 1/'+(1+a2*a2)+'.',hint:'1 / (1 + x²)'}}
 if(t<=9){var kk=ri(1,4),a3=1,b=a3*a3*a3+kk*a3;var d=3*a3*a3+kk;
  return{q:'f(x) = x³ + '+(kk===1?'':kk)+'x. f(1) = '+b+'. Find (f<sup>−1</sup>)′('+b+').',a:ft(1,d),w:wn(1/d,[d,b,1/b,3,1/(d+1)]),why:'Inverse slope: 1/f′(1). f′(1) = '+d+', so 1/'+d+'.',hint:'(f<sup>−1</sup>)′(b) = 1 / f′(a), where f(a) = b.'}}
 var c3=[ri(1,4),ri(-5,5),ri(-4,4),ri(1,6)],x2=ri(1,2),d2=Q.dpoly(Q.dpoly(c3)),ans=Q.ev(d2,x2);
 return{q:'f(x) = '+P(c3)+'. Find f″('+x2+').',a:n(ans),w:wn(ans,[Q.ev(Q.dpoly(c3),x2),Q.ev(c3,x2),ans+3]),why:'f′ = '+P(Q.dpoly(c3))+'. f″ = '+P(d2)+'. At x = '+x2+': '+n(ans)+'.',hint:'Differentiate twice.'}});

var apps=U('app','Rates and motion','Velocity, related rates and linear approximation.',function(t){
 if(t<=3){var c=[ri(1,3),ri(-6,6),ri(0,5)],t0=ri(1,4),v=Q.ev(Q.dpoly(c),t0);
  return{q:'Position s(t) = '+P(c,'t')+'. Velocity at t = '+t0+'?',a:n(v),w:wn(v,[Q.ev(c,t0),2*c[0],Q.ev(Q.dpoly(Q.dpoly(c)),t0)]),why:'v = s′ = '+P(Q.dpoly(c),'t')+'. At t = '+t0+': '+n(v)+'.',hint:'Velocity is the derivative of position.'}}
 if(t<=5){var r=ri(2,9),dr=ri(1,4);
  return{q:'A circle’s radius grows at '+dr+' cm/s. How fast is the area growing when r = '+r+' cm?',fig:Q.svg(180,120,'<circle cx="90" cy="60" r="26" fill="#fff8e8" stroke="#0C1A33" stroke-width="2"/><circle cx="90" cy="60" r="46" fill="none" stroke="#E52421" stroke-width="2.5" stroke-dasharray="5 4"/>'+Q.line(90,60,136,60,Q.col.blue,2)+Q.txt(113,54,'r',{s:13})),a:(2*r*dr)+PI+' cm²/s',w:[(r*dr)+PI+' cm²/s',(r*r*dr)+PI+' cm²/s',(2*dr)+PI+' cm²/s',(2*r)+PI+' cm²/s'],why:'A = πr², so dA/dt = 2πr·dr/dt = 2π·'+r+'·'+dr+'.',hint:'Differentiate A = πr² with respect to t.'}}
 if(t<=7){var tr=pick([[5,12,13],[3,4,5],[6,8,10],[8,15,17]]),x=tr[0],y=tr[1],L=tr[2],dx=ri(1,4);var ans=ft(-x*dx,y);
  return{q:'A '+L+' ft ladder slides. Bottom moves out at '+dx+' ft/s. Find dy/dt (the top\u2019s height rate) when the bottom is '+x+' ft out.',fig:Q.svg(200,170,Q.line(30,150,170,150,'#0C1A33',3)+Q.line(30,20,30,150,'#0C1A33',3)+Q.line(30,150-0,30,150,'#0C1A33',1)+Q.line(30,150-100*y/L*1.3,30+100*x/L*1.3+0,150,Q.col.red,4)+Q.txt(30+50*x/L*1.3+10,150-50*y/L*1.3-6,L,{s:12})+Q.txt(40,150-50*y/L*1.3,'y',{s:12,a:'start'})+Q.txt(30+50*x/L*1.3,166,'x',{s:12})),a:ans+' ft/s',w:wn(-x*dx/y,[x*dx/y,-y*dx/x,-dx,-x*dx/L]).map(function(v){return ft(Math.round(v*100),100)+' ft/s'}).slice(0,0).concat([ft(x*dx,y)+' ft/s',ft(-y*dx,x)+' ft/s',n(-dx)+' ft/s',ft(-x*dx,L)+' ft/s']),why:'x² + y² = '+(L*L)+' gives dy/dt = −(x/y)·dx/dt = −'+x+'/'+y+'·'+dx+'.',hint:'Use x² + y² = '+(L*L)+' and differentiate.'}}
 if(t<=8){var m=pick([[2,-1],[3,2]]),k=ri(2,6),l=ri(1,5);var lim=(Math.random()<.5);
  if(lim){var N=ri(2,5),c0=ri(1,3),r2=N*Math.pow(c0,N-1);return{q:'Using L’Hôpital: lim<sub>x→'+c0+'</sub> (x<sup>'+N+'</sup> − '+Math.pow(c0,N)+') / (x − '+c0+') = ?',a:n(r2),w:wn(r2,[Math.pow(c0,N),0,N,'∞'==0?0:N*c0]),why:'0/0: differentiate top and bottom. '+N+'x<sup>'+(N-1)+'</sup>/1 at '+c0+' = '+n(r2)+'.',hint:'0/0, so take derivatives top and bottom.'}}
  return{q:'lim<sub>x→0</sub> (e<sup>'+k+'x</sup> − 1) / x = ?',a:n(k),w:wn(k,[1,0,k*k,1/k]),why:'0/0. Derivatives: '+k+'e<sup>'+k+'x</sup>/1 → '+k+'.',hint:'0/0, so take derivatives top and bottom.'}}
 var a=pick([2,3,4,5]),dl=pick([0.2,0.4,0.6]),val=a+dl/(2*a);
 return{q:'Use the tangent line of √x at x = '+(a*a)+' to estimate √'+n(a*a+dl)+'.',fig:pl({xmin:0,xmax:a*a*2,ymin:0,ymax:a*2+2,fns:[{f:Math.sqrt},{f:function(x){return a+(x-a*a)/(2*a)},c:Q.col.red,dash:'5 3'}],pts:[[a*a,a,'']]}),a:n(rd4(val)),w:wn(val,[a+dl/a,a+dl,a-dl/(2*a),a+dl/(4*a)],function(v){return n(rd4(v))}),why:'L(x) = '+a+' + (x − '+(a*a)+')/'+(2*a)+' → '+n(rd4(val))+'.',hint:'f(a) + f′(a)(x − a), with f′ = 1/(2√x).'}});
function rd4(v){return Math.round(v*10000)/10000}

var analyt=U('ana','Max, min and curve shape','Extrema, concavity, MVT and optimization.',function(t){
 if(t<=2){var a=ri(1,3);
  return{q:'Where does f have a local <b>max</b>?',fig:pl({xmin:-4,xmax:4,ymin:-12,ymax:12,fns:[{f:function(x){return x*x*x/3-a*a*x}}],xs:1,ys:4,vl:[]}),a:'x = −'+a,w:['x = '+a,'x = 0','x = '+(2*a),'x = −'+(2*a)],why:'The top of the hill is on the left, at x = −'+a+'.',hint:'Find the highest bump.'}}
 if(t<=4){var p=ri(1,4),q=ri(2,6),r=Math.min(p,q),R2=Math.max(p,q);
  return{q:'This is the graph of f′. Where does f have a local <b>max</b>?',fig:pl({xmin:-1,xmax:R2+2,ymin:-4,ymax:6,fns:[{f:function(x){return (x-r)*(x-R2)}}],pts:[[r,0,''],[R2,0,'']],xs:1,ys:2}),a:'x = '+r,w:['x = '+R2,'x = '+(r+R2)/2,'x = 0','x = '+(R2+1)],why:'f′ goes + to − at x = '+r+', so f peaks there.',hint:'Look for f′ changing from + to −.'}}
 if(t<=5){var P2=pick([24,32,40,48,56,64]),area=P2*P2/8;
  return{q:'You have '+P2+' m of fence for a rectangle with a wall on one side. Largest area?',fig:Q.svg(220,130,'<rect x="40" y="30" width="140" height="70" fill="#fff8e8" stroke="#E52421" stroke-width="3"/>'+Q.line(30,30,190,30,'#0C1A33',6)+Q.txt(110,20,'wall',{s:11})+Q.txt(110,118,'x',{s:13})+Q.txt(28,70,'y',{s:13,a:'end'})),a:area+' m²',w:[(P2*P2/16)+' m²',(P2*P2/4)+' m²',(P2*P2/8+P2)+' m²',(P2*P2/2)+' m²'],why:'2y + x = '+P2+', A = x(' + P2 + ' − x)/2. Max at x = '+(P2/2)+': '+area+'.',hint:'Write area with one variable, then find where A′ = 0.'}}
 if(t<=6){var k=ri(1,3);
  return{q:'f(x) = x³ − '+(3*k)+'x² + 2. Where does the curve change concavity?',fig:pl({xmin:-1,xmax:2*k+2,ymin:-4*k*k*k-2,ymax:6,fns:[{f:function(x){return x*x*x-3*k*x*x+2}}]}),a:'x = '+k,w:['x = 0','x = '+(2*k),'x = '+(3*k),'x = '+(k+1)],why:'f″ = 6x − '+(6*k)+' = 0 at x = '+k+'.',hint:'Solve f″(x) = 0.'}}
 if(t<=8){var a2=ri(0,2),b2=a2+ri(2,4)*2;var f=function(x){return x*x},c=(a2+b2)/2;
  return{q:'MVT for f(x) = x² on ['+a2+', '+b2+']: find c.',fig:pl({xmin:-1,xmax:b2+1,ymin:-1,ymax:b2*b2+4,fns:[{f:f}],segs:[[a2,f(a2),b2,f(b2),Q.col.green,'5 3'],[c-1,f(c)-2*c,c+1,f(c)+2*c,Q.col.red]],pts:[[c,f(c),'']]}),a:'c = '+c,w:['c = '+a2,'c = '+b2,'c = '+(c+1),'c = '+(c-1<0?c+2:c-1)],why:'Secant slope = '+(a2+b2)+'. f′(c) = 2c = '+(a2+b2)+', so c = '+c+'.',hint:'Set f′(c) equal to the secant slope.'}}
 var bb=ri(2,5)*2,cc=ri(0,3),lo=0,hi=bb+ri(1,3);var f2=function(x){return -x*x+bb*x+cc};var vx=bb/2;var best=Math.max(f2(lo),f2(hi),(vx>=lo&&vx<=hi)?f2(vx):-1e9);
 return{q:'Absolute max of f(x) = −x² + '+bb+'x'+(cc?' + '+cc:'')+' on [0, '+hi+']?',fig:pl({xmin:-1,xmax:hi+1,ymin:-4,ymax:best+4,fns:[{f:f2,a:0,b:hi}],pts:[[vx,f2(vx),''],[0,f2(0),''],[hi,f2(hi),'']]}),a:n(best),w:wn(best,[f2(0),f2(hi),f2(vx)+bb,best-bb]),why:'Check the top x = '+vx+' and both ends. Largest: '+n(best)+'.',hint:'Compare f at the critical point and at both endpoints.'}});

var integ=U('int','Integrals and FTC','Antiderivatives, areas, Riemann sums and u-substitution.',function(t){
 if(t<=2){var m=ri(1,3),a=ri(2,4),A=m*a*a/2;
  return{q:'Area under y = '+(m===1?'':m)+'x from x = 0 to x = '+a+'?',fig:pl({xmin:-1,xmax:a+2,ymin:-1,ymax:m*a+2,fns:[{f:function(x){return m*x}}],shade:{f:function(x){return m*x},a:0,b:a}}),a:n(A),w:wn(A,[m*a,m*a*a,A*2+1]),why:'Triangle: ½ · '+a+' · '+(m*a)+' = '+n(A)+'.',hint:'The shaded part is a triangle.'}}
 if(t<=4){var c1=3*ri(1,3),c2=2*ri(1,4),c3=ri(1,6);var F=[c1/3,c2/2,c3,0];
  return{q:'∫ ('+c1+'x² + '+c2+'x + '+c3+') dx = ?',a:P(F)+' + C',w:[P([c1,c2,c3])+' + C',P([c1/3,c2/2,0,0])+' + C',P([c1,c2/2,c3,0])+' + C',P([c1/3,c2,c3,0])+' + C'],why:'Raise the power, divide by it: x³, x², x.',hint:'x<sup>n</sup> → x<sup>n+1</sup>/(n+1)'}}
 if(t<=5){var w=ri(1,2),k=ri(2,4)*w,m=k/w;var f=function(x){return x*x};var tot=0;for(var i=0;i<m;i++)tot+=f(i*w);tot*=w;
  var nn=m;return{q:'Left Riemann sum of f(x) = x² on [0, '+k+'] with '+nn+' rectangles?',fig:pl({xmin:-1,xmax:k+1,ymin:-1,ymax:k*k+3,fns:[{f:f}],rects:Array.from({length:nn},function(_,i){return[i*w,(i+1)*w,f(i*w)]})}),a:n(tot),w:wn(tot,[tot+f(k)*w,tot-w,(k*k*k)/3,tot*2]),why:'Heights at the left ends, each width '+w+'.',hint:'Use the left end of each strip for the height.'}}
 if(t<=6){var a2=ri(1,4);var b2=a2+ri(1,3);var A2=ri(2,6);var ans=(Math.pow(b2,2)-Math.pow(a2,2))/2*A2;
  return{q:'∫<sub>'+a2+'</sub><sup>'+b2+'</sup> '+A2+'x dx = ?',a:ft(2*ans,2),w:wn(ans,[A2*b2*b2/2,ans*2,A2*(b2-a2),ans+A2]).map(function(x){return x}),why:'F(x) = '+ft(A2,2)+'x². F('+b2+') − F('+a2+') = '+ft(2*ans,2)+'.',hint:'Antiderivative, then top minus bottom.'}}
 if(t<=7){var b=pick([[1,'x²'],[2,'x²']]);var k2=ri(2,4),tr=ri(0,1);
  return tr?{q:'d/dx ∫<sub>1</sub><sup>x</sup> t<sup>'+k2+'</sup> dt = ?',a:'x<sup>'+k2+'</sup>',w:['x<sup>'+(k2+1)+'</sup>/'+(k2+1),k2+'x<sup>'+(k2-1)+'</sup>','x<sup>'+k2+'</sup> − 1','0'],why:'FTC: derivative of the integral gives back the integrand.',hint:'Fundamental Theorem, Part 1.'}:{q:'d/dx ∫<sub>0</sub><sup>x²</sup> cos t dt = ?',a:'2x cos(x²)',w:['cos(x²)','2x cos x','−sin(x²)','2x sin(x²)'],why:'cos(x²) times the inside derivative 2x.',hint:'FTC plus the chain rule.'}}
 if(t<=9){var N=ri(2,4),a3=0,b3=ri(1,2);var up=Math.pow(b3*b3+1,N+1),lo=1;var res=(up-lo)/(N+1);
  return{q:'∫<sub>0</sub><sup>'+b3+'</sup> 2x(x² + 1)<sup>'+N+'</sup> dx = ?',a:ft(up-lo,N+1),w:wn(res,[up/(N+1),up-lo,res*2,Math.pow(b3*b3+1,N)]).map(function(x){return x}),why:'u = x² + 1, du = 2x dx. u<sup>'+(N+1)+'</sup>/'+(N+1)+' from 1 to '+(b3*b3+1)+'.',hint:'Let u = x² + 1.'}}
 var k3=ri(2,5);
 return{q:'∫ '+k3+'x · e<sup>x²</sup> dx = ?',a:ft(k3,2)+'e<sup>x²</sup> + C',w:[k3+'e<sup>x²</sup> + C',ft(k3,2)+'x²e<sup>x²</sup> + C',k3+'x e<sup>x²</sup>/2 + C',ft(k3,2)+'e<sup>x</sup> + C'],why:'u = x², du = 2x dx. Integral of e<sup>u</sup> is e<sup>u</sup>.',hint:'Let u = x².'}});

var diffeq=U('deq','Differential equations','Slope fields, separation of variables, growth and decay.',function(t){
 if(t<=4){var S=[['x',function(x,y){return x}],['y',function(x,y){return y}],['x + y',function(x,y){return x+y}],['−x',function(x,y){return -x}],['x − y',function(x,y){return x-y}],['−y',function(x,y){return -y}]];var c=pick(S);var names=S.map(function(s){return 'dy/dx = '+s[0]});
  return{q:'Which equation makes this slope field?',fig:field(c[1]),a:'dy/dx = '+c[0],w:names.filter(function(x){return x!=='dy/dx = '+c[0]}),why:'Match the slopes on the axes: check where they are flat, up and down.',hint:'Check the slope on the x-axis (y = 0) and on the y-axis (x = 0).'}}
 if(t<=6){var A=ri(1,5),k=ri(2,5),sg=pick([1,-1]),kk=sg*k;var K=kk<0?'−'+k:k;
  return{q:'dy/dx = '+(kk<0?'−':'')+k+'y, y(0) = '+A+'. Solve for y.',a:'y = '+(A===1?'':A)+'e<sup>'+(kk<0?'−':'')+k+'x</sup>',w:['y = e<sup>'+(kk<0?'−':'')+k+'x</sup> + '+(A-1),'y = '+(A===1?'':A)+'e<sup>'+(kk<0?'':'−')+k+'x</sup>','y = '+(kk<0?'−':'')+k+A+'x','y = '+(A+1)+'e<sup>'+(kk<0?'−':'')+k+'x</sup>'],why:'dy/dx = ky gives y = Ce<sup>kx</sup>. y(0) = '+A+' so C = '+A+'.',hint:'Growth/decay: y = Ce<sup>kx</sup>.'}}
 if(t<=8){var x0=ri(-3,3),y0=ri(-3,3),ty=pick([['x·y',function(x,y){return x*y}],['x + y',function(x,y){return x+y}],['y − x²',function(x,y){return y-x*x}],['x² − y',function(x,y){return x*x-y}]]);var v=ty[1](x0,y0);
  return{q:'dy/dx = '+ty[0]+'. Slope at ('+n(x0)+', '+n(y0)+')?',a:n(v),w:wn(v,[x0+y0,x0*y0,x0*x0,y0]),why:'Put x = '+n(x0)+', y = '+n(y0)+' into '+ty[0]+'.',hint:'Just substitute.'}}
 var M=pick(['x/y','−x/y','y/x']);
 if(M==='x/y')return{q:'dy/dx = x/y. Separate and integrate.',a:'y² − x² = C',w:['y² + x² = C','y = x + C','ln y = x + C','y² = ln x + C'],why:'y dy = x dx → y²/2 = x²/2 + C.',hint:'Move y with dy, x with dx.'};
 if(M==='−x/y')return{q:'dy/dx = −x/y. Separate and integrate.',a:'x² + y² = C',w:['y² − x² = C','y = −x + C','ln y = −x + C','y = x² + C'],why:'y dy = −x dx → x² + y² = C (circles).',hint:'Move y with dy, x with dx.'};
 return{q:'dy/dx = y/x. Separate and integrate.',a:'y = Cx',w:['y = x + C','y = C ln x','y = Cx²','y = e<sup>x</sup> + C'],why:'dy/y = dx/x → ln y = ln x + C.',hint:'Move y with dy, x with dx.'}});

var areas=U('aoi','Area, average, volume','Between curves, average value and solids of revolution.',function(t){
 if(t<=3){var b=3*ri(1,3),A=b*b/3;
  return{q:'Average value of f(x) = x² on [0, '+b+']?',fig:pl({xmin:-1,xmax:b+1,ymin:-1,ymax:b*b+2,fns:[{f:function(x){return x*x}}],shade:{f:function(x){return x*x},a:0,b:b}}),a:n(A),w:wn(A,[b*b,b*b*b/3,b*b/2,b]),why:'(1/'+b+')·'+b+'³/3 = '+n(A)+'.',hint:'Integral divided by the width.'}}
 if(t<=6){var k=ri(2,5);
  return{q:'Area between y = '+k+'x and y = x².',fig:pl({xmin:-1,xmax:k+1,ymin:-1,ymax:k*k+2,fns:[{f:function(x){return k*x}},{f:function(x){return x*x},c:Q.col.red}],shade:{f:function(x){return k*x},g:function(x){return x*x},a:0,b:k}}),a:ft(k*k*k,6),w:wn(k*k*k/6,[k*k*k/3,k*k/2,k*k*k/2,k*k/6]).concat([ft(k*k,6)]),why:'They meet at 0 and '+k+'. ∫('+k+'x − x²) = '+ft(k*k*k,6)+'.',hint:'Top curve minus bottom curve.'}}
 if(t<=8){var a=ri(2,6);
  return{q:'Spin y = x on [0, '+a+'] around the x-axis. Volume?',fig:Q.svg(240,150,'<ellipse cx="200" cy="75" rx="14" ry="44" fill="#fff8e8" stroke="#0C1A33" stroke-width="2"/><path d="M40 75L200 31L200 119Z" fill="#FDBB0B" fill-opacity=".45" stroke="#0C1A33" stroke-width="2"/>'+Q.line(20,75,230,75,'#0C1A33',1.5,'4 3')+Q.txt(120,140,'x from 0 to '+a,{s:11})),a:ft(a*a*a,3)+PI,w:[ft(a*a,2)+PI,a*a*a+PI,ft(a*a*a,2)+PI,ft(a*a*a,3)],why:'Disks: π∫x² dx = πa³/3.',hint:'Disk method: π · (radius)² dx.'}}
 var a2=ri(2,5);
 return{q:'Cross-sections are squares with side x. Base: 0 ≤ x ≤ '+a2+'. Volume?',fig:Q.svg(240,140,'<path d="M30 110L210 110" stroke="#0C1A33" stroke-width="2"/><rect x="60" y="70" width="30" height="40" fill="#FDBB0B" fill-opacity=".5" stroke="#0C1A33"/><rect x="110" y="50" width="45" height="60" fill="#FDBB0B" fill-opacity=".5" stroke="#0C1A33"/><rect x="170" y="25" width="30" height="85" fill="#FDBB0B" fill-opacity=".5" stroke="#0C1A33"/>'+Q.txt(120,128,'x: 0 to '+a2,{s:11})),a:ft(a2*a2*a2,3),w:wn(a2*a2*a2/3,[a2*a2/2,a2*a2*a2,a2*a2,a2*a2*a2/2]).concat([]),why:'Area = x². ∫<sub>0</sub><sup>'+a2+'</sup> x² dx = '+ft(a2*a2*a2,3)+'.',hint:'Area of a square slice = side².'}});

Q.add('ap-calculus-ab',{short:'AP Calculus AB',title:'Climb Mount Calculus AB',intro:'Twelve camps, one for each big idea in AP Calculus AB. Every camp is a little harder.',units:[limits,deriv,chain,apps,analyt,integ,diffeq,areas]});

/* ---------- BC extras ---------- */
var parts=U('adv','Advanced integration','Integration by parts, partial fractions, improper integrals.',function(t){
 if(t<=4){var c=pick(['x e<sup>x</sup>','x cos x','x sin x','ln x']);
  var S={'x e<sup>x</sup>':['(x − 1)e<sup>x</sup> + C',['(x + 1)e<sup>x</sup> + C','x e<sup>x</sup> + C','e<sup>x</sup>/2 + C'],'u = x, dv = e<sup>x</sup> dx.'],
   'x cos x':['x sin x + cos x + C',['x sin x − cos x + C','−x sin x + cos x + C','sin x + C'],'u = x, dv = cos x dx.'],
   'x sin x':['−x cos x + sin x + C',['x cos x + sin x + C','−x cos x − sin x + C','cos x + C'],'u = x, dv = sin x dx.'],
   'ln x':['x ln x − x + C',['x ln x + x + C','1/x + C','ln x − x + C'],'u = ln x, dv = dx.']}[c];
  return{q:'∫ '+c+' dx = ?',a:S[0],w:S[1],why:'By parts: ∫u dv = uv − ∫v du. '+S[2],hint:'Pick u so that du is simpler.'}}
 if(t<=7){var p=ri(2,4);
  return{q:'∫<sub>1</sub><sup>∞</sup> 1/x<sup>'+p+'</sup> dx = ?',fig:pl({xmin:0,xmax:6,ymin:-0.2,ymax:1.4,fns:[{f:function(x){return Math.pow(x,-p)},a:0.5}],shade:{f:function(x){return Math.pow(x,-p)},a:1,b:6},xs:1,ys:.5}),a:ft(1,p-1),w:['Diverges',ft(1,p),ft(p,p-1),'0'].concat([n(p)]),why:'F(x) = −1/('+(p-1)+'x<sup>'+(p-1)+'</sup>). F(∞) = 0, F(1) = −'+ft(1,p-1)+'.',hint:'Take a limit as the top bound goes to ∞.'}}
 if(t<=8){return{q:'∫<sub>1</sub><sup>∞</sup> 1/x dx = ?',fig:pl({xmin:0,xmax:6,ymin:-0.2,ymax:1.4,fns:[{f:function(x){return 1/x},a:0.5}],shade:{f:function(x){return 1/x},a:1,b:6},xs:1,ys:.5}),a:'Diverges',w:['1','e','0','ln 2'],why:'ln b → ∞. The area never settles.',hint:'The antiderivative is ln x.'}}
 var a=ri(1,3),b=a+ri(1,3);
 return{q:'Partial fractions: 1/((x + '+a+')(x + '+b+')) = ?',a:ft(1,b-a)+'/(x + '+a+') − '+ft(1,b-a)+'/(x + '+b+')',w:[ft(1,b-a)+'/(x + '+a+') + '+ft(1,b-a)+'/(x + '+b+')','1/(x + '+a+') − 1/(x + '+b+')',ft(1,b-a)+'/(x + '+b+') − '+ft(1,b-a)+'/(x + '+a+')','1/(x + '+(a+b)+')'],why:'Split: A/(x + '+a+') + B/(x + '+b+'). A = 1/'+(b-a)+', B = −1/'+(b-a)+'.',hint:'Write A/(x + a) + B/(x + b) and solve for A, B.'}});

var eul=U('eul','Euler, logistic and slope fields','Euler’s method and logistic growth.',function(t){
 if(t<=5){var F=pick([['x + y',function(x,y){return x+y}],['y − x',function(x,y){return y-x}],['x·y',function(x,y){return x*y}]]),h=pick([0.5,1]),x=0,y=pick([1,2]),y0=y,steps=h===1?2:2;var tr=['(0, '+y0+')'];
  for(var i=0;i<steps;i++){y=y+h*F[1](x,y);x+=h;tr.push('('+n(x)+', '+n(y)+')')}
  var ans=y;
  return{q:'Euler’s method: dy/dx = '+F[0]+', y(0) = '+y0+', step '+h+'. Find y after 2 steps.',fig:field(F[1]),a:n(ans),w:wn(ans,[y0+h*F[1](0,y0),ans+h,ans*2,ans-1]),why:'New y = old y + h·slope. Path: '+tr.join(' → ')+'.',hint:'Slope at the current point, times h, added to y.'}}
 var M=pick([100,200,500,1000]),k=pick([0.1,0.2,0.5]);
 if(t<=7)return{q:'dP/dt = '+k+'P(1 − P/'+M+'). What does P approach?',fig:pl({xmin:0,xmax:10,ymin:0,ymax:M*1.2,fns:[{f:function(x){return M/(1+9*Math.exp(-0.9*x))}}],segs:[[0,M,10,M,Q.col.red,'5 4']],noTicks:1}),a:n(M),w:[n(M/2),n(k),n(M*2),'0'],why:'Growth stops when 1 − P/M = 0, so P → '+M+'.',hint:'Set dP/dt = 0.'}
 if(t<=9)return{q:'Logistic growth with limit '+M+'. P grows fastest when P = ?',fig:pl({xmin:0,xmax:10,ymin:0,ymax:M*1.2,fns:[{f:function(x){return M/(1+9*Math.exp(-0.9*x))}}],segs:[[0,M/2,10,M/2,Q.col.green,'5 4']],noTicks:1}),a:n(M/2),w:[n(M),n(M/4),'0',n(M*2/3)],why:'The curve is steepest halfway to the limit: '+M+'/2.',hint:'The inflection point of the S-curve.'}
 var P0=M/2;var rate=k*P0*(1-P0/M);
 return{q:'dP/dt = '+k+'P(1 − P/'+M+'). Find dP/dt when P = '+(M/4)+'.',a:n(rd4(k*(M/4)*(0.75))),w:wn(k*(M/4)*.75,[k*M/4,k*M/4*.25,k*M*.25,k*.75],function(v){return n(rd4(v))}),why:'Plug in: '+k+'·'+(M/4)+'·0.75 = '+n(rd4(k*(M/4)*.75))+'.',hint:'Substitute P into the equation.'}});

var vec=U('par','Parametric, polar, vectors','Slopes, speed, polar curves and vectors.',function(t){
 if(t<=3){var C=pick([['r = 1 + cosθ',function(a){return 1+Math.cos(a)}],['r = 2cos 3θ',function(a){return 2*Math.cos(3*a)}],['r = 2',function(a){return 2}],['r = 2cos 2θ',function(a){return 2*Math.cos(2*a)}],['r = 1 + 2cosθ',function(a){return 1+2*Math.cos(a)}]]);var names=['r = 1 + cosθ','r = 2cos 3θ','r = 2','r = 2cos 2θ','r = 1 + 2cosθ'];
  return{q:'Which polar equation draws this curve?',fig:polar(function(a){return C[1](a)/(C[0]==='r = 2'?1.2:C[0]==='r = 1 + 2cosθ'?1.4:1)}),a:C[0],w:names.filter(function(x){return x!==C[0]}),why:'Count the loops and check where it touches the center.',hint:'Cardioid has one dent, roses have petals, a circle is round.'}}
 if(t<=6){var c=ri(1,3),q=ri(1,4);var s=ft(3*c*c+q,2*c);
  return{q:'x = t², y = t³ + '+q+'t. Find dy/dx at t = '+c+'.',a:s,w:wn((3*c*c+q)/(2*c),[3*c*c+q,2*c,3*c*c,(2*c)/(3*c*c+q)]).concat([ft(2*c,3*c*c+q)]),why:'(dy/dt)/(dx/dt) = (3t² + '+q+')/(2t) at t = '+c+'.',hint:'dy/dx = (dy/dt) / (dx/dt)'}}
 if(t<=8){var tr=pick([[3,4,2],[5,12,6],[6,8,4],[9,12,6],[15,8,4]]);var p=tr[0],o=tr[1],qq=tr[2];var sp=Math.sqrt(p*p+o*o);
  return{q:'x = '+p+'t, y = '+qq+'t². Speed at t = 1?',fig:Q.svg(220,150,Q.line(20,130,200,130,'#0C1A33',1.5)+Q.line(20,130,20,20,'#0C1A33',1.5)+Q.line(20,130,20+p*8,130,Q.col.blue,3)+Q.line(20+p*8,130,20+p*8,130-o*5,Q.col.green,3)+Q.line(20,130,20+p*8,130-o*5,Q.col.red,3)+Q.txt(20+p*4,145,'x′ = '+p,{s:11})+Q.txt(30+p*8,130-o*2.5,'y′ = '+o,{s:11,a:'start'})),a:n(sp),w:wn(sp,[p+o,p,o,sp*sp]),why:'x′ = '+p+', y′ = '+o+'. Speed = √('+p*p+' + '+o*o+') = '+n(sp)+'.',hint:'Speed = √(x′² + y′²) at t = 1.'}}
 var rr=ri(1,3)*2,th=pick([1,2,4]);var A=rr*rr*th/2;
 return{q:'Area inside r = '+rr+' from θ = 0 to θ = '+(th===1?'1':th===2?'2':'4')+' (radians)?',fig:polar(function(){return rr/2.0}),a:n(A),w:wn(A,[rr*rr*th,rr*th,A*2+1,rr*rr]),why:'½∫r²dθ = ½·'+rr*rr+'·'+th+' = '+n(A)+'.',hint:'Polar area: ½ ∫ r² dθ'}});

var ser=U('ser','Series and convergence','Choose the test and decide: converges or diverges.',function(t){
 var CH=['Converges','Diverges','Converges conditionally','Cannot tell'];
 if(t<=3){var r=pick([[1,2],[1,3],[2,3],[3,4],[1,4]]),a=ri(1,6)*r[1]*r[1];var S=a/(1-r[0]/r[1]);var psum=[],s=0;for(var i=0;i<8;i++){s+=a*Math.pow(r[0]/r[1],i);psum.push([i,s])}
  return{q:'Σ '+a+'('+r[0]+'/'+r[1]+')<sup>n</sup> from n = 0. What is the sum?',fig:pl({xmin:-1,xmax:8,ymin:0,ymax:S*1.2,fns:[],segs:[[-1,S,8,S,Q.col.red,'5 4']],pts:psum.map(function(p){return[p[0],p[1],'']}),noTicks:1}),a:n(Q.rd(S)),w:wn(S,[a,a*(1+r[0]/r[1]),a/(r[0]/r[1]),S+a]),why:'Geometric: a/(1 − r) = '+a+'/'+ft(r[1]-r[0],r[1])+' = '+n(Q.rd(S))+'.',hint:'S = a/(1 − r) when |r| &lt; 1.'}}
 if(t<=6){var p=pick([[1,'Σ 1/n','Diverges','p = 1'],[2,'Σ 1/n²','Converges','p = 2 &gt; 1'],[0.5,'Σ 1/√n','Diverges','p = ½ ≤ 1'],[3,'Σ 1/n³','Converges','p = 3 &gt; 1'],[1.5,'Σ 1/n<sup>1.5</sup>','Converges','p = 1.5 &gt; 1']]);
  return{q:p[1]+' (n from 1)',a:p[2],w:CH.filter(function(x){return x!==p[2]}),why:'p-series: converges only if p &gt; 1. Here '+p[3]+'.',hint:'It is a p-series 1/n<sup>p</sup>.'}}
 if(t<=8){var kx=pick([[ 'Σ (−1)<sup>n</sup>/n','Converges conditionally','Alternating, terms shrink to 0, but Σ1/n diverges.'],['Σ (−1)<sup>n</sup>/n²','Converges','Alternating, and Σ1/n² converges too.'],['Σ n/(n + 1)','Diverges','Terms go to 1, not 0.'],['Σ (−1)<sup>n</sup> n/(n + 1)','Diverges','Terms do not go to 0.']]);
  return{q:kx[0]+' (n from 1)',a:kx[1],w:CH.filter(function(x){return x!==kx[1]}),why:kx[2],hint:'Check the limit of the terms, then the alternating test.'}}
 var tt=pick([['Σ n!/3<sup>n</sup>','Ratio test','Diverges','Ratio of terms → ∞.'],['Σ 2<sup>n</sup>/n!','Ratio test','Converges','Ratio of terms → 0.'],['Σ 3<sup>n</sup>/n<sup>n</sup>','Root test','Converges','The n-th root of the term → 0.']]);
 return{q:tt[0]+': pick the best test, then the result.',a:tt[1]+' → '+tt[2],w:['Integral test → '+tt[2],'Alternating series test → '+tt[2],tt[1]+' → '+(tt[2]==='Converges'?'Diverges':'Converges'),'p-series → '+tt[2]].concat(tt[1]==='Root test'?['Ratio test → Converges']:[]),why:tt[3],hint:'Factorials suggest the ratio test, n-th powers suggest the root test.'}});

var tay=U('tay','Taylor series and error','Build polynomials, find radius, bound the error.',function(t){
 if(t<=4){var k=ri(2,4);var m=ri(0,2);
  if(m===0)return{q:'Coefficient of x<sup>2</sup> in the Maclaurin series of e<sup>'+k+'x</sup>?',a:ft(k*k,2),w:wn(k*k/2,[k,k*k,k/2,1/2]),why:'e<sup>u</sup> = 1 + u + u²/2!. With u = '+k+'x: '+k+'²/2.',hint:'Replace u by '+k+'x in 1 + u + u²/2! + …'};
  if(m===1)return{q:'Maclaurin series of sin x starts with?',fig:pl({xmin:-4,xmax:4,ymin:-2,ymax:2,fns:[{f:Math.sin},{f:function(x){return x-x*x*x/6},c:Q.col.red,dash:'5 3'}]}),a:'x − x³/3! + x⁵/5!',w:['1 − x²/2! + x⁴/4!','x + x³/3! + x⁵/5!','x − x²/2! + x³/3!','1 + x + x²/2!'],why:'sin x is odd: only odd powers, signs alternate.',hint:'sin x is an odd function.'};
  return{q:'Maclaurin series of cos x starts with?',a:'1 − x²/2! + x⁴/4!',w:['x − x³/3! + x⁵/5!','1 + x²/2! + x⁴/4!','1 − x + x²/2!','x + x³/3!'],why:'cos x is even: only even powers, signs alternate.',hint:'cos x is an even function.'}}
 if(t<=7){var c=ri(2,5);
  return{q:'Radius of convergence of Σ x<sup>n</sup>/('+c+'<sup>n</sup>)?',a:n(c),w:[n(1/c),'1','∞',n(c*c)],why:'Ratio test: |x|/'+c+' &lt; 1, so |x| &lt; '+c+'.',hint:'Use the ratio test.'}}
 if(t<=8){return{q:'Taylor polynomial of ln x about x = 1, to degree 2?',fig:pl({xmin:0,xmax:3,ymin:-2,ymax:2,fns:[{f:Math.log},{f:function(x){return (x-1)-(x-1)*(x-1)/2},c:Q.col.red,dash:'5 3'}]}),a:'(x − 1) − (x − 1)²/2',w:['(x − 1) + (x − 1)²/2','1 + (x − 1) − (x − 1)²/2','x − x²/2','(x − 1) − (x − 1)²'],why:'ln 1 = 0, f′ = 1/x = 1, f″ = −1/x² = −1, divide by 2!.',hint:'f(1), f′(1), f″(1)/2!'}}
 var M=pick([2,3,4,6]),h=pick([0.5,1]),N=pick([2,3]);var fac=[1,1,2,6,24,120][N+1];var err=M*Math.pow(h,N+1)/fac;
 return{q:'Degree '+N+' Taylor polynomial, |f<sup>('+(N+1)+')</sup>| ≤ '+M+' and |x − a| ≤ '+h+'. Error bound?',a:n(rd4(err)),w:wn(err,[M*Math.pow(h,N)/[1,1,2,6,24][N],M*h/fac,err*2,M*Math.pow(h,N+1)/[1,1,2,6,24,120,720][N+2]],function(v){return n(rd4(v))}),why:'M|x−a|<sup>'+(N+1)+'</sup>/'+(N+1)+'! = '+M+'·'+h+'<sup>'+(N+1)+'</sup>/'+fac+'.',hint:'Lagrange: M·|x−a|<sup>n+1</sup>/(n+1)!'}});

Q.add('ap-calculus-bc',{short:'AP Calculus BC',title:'Climb Mount Calculus BC',intro:'Twelve camps from limits to series. BC adds parts, Euler, polar and Taylor, so the top is higher.',units:[limits,deriv,apps,analyt,integ,parts,eul,vec,ser,tay]});
})(typeof window!=='undefined'?window:global);

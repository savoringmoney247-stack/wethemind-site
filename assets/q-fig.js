/* Shared diagrams for the Math Mountain games */
(function(g){var Q=g.Q,n=Q.n,C=Q.col,L=Q.line,T=Q.txt;
Q.field=function(f,W){W=W||220;var s='<rect width="'+W+'" height="'+W+'" fill="#fff"/>',N=7,st=W/(N+1),k=st*0.32;
 for(var i=1;i<=N;i++)for(var j=1;j<=N;j++){var x=i-4,y=4-j,sl=f(x,y),ang=Math.atan(Math.max(-6,Math.min(6,sl))),cx=i*st,cy=j*st;
  s+=Q.line(cx-k*Math.cos(ang),cy+k*Math.sin(ang),cx+k*Math.cos(ang),cy-k*Math.sin(ang),Q.col.blue,2)}
 s+=Q.line(0,4*st,W,4*st,'#0C1A33',1)+Q.line(4*st,0,4*st,W,'#0C1A33',1);return Q.svg(W,W,s)};
Q.polar=function(f,W){W=W||220;var c=W/2,sc=W/2.6,pts=[];for(var i=0;i<=360;i++){var th=i*Math.PI/180,r=f(th);pts.push([c+sc*r*Math.cos(th),c-sc*r*Math.sin(th)])}
 var s='<rect width="'+W+'" height="'+W+'" fill="#fff"/>'+Q.line(0,c,W,c,'#cfc6b0',1)+Q.line(c,0,c,W,'#cfc6b0',1)+'<circle cx="'+c+'" cy="'+c+'" r="'+sc+'" fill="none" stroke="#e6dcc6"/>'+Q.path(pts,{stroke:Q.col.red,w:2.6});return Q.svg(W,W,s)};
/* number line with a ray or segment. lo/hi can be null (to infinity); openLo/openHi booleans */
Q.numline=function(lo,hi,openLo,openHi,min,max){min=min==null?-6:min;max=max==null?6:max;var W=300,X=function(v){return 20+(v-min)/(max-min)*(W-40)},s=L(14,40,W-14,40,'#0C1A33',2);
 for(var k=Math.ceil(min);k<=max;k++)s+=L(X(k),35,X(k),45,'#0C1A33',1.5)+T(X(k),60,n(k),{s:10,c:'#5b6678'});
 var a=lo==null?20:X(lo),b=hi==null?W-20:X(hi);s+=L(a,40,b,40,C.red,6);
 if(lo==null)s+='<path d="M20 40l8-6v12z" fill="'+C.red+'"/>';if(hi==null)s+='<path d="M'+(W-20)+' 40l-8-6v12z" fill="'+C.red+'"/>';
 if(lo!=null)s+='<circle cx="'+a+'" cy="40" r="6" fill="'+(openLo?'#fff':C.red)+'" stroke="'+C.red+'" stroke-width="2.5"/>';
 if(hi!=null)s+='<circle cx="'+b+'" cy="40" r="6" fill="'+(openHi?'#fff':C.red)+'" stroke="'+C.red+'" stroke-width="2.5"/>';
 return Q.svg(W,76,s)};
/* histogram of counts for labels */
Q.bars=function(labels,vals,o){o=o||{};var W=300,H=170,m=26,mx=Math.max.apply(null,vals)*1.15,bw=(W-2*m)/vals.length,s=L(m,H-m,W-m,H-m,'#0C1A33',1.6)+L(m,m-6,m,H-m,'#0C1A33',1.6);
 vals.forEach(function(v,i){var h=(H-2*m)*v/mx;s+='<rect x="'+(m+i*bw+3)+'" y="'+(H-m-h)+'" width="'+(bw-6)+'" height="'+h+'" fill="'+(o.c||C.yel)+'" stroke="#0C1A33" stroke-width="1.5"/>'+T(m+i*bw+bw/2,H-m+13,labels[i],{s:10})+(o.noVals?'':T(m+i*bw+bw/2,H-m-h-4,v,{s:10}))});
 return Q.svg(W,H,s)};
/* box plot from five numbers */
Q.box=function(mn,q1,md,q3,mx,min,max){var W=300,X=function(v){return 20+(v-min)/(max-min)*(W-40)},s=L(14,70,W-14,70,'#0C1A33',1.5);
 var step=Math.max(1,Math.round((max-min)/10));for(var k=min;k<=max;k+=step)s+=L(X(k),66,X(k),74,'#0C1A33',1)+T(X(k),88,k,{s:9,c:'#5b6678'});
 s+=L(X(mn),40,X(q1),40,'#0C1A33',2)+L(X(q3),40,X(mx),40,'#0C1A33',2)+L(X(mn),32,X(mn),48,'#0C1A33',2)+L(X(mx),32,X(mx),48,'#0C1A33',2)+'<rect x="'+X(q1)+'" y="26" width="'+(X(q3)-X(q1))+'" height="28" fill="'+C.yel+'" fill-opacity=".5" stroke="#0C1A33" stroke-width="2"/>'+L(X(md),26,X(md),54,C.red,3);
 return Q.svg(W,98,s)};
/* unit circle with a marked angle (degrees) */
Q.unit=function(deg,label){var W=220,c=W/2,r=84,a=deg*Math.PI/180,px=c+r*Math.cos(a),py=c-r*Math.sin(a),s='<rect width="'+W+'" height="'+W+'" fill="#fff"/>'+L(8,c,W-8,c,'#cfc6b0',1.2)+L(c,8,c,W-8,'#cfc6b0',1.2)+'<circle cx="'+c+'" cy="'+c+'" r="'+r+'" fill="#fff8e8" stroke="#0C1A33" stroke-width="2.5"/>';
 s+='<path d="M'+(c+22)+' '+c+'A22 22 0 '+(deg>180?1:0)+' 0 '+(c+22*Math.cos(a))+' '+(c-22*Math.sin(a))+'" fill="none" stroke="'+C.blue+'" stroke-width="2.5"/>'+L(c,c,px,py,C.red,3)+L(px,c,px,py,C.green,2,'4 3')+Q.dot(px,py,C.red,5)+T(c+34,c-8,label||(deg+'\u00b0'),{s:12,c:C.blue})+T(c+r+4,c+14,'1',{s:10,c:'#5b6678'});return Q.svg(W,W,s)};
/* triangle: pts [[x,y]*3] in a 220x160 box, labels for sides [ab,bc,ca], vertex names, right angle at index ra */
Q.tri=function(P,sides,verts,ra,extra){var s=Q.path(P,{close:1,fill:'#fff8e8',stroke:'#0C1A33',w:2.5});
 var mid=function(a,b,off){var mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;var dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;var cx=(P[0][0]+P[1][0]+P[2][0])/3,cy=(P[0][1]+P[1][1]+P[2][1])/3;var nx=-dy/l,ny=dx/l;if((mx-cx)*nx+(my-cy)*ny<0){nx=-nx;ny=-ny}return[mx+nx*off,my+ny*off+4]};
 [[0,1],[1,2],[2,0]].forEach(function(e,i){if(sides&&sides[i]!=null&&sides[i]!==''){var m=mid(P[e[0]],P[e[1]],12);s+=T(m[0],m[1],sides[i],{s:12,c:C.blue})}});
 if(verts)P.forEach(function(p,i){var cx=(P[0][0]+P[1][0]+P[2][0])/3,cy=(P[0][1]+P[1][1]+P[2][1])/3,dx=p[0]-cx,dy=p[1]-cy,l=Math.hypot(dx,dy)||1;s+=T(p[0]+dx/l*11,p[1]+dy/l*11+4,verts[i],{s:12,w:800})});
 if(ra!=null){var p=P[ra],a=P[(ra+1)%3],b=P[(ra+2)%3],u=[a[0]-p[0],a[1]-p[1]],v=[b[0]-p[0],b[1]-p[1]],lu=Math.hypot(u[0],u[1]),lv=Math.hypot(v[0],v[1]),k=11;u=[u[0]/lu*k,u[1]/lu*k];v=[v[0]/lv*k,v[1]/lv*k];s+=Q.path([[p[0]+u[0],p[1]+u[1]],[p[0]+u[0]+v[0],p[1]+u[1]+v[1]],[p[0]+v[0],p[1]+v[1]]],{stroke:'#0C1A33',w:1.5})}
 return Q.svg(220,160,s+(extra||''))};
})(typeof window!=='undefined'?window:global);

var builtinElements=function(e){"use strict";
/*! (c) Andrea Giammarchi - ISC */const t=!0,a=!1,n="querySelectorAll",r="",o="Heading",l="TableCell",d="TableSection",c="Element",i="attributeChangedCallback",s="connectedCallback",u="disconnectedCallback",b="upgradedCallback",g="downgradedCallback",w={A:"Anchor",Caption:"TableCaption",DL:"DList",Dir:"Directory",Img:"Image",OL:"OList",P:"Paragraph",TR:"TableRow",UL:"UList",Article:r,Aside:r,Footer:r,Header:r,Main:r,Nav:r,[c]:r,H1:o,H2:o,H3:o,H4:o,H5:o,H6:o,TD:l,TH:l,TBody:d,TFoot:d,THead:d},{setPrototypeOf:p}=Object,C=new WeakSet,h=new WeakSet,f=new Set,k=(e,t)=>document.createElementNS(t?"http://www.w3.org/2000/svg":"",e),H=new MutationObserver((e=>{for(let t=0;t<e.length;t++){const{target:a,attributeName:n,oldValue:r}=e[t];C.has(a)&&a.attributeChangedCallback(n,r,a.getAttribute(n))}})),T=e=>{f.has(e.constructor)||(C.delete(e),h.delete(e),g in e&&e.downgradedCallback(),p(e,k(e.tagName,"ownerSVGElement"in e).constructor.prototype))},m=(e,t)=>{if(!(e instanceof t)){T(e),p(e,t.prototype),b in e&&e.upgradedCallback();const{observedAttributes:a}=t;if(a&&i in e){C.add(e),H.observe(e,{attributeFilter:a,attributeOldValue:!0,attributes:!0});for(let t=0;t<a.length;t++){const n=a[t],r=e.getAttribute(n);null!=r&&e.attributeChangedCallback(n,null,r)}}(s in e||u in e)&&(h.add(e),e.isConnected&&s in e&&e.connectedCallback())}return e},v=e=>e.toLowerCase(),S=(e,t,a)=>new Proxy(new Map,{get(n,r){if(!n.has(r)){function o(){return m(k(l,a),this.constructor)}const l=e(r),d=self[t(r)];n.set(r,p(o,d)),o.prototype=d.prototype}return n.get(r)}}),A=S(v,(e=>"HTML"+(w[e]||"")+c),!1),L=S((e=>e.replace(/^([A-Z]+?)([A-Z][a-z])/,((e,t,a)=>v(t)+a))),(e=>"SVG"+(e===c?"":e)+c),!0),y=((e,r=document,o=MutationObserver)=>{const l=(a,r,o,d,c)=>{for(const i of a)(c||n in i)&&(d?r.has(i)||(r.add(i),o.delete(i),e(i,d)):o.has(i)||(o.add(i),r.delete(i),e(i,d)),c||l(i[n]("*"),r,o,d,t))},d=new o((e=>{const n=new Set,r=new Set;for(const{addedNodes:o,removedNodes:d}of e)l(d,n,r,a,a),l(o,n,r,t,a)})),{observe:c}=d;return(d.observe=e=>c.call(d,e,{subtree:t,childList:t}))(r),d})(((e,t)=>{if(h.has(e)){const a=t?s:u;a in e&&e[a]()}}));return e.HTML=A,e.SVG=L,e.downgrade=T,e.observer=y,e.upgrade=m,e}({});

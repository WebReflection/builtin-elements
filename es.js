var builtinElements=function(e){"use strict";
/*! (c) Andrea Giammarchi - ISC */const t=!0,a=!1,n="querySelectorAll",r="",o="Heading",l="TableCell",c="TableSection",d="Element",i="attributeChangedCallback",s="connectedCallback",u="disconnectedCallback",b="upgradedCallback",g="downgradedCallback",p={A:"Anchor",Caption:"TableCaption",DL:"DList",Dir:"Directory",Img:"Image",OL:"OList",P:"Paragraph",TR:"TableRow",UL:"UList",Article:r,Aside:r,Footer:r,Header:r,Main:r,Nav:r,[d]:r,H1:o,H2:o,H3:o,H4:o,H5:o,H6:o,TD:l,TH:l,TBody:c,TFoot:c,THead:c},{setPrototypeOf:w}=Object,C=new WeakSet,f=new WeakSet,h=(e,t)=>document.createElementNS(t?"http://www.w3.org/2000/svg":"",e),k=new MutationObserver((e=>{for(let t=0;t<e.length;t++){const{target:a,attributeName:n,oldValue:r}=e[t];C.has(a)&&a.attributeChangedCallback(n,r,a.getAttribute(n))}})),m=e=>{const t=e.constructor;t!==self[t.name]&&(C.delete(e),f.delete(e),g in e&&e.downgradedCallback(),w(e,h(e.tagName,"ownerSVGElement"in e).constructor.prototype))},H=(e,t)=>{if(!(e instanceof t)){m(e),w(e,t.prototype),b in e&&e.upgradedCallback();const{observedAttributes:a}=t;if(a&&i in e){C.add(e),k.observe(e,{attributeFilter:a,attributeOldValue:!0,attributes:!0});for(let t=0;t<a.length;t++){const n=a[t],r=e.getAttribute(n);null!=r&&e.attributeChangedCallback(n,null,r)}}(s in e||u in e)&&(f.add(e),e.isConnected&&s in e&&e.connectedCallback())}return e},T=e=>e.toLowerCase(),v=(e,t,a)=>new Proxy(new Map,{get(n,r){if(!n.has(r)){function o(){return H(h(l,a),this.constructor)}const l=e(r),c=self[t(r)];n.set(r,w(o,c)),o.prototype=c.prototype}return n.get(r)}}),A=v(T,(e=>"HTML"+(p[e]||"")+d),!1),L=v((e=>e.replace(/^([A-Z]+?)([A-Z][a-z])/,((e,t,a)=>T(t)+a))),(e=>"SVG"+(e===d?"":e)+d),!0),S=((e,r=document,o=MutationObserver)=>{const l=(a,r,o,c,d)=>{for(const i of a)(d||n in i)&&(c?r.has(i)||(r.add(i),o.delete(i),e(i,c)):o.has(i)||(o.add(i),r.delete(i),e(i,c)),d||l(i[n]("*"),r,o,c,t))},c=new o((e=>{const n=new Set,r=new Set;for(const{addedNodes:o,removedNodes:c}of e)l(c,n,r,a,a),l(o,n,r,t,a)})),{observe:d}=c;return(c.observe=e=>d.call(c,e,{subtree:t,childList:t}))(r),c})(((e,t)=>{if(f.has(e)){const a=t?s:u;a in e&&e[a]()}}));return e.HTML=A,e.SVG=L,e.downgrade=m,e.observer=S,e.upgrade=H,e}({});

self.builtinElements=function(e){"use strict";const t=!0,n=!1,a="querySelectorAll",o="attributeChangedCallback",r="connectedCallback",l="disconnectedCallback",c="upgradedCallback",d="downgradedCallback",{getOwnPropertyNames:i,setPrototypeOf:s}=Object,u=new WeakMap,b=new WeakMap,g=new Set,w=(e,t)=>t?document.createElementNS("http://www.w3.org/2000/svg",e):document.createElement(e),h=new MutationObserver((e=>{for(let t=0;t<e.length;t++){const{target:n,attributeName:a,oldValue:o}=e[t];u.has(n)&&n.attributeChangedCallback(a,o,n.getAttribute(a))}})),p=e=>{g.has(e.constructor)||(u.delete(e),b.delete(e),d in e&&e.downgradedCallback(),s(e,w(e.tagName,"ownerSVGElement"in e).constructor.prototype))},C=(e,t)=>{if(!(e instanceof t)){p(e),s(e,t.prototype),c in e&&e.upgradedCallback();const{observedAttributes:n}=t;if(n&&o in e){u.set(e,0),h.observe(e,{attributeFilter:n,attributeOldValue:!0,attributes:!0});for(let t=0;t<n.length;t++){const a=n[t],o=e.getAttribute(a);null!=o&&e.attributeChangedCallback(a,null,o)}}(r in e||l in e)&&(b.set(e,0),e.isConnected&&r in e&&e.connectedCallback())}return e},f={},m={},k={Anchor:"A",DList:"DL",Directory:"Dir",Heading:["H6","H5","H4","H3","H2","H1"],Image:"Img",OList:"OL",Paragraph:"P",TableCaption:"Caption",TableCell:["TH","TD"],TableRow:"TR",UList:"UL"};return i(window).forEach((e=>{if(/^(HTML|SVG)/.test(e)){const{$1:t}=RegExp,n="SVG"==t,a=e.slice(t.length,-7)||"Element",o=n?f:m,r=window[e];g.add(r),[].concat(k[a]||a).forEach((e=>{const t=e.toLowerCase();(o[a]=o[e]=function(){return C(w(t,n),this.constructor)}).prototype=r.prototype}))}})),(e=>{const o=(n,r,l,c,d)=>{for(let i=0,{length:s}=n;i<s;i++){const s=n[i];(d||a in s)&&(c?r.has(s)||(r.add(s),l.delete(s),e(s,c)):l.has(s)||(l.add(s),r.delete(s),e(s,c)),d||o((s.shadowRoot||s)[a]("*"),r,l,c,t))}},r=new MutationObserver((e=>{for(let a=new Set,r=new Set,l=0,{length:c}=e;l<c;l++){const{addedNodes:c,removedNodes:d}=e[l];o(d,a,r,n,n),o(c,a,r,t,n)}}));r.observe(document,{subtree:t,childList:t})})(((e,t)=>{if(b.has(e)){const n=t?r:l;n in e&&e[n]()}})),e.HTML=m,e.SVG=f,e.downgrade=p,e.upgrade=C,e}({});

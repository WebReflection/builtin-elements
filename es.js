self.builtinElements=function(e){"use strict";
/*! (c) Andrea Giammarchi - ISC */const t="attributeChangedCallback",n="connectedCallback",a="disconnectedCallback",o="upgradedCallback",r="downgradedCallback",{getOwnPropertyNames:l,setPrototypeOf:c}=Object,i=new WeakMap,s=new WeakMap,d=new Set,u=(e,t)=>t?document.createElementNS("http://www.w3.org/2000/svg",e):document.createElement(e),b=(e,t,n)=>{for(let a=0;a<e.length;a++){const o=e[a];n.has(o)||(n.add(o),s.has(o)&&t in o&&o[t](),b(o.children||[],t,n))}},g=new MutationObserver((e=>{for(let t=0;t<e.length;t++){const{target:n,attributeName:a,oldValue:o}=e[t];i.has(n)&&n.attributeChangedCallback(a,o,n.getAttribute(a))}})),w=e=>{const{constructor:t,tagName:n}=e;d.has(t)||(i.delete(e),s.delete(e),r in e&&e.downgradedCallback(),c(e,u(n,"ownerSVGElement"in e).constructor.prototype))},h=(e,r)=>{if(!(e instanceof r)){w(e);const{observedAttributes:l,prototype:d}=r;if(c(e,d),o in e&&e.upgradedCallback(),l&&t in d){i.set(e,0),g.observe(e,{attributeFilter:l,attributeOldValue:!0,attributes:!0});for(let t=0;t<l.length;t++){const n=l[t],a=e.getAttribute(n);null!=a&&e.attributeChangedCallback(n,null,a)}}(n in e||a in e)&&(s.set(e,0),e.isConnected&&n in e&&e.connectedCallback())}return e},p={},C={},m={Anchor:"A",DList:"DL",Directory:"Dir",Heading:["H6","H5","H4","H3","H2","H1"],Image:"Img",OList:"OL",Paragraph:"P",TableCaption:"Caption",TableCell:["TH","TD"],TableRow:"TR",UList:"UL"};return l(window).forEach((e=>{if(/^(HTML|SVG)/.test(e)){const{$1:t}=RegExp,n="SVG"===t,a=e.slice(t.length,-7)||"Element",o=n?p:C,r=window[e];d.add(r),[].concat(m[a]||a).forEach((e=>{const t=e.toLowerCase();(o[a]=o[e]=function(){return h(u(t,n),this.constructor)}).prototype=r.prototype}))}})),new MutationObserver((e=>{for(let t=0;t<e.length;t++){const{addedNodes:o,removedNodes:r}=e[t];b(r,a,new Set),b(o,n,new Set)}})).observe(document,{subtree:!0,childList:!0}),e.HTML=C,e.SVG=p,e.downgrade=w,e.upgrade=h,e}({});

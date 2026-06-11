(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))a(i);new MutationObserver(i=>{for(const c of i)if(c.type==="childList")for(const g of c.addedNodes)g.tagName==="LINK"&&g.rel==="modulepreload"&&a(g)}).observe(document,{childList:!0,subtree:!0});function t(i){const c={};return i.integrity&&(c.integrity=i.integrity),i.referrerPolicy&&(c.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?c.credentials="include":i.crossOrigin==="anonymous"?c.credentials="omit":c.credentials="same-origin",c}function a(i){if(i.ep)return;i.ep=!0;const c=t(i);fetch(i.href,c)}})();function ke(e){try{const n=localStorage.getItem(e);return n?JSON.parse(n):{}}catch{return{}}}function Ce(e,n){localStorage.setItem(e,JSON.stringify(n))}function ze(e){localStorage.removeItem(e)}function He(){const e=localStorage.getItem("srs:all");!e||localStorage.getItem("srs:javascript")||(localStorage.setItem("srs:javascript",e),localStorage.removeItem("srs:all"))}const Oe="modulepreload",Ne=function(e){return"/"+e},Fe={},U=function(n,t,a){let i=Promise.resolve();if(t&&t.length>0){document.getElementsByTagName("link");const g=document.querySelector("meta[property=csp-nonce]"),o=(g==null?void 0:g.nonce)||(g==null?void 0:g.getAttribute("nonce"));i=Promise.allSettled(t.map(h=>{if(h=Ne(h),h in Fe)return;Fe[h]=!0;const m=h.endsWith(".css"),F=m?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${h}"]${F}`))return;const b=document.createElement("link");if(b.rel=m?"stylesheet":Oe,m||(b.as="script"),b.crossOrigin="",b.href=h,o&&b.setAttribute("nonce",o),document.head.appendChild(b),m)return new Promise((w,A)=>{b.addEventListener("load",w),b.addEventListener("error",()=>A(new Error(`Unable to preload CSS for ${h}`)))})}))}function c(g){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=g,window.dispatchEvent(o),!o.defaultPrevented)throw g}return i.then(g=>{for(const o of g||[])o.status==="rejected"&&c(o.reason);return n().catch(c)})},Ee={javascript:{id:"javascript",label:"JavaScript",icon:"JS",color:"#f7df1e",storageKey:"srs:javascript",loadData:()=>U(()=>import("./javascript-DXvxpGUl.js"),[])},react:{id:"react",label:"React",icon:"⚛",color:"#61dafb",storageKey:"srs:react",loadData:()=>U(()=>import("./react-Cxu1MB41.js"),[])},node:{id:"node",label:"Node.js",icon:"No",color:"#8cc84b",storageKey:"srs:node",loadData:()=>U(()=>import("./node-ANg3FMVl.js"),[])},typescript:{id:"typescript",label:"TypeScript",icon:"TS",color:"#3178c6",storageKey:"srs:typescript",loadData:()=>U(()=>import("./typescript-UIP2cYDg.js"),[])},aws:{id:"aws",label:"AWS SAA",icon:"☁",color:"#ff9900",storageKey:"srs:aws",loadData:()=>U(()=>import("./aws-3d38fGAY.js"),[])}};function Ge(e){return Ee[e]??null}function Ze(){return Object.values(Ee)}const K=864e5;function Ue(e){return{id:e,phase:"learning",interval:0,ease:2.5,nextDue:0,lastReviewed:null,totalSeen:0}}function Y(e){if("phase"in e)return e;const n={1:0,2:1,3:3,4:7,5:14};return{id:e.id,phase:(e.box??1)<=1?"learning":"review",interval:n[e.box??1]??0,ease:2.5,nextDue:e.nextDue??0,lastReviewed:e.lastReviewed??null,totalSeen:e.totalSeen??0}}function H(e,n){const t=n[e];return t?Y(t):Ue(e)}function Ae(e,n){const t=Date.now(),a={...e,totalSeen:e.totalSeen+1,lastReviewed:t};if(e.phase==="learning")return{...a,phase:"review",interval:3,nextDue:t+3*K};if(n==="hard"){const g=Math.max(1.3,e.ease-.15),o=Math.max(1,Math.round(e.interval*1.2));return{...a,ease:g,interval:o,nextDue:t+o*K}}if(n==="good"){const g=Math.max(2,Math.round(e.interval*e.ease));return{...a,interval:g,nextDue:t+g*K}}const i=Math.min(3,e.ease+.15),c=Math.max(3,Math.round(e.interval*e.ease*1.3));return{...a,ease:i,interval:c,nextDue:t+c*K}}function Ke(e,n){const t=Date.now(),a=n==="hard"?1:n==="easy"?3:2;return{...e,phase:"review",interval:a,nextDue:t+a*K,lastReviewed:t,totalSeen:e.totalSeen+1}}function ee(e){if(e.phase==="learning")return{hard:"again",good:"later",easy:"3d"};const n=Math.max(1,Math.round(e.interval*1.2)),t=Math.max(2,Math.round(e.interval*e.ease)),a=Math.max(3,Math.round(e.interval*e.ease*1.3));return{hard:`${n}d`,good:`${t}d`,easy:`${a}d`}}function Qe(e,n){const t=Date.now(),a=e.filter(i=>{const c=n[i.id];return c?Y(c).nextDue<=t:!0});for(let i=a.length-1;i>0;i--){const c=Math.floor(Math.random()*(i+1));[a[i],a[c]]=[a[c],a[i]]}return a}function ue(e,n){const t=Date.now();let a=0,i=0,c=0,g=0;for(const o of e){const h=n[o.id],m=h?Y(h):null;(m==null?void 0:m.lastReviewed)!=null&&a++,(m==null?void 0:m.phase)==="review"&&m.interval>=7&&i++,(!m||m.nextDue<=t)&&c++,(m==null?void 0:m.phase)==="learning"&&m.totalSeen>0&&g++}return{total:e.length,attempted:a,mastered:i,dueToday:c,inLearning:g}}function We(e){const n=Date.now(),t=Object.values(e).map(a=>Y(a).nextDue).filter(a=>a>n);return t.length?Math.min(...t):null}function te(e){return e.type?e.type:e.answers?"multiple-response":e.options?"multiple-choice":"reveal"}function de(e,n){return e.filter(t=>!(n.topic&&t.topic!==n.topic||n.difficulty&&t.difficulty!==n.difficulty||n.type&&te(t)!==n.type||n.tag&&!(t.tags??[]).includes(n.tag)))}function Je(e,n,t,a){const i=de(e,t),c=Qe(i,n);return a===1/0?c:c.slice(0,a)}function Ve(e,n,t){if(n)return e.slice(1);if(t==="hard"){const a=e.slice(1),i=Math.min(2,a.length);return[...a.slice(0,i),e[0],...a.slice(i)]}return[...e.slice(1),e[0]]}const oe=new Map,Le=[];function ne(e,n){if(e.includes(":")){const t=[],a=new RegExp("^"+e.replace(/:([^/]+)/g,(i,c)=>(t.push(c),"([^/]+)"))+"$");Le.push({regex:a,keys:t,fn:n})}else oe.set(e,n)}function q(e){history.pushState(null,"",e),ce()}function Xe(e){history.replaceState(null,"",e)}function ce(){var n;const e=oe.get(location.pathname);if(e){e();return}for(const{regex:t,keys:a,fn:i}of Le){const c=location.pathname.match(t);if(c){const g=Object.fromEntries(a.map((o,h)=>[o,decodeURIComponent(c[h+1])]));i(g);return}}(n=oe.get("/"))==null||n()}function Ye(){window.addEventListener("popstate",ce),ce()}var Se=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function et(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var Me={exports:{}};(function(e){var n=typeof window<"u"?window:typeof WorkerGlobalScope<"u"&&self instanceof WorkerGlobalScope?self:{};/**
 * Prism: Lightweight, robust, elegant syntax highlighting
 *
 * @license MIT <https://opensource.org/licenses/MIT>
 * @author Lea Verou <https://lea.verou.me>
 * @namespace
 * @public
 */var t=function(a){var i=/(?:^|\s)lang(?:uage)?-([\w-]+)(?=\s|$)/i,c=0,g={},o={manual:a.Prism&&a.Prism.manual,disableWorkerMessageHandler:a.Prism&&a.Prism.disableWorkerMessageHandler,util:{encode:function l(s){return s instanceof h?new h(s.type,l(s.content),s.alias):Array.isArray(s)?s.map(l):s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\u00a0/g," ")},type:function(l){return Object.prototype.toString.call(l).slice(8,-1)},objId:function(l){return l.__id||Object.defineProperty(l,"__id",{value:++c}),l.__id},clone:function l(s,r){r=r||{};var u,d;switch(o.util.type(s)){case"Object":if(d=o.util.objId(s),r[d])return r[d];u={},r[d]=u;for(var f in s)s.hasOwnProperty(f)&&(u[f]=l(s[f],r));return u;case"Array":return d=o.util.objId(s),r[d]?r[d]:(u=[],r[d]=u,s.forEach(function(y,p){u[p]=l(y,r)}),u);default:return s}},getLanguage:function(l){for(;l;){var s=i.exec(l.className);if(s)return s[1].toLowerCase();l=l.parentElement}return"none"},setLanguage:function(l,s){l.className=l.className.replace(RegExp(i,"gi"),""),l.classList.add("language-"+s)},currentScript:function(){if(typeof document>"u")return null;if(document.currentScript&&document.currentScript.tagName==="SCRIPT")return document.currentScript;try{throw new Error}catch(u){var l=(/at [^(\r\n]*\((.*):[^:]+:[^:]+\)$/i.exec(u.stack)||[])[1];if(l){var s=document.getElementsByTagName("script");for(var r in s)if(s[r].src==l)return s[r]}return null}},isActive:function(l,s,r){for(var u="no-"+s;l;){var d=l.classList;if(d.contains(s))return!0;if(d.contains(u))return!1;l=l.parentElement}return!!r}},languages:{plain:g,plaintext:g,text:g,txt:g,extend:function(l,s){var r=o.util.clone(o.languages[l]);for(var u in s)r[u]=s[u];return r},insertBefore:function(l,s,r,u){u=u||o.languages;var d=u[l],f={};for(var y in d)if(d.hasOwnProperty(y)){if(y==s)for(var p in r)r.hasOwnProperty(p)&&(f[p]=r[p]);r.hasOwnProperty(y)||(f[y]=d[y])}var v=u[l];return u[l]=f,o.languages.DFS(o.languages,function(k,P){P===v&&k!=l&&(this[k]=f)}),f},DFS:function l(s,r,u,d){d=d||{};var f=o.util.objId;for(var y in s)if(s.hasOwnProperty(y)){r.call(s,y,s[y],u||y);var p=s[y],v=o.util.type(p);v==="Object"&&!d[f(p)]?(d[f(p)]=!0,l(p,r,null,d)):v==="Array"&&!d[f(p)]&&(d[f(p)]=!0,l(p,r,y,d))}}},plugins:{},highlightAll:function(l,s){o.highlightAllUnder(document,l,s)},highlightAllUnder:function(l,s,r){var u={callback:r,container:l,selector:'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'};o.hooks.run("before-highlightall",u),u.elements=Array.prototype.slice.apply(u.container.querySelectorAll(u.selector)),o.hooks.run("before-all-elements-highlight",u);for(var d=0,f;f=u.elements[d++];)o.highlightElement(f,s===!0,u.callback)},highlightElement:function(l,s,r){var u=o.util.getLanguage(l),d=o.languages[u];o.util.setLanguage(l,u);var f=l.parentElement;f&&f.nodeName.toLowerCase()==="pre"&&o.util.setLanguage(f,u);var y=l.textContent,p={element:l,language:u,grammar:d,code:y};function v(P){p.highlightedCode=P,o.hooks.run("before-insert",p),p.element.innerHTML=p.highlightedCode,o.hooks.run("after-highlight",p),o.hooks.run("complete",p),r&&r.call(p.element)}if(o.hooks.run("before-sanity-check",p),f=p.element.parentElement,f&&f.nodeName.toLowerCase()==="pre"&&!f.hasAttribute("tabindex")&&f.setAttribute("tabindex","0"),!p.code){o.hooks.run("complete",p),r&&r.call(p.element);return}if(o.hooks.run("before-highlight",p),!p.grammar){v(o.util.encode(p.code));return}if(s&&a.Worker){var k=new Worker(o.filename);k.onmessage=function(P){v(P.data)},k.postMessage(JSON.stringify({language:p.language,code:p.code,immediateClose:!0}))}else v(o.highlight(p.code,p.grammar,p.language))},highlight:function(l,s,r){var u={code:l,grammar:s,language:r};if(o.hooks.run("before-tokenize",u),!u.grammar)throw new Error('The language "'+u.language+'" has no grammar.');return u.tokens=o.tokenize(u.code,u.grammar),o.hooks.run("after-tokenize",u),h.stringify(o.util.encode(u.tokens),u.language)},tokenize:function(l,s){var r=s.rest;if(r){for(var u in r)s[u]=r[u];delete s.rest}var d=new b;return w(d,d.head,l),F(l,d,s,d.head,0),M(d)},hooks:{all:{},add:function(l,s){var r=o.hooks.all;r[l]=r[l]||[],r[l].push(s)},run:function(l,s){var r=o.hooks.all[l];if(!(!r||!r.length))for(var u=0,d;d=r[u++];)d(s)}},Token:h};a.Prism=o;function h(l,s,r,u){this.type=l,this.content=s,this.alias=r,this.length=(u||"").length|0}h.stringify=function l(s,r){if(typeof s=="string")return s;if(Array.isArray(s)){var u="";return s.forEach(function(v){u+=l(v,r)}),u}var d={type:s.type,content:l(s.content,r),tag:"span",classes:["token",s.type],attributes:{},language:r},f=s.alias;f&&(Array.isArray(f)?Array.prototype.push.apply(d.classes,f):d.classes.push(f)),o.hooks.run("wrap",d);var y="";for(var p in d.attributes)y+=" "+p+'="'+(d.attributes[p]||"").replace(/"/g,"&quot;")+'"';return"<"+d.tag+' class="'+d.classes.join(" ")+'"'+y+">"+d.content+"</"+d.tag+">"};function m(l,s,r,u){l.lastIndex=s;var d=l.exec(r);if(d&&u&&d[1]){var f=d[1].length;d.index+=f,d[0]=d[0].slice(f)}return d}function F(l,s,r,u,d,f){for(var y in r)if(!(!r.hasOwnProperty(y)||!r[y])){var p=r[y];p=Array.isArray(p)?p:[p];for(var v=0;v<p.length;++v){if(f&&f.cause==y+","+v)return;var k=p[v],P=k.inside,ye=!!k.lookbehind,we=!!k.greedy,Pe=k.alias;if(we&&!k.pattern.global){var Re=k.pattern.toString().match(/[imsuy]*$/)[0];k.pattern=RegExp(k.pattern.source,Re+"g")}for(var $e=k.pattern||k,j=u.next,R=d;j!==s.tail&&!(f&&R>=f.reach);R+=j.value.length,j=j.next){var O=j.value;if(s.length>l.length)return;if(!(O instanceof h)){var Q=1,I;if(we){if(I=m($e,R,l,ye),!I||I.index>=l.length)break;var W=I.index,qe=I.index+I[0].length,C=R;for(C+=j.value.length;W>=C;)j=j.next,C+=j.value.length;if(C-=j.value.length,R=C,j.value instanceof h)continue;for(var Z=j;Z!==s.tail&&(C<qe||typeof Z.value=="string");Z=Z.next)Q++,C+=Z.value.length;Q--,O=l.slice(R,C),I.index-=R}else if(I=m($e,0,O,ye),!I)continue;var W=I.index,J=I[0],se=O.slice(0,W),xe=O.slice(W+J.length),re=R+O.length;f&&re>f.reach&&(f.reach=re);var V=j.prev;se&&(V=w(s,V,se),R+=se.length),A(s,V,Q);var Be=new h(y,P?o.tokenize(J,P):J,Pe,J);if(j=w(s,V,Be),xe&&w(s,j,xe),Q>1){var ie={cause:y+","+v,reach:re};F(l,s,r,j.prev,R,ie),f&&ie.reach>f.reach&&(f.reach=ie.reach)}}}}}}function b(){var l={value:null,prev:null,next:null},s={value:null,prev:l,next:null};l.next=s,this.head=l,this.tail=s,this.length=0}function w(l,s,r){var u=s.next,d={value:r,prev:s,next:u};return s.next=d,u.prev=d,l.length++,d}function A(l,s,r){for(var u=s.next,d=0;d<r&&u!==l.tail;d++)u=u.next;s.next=u,u.prev=s,l.length-=d}function M(l){for(var s=[],r=l.head.next;r!==l.tail;)s.push(r.value),r=r.next;return s}if(!a.document)return a.addEventListener&&(o.disableWorkerMessageHandler||a.addEventListener("message",function(l){var s=JSON.parse(l.data),r=s.language,u=s.code,d=s.immediateClose;a.postMessage(o.highlight(u,o.languages[r],r)),d&&a.close()},!1)),o;var S=o.util.currentScript();S&&(o.filename=S.src,S.hasAttribute("data-manual")&&(o.manual=!0));function $(){o.manual||o.highlightAll()}if(!o.manual){var E=document.readyState;E==="loading"||E==="interactive"&&S&&S.defer?document.addEventListener("DOMContentLoaded",$):window.requestAnimationFrame?window.requestAnimationFrame($):window.setTimeout($,16)}return o}(n);e.exports&&(e.exports=t),typeof Se<"u"&&(Se.Prism=t),t.languages.markup={comment:{pattern:/<!--(?:(?!<!--)[\s\S])*?-->/,greedy:!0},prolog:{pattern:/<\?[\s\S]+?\?>/,greedy:!0},doctype:{pattern:/<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i,greedy:!0,inside:{"internal-subset":{pattern:/(^[^\[]*\[)[\s\S]+(?=\]>$)/,lookbehind:!0,greedy:!0,inside:null},string:{pattern:/"[^"]*"|'[^']*'/,greedy:!0},punctuation:/^<!|>$|[[\]]/,"doctype-tag":/^DOCTYPE/i,name:/[^\s<>'"]+/}},cdata:{pattern:/<!\[CDATA\[[\s\S]*?\]\]>/i,greedy:!0},tag:{pattern:/<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/,greedy:!0,inside:{tag:{pattern:/^<\/?[^\s>\/]+/,inside:{punctuation:/^<\/?/,namespace:/^[^\s>\/:]+:/}},"special-attr":[],"attr-value":{pattern:/=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,inside:{punctuation:[{pattern:/^=/,alias:"attr-equals"},{pattern:/^(\s*)["']|["']$/,lookbehind:!0}]}},punctuation:/\/?>/,"attr-name":{pattern:/[^\s>\/]+/,inside:{namespace:/^[^\s>\/:]+:/}}}},entity:[{pattern:/&[\da-z]{1,8};/i,alias:"named-entity"},/&#x?[\da-f]{1,8};/i]},t.languages.markup.tag.inside["attr-value"].inside.entity=t.languages.markup.entity,t.languages.markup.doctype.inside["internal-subset"].inside=t.languages.markup,t.hooks.add("wrap",function(a){a.type==="entity"&&(a.attributes.title=a.content.replace(/&amp;/,"&"))}),Object.defineProperty(t.languages.markup.tag,"addInlined",{value:function(i,c){var g={};g["language-"+c]={pattern:/(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,lookbehind:!0,inside:t.languages[c]},g.cdata=/^<!\[CDATA\[|\]\]>$/i;var o={"included-cdata":{pattern:/<!\[CDATA\[[\s\S]*?\]\]>/i,inside:g}};o["language-"+c]={pattern:/[\s\S]+/,inside:t.languages[c]};var h={};h[i]={pattern:RegExp(/(<__[^>]*>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(/__/g,function(){return i}),"i"),lookbehind:!0,greedy:!0,inside:o},t.languages.insertBefore("markup","cdata",h)}}),Object.defineProperty(t.languages.markup.tag,"addAttribute",{value:function(a,i){t.languages.markup.tag.inside["special-attr"].push({pattern:RegExp(/(^|["'\s])/.source+"(?:"+a+")"+/\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))/.source,"i"),lookbehind:!0,inside:{"attr-name":/^[^\s=]+/,"attr-value":{pattern:/=[\s\S]+/,inside:{value:{pattern:/(^=\s*(["']|(?!["'])))\S[\s\S]*(?=\2$)/,lookbehind:!0,alias:[i,"language-"+i],inside:t.languages[i]},punctuation:[{pattern:/^=/,alias:"attr-equals"},/"|'/]}}}})}}),t.languages.html=t.languages.markup,t.languages.mathml=t.languages.markup,t.languages.svg=t.languages.markup,t.languages.xml=t.languages.extend("markup",{}),t.languages.ssml=t.languages.xml,t.languages.atom=t.languages.xml,t.languages.rss=t.languages.xml,function(a){var i=/(?:"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n])*')/;a.languages.css={comment:/\/\*[\s\S]*?\*\//,atrule:{pattern:RegExp("@[\\w-](?:"+/[^;{\s"']|\s+(?!\s)/.source+"|"+i.source+")*?"+/(?:;|(?=\s*\{))/.source),inside:{rule:/^@[\w-]+/,"selector-function-argument":{pattern:/(\bselector\s*\(\s*(?![\s)]))(?:[^()\s]|\s+(?![\s)])|\((?:[^()]|\([^()]*\))*\))+(?=\s*\))/,lookbehind:!0,alias:"selector"},keyword:{pattern:/(^|[^\w-])(?:and|not|only|or)(?![\w-])/,lookbehind:!0}}},url:{pattern:RegExp("\\burl\\((?:"+i.source+"|"+/(?:[^\\\r\n()"']|\\[\s\S])*/.source+")\\)","i"),greedy:!0,inside:{function:/^url/i,punctuation:/^\(|\)$/,string:{pattern:RegExp("^"+i.source+"$"),alias:"url"}}},selector:{pattern:RegExp(`(^|[{}\\s])[^{}\\s](?:[^{};"'\\s]|\\s+(?![\\s{])|`+i.source+")*(?=\\s*\\{)"),lookbehind:!0},string:{pattern:i,greedy:!0},property:{pattern:/(^|[^-\w\xA0-\uFFFF])(?!\s)[-_a-z\xA0-\uFFFF](?:(?!\s)[-\w\xA0-\uFFFF])*(?=\s*:)/i,lookbehind:!0},important:/!important\b/i,function:{pattern:/(^|[^-a-z0-9])[-a-z0-9]+(?=\()/i,lookbehind:!0},punctuation:/[(){};:,]/},a.languages.css.atrule.inside.rest=a.languages.css;var c=a.languages.markup;c&&(c.tag.addInlined("style","css"),c.tag.addAttribute("style","css"))}(t),t.languages.clike={comment:[{pattern:/(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,lookbehind:!0,greedy:!0},{pattern:/(^|[^\\:])\/\/.*/,lookbehind:!0,greedy:!0}],string:{pattern:/(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,greedy:!0},"class-name":{pattern:/(\b(?:class|extends|implements|instanceof|interface|new|trait)\s+|\bcatch\s+\()[\w.\\]+/i,lookbehind:!0,inside:{punctuation:/[.\\]/}},keyword:/\b(?:break|catch|continue|do|else|finally|for|function|if|in|instanceof|new|null|return|throw|try|while)\b/,boolean:/\b(?:false|true)\b/,function:/\b\w+(?=\()/,number:/\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,operator:/[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,punctuation:/[{}[\];(),.:]/},t.languages.javascript=t.languages.extend("clike",{"class-name":[t.languages.clike["class-name"],{pattern:/(^|[^$\w\xA0-\uFFFF])(?!\s)[_$A-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\.(?:constructor|prototype))/,lookbehind:!0}],keyword:[{pattern:/((?:^|\})\s*)catch\b/,lookbehind:!0},{pattern:/(^|[^.]|\.\.\.\s*)\b(?:as|assert(?=\s*\{)|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally(?=\s*(?:\{|$))|for|from(?=\s*(?:['"]|$))|function|(?:get|set)(?=\s*(?:[#\[$\w\xA0-\uFFFF]|$))|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,lookbehind:!0}],function:/#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,number:{pattern:RegExp(/(^|[^\w$])/.source+"(?:"+(/NaN|Infinity/.source+"|"+/0[bB][01]+(?:_[01]+)*n?/.source+"|"+/0[oO][0-7]+(?:_[0-7]+)*n?/.source+"|"+/0[xX][\dA-Fa-f]+(?:_[\dA-Fa-f]+)*n?/.source+"|"+/\d+(?:_\d+)*n/.source+"|"+/(?:\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\.\d+(?:_\d+)*)(?:[Ee][+-]?\d+(?:_\d+)*)?/.source)+")"+/(?![\w$])/.source),lookbehind:!0},operator:/--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/}),t.languages.javascript["class-name"][0].pattern=/(\b(?:class|extends|implements|instanceof|interface|new)\s+)[\w.\\]+/,t.languages.insertBefore("javascript","keyword",{regex:{pattern:RegExp(/((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)/.source+/\//.source+"(?:"+/(?:\[(?:[^\]\\\r\n]|\\.)*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}/.source+"|"+/(?:\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.)*\])*\])*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}v[dgimyus]{0,7}/.source+")"+/(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/.source),lookbehind:!0,greedy:!0,inside:{"regex-source":{pattern:/^(\/)[\s\S]+(?=\/[a-z]*$)/,lookbehind:!0,alias:"language-regex",inside:t.languages.regex},"regex-delimiter":/^\/|\/$/,"regex-flags":/^[a-z]+$/}},"function-variable":{pattern:/#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/,alias:"function"},parameter:[{pattern:/(function(?:\s+(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)?\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\))/,lookbehind:!0,inside:t.languages.javascript},{pattern:/(^|[^$\w\xA0-\uFFFF])(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=>)/i,lookbehind:!0,inside:t.languages.javascript},{pattern:/(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/,lookbehind:!0,inside:t.languages.javascript},{pattern:/((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/,lookbehind:!0,inside:t.languages.javascript}],constant:/\b[A-Z](?:[A-Z_]|\dx?)*\b/}),t.languages.insertBefore("javascript","string",{hashbang:{pattern:/^#!.*/,greedy:!0,alias:"comment"},"template-string":{pattern:/`(?:\\[\s\S]|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}|(?!\$\{)[^\\`])*`/,greedy:!0,inside:{"template-punctuation":{pattern:/^`|`$/,alias:"string"},interpolation:{pattern:/((?:^|[^\\])(?:\\{2})*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}/,lookbehind:!0,inside:{"interpolation-punctuation":{pattern:/^\$\{|\}$/,alias:"punctuation"},rest:t.languages.javascript}},string:/[\s\S]+/}},"string-property":{pattern:/((?:^|[,{])[ \t]*)(["'])(?:\\(?:\r\n|[\s\S])|(?!\2)[^\\\r\n])*\2(?=\s*:)/m,lookbehind:!0,greedy:!0,alias:"property"}}),t.languages.insertBefore("javascript","operator",{"literal-property":{pattern:/((?:^|[,{])[ \t]*)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*:)/m,lookbehind:!0,alias:"property"}}),t.languages.markup&&(t.languages.markup.tag.addInlined("script","javascript"),t.languages.markup.tag.addAttribute(/on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)/.source,"javascript")),t.languages.js=t.languages.javascript,function(){if(typeof t>"u"||typeof document>"u")return;Element.prototype.matches||(Element.prototype.matches=Element.prototype.msMatchesSelector||Element.prototype.webkitMatchesSelector);var a="Loading…",i=function(S,$){return"✖ Error "+S+" while fetching file: "+$},c="✖ Error: File does not exist or is empty",g={js:"javascript",py:"python",rb:"ruby",ps1:"powershell",psm1:"powershell",sh:"bash",bat:"batch",h:"c",tex:"latex"},o="data-src-status",h="loading",m="loaded",F="failed",b="pre[data-src]:not(["+o+'="'+m+'"]):not(['+o+'="'+h+'"])';function w(S,$,E){var l=new XMLHttpRequest;l.open("GET",S,!0),l.onreadystatechange=function(){l.readyState==4&&(l.status<400&&l.responseText?$(l.responseText):l.status>=400?E(i(l.status,l.statusText)):E(c))},l.send(null)}function A(S){var $=/^\s*(\d+)\s*(?:(,)\s*(?:(\d+)\s*)?)?$/.exec(S||"");if($){var E=Number($[1]),l=$[2],s=$[3];return l?s?[E,Number(s)]:[E,void 0]:[E,E]}}t.hooks.add("before-highlightall",function(S){S.selector+=", "+b}),t.hooks.add("before-sanity-check",function(S){var $=S.element;if($.matches(b)){S.code="",$.setAttribute(o,h);var E=$.appendChild(document.createElement("CODE"));E.textContent=a;var l=$.getAttribute("data-src"),s=S.language;if(s==="none"){var r=(/\.(\w+)$/.exec(l)||[,"none"])[1];s=g[r]||r}t.util.setLanguage(E,s),t.util.setLanguage($,s);var u=t.plugins.autoloader;u&&u.loadLanguages(s),w(l,function(d){$.setAttribute(o,m);var f=A($.getAttribute("data-range"));if(f){var y=d.split(/\r\n?|\n/g),p=f[0],v=f[1]==null?y.length:f[1];p<0&&(p+=y.length),p=Math.max(0,Math.min(p-1,y.length)),v<0&&(v+=y.length),v=Math.max(0,Math.min(v,y.length)),d=y.slice(p,v).join(`
`),$.hasAttribute("data-start")||$.setAttribute("data-start",String(p+1))}E.textContent=d,t.highlightElement(E)},function(d){$.setAttribute(o,F),E.textContent=d})}}),t.plugins.fileHighlight={highlight:function($){for(var E=($||document).querySelectorAll(b),l=0,s;s=E[l++];)t.highlightElement(s)}};var M=!1;t.fileHighlight=function(){M||(console.warn("Prism.fileHighlight is deprecated. Use `Prism.plugins.fileHighlight.highlight` instead."),M=!0),t.plugins.fileHighlight.highlight.apply(this,arguments)}}()})(Me);var tt=Me.exports;const le=et(tt);Prism.languages.javascript=Prism.languages.extend("clike",{"class-name":[Prism.languages.clike["class-name"],{pattern:/(^|[^$\w\xA0-\uFFFF])(?!\s)[_$A-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\.(?:constructor|prototype))/,lookbehind:!0}],keyword:[{pattern:/((?:^|\})\s*)catch\b/,lookbehind:!0},{pattern:/(^|[^.]|\.\.\.\s*)\b(?:as|assert(?=\s*\{)|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally(?=\s*(?:\{|$))|for|from(?=\s*(?:['"]|$))|function|(?:get|set)(?=\s*(?:[#\[$\w\xA0-\uFFFF]|$))|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,lookbehind:!0}],function:/#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,number:{pattern:RegExp(/(^|[^\w$])/.source+"(?:"+(/NaN|Infinity/.source+"|"+/0[bB][01]+(?:_[01]+)*n?/.source+"|"+/0[oO][0-7]+(?:_[0-7]+)*n?/.source+"|"+/0[xX][\dA-Fa-f]+(?:_[\dA-Fa-f]+)*n?/.source+"|"+/\d+(?:_\d+)*n/.source+"|"+/(?:\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\.\d+(?:_\d+)*)(?:[Ee][+-]?\d+(?:_\d+)*)?/.source)+")"+/(?![\w$])/.source),lookbehind:!0},operator:/--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/});Prism.languages.javascript["class-name"][0].pattern=/(\b(?:class|extends|implements|instanceof|interface|new)\s+)[\w.\\]+/;Prism.languages.insertBefore("javascript","keyword",{regex:{pattern:RegExp(/((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)/.source+/\//.source+"(?:"+/(?:\[(?:[^\]\\\r\n]|\\.)*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}/.source+"|"+/(?:\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.)*\])*\])*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}v[dgimyus]{0,7}/.source+")"+/(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/.source),lookbehind:!0,greedy:!0,inside:{"regex-source":{pattern:/^(\/)[\s\S]+(?=\/[a-z]*$)/,lookbehind:!0,alias:"language-regex",inside:Prism.languages.regex},"regex-delimiter":/^\/|\/$/,"regex-flags":/^[a-z]+$/}},"function-variable":{pattern:/#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/,alias:"function"},parameter:[{pattern:/(function(?:\s+(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)?\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\))/,lookbehind:!0,inside:Prism.languages.javascript},{pattern:/(^|[^$\w\xA0-\uFFFF])(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=>)/i,lookbehind:!0,inside:Prism.languages.javascript},{pattern:/(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/,lookbehind:!0,inside:Prism.languages.javascript},{pattern:/((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/,lookbehind:!0,inside:Prism.languages.javascript}],constant:/\b[A-Z](?:[A-Z_]|\dx?)*\b/});Prism.languages.insertBefore("javascript","string",{hashbang:{pattern:/^#!.*/,greedy:!0,alias:"comment"},"template-string":{pattern:/`(?:\\[\s\S]|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}|(?!\$\{)[^\\`])*`/,greedy:!0,inside:{"template-punctuation":{pattern:/^`|`$/,alias:"string"},interpolation:{pattern:/((?:^|[^\\])(?:\\{2})*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}/,lookbehind:!0,inside:{"interpolation-punctuation":{pattern:/^\$\{|\}$/,alias:"punctuation"},rest:Prism.languages.javascript}},string:/[\s\S]+/}},"string-property":{pattern:/((?:^|[,{])[ \t]*)(["'])(?:\\(?:\r\n|[\s\S])|(?!\2)[^\\\r\n])*\2(?=\s*:)/m,lookbehind:!0,greedy:!0,alias:"property"}});Prism.languages.insertBefore("javascript","operator",{"literal-property":{pattern:/((?:^|[,{])[ \t]*)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*:)/m,lookbehind:!0,alias:"property"}});Prism.languages.markup&&(Prism.languages.markup.tag.addInlined("script","javascript"),Prism.languages.markup.tag.addAttribute(/on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)/.source,"javascript"));Prism.languages.js=Prism.languages.javascript;const T=()=>document.getElementById("app");function x(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function D(e){return e?e.split(/(```(?:\w+)?\n[\s\S]*?```)/g).map(t=>{const a=t.match(/^```(\w+)?\n([\s\S]*?)```$/);if(a){const i=a[1]==="js"?"javascript":a[1]||"javascript",c=le.languages[i]??le.languages.javascript;return`<pre class="code-block"><code>${le.highlight(a[2],c,i)}</code></pre>`}return x(t).split(/(`[^`\n]+`)/g).map(i=>{const c=i.match(/^`([^`\n]+)`$/);return c?`<code class="inline-code">${c[1]}</code>`:i.replace(/\*\*([^*\n]+)\*\*/g,"<strong>$1</strong>").replace(/\*([^*\n]+)\*/g,"<em>$1</em>")}).join("").replace(/\n/g,"<br>")}).join(""):""}function nt(e){return e?e.replace(/```[\s\S]*?```/g,"[code]").replace(/`([^`\n]+)`/g,"$1"):""}function je(e){const n=e.slice();for(let t=n.length-1;t>0;t--){const a=Math.floor(Math.random()*(t+1));[n[t],n[a]]=[n[a],n[t]]}return n}function pe(e){return`<span class="badge badge-${e}">${e}</span>`}function _e(e){const n=te(e);return n==="multiple-choice"?"MCQ":n==="multiple-response"?"Multi":"reveal"}function at({phase:e,streak:n,interval:t}){return e==="learning"?`<span class="badge badge-learning">Learning · ${n}/2</span>`:`<span class="badge badge-review">Review · ${t}d</span>`}function N(e,n){return`
    <div class="card-meta">
      <span class="badge">${x(e.topic)}</span>
      ${pe(e.difficulty)}
      <span class="badge">${_e(e)}</span>
      ${n?at(n):""}
    </div>`}function G(e){return`
    <div class="session-header">
      <button class="exit-btn" id="exit-btn">← Exit</button>
      <span class="progress-label">${e} left</span>
    </div>`}function ge(e){return`
    <div id="grade-area" class="grade-buttons">
      <button class="btn-hard" data-rating="hard">
        Hard <span class="interval-label">${x(e.hard)}</span>
      </button>
      <button class="btn-good" data-rating="good">
        Good <span class="interval-label">${x(e.good)}</span>
      </button>
      <button class="btn-easy" data-rating="easy">
        Easy <span class="interval-label">${x(e.easy)}</span>
      </button>
    </div>`}function fe(e){const n=e-Date.now();if(n<=0)return"now";const t=Math.floor(n/36e5),a=Math.floor(n%36e5/6e4);return t<24?`in ${t}h ${a}m`:`on ${new Date(e).toLocaleDateString()}`}function st(e,{onPick:n}){T().innerHTML=`
    <div class="screen">
      <header class="app-header">
        <h1 class="app-title">Dev Drill</h1>
        <p class="app-subtitle">Pick a subject to study</p>
      </header>
      <div class="subject-tiles">
        ${e.map(({subject:t,total:a,dueToday:i})=>`
          <button class="subject-tile" data-id="${x(t.id)}" style="--subject-color: ${x(t.color)}">
            <span class="subject-icon">${x(t.icon)}</span>
            <span class="subject-label">${x(t.label)}</span>
            <span class="subject-counts">
              ${a===0?"No cards yet":`${a} cards · ${i} due`}
            </span>
          </button>`).join("")}
      </div>
    </div>`,document.querySelectorAll(".subject-tile").forEach(t=>t.addEventListener("click",()=>n(t.dataset.id)))}function rt(e,{onBack:n}){var t;T().innerHTML=`
    <div class="screen">
      <div class="nothing-due">
        <div class="nothing-due-icon">📭</div>
        <h2>${x(e.label)}</h2>
        <p>No cards yet — this subject's question bank is empty.</p>
        <button id="back-btn" class="btn-primary" style="margin-top:32px">← Subjects</button>
      </div>
    </div>`,(t=document.getElementById("back-btn"))==null||t.addEventListener("click",n)}function it(e,n,t,{onStart:a,onReset:i,onBack:c,onTileClick:g}){const o=[...new Set(n.map(w=>w.topic))].sort(),h=[...new Set(n.flatMap(w=>w.tags??[]))].sort(),m={topic:"",difficulty:"",type:"",tag:""};let F=20;function b(){var u,d,f,y;const w=de(n,m),A=ue(w,t),M=A.dueToday>0;let S,$;w.length===0?(S="No cards match filters",$=!0):M?(S="Start Session",$=!1):(S="Nothing due today",$=!0);const E=!M&&w.length>0?w.map(p=>{var v;return((v=t[p.id])==null?void 0:v.nextDue)??0}).filter(p=>p>Date.now()).sort((p,v)=>p-v)[0]??null:null,l=E?`Next review ${fe(E)}`:"",s=F===1/0?Math.min(A.dueToday,w.length):Math.min(F,A.dueToday);T().innerHTML=`
      <div class="screen">
        <header class="app-header">
          <button class="exit-btn subjects-back" id="subjects-btn">← Subjects</button>
          <h1 class="app-title">${x(e.label)}</h1>
          <p class="app-subtitle">Spaced repetition drill</p>
        </header>

        <div class="stat-tiles">
          <div class="stat-tile stat-tile-link" data-filter="attempted"><span class="stat-val">${A.attempted}/${A.total}</span><span class="stat-label">Attempted</span></div>
          <div class="stat-tile stat-tile-link" data-filter="learning"><span class="stat-val">${A.inLearning}</span><span class="stat-label">Learning</span></div>
          <div class="stat-tile stat-tile-link" data-filter="mastered"><span class="stat-val">${A.mastered}</span><span class="stat-label">Mastered</span></div>
          <div class="stat-tile stat-tile-link" data-filter="due"><span class="stat-val">${A.dueToday}</span><span class="stat-label">Due Today</span></div>
        </div>

        <div class="filters">
          <select id="f-topic" class="filter-select">
            <option value="">All Topics</option>
            ${o.map(p=>`<option value="${x(p)}"${m.topic===p?" selected":""}>${x(p)}</option>`).join("")}
          </select>
          <select id="f-difficulty" class="filter-select">
            <option value="">All Difficulties</option>
            ${["easy","medium","hard"].map(p=>`<option value="${p}"${m.difficulty===p?" selected":""}>${p}</option>`).join("")}
          </select>
          <select id="f-type" class="filter-select">
            <option value="">All Types</option>
            <option value="reveal"${m.type==="reveal"?" selected":""}>Reveal</option>
            <option value="multiple-choice"${m.type==="multiple-choice"?" selected":""}>Multiple Choice</option>
            <option value="multiple-response"${m.type==="multiple-response"?" selected":""}>Multiple Response</option>
          </select>
          <select id="f-tag" class="filter-select">
            <option value="">All Tags</option>
            ${h.map(p=>`<option value="${x(p)}"${m.tag===p?" selected":""}>${x(p)}</option>`).join("")}
          </select>
        </div>

        <p class="size-label">Session size</p>
        <div class="size-toggle">
          <button class="size-btn ${F===10?"active":""}" data-size="10">10</button>
          <button class="size-btn ${F===20?"active":""}" data-size="20">20</button>
          <button class="size-btn ${F===1/0?"active":""}" data-size="all">All (${A.dueToday})</button>
        </div>

        <button id="start-btn" class="btn-primary"${$?" disabled":""}>
          ${x(S)}${$?"":` · ${s} cards`}
        </button>
        ${l?`<p class="next-due-hint">${x(l)}</p>`:""}

        <button id="reset-btn" class="btn-reset">Reset all progress</button>
      </div>`,document.querySelectorAll(".size-btn").forEach(p=>p.addEventListener("click",()=>{F=p.dataset.size==="all"?1/0:Number(p.dataset.size),b()}));const r={"f-topic":"topic","f-difficulty":"difficulty","f-type":"type","f-tag":"tag"};for(const[p,v]of Object.entries(r))(u=document.getElementById(p))==null||u.addEventListener("change",k=>{m[v]=k.target.value,b()});(d=document.getElementById("start-btn"))==null||d.addEventListener("click",()=>{$||a({...m},F)}),(f=document.getElementById("reset-btn"))==null||f.addEventListener("click",()=>{confirm(`Reset all ${e.label} progress? This cannot be undone.`)&&i()}),(y=document.getElementById("subjects-btn"))==null||y.addEventListener("click",c),g&&document.querySelectorAll(".stat-tile-link").forEach(p=>p.addEventListener("click",()=>g(p.dataset.filter)))}b()}function lt(e,{remaining:n,cardInfo:t},a,i){var c,g;T().innerHTML=`
    <div class="screen">
      ${G(n)}
      <div class="card">
        ${N(e,t)}
        <div class="question-text">${D(e.question)}</div>
      </div>
      <button id="show-btn" class="btn-show-answer">Show Answer</button>
    </div>`,(c=document.getElementById("exit-btn"))==null||c.addEventListener("click",i),(g=document.getElementById("show-btn"))==null||g.addEventListener("click",a)}function ot(e,{remaining:n,cardInfo:t,previews:a},i,c){var g;T().innerHTML=`
    <div class="screen">
      ${G(n)}
      <div class="card">
        ${N(e,t)}
        <div class="question-text">${D(e.question)}</div>
        <div class="answer-section">
          <p class="answer-label">Answer</p>
          <div class="answer-text">${D(e.answer)}</div>
          <div class="explanation-text">${D(e.explanation)}</div>
        </div>
      </div>
      ${ge(a)}
    </div>`,(g=document.getElementById("exit-btn"))==null||g.addEventListener("click",c),document.querySelectorAll("[data-rating]").forEach(o=>o.addEventListener("click",()=>i(o.dataset.rating)))}function ct(e,{remaining:n,cardInfo:t},a,i){var g;const c=je(e.options);T().innerHTML=`
    <div class="screen">
      ${G(n)}
      <div class="card">
        ${N(e,t)}
        <div class="question-text">${D(e.question)}</div>
        <ul class="options-list">
          ${c.map((o,h)=>`<li><button class="option-btn" data-idx="${h}">${x(o)}</button></li>`).join("")}
        </ul>
      </div>
    </div>`,(g=document.getElementById("exit-btn"))==null||g.addEventListener("click",i),document.querySelectorAll(".option-btn").forEach((o,h)=>{o.addEventListener("click",()=>a(c[h],c))})}function ut(e,{remaining:n,cardInfo:t,previews:a},i,c,g,o){var F;const h=i===e.answer,m=c.map(b=>{let w="option-btn";return b===e.answer?w+=" correct":b===i&&(w+=" wrong"),`<li><button class="${w}" disabled>${x(b)}</button></li>`}).join("");T().innerHTML=`
    <div class="screen">
      ${G(n)}
      <div class="card">
        ${N(e,t)}
        <div class="question-text">${D(e.question)}</div>
        <ul class="options-list">${m}</ul>
        <div class="answer-section">
          <p class="answer-label">${h?"✓ Correct":"✗ Incorrect"}</p>
          <div class="explanation-text">${D(e.explanation)}</div>
        </div>
      </div>
      ${ge(a)}
    </div>`,(F=document.getElementById("exit-btn"))==null||F.addEventListener("click",o),document.querySelectorAll("[data-rating]").forEach(b=>b.addEventListener("click",()=>g(b.dataset.rating)))}function dt(e,{remaining:n,cardInfo:t},a,i){var m;const c=je(e.options),g=e.answers.length,o=new Set;T().innerHTML=`
    <div class="screen">
      ${G(n)}
      <div class="card">
        ${N(e,t)}
        <div class="question-text">${D(e.question)}</div>
        <p class="mr-hint">Select ${g}</p>
        <ul class="options-list">
          ${c.map((F,b)=>`<li><button class="option-btn" data-idx="${b}">${x(F)}</button></li>`).join("")}
        </ul>
        <button id="mr-submit" class="btn-show-answer" disabled>Submit</button>
      </div>
    </div>`;const h=document.getElementById("mr-submit");(m=document.getElementById("exit-btn"))==null||m.addEventListener("click",i),document.querySelectorAll(".option-btn").forEach((F,b)=>{F.addEventListener("click",()=>{o.has(b)?(o.delete(b),F.classList.remove("selected")):(o.add(b),F.classList.add("selected")),h.disabled=o.size!==g})}),h.addEventListener("click",()=>{o.size===g&&a([...o].map(F=>c[F]),c)})}function pt(e,{remaining:n,cardInfo:t,previews:a},i,c,g,o){var w;const h=new Set(e.answers),m=new Set(i),F=e.answers.length===i.length&&i.every(A=>h.has(A)),b=c.map(A=>{let M="option-btn";return h.has(A)?M+=" correct":m.has(A)&&(M+=" wrong"),`<li><button class="${M}" disabled>${x(A)}</button></li>`}).join("");T().innerHTML=`
    <div class="screen">
      ${G(n)}
      <div class="card">
        ${N(e,t)}
        <div class="question-text">${D(e.question)}</div>
        <ul class="options-list">${b}</ul>
        <div class="answer-section">
          <p class="answer-label">${F?"✓ Correct":"✗ Incorrect"}</p>
          <div class="explanation-text">${D(e.explanation)}</div>
        </div>
      </div>
      ${ge(a)}
    </div>`,(w=document.getElementById("exit-btn"))==null||w.addEventListener("click",o),document.querySelectorAll("[data-rating]").forEach(A=>A.addEventListener("click",()=>g(A.dataset.rating)))}function ve(e,n){const t=document.getElementById("grade-area");if(!t){n();return}t.innerHTML=`<p class="grade-toast">${x(e)}</p>`,setTimeout(n,2e3)}function gt({reviewed:e,correct:n},{onAgain:t,onHome:a}){var g,o;const i=e>0?Math.round(n/e*100):0,c=i>=80?"🌟":i>=50?"👍":"💪";T().innerHTML=`
    <div class="screen">
      <div class="summary">
        <div class="summary-icon">${c}</div>
        <h2 class="summary-title">Session complete!</h2>
        <div class="summary-stats">
          <div class="summary-stat"><span class="summary-stat-val">${e}</span><span class="summary-stat-label">Reviewed</span></div>
          <div class="summary-stat"><span class="summary-stat-val">${n}</span><span class="summary-stat-label">Good/Easy</span></div>
          <div class="summary-stat"><span class="summary-stat-val">${i}%</span><span class="summary-stat-label">Accuracy</span></div>
        </div>
        <button id="again-btn" class="btn-primary">Study Again</button>
        <button id="home-btn" class="btn-secondary">Back to Home</button>
      </div>
    </div>`,(g=document.getElementById("again-btn"))==null||g.addEventListener("click",t),(o=document.getElementById("home-btn"))==null||o.addEventListener("click",a)}function ft(e,n,{basePath:t="/card-library",onBack:a,onCardClick:i}){const c=[...new Set(e.map(r=>r.topic))].sort(),g=Date.now();function o(r){return H(r.id,n)}function h(r){const u=o(r);return u.totalSeen===0?"new":u.phase==="learning"?"learning":u.interval>=7?"mastered":"review"}function m(r){return o(r).nextDue<=g}const F={all:e.length,new:e.filter(r=>h(r)==="new").length,learning:e.filter(r=>h(r)==="learning").length,due:e.filter(r=>m(r)).length,mastered:e.filter(r=>h(r)==="mastered").length},b=new URLSearchParams(location.search);let w=b.get("filter")??"all",A=b.get("attempted")??"all",M=b.get("topic")??"",S=b.get("q")??"";function $(){const r=new URLSearchParams;w!=="all"&&r.set("filter",w),A!=="all"&&r.set("attempted",A),M&&r.set("topic",M),S&&r.set("q",S);const u=r.toString();Xe(t+(u?"?"+u:""))}function E(r){const u=h(r),d=o(r);return u==="new"?'<span class="badge badge-lib-new">New</span>':u==="learning"?'<span class="badge badge-learning">Learning</span>':u==="mastered"?'<span class="badge badge-lib-mastered">Mastered</span>':`<span class="badge badge-review">Review · ${d.interval}d</span>`}function l(r){const u=o(r),d=h(r);return!(w==="new"&&d!=="new"||w==="learning"&&d!=="learning"||w==="mastered"&&d!=="mastered"||w==="due"&&!m(r)||A==="attempted"&&u.lastReviewed==null||A==="not-attempted"&&u.lastReviewed!=null||M&&r.topic!==M||S&&!r.question.toLowerCase().includes(S.toLowerCase()))}function s(){var d,f,y,p;const r=e.filter(l),u=[["all",`All (${F.all})`],["new",`New (${F.new})`],["learning",`Learning (${F.learning})`],["due",`Due (${F.due})`],["mastered",`Mastered (${F.mastered})`]];T().innerHTML=`
      <div class="screen">
        <div class="lib-header">
          <button class="exit-btn" id="back-btn">← Back</button>
          <span class="lib-title">Card Library</span>
          <span class="lib-count">${r.length} cards</span>
        </div>

        <div class="lib-filters">
          <div class="lib-chips">
            ${u.map(([v,k])=>`<button class="chip${w===v?" active":""}" data-status="${v}">${x(k)}</button>`).join("")}
          </div>
          <div class="lib-controls">
            <input id="lib-search" class="search-box" type="text" placeholder="Search questions…" value="${x(S)}">
            <select id="lib-topic" class="filter-select">
              <option value="">All Topics</option>
              ${c.map(v=>`<option value="${x(v)}"${M===v?" selected":""}>${x(v)}</option>`).join("")}
            </select>
            <select id="lib-attempted" class="filter-select">
              <option value="all"${A==="all"?" selected":""}>All</option>
              <option value="attempted"${A==="attempted"?" selected":""}>Attempted</option>
              <option value="not-attempted"${A==="not-attempted"?" selected":""}>Not attempted</option>
            </select>
          </div>
        </div>

        ${r.length===0?'<p class="lib-empty">No cards match the current filters.</p>':`<div class="lib-table-wrap">
              <table class="lib-table">
                <thead>
                  <tr>
                    <th class="col-q">Question</th>
                    <th class="col-topic">Topic</th>
                    <th class="col-diff">Difficulty</th>
                    <th class="col-status">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${r.map(v=>{const k=nt(v.question),P=k.length>80?k.slice(0,80)+"…":k;return`<tr>
                      <td class="col-q">
                        <button class="q-link" data-id="${x(v.id)}">
                          <span class="q-text">${x(P)}</span>
                          <span class="q-id">${x(v.id)}</span>
                        </button>
                      </td>
                      <td class="col-topic"><span class="badge">${x(v.topic)}</span></td>
                      <td class="col-diff">${pe(v.difficulty)}</td>
                      <td class="col-status">${E(v)}</td>
                    </tr>`}).join("")}
                </tbody>
              </table>
            </div>`}
      </div>`,(d=document.getElementById("back-btn"))==null||d.addEventListener("click",a),document.querySelectorAll(".chip").forEach(v=>v.addEventListener("click",()=>{w=v.dataset.status,$(),s()})),(f=document.getElementById("lib-search"))==null||f.addEventListener("input",v=>{S=v.target.value,$(),s()}),(y=document.getElementById("lib-topic"))==null||y.addEventListener("change",v=>{M=v.target.value,$(),s()}),(p=document.getElementById("lib-attempted"))==null||p.addEventListener("change",v=>{A=v.target.value,$(),s()}),i&&document.querySelectorAll(".q-link").forEach(v=>v.addEventListener("click",()=>i(v.dataset.id)))}s()}function vt(e,n,{onBack:t}){var h;const a=H(e.id,n),i=te(e),c=(e.tags??[]).map(m=>`<span class="badge">${x(m)}</span>`).join("");function g(){if(a.totalSeen===0)return`<div class="detail-progress-row">
        <span class="badge badge-lib-new">New</span>
        <span class="detail-progress-info">Never studied</span>
      </div>`;if(a.phase==="learning")return`<div class="detail-progress-row">
        <span class="badge badge-learning">Learning</span>
        <span class="detail-progress-info">Seen ${a.totalSeen} time${a.totalSeen!==1?"s":""} · in learning phase</span>
      </div>`;const F=a.interval>=7?'<span class="badge badge-lib-mastered">Mastered</span>':'<span class="badge badge-review">Review</span>',b=a.nextDue>Date.now()?fe(a.nextDue):"due now",w=a.lastReviewed?new Date(a.lastReviewed).toLocaleDateString():"never";return`
      <div class="detail-progress-row">
        ${F}
        <span class="detail-progress-info">Interval: ${a.interval}d · Ease: ${a.ease.toFixed(2)} · Next: ${x(b)}</span>
      </div>
      <div class="detail-progress-row" style="margin-top:8px">
        <span class="detail-progress-info">Last reviewed: ${w} · Seen ${a.totalSeen} times</span>
      </div>`}function o(){if(i==="multiple-choice"||i==="multiple-response"){const m=new Set(i==="multiple-response"?e.answers:[e.answer]);return`
        <ul class="detail-options">${e.options.map(b=>`<li><span class="detail-option${m.has(b)?" correct":""}">${x(b)}</span></li>`).join("")}</ul>
        <div class="answer-section">
          <p class="answer-label">Explanation</p>
          <div class="explanation-text">${D(e.explanation)}</div>
        </div>`}return`
      <div class="answer-section">
        <p class="answer-label">Answer</p>
        <div class="answer-text">${D(e.answer)}</div>
        <div class="explanation-text">${D(e.explanation)}</div>
      </div>`}T().innerHTML=`
    <div class="screen">
      <div class="lib-header">
        <button class="exit-btn" id="back-btn">← Back</button>
        <span class="lib-title">Card Detail</span>
      </div>

      <div class="card">
        <div class="card-meta">
          <span class="badge">${x(e.topic)}</span>
          ${e.subtopic?`<span class="badge">${x(e.subtopic)}</span>`:""}
          ${pe(e.difficulty)}
          <span class="badge">${_e(e)}</span>
          ${c}
        </div>
        <div class="question-text">${D(e.question)}</div>
        ${o()}
      </div>

      <div class="detail-progress-card">
        <p class="detail-section-label">Progress</p>
        ${g()}
        <p class="q-id" style="margin-top:10px">${x(e.id)}</p>
      </div>
    </div>`,(h=document.getElementById("back-btn"))==null||h.addEventListener("click",t)}function ht({nextDueTs:e,mastered:n,total:t},a){var c;const i=e?fe(e):null;T().innerHTML=`
    <div class="screen">
      <div class="nothing-due">
        <div class="nothing-due-icon">🎉</div>
        <h2>All caught up!</h2>
        <p>Nothing to review right now.</p>
        ${i?`<p class="next-due">Next review <strong>${x(i)}</strong></p>`:""}
        <p style="margin-top:12px;color:var(--muted)">${n} / ${t} cards mastered</p>
        <button id="home-btn" class="btn-primary" style="margin-top:32px">Back to Home</button>
      </div>
    </div>`,(c=document.getElementById("home-btn"))==null||c.addEventListener("click",a)}let L=null,_=[],X={reviewed:0,correct:0},he={},De=20,B={};async function Te(e){return(await e.loadData()).default}async function me(e){const n=Ge(e);if(!n)return q("/"),null;const t=await Te(n);return L={subject:n,cards:t,progressMap:ke(n.storageKey)},L}ne("/",async()=>{const e=await Promise.all(Ze().map(async n=>{const t=await Te(n),a=ue(t,ke(n.storageKey));return{subject:n,total:t.length,dueToday:a.dueToday}}));st(e,{onPick:n=>q(`/${n}`)})});ne("/:subject",async({subject:e})=>{const n=await me(e);if(n){if(n.cards.length===0){rt(n.subject,{onBack:()=>q("/")});return}it(n.subject,n.cards,n.progressMap,{onStart:Ie,onReset:mt,onBack:()=>q("/"),onTileClick:t=>q(`/${e}/card-library${t?`?filter=${t}`:""}`)})}});ne("/:subject/card-library",async({subject:e})=>{const n=await me(e);n&&ft(n.cards,n.progressMap,{basePath:`/${e}/card-library`,onBack:()=>q(`/${e}`),onCardClick:t=>q(`/${e}/card/${t}`)})});ne("/:subject/card/:id",async({subject:e,id:n})=>{const t=await me(e);if(!t)return;const a=t.cards.find(i=>i.id===n);if(!a){q(`/${e}/card-library`);return}vt(a,t.progressMap,{onBack:()=>history.back()})});function mt(){ze(L.subject.storageKey),L.progressMap={},q(`/${L.subject.id}`)}function z(){q(`/${L.subject.id}`)}function Ie(e,n){if(he=e,De=n,_=Je(L.cards,L.progressMap,e,n),X={reviewed:0,correct:0},B={},_.length===0){xt();return}ae()}function ae(){if(_.length===0){gt(X,{onAgain:()=>Ie(he,De),onHome:z});return}const e=_[0],n=H(e.id,L.progressMap),t={phase:n.phase,streak:B[e.id]??0,interval:n.interval},a=te(e);a==="multiple-choice"?ct(e,{remaining:_.length,cardInfo:t},(i,c)=>wt(e,i,c),z):a==="multiple-response"?dt(e,{remaining:_.length,cardInfo:t},(i,c)=>$t(e,i,c),z):lt(e,{remaining:_.length,cardInfo:t},bt,z)}function bt(){const e=_[0],n=H(e.id,L.progressMap),t={phase:n.phase,streak:B[e.id]??0,interval:n.interval},a=ee(n);ot(e,{remaining:_.length,cardInfo:t,previews:a},yt,z)}function yt(e){const n=_[0],t=be(n,e);ve(t,ae)}function wt(e,n,t){const a=H(e.id,L.progressMap),i={phase:a.phase,streak:B[e.id]??0,interval:a.interval},c=ee(a);ut(e,{remaining:_.length,cardInfo:i,previews:c},n,t,g=>{const o=be(e,g);ve(o,ae)},z)}function $t(e,n,t){const a=H(e.id,L.progressMap),i={phase:a.phase,streak:B[e.id]??0,interval:a.interval},c=ee(a);pt(e,{remaining:_.length,cardInfo:i,previews:c},n,t,g=>{const o=be(e,g);ve(o,ae)},z)}function be(e,n){const t=H(e.id,L.progressMap);let a,i=!1,c;if(t.phase==="learning")if(n==="easy")a=Ae(t,"easy"),i=!0,c="Graduated! See you in 3 days";else if(n==="good"){const g=(B[e.id]??0)+1;B[e.id]=g,g>=2?(a=Ke(t,"good"),i=!0,c="Graduated! See you in 2 days",delete B[e.id]):(a={...t,totalSeen:t.totalSeen+1,lastReviewed:Date.now()},c="1 more correct to graduate")}else B[e.id]=0,a={...t,totalSeen:t.totalSeen+1,lastReviewed:Date.now()},c="Coming back soon";else a=Ae(t,n),i=!0,c=`See you in ${ee(t)[n]}`;return L.progressMap={...L.progressMap,[e.id]:a},Ce(L.subject.storageKey,L.progressMap),X.reviewed++,n!=="hard"&&X.correct++,_=Ve(_,i,n),c}function xt(){const e=de(L.cards,he),n=ue(e,L.progressMap),t=We(L.progressMap);ht({nextDueTs:t,mastered:n.mastered,total:n.total},z)}He();Ye();

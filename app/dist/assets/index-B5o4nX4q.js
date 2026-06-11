(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const l of document.querySelectorAll('link[rel="modulepreload"]'))a(l);new MutationObserver(l=>{for(const p of l)if(p.type==="childList")for(const g of p.addedNodes)g.tagName==="LINK"&&g.rel==="modulepreload"&&a(g)}).observe(document,{childList:!0,subtree:!0});function t(l){const p={};return l.integrity&&(p.integrity=l.integrity),l.referrerPolicy&&(p.referrerPolicy=l.referrerPolicy),l.crossOrigin==="use-credentials"?p.credentials="include":l.crossOrigin==="anonymous"?p.credentials="omit":p.credentials="same-origin",p}function a(l){if(l.ep)return;l.ep=!0;const p=t(l);fetch(l.href,p)}})();function Fe(e){try{const n=localStorage.getItem(e);return n?JSON.parse(n):{}}catch{return{}}}function Be(e,n){localStorage.setItem(e,JSON.stringify(n))}function Ce(e){localStorage.removeItem(e)}function qe(){const e=localStorage.getItem("srs:all");!e||localStorage.getItem("srs:javascript")||(localStorage.setItem("srs:javascript",e),localStorage.removeItem("srs:all"))}const ze="modulepreload",Oe=function(e){return"/"+e},we={},W=function(n,t,a){let l=Promise.resolve();if(t&&t.length>0){document.getElementsByTagName("link");const g=document.querySelector("meta[property=csp-nonce]"),o=(g==null?void 0:g.nonce)||(g==null?void 0:g.getAttribute("nonce"));l=Promise.allSettled(t.map(h=>{if(h=Oe(h),h in we)return;we[h]=!0;const m=h.endsWith(".css"),A=m?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${h}"]${A}`))return;const $=document.createElement("link");if($.rel=m?"stylesheet":ze,m||($.as="script"),$.crossOrigin="",$.href=h,o&&$.setAttribute("nonce",o),document.head.appendChild($),m)return new Promise((x,S)=>{$.addEventListener("load",x),$.addEventListener("error",()=>S(new Error(`Unable to preload CSS for ${h}`)))})}))}function p(g){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=g,window.dispatchEvent(o),!o.defaultPrevented)throw g}return l.then(g=>{for(const o of g||[])o.status==="rejected"&&p(o.reason);return n().catch(p)})},Ae={javascript:{id:"javascript",label:"JavaScript",icon:"JS",color:"#f7df1e",storageKey:"srs:javascript",loadData:()=>W(()=>import("./javascript-DXvxpGUl.js"),[])},react:{id:"react",label:"React",icon:"⚛",color:"#61dafb",storageKey:"srs:react",loadData:()=>W(()=>import("./react-K6fnWhzg.js"),[])},node:{id:"node",label:"Node.js",icon:"No",color:"#8cc84b",storageKey:"srs:node",loadData:()=>W(()=>import("./node-Id6sFHAw.js"),[])},typescript:{id:"typescript",label:"TypeScript",icon:"TS",color:"#3178c6",storageKey:"srs:typescript",loadData:()=>W(()=>import("./typescript-UIP2cYDg.js"),[])}};function He(e){return Ae[e]??null}function Ne(){return Object.values(Ae)}const G=864e5;function Ge(e){return{id:e,phase:"learning",interval:0,ease:2.5,nextDue:0,lastReviewed:null,totalSeen:0}}function V(e){if("phase"in e)return e;const n={1:0,2:1,3:3,4:7,5:14};return{id:e.id,phase:(e.box??1)<=1?"learning":"review",interval:n[e.box??1]??0,ease:2.5,nextDue:e.nextDue??0,lastReviewed:e.lastReviewed??null,totalSeen:e.totalSeen??0}}function H(e,n){const t=n[e];return t?V(t):Ge(e)}function $e(e,n){const t=Date.now(),a={...e,totalSeen:e.totalSeen+1,lastReviewed:t};if(e.phase==="learning")return{...a,phase:"review",interval:3,nextDue:t+3*G};if(n==="hard"){const g=Math.max(1.3,e.ease-.15),o=Math.max(1,Math.round(e.interval*1.2));return{...a,ease:g,interval:o,nextDue:t+o*G}}if(n==="good"){const g=Math.max(2,Math.round(e.interval*e.ease));return{...a,interval:g,nextDue:t+g*G}}const l=Math.min(3,e.ease+.15),p=Math.max(3,Math.round(e.interval*e.ease*1.3));return{...a,ease:l,interval:p,nextDue:t+p*G}}function Ze(e,n){const t=Date.now(),a=n==="hard"?1:n==="easy"?3:2;return{...e,phase:"review",interval:a,nextDue:t+a*G,lastReviewed:t,totalSeen:e.totalSeen+1}}function oe(e){if(e.phase==="learning")return{hard:"again",good:"later",easy:"3d"};const n=Math.max(1,Math.round(e.interval*1.2)),t=Math.max(2,Math.round(e.interval*e.ease)),a=Math.max(3,Math.round(e.interval*e.ease*1.3));return{hard:`${n}d`,good:`${t}d`,easy:`${a}d`}}function Ue(e,n){const t=Date.now(),a=e.filter(l=>{const p=n[l.id];return p?V(p).nextDue<=t:!0});for(let l=a.length-1;l>0;l--){const p=Math.floor(Math.random()*(l+1));[a[l],a[p]]=[a[p],a[l]]}return a}function ce(e,n){const t=Date.now();let a=0,l=0,p=0,g=0;for(const o of e){const h=n[o.id],m=h?V(h):null;(m==null?void 0:m.lastReviewed)!=null&&a++,(m==null?void 0:m.phase)==="review"&&m.interval>=7&&l++,(!m||m.nextDue<=t)&&p++,(m==null?void 0:m.phase)==="learning"&&m.totalSeen>0&&g++}return{total:e.length,attempted:a,mastered:l,dueToday:p,inLearning:g}}function Ke(e){const n=Date.now(),t=Object.values(e).map(a=>V(a).nextDue).filter(a=>a>n);return t.length?Math.min(...t):null}function X(e){return e.type??(e.options?"multiple-choice":"reveal")}function ue(e,n){return e.filter(t=>!(n.topic&&t.topic!==n.topic||n.difficulty&&t.difficulty!==n.difficulty||n.type&&X(t)!==n.type||n.tag&&!(t.tags??[]).includes(n.tag)))}function Qe(e,n,t,a){const l=ue(e,t),p=Ue(l,n);return a===1/0?p:p.slice(0,a)}function We(e,n,t){if(n)return e.slice(1);if(t==="hard"){const a=e.slice(1),l=Math.min(2,a.length);return[...a.slice(0,l),e[0],...a.slice(l)]}return[...e.slice(1),e[0]]}const ie=new Map,Se=[];function Y(e,n){if(e.includes(":")){const t=[],a=new RegExp("^"+e.replace(/:([^/]+)/g,(l,p)=>(t.push(p),"([^/]+)"))+"$");Se.push({regex:a,keys:t,fn:n})}else ie.set(e,n)}function B(e){history.pushState(null,"",e),le()}function Je(e){history.replaceState(null,"",e)}function le(){var n;const e=ie.get(location.pathname);if(e){e();return}for(const{regex:t,keys:a,fn:l}of Se){const p=location.pathname.match(t);if(p){const g=Object.fromEntries(a.map((o,h)=>[o,decodeURIComponent(p[h+1])]));l(g);return}}(n=ie.get("/"))==null||n()}function Ve(){window.addEventListener("popstate",le),le()}var xe=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function Xe(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var ke={exports:{}};(function(e){var n=typeof window<"u"?window:typeof WorkerGlobalScope<"u"&&self instanceof WorkerGlobalScope?self:{};/**
 * Prism: Lightweight, robust, elegant syntax highlighting
 *
 * @license MIT <https://opensource.org/licenses/MIT>
 * @author Lea Verou <https://lea.verou.me>
 * @namespace
 * @public
 */var t=function(a){var l=/(?:^|\s)lang(?:uage)?-([\w-]+)(?=\s|$)/i,p=0,g={},o={manual:a.Prism&&a.Prism.manual,disableWorkerMessageHandler:a.Prism&&a.Prism.disableWorkerMessageHandler,util:{encode:function i(s){return s instanceof h?new h(s.type,i(s.content),s.alias):Array.isArray(s)?s.map(i):s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\u00a0/g," ")},type:function(i){return Object.prototype.toString.call(i).slice(8,-1)},objId:function(i){return i.__id||Object.defineProperty(i,"__id",{value:++p}),i.__id},clone:function i(s,r){r=r||{};var c,u;switch(o.util.type(s)){case"Object":if(u=o.util.objId(s),r[u])return r[u];c={},r[u]=c;for(var f in s)s.hasOwnProperty(f)&&(c[f]=i(s[f],r));return c;case"Array":return u=o.util.objId(s),r[u]?r[u]:(c=[],r[u]=c,s.forEach(function(b,d){c[d]=i(b,r)}),c);default:return s}},getLanguage:function(i){for(;i;){var s=l.exec(i.className);if(s)return s[1].toLowerCase();i=i.parentElement}return"none"},setLanguage:function(i,s){i.className=i.className.replace(RegExp(l,"gi"),""),i.classList.add("language-"+s)},currentScript:function(){if(typeof document>"u")return null;if(document.currentScript&&document.currentScript.tagName==="SCRIPT")return document.currentScript;try{throw new Error}catch(c){var i=(/at [^(\r\n]*\((.*):[^:]+:[^:]+\)$/i.exec(c.stack)||[])[1];if(i){var s=document.getElementsByTagName("script");for(var r in s)if(s[r].src==i)return s[r]}return null}},isActive:function(i,s,r){for(var c="no-"+s;i;){var u=i.classList;if(u.contains(s))return!0;if(u.contains(c))return!1;i=i.parentElement}return!!r}},languages:{plain:g,plaintext:g,text:g,txt:g,extend:function(i,s){var r=o.util.clone(o.languages[i]);for(var c in s)r[c]=s[c];return r},insertBefore:function(i,s,r,c){c=c||o.languages;var u=c[i],f={};for(var b in u)if(u.hasOwnProperty(b)){if(b==s)for(var d in r)r.hasOwnProperty(d)&&(f[d]=r[d]);r.hasOwnProperty(b)||(f[b]=u[b])}var v=c[i];return c[i]=f,o.languages.DFS(o.languages,function(k,P){P===v&&k!=i&&(this[k]=f)}),f},DFS:function i(s,r,c,u){u=u||{};var f=o.util.objId;for(var b in s)if(s.hasOwnProperty(b)){r.call(s,b,s[b],c||b);var d=s[b],v=o.util.type(d);v==="Object"&&!u[f(d)]?(u[f(d)]=!0,i(d,r,null,u)):v==="Array"&&!u[f(d)]&&(u[f(d)]=!0,i(d,r,b,u))}}},plugins:{},highlightAll:function(i,s){o.highlightAllUnder(document,i,s)},highlightAllUnder:function(i,s,r){var c={callback:r,container:i,selector:'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'};o.hooks.run("before-highlightall",c),c.elements=Array.prototype.slice.apply(c.container.querySelectorAll(c.selector)),o.hooks.run("before-all-elements-highlight",c);for(var u=0,f;f=c.elements[u++];)o.highlightElement(f,s===!0,c.callback)},highlightElement:function(i,s,r){var c=o.util.getLanguage(i),u=o.languages[c];o.util.setLanguage(i,c);var f=i.parentElement;f&&f.nodeName.toLowerCase()==="pre"&&o.util.setLanguage(f,c);var b=i.textContent,d={element:i,language:c,grammar:u,code:b};function v(P){d.highlightedCode=P,o.hooks.run("before-insert",d),d.element.innerHTML=d.highlightedCode,o.hooks.run("after-highlight",d),o.hooks.run("complete",d),r&&r.call(d.element)}if(o.hooks.run("before-sanity-check",d),f=d.element.parentElement,f&&f.nodeName.toLowerCase()==="pre"&&!f.hasAttribute("tabindex")&&f.setAttribute("tabindex","0"),!d.code){o.hooks.run("complete",d),r&&r.call(d.element);return}if(o.hooks.run("before-highlight",d),!d.grammar){v(o.util.encode(d.code));return}if(s&&a.Worker){var k=new Worker(o.filename);k.onmessage=function(P){v(P.data)},k.postMessage(JSON.stringify({language:d.language,code:d.code,immediateClose:!0}))}else v(o.highlight(d.code,d.grammar,d.language))},highlight:function(i,s,r){var c={code:i,grammar:s,language:r};if(o.hooks.run("before-tokenize",c),!c.grammar)throw new Error('The language "'+c.language+'" has no grammar.');return c.tokens=o.tokenize(c.code,c.grammar),o.hooks.run("after-tokenize",c),h.stringify(o.util.encode(c.tokens),c.language)},tokenize:function(i,s){var r=s.rest;if(r){for(var c in r)s[c]=r[c];delete s.rest}var u=new $;return x(u,u.head,i),A(i,u,s,u.head,0),M(u)},hooks:{all:{},add:function(i,s){var r=o.hooks.all;r[i]=r[i]||[],r[i].push(s)},run:function(i,s){var r=o.hooks.all[i];if(!(!r||!r.length))for(var c=0,u;u=r[c++];)u(s)}},Token:h};a.Prism=o;function h(i,s,r,c){this.type=i,this.content=s,this.alias=r,this.length=(c||"").length|0}h.stringify=function i(s,r){if(typeof s=="string")return s;if(Array.isArray(s)){var c="";return s.forEach(function(v){c+=i(v,r)}),c}var u={type:s.type,content:i(s.content,r),tag:"span",classes:["token",s.type],attributes:{},language:r},f=s.alias;f&&(Array.isArray(f)?Array.prototype.push.apply(u.classes,f):u.classes.push(f)),o.hooks.run("wrap",u);var b="";for(var d in u.attributes)b+=" "+d+'="'+(u.attributes[d]||"").replace(/"/g,"&quot;")+'"';return"<"+u.tag+' class="'+u.classes.join(" ")+'"'+b+">"+u.content+"</"+u.tag+">"};function m(i,s,r,c){i.lastIndex=s;var u=i.exec(r);if(u&&c&&u[1]){var f=u[1].length;u.index+=f,u[0]=u[0].slice(f)}return u}function A(i,s,r,c,u,f){for(var b in r)if(!(!r.hasOwnProperty(b)||!r[b])){var d=r[b];d=Array.isArray(d)?d:[d];for(var v=0;v<d.length;++v){if(f&&f.cause==b+","+v)return;var k=d[v],P=k.inside,he=!!k.lookbehind,me=!!k.greedy,Te=k.alias;if(me&&!k.pattern.global){var Ie=k.pattern.toString().match(/[imsuy]*$/)[0];k.pattern=RegExp(k.pattern.source,Ie+"g")}for(var be=k.pattern||k,j=c.next,R=u;j!==s.tail&&!(f&&R>=f.reach);R+=j.value.length,j=j.next){var z=j.value;if(s.length>i.length)return;if(!(z instanceof h)){var Z=1,D;if(me){if(D=m(be,R,i,he),!D||D.index>=i.length)break;var U=D.index,Pe=D.index+D[0].length,C=R;for(C+=j.value.length;U>=C;)j=j.next,C+=j.value.length;if(C-=j.value.length,R=C,j.value instanceof h)continue;for(var N=j;N!==s.tail&&(C<Pe||typeof N.value=="string");N=N.next)Z++,C+=N.value.length;Z--,z=i.slice(R,C),D.index-=R}else if(D=m(be,0,z,he),!D)continue;var U=D.index,K=D[0],ne=z.slice(0,U),ye=z.slice(U+K.length),ae=R+z.length;f&&ae>f.reach&&(f.reach=ae);var Q=j.prev;ne&&(Q=x(s,Q,ne),R+=ne.length),S(s,Q,Z);var Re=new h(b,P?o.tokenize(K,P):K,Te,K);if(j=x(s,Q,Re),ye&&x(s,j,ye),Z>1){var se={cause:b+","+v,reach:ae};A(i,s,r,j.prev,R,se),f&&se.reach>f.reach&&(f.reach=se.reach)}}}}}}function $(){var i={value:null,prev:null,next:null},s={value:null,prev:i,next:null};i.next=s,this.head=i,this.tail=s,this.length=0}function x(i,s,r){var c=s.next,u={value:r,prev:s,next:c};return s.next=u,c.prev=u,i.length++,u}function S(i,s,r){for(var c=s.next,u=0;u<r&&c!==i.tail;u++)c=c.next;s.next=c,c.prev=s,i.length-=u}function M(i){for(var s=[],r=i.head.next;r!==i.tail;)s.push(r.value),r=r.next;return s}if(!a.document)return a.addEventListener&&(o.disableWorkerMessageHandler||a.addEventListener("message",function(i){var s=JSON.parse(i.data),r=s.language,c=s.code,u=s.immediateClose;a.postMessage(o.highlight(c,o.languages[r],r)),u&&a.close()},!1)),o;var F=o.util.currentScript();F&&(o.filename=F.src,F.hasAttribute("data-manual")&&(o.manual=!0));function y(){o.manual||o.highlightAll()}if(!o.manual){var E=document.readyState;E==="loading"||E==="interactive"&&F&&F.defer?document.addEventListener("DOMContentLoaded",y):window.requestAnimationFrame?window.requestAnimationFrame(y):window.setTimeout(y,16)}return o}(n);e.exports&&(e.exports=t),typeof xe<"u"&&(xe.Prism=t),t.languages.markup={comment:{pattern:/<!--(?:(?!<!--)[\s\S])*?-->/,greedy:!0},prolog:{pattern:/<\?[\s\S]+?\?>/,greedy:!0},doctype:{pattern:/<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i,greedy:!0,inside:{"internal-subset":{pattern:/(^[^\[]*\[)[\s\S]+(?=\]>$)/,lookbehind:!0,greedy:!0,inside:null},string:{pattern:/"[^"]*"|'[^']*'/,greedy:!0},punctuation:/^<!|>$|[[\]]/,"doctype-tag":/^DOCTYPE/i,name:/[^\s<>'"]+/}},cdata:{pattern:/<!\[CDATA\[[\s\S]*?\]\]>/i,greedy:!0},tag:{pattern:/<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/,greedy:!0,inside:{tag:{pattern:/^<\/?[^\s>\/]+/,inside:{punctuation:/^<\/?/,namespace:/^[^\s>\/:]+:/}},"special-attr":[],"attr-value":{pattern:/=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,inside:{punctuation:[{pattern:/^=/,alias:"attr-equals"},{pattern:/^(\s*)["']|["']$/,lookbehind:!0}]}},punctuation:/\/?>/,"attr-name":{pattern:/[^\s>\/]+/,inside:{namespace:/^[^\s>\/:]+:/}}}},entity:[{pattern:/&[\da-z]{1,8};/i,alias:"named-entity"},/&#x?[\da-f]{1,8};/i]},t.languages.markup.tag.inside["attr-value"].inside.entity=t.languages.markup.entity,t.languages.markup.doctype.inside["internal-subset"].inside=t.languages.markup,t.hooks.add("wrap",function(a){a.type==="entity"&&(a.attributes.title=a.content.replace(/&amp;/,"&"))}),Object.defineProperty(t.languages.markup.tag,"addInlined",{value:function(l,p){var g={};g["language-"+p]={pattern:/(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,lookbehind:!0,inside:t.languages[p]},g.cdata=/^<!\[CDATA\[|\]\]>$/i;var o={"included-cdata":{pattern:/<!\[CDATA\[[\s\S]*?\]\]>/i,inside:g}};o["language-"+p]={pattern:/[\s\S]+/,inside:t.languages[p]};var h={};h[l]={pattern:RegExp(/(<__[^>]*>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(/__/g,function(){return l}),"i"),lookbehind:!0,greedy:!0,inside:o},t.languages.insertBefore("markup","cdata",h)}}),Object.defineProperty(t.languages.markup.tag,"addAttribute",{value:function(a,l){t.languages.markup.tag.inside["special-attr"].push({pattern:RegExp(/(^|["'\s])/.source+"(?:"+a+")"+/\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))/.source,"i"),lookbehind:!0,inside:{"attr-name":/^[^\s=]+/,"attr-value":{pattern:/=[\s\S]+/,inside:{value:{pattern:/(^=\s*(["']|(?!["'])))\S[\s\S]*(?=\2$)/,lookbehind:!0,alias:[l,"language-"+l],inside:t.languages[l]},punctuation:[{pattern:/^=/,alias:"attr-equals"},/"|'/]}}}})}}),t.languages.html=t.languages.markup,t.languages.mathml=t.languages.markup,t.languages.svg=t.languages.markup,t.languages.xml=t.languages.extend("markup",{}),t.languages.ssml=t.languages.xml,t.languages.atom=t.languages.xml,t.languages.rss=t.languages.xml,function(a){var l=/(?:"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n])*')/;a.languages.css={comment:/\/\*[\s\S]*?\*\//,atrule:{pattern:RegExp("@[\\w-](?:"+/[^;{\s"']|\s+(?!\s)/.source+"|"+l.source+")*?"+/(?:;|(?=\s*\{))/.source),inside:{rule:/^@[\w-]+/,"selector-function-argument":{pattern:/(\bselector\s*\(\s*(?![\s)]))(?:[^()\s]|\s+(?![\s)])|\((?:[^()]|\([^()]*\))*\))+(?=\s*\))/,lookbehind:!0,alias:"selector"},keyword:{pattern:/(^|[^\w-])(?:and|not|only|or)(?![\w-])/,lookbehind:!0}}},url:{pattern:RegExp("\\burl\\((?:"+l.source+"|"+/(?:[^\\\r\n()"']|\\[\s\S])*/.source+")\\)","i"),greedy:!0,inside:{function:/^url/i,punctuation:/^\(|\)$/,string:{pattern:RegExp("^"+l.source+"$"),alias:"url"}}},selector:{pattern:RegExp(`(^|[{}\\s])[^{}\\s](?:[^{};"'\\s]|\\s+(?![\\s{])|`+l.source+")*(?=\\s*\\{)"),lookbehind:!0},string:{pattern:l,greedy:!0},property:{pattern:/(^|[^-\w\xA0-\uFFFF])(?!\s)[-_a-z\xA0-\uFFFF](?:(?!\s)[-\w\xA0-\uFFFF])*(?=\s*:)/i,lookbehind:!0},important:/!important\b/i,function:{pattern:/(^|[^-a-z0-9])[-a-z0-9]+(?=\()/i,lookbehind:!0},punctuation:/[(){};:,]/},a.languages.css.atrule.inside.rest=a.languages.css;var p=a.languages.markup;p&&(p.tag.addInlined("style","css"),p.tag.addAttribute("style","css"))}(t),t.languages.clike={comment:[{pattern:/(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,lookbehind:!0,greedy:!0},{pattern:/(^|[^\\:])\/\/.*/,lookbehind:!0,greedy:!0}],string:{pattern:/(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,greedy:!0},"class-name":{pattern:/(\b(?:class|extends|implements|instanceof|interface|new|trait)\s+|\bcatch\s+\()[\w.\\]+/i,lookbehind:!0,inside:{punctuation:/[.\\]/}},keyword:/\b(?:break|catch|continue|do|else|finally|for|function|if|in|instanceof|new|null|return|throw|try|while)\b/,boolean:/\b(?:false|true)\b/,function:/\b\w+(?=\()/,number:/\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,operator:/[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,punctuation:/[{}[\];(),.:]/},t.languages.javascript=t.languages.extend("clike",{"class-name":[t.languages.clike["class-name"],{pattern:/(^|[^$\w\xA0-\uFFFF])(?!\s)[_$A-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\.(?:constructor|prototype))/,lookbehind:!0}],keyword:[{pattern:/((?:^|\})\s*)catch\b/,lookbehind:!0},{pattern:/(^|[^.]|\.\.\.\s*)\b(?:as|assert(?=\s*\{)|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally(?=\s*(?:\{|$))|for|from(?=\s*(?:['"]|$))|function|(?:get|set)(?=\s*(?:[#\[$\w\xA0-\uFFFF]|$))|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,lookbehind:!0}],function:/#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,number:{pattern:RegExp(/(^|[^\w$])/.source+"(?:"+(/NaN|Infinity/.source+"|"+/0[bB][01]+(?:_[01]+)*n?/.source+"|"+/0[oO][0-7]+(?:_[0-7]+)*n?/.source+"|"+/0[xX][\dA-Fa-f]+(?:_[\dA-Fa-f]+)*n?/.source+"|"+/\d+(?:_\d+)*n/.source+"|"+/(?:\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\.\d+(?:_\d+)*)(?:[Ee][+-]?\d+(?:_\d+)*)?/.source)+")"+/(?![\w$])/.source),lookbehind:!0},operator:/--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/}),t.languages.javascript["class-name"][0].pattern=/(\b(?:class|extends|implements|instanceof|interface|new)\s+)[\w.\\]+/,t.languages.insertBefore("javascript","keyword",{regex:{pattern:RegExp(/((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)/.source+/\//.source+"(?:"+/(?:\[(?:[^\]\\\r\n]|\\.)*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}/.source+"|"+/(?:\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.)*\])*\])*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}v[dgimyus]{0,7}/.source+")"+/(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/.source),lookbehind:!0,greedy:!0,inside:{"regex-source":{pattern:/^(\/)[\s\S]+(?=\/[a-z]*$)/,lookbehind:!0,alias:"language-regex",inside:t.languages.regex},"regex-delimiter":/^\/|\/$/,"regex-flags":/^[a-z]+$/}},"function-variable":{pattern:/#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/,alias:"function"},parameter:[{pattern:/(function(?:\s+(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)?\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\))/,lookbehind:!0,inside:t.languages.javascript},{pattern:/(^|[^$\w\xA0-\uFFFF])(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=>)/i,lookbehind:!0,inside:t.languages.javascript},{pattern:/(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/,lookbehind:!0,inside:t.languages.javascript},{pattern:/((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/,lookbehind:!0,inside:t.languages.javascript}],constant:/\b[A-Z](?:[A-Z_]|\dx?)*\b/}),t.languages.insertBefore("javascript","string",{hashbang:{pattern:/^#!.*/,greedy:!0,alias:"comment"},"template-string":{pattern:/`(?:\\[\s\S]|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}|(?!\$\{)[^\\`])*`/,greedy:!0,inside:{"template-punctuation":{pattern:/^`|`$/,alias:"string"},interpolation:{pattern:/((?:^|[^\\])(?:\\{2})*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}/,lookbehind:!0,inside:{"interpolation-punctuation":{pattern:/^\$\{|\}$/,alias:"punctuation"},rest:t.languages.javascript}},string:/[\s\S]+/}},"string-property":{pattern:/((?:^|[,{])[ \t]*)(["'])(?:\\(?:\r\n|[\s\S])|(?!\2)[^\\\r\n])*\2(?=\s*:)/m,lookbehind:!0,greedy:!0,alias:"property"}}),t.languages.insertBefore("javascript","operator",{"literal-property":{pattern:/((?:^|[,{])[ \t]*)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*:)/m,lookbehind:!0,alias:"property"}}),t.languages.markup&&(t.languages.markup.tag.addInlined("script","javascript"),t.languages.markup.tag.addAttribute(/on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)/.source,"javascript")),t.languages.js=t.languages.javascript,function(){if(typeof t>"u"||typeof document>"u")return;Element.prototype.matches||(Element.prototype.matches=Element.prototype.msMatchesSelector||Element.prototype.webkitMatchesSelector);var a="Loading…",l=function(F,y){return"✖ Error "+F+" while fetching file: "+y},p="✖ Error: File does not exist or is empty",g={js:"javascript",py:"python",rb:"ruby",ps1:"powershell",psm1:"powershell",sh:"bash",bat:"batch",h:"c",tex:"latex"},o="data-src-status",h="loading",m="loaded",A="failed",$="pre[data-src]:not(["+o+'="'+m+'"]):not(['+o+'="'+h+'"])';function x(F,y,E){var i=new XMLHttpRequest;i.open("GET",F,!0),i.onreadystatechange=function(){i.readyState==4&&(i.status<400&&i.responseText?y(i.responseText):i.status>=400?E(l(i.status,i.statusText)):E(p))},i.send(null)}function S(F){var y=/^\s*(\d+)\s*(?:(,)\s*(?:(\d+)\s*)?)?$/.exec(F||"");if(y){var E=Number(y[1]),i=y[2],s=y[3];return i?s?[E,Number(s)]:[E,void 0]:[E,E]}}t.hooks.add("before-highlightall",function(F){F.selector+=", "+$}),t.hooks.add("before-sanity-check",function(F){var y=F.element;if(y.matches($)){F.code="",y.setAttribute(o,h);var E=y.appendChild(document.createElement("CODE"));E.textContent=a;var i=y.getAttribute("data-src"),s=F.language;if(s==="none"){var r=(/\.(\w+)$/.exec(i)||[,"none"])[1];s=g[r]||r}t.util.setLanguage(E,s),t.util.setLanguage(y,s);var c=t.plugins.autoloader;c&&c.loadLanguages(s),x(i,function(u){y.setAttribute(o,m);var f=S(y.getAttribute("data-range"));if(f){var b=u.split(/\r\n?|\n/g),d=f[0],v=f[1]==null?b.length:f[1];d<0&&(d+=b.length),d=Math.max(0,Math.min(d-1,b.length)),v<0&&(v+=b.length),v=Math.max(0,Math.min(v,b.length)),u=b.slice(d,v).join(`
`),y.hasAttribute("data-start")||y.setAttribute("data-start",String(d+1))}E.textContent=u,t.highlightElement(E)},function(u){y.setAttribute(o,A),E.textContent=u})}}),t.plugins.fileHighlight={highlight:function(y){for(var E=(y||document).querySelectorAll($),i=0,s;s=E[i++];)t.highlightElement(s)}};var M=!1;t.fileHighlight=function(){M||(console.warn("Prism.fileHighlight is deprecated. Use `Prism.plugins.fileHighlight.highlight` instead."),M=!0),t.plugins.fileHighlight.highlight.apply(this,arguments)}}()})(ke);var Ye=ke.exports;const re=Xe(Ye);Prism.languages.javascript=Prism.languages.extend("clike",{"class-name":[Prism.languages.clike["class-name"],{pattern:/(^|[^$\w\xA0-\uFFFF])(?!\s)[_$A-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\.(?:constructor|prototype))/,lookbehind:!0}],keyword:[{pattern:/((?:^|\})\s*)catch\b/,lookbehind:!0},{pattern:/(^|[^.]|\.\.\.\s*)\b(?:as|assert(?=\s*\{)|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally(?=\s*(?:\{|$))|for|from(?=\s*(?:['"]|$))|function|(?:get|set)(?=\s*(?:[#\[$\w\xA0-\uFFFF]|$))|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,lookbehind:!0}],function:/#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,number:{pattern:RegExp(/(^|[^\w$])/.source+"(?:"+(/NaN|Infinity/.source+"|"+/0[bB][01]+(?:_[01]+)*n?/.source+"|"+/0[oO][0-7]+(?:_[0-7]+)*n?/.source+"|"+/0[xX][\dA-Fa-f]+(?:_[\dA-Fa-f]+)*n?/.source+"|"+/\d+(?:_\d+)*n/.source+"|"+/(?:\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\.\d+(?:_\d+)*)(?:[Ee][+-]?\d+(?:_\d+)*)?/.source)+")"+/(?![\w$])/.source),lookbehind:!0},operator:/--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/});Prism.languages.javascript["class-name"][0].pattern=/(\b(?:class|extends|implements|instanceof|interface|new)\s+)[\w.\\]+/;Prism.languages.insertBefore("javascript","keyword",{regex:{pattern:RegExp(/((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)/.source+/\//.source+"(?:"+/(?:\[(?:[^\]\\\r\n]|\\.)*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}/.source+"|"+/(?:\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.)*\])*\])*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}v[dgimyus]{0,7}/.source+")"+/(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/.source),lookbehind:!0,greedy:!0,inside:{"regex-source":{pattern:/^(\/)[\s\S]+(?=\/[a-z]*$)/,lookbehind:!0,alias:"language-regex",inside:Prism.languages.regex},"regex-delimiter":/^\/|\/$/,"regex-flags":/^[a-z]+$/}},"function-variable":{pattern:/#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/,alias:"function"},parameter:[{pattern:/(function(?:\s+(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)?\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\))/,lookbehind:!0,inside:Prism.languages.javascript},{pattern:/(^|[^$\w\xA0-\uFFFF])(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=>)/i,lookbehind:!0,inside:Prism.languages.javascript},{pattern:/(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/,lookbehind:!0,inside:Prism.languages.javascript},{pattern:/((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/,lookbehind:!0,inside:Prism.languages.javascript}],constant:/\b[A-Z](?:[A-Z_]|\dx?)*\b/});Prism.languages.insertBefore("javascript","string",{hashbang:{pattern:/^#!.*/,greedy:!0,alias:"comment"},"template-string":{pattern:/`(?:\\[\s\S]|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}|(?!\$\{)[^\\`])*`/,greedy:!0,inside:{"template-punctuation":{pattern:/^`|`$/,alias:"string"},interpolation:{pattern:/((?:^|[^\\])(?:\\{2})*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}/,lookbehind:!0,inside:{"interpolation-punctuation":{pattern:/^\$\{|\}$/,alias:"punctuation"},rest:Prism.languages.javascript}},string:/[\s\S]+/}},"string-property":{pattern:/((?:^|[,{])[ \t]*)(["'])(?:\\(?:\r\n|[\s\S])|(?!\2)[^\\\r\n])*\2(?=\s*:)/m,lookbehind:!0,greedy:!0,alias:"property"}});Prism.languages.insertBefore("javascript","operator",{"literal-property":{pattern:/((?:^|[,{])[ \t]*)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*:)/m,lookbehind:!0,alias:"property"}});Prism.languages.markup&&(Prism.languages.markup.tag.addInlined("script","javascript"),Prism.languages.markup.tag.addAttribute(/on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)/.source,"javascript"));Prism.languages.js=Prism.languages.javascript;const I=()=>document.getElementById("app");function w(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function T(e){return e?e.split(/(```(?:\w+)?\n[\s\S]*?```)/g).map(t=>{const a=t.match(/^```(\w+)?\n([\s\S]*?)```$/);if(a){const l=a[1]==="js"?"javascript":a[1]||"javascript",p=re.languages[l]??re.languages.javascript;return`<pre class="code-block"><code>${re.highlight(a[2],p,l)}</code></pre>`}return w(t).replace(/`([^`\n]+)`/g,'<code class="inline-code">$1</code>').replace(/\n/g,"<br>")}).join(""):""}function et(e){return e?e.replace(/```[\s\S]*?```/g,"[code]").replace(/`([^`\n]+)`/g,"$1"):""}function tt(e){const n=e.slice();for(let t=n.length-1;t>0;t--){const a=Math.floor(Math.random()*(t+1));[n[t],n[a]]=[n[a],n[t]]}return n}function de(e){return`<span class="badge badge-${e}">${e}</span>`}function nt({phase:e,streak:n,interval:t}){return e==="learning"?`<span class="badge badge-learning">Learning · ${n}/2</span>`:`<span class="badge badge-review">Review · ${t}d</span>`}function ee(e,n){return`
    <div class="card-meta">
      <span class="badge">${w(e.topic)}</span>
      ${de(e.difficulty)}
      <span class="badge">${X(e)==="multiple-choice"?"MCQ":"reveal"}</span>
      ${n?nt(n):""}
    </div>`}function te(e){return`
    <div class="session-header">
      <button class="exit-btn" id="exit-btn">← Exit</button>
      <span class="progress-label">${e} left</span>
    </div>`}function Ee(e){return`
    <div id="grade-area" class="grade-buttons">
      <button class="btn-hard" data-rating="hard">
        Hard <span class="interval-label">${w(e.hard)}</span>
      </button>
      <button class="btn-good" data-rating="good">
        Good <span class="interval-label">${w(e.good)}</span>
      </button>
      <button class="btn-easy" data-rating="easy">
        Easy <span class="interval-label">${w(e.easy)}</span>
      </button>
    </div>`}function pe(e){const n=e-Date.now();if(n<=0)return"now";const t=Math.floor(n/36e5),a=Math.floor(n%36e5/6e4);return t<24?`in ${t}h ${a}m`:`on ${new Date(e).toLocaleDateString()}`}function at(e,{onPick:n}){I().innerHTML=`
    <div class="screen">
      <header class="app-header">
        <h1 class="app-title">Dev Drill</h1>
        <p class="app-subtitle">Pick a subject to study</p>
      </header>
      <div class="subject-tiles">
        ${e.map(({subject:t,total:a,dueToday:l})=>`
          <button class="subject-tile" data-id="${w(t.id)}" style="--subject-color: ${w(t.color)}">
            <span class="subject-icon">${w(t.icon)}</span>
            <span class="subject-label">${w(t.label)}</span>
            <span class="subject-counts">
              ${a===0?"No cards yet":`${a} cards · ${l} due`}
            </span>
          </button>`).join("")}
      </div>
    </div>`,document.querySelectorAll(".subject-tile").forEach(t=>t.addEventListener("click",()=>n(t.dataset.id)))}function st(e,{onBack:n}){var t;I().innerHTML=`
    <div class="screen">
      <div class="nothing-due">
        <div class="nothing-due-icon">📭</div>
        <h2>${w(e.label)}</h2>
        <p>No cards yet — this subject's question bank is empty.</p>
        <button id="back-btn" class="btn-primary" style="margin-top:32px">← Subjects</button>
      </div>
    </div>`,(t=document.getElementById("back-btn"))==null||t.addEventListener("click",n)}function rt(e,n,t,{onStart:a,onReset:l,onBack:p,onTileClick:g}){const o=[...new Set(n.map(x=>x.topic))].sort(),h=[...new Set(n.flatMap(x=>x.tags??[]))].sort(),m={topic:"",difficulty:"",type:"",tag:""};let A=20;function $(){var c,u,f,b;const x=ue(n,m),S=ce(x,t),M=S.dueToday>0;let F,y;x.length===0?(F="No cards match filters",y=!0):M?(F="Start Session",y=!1):(F="Nothing due today",y=!0);const E=!M&&x.length>0?x.map(d=>{var v;return((v=t[d.id])==null?void 0:v.nextDue)??0}).filter(d=>d>Date.now()).sort((d,v)=>d-v)[0]??null:null,i=E?`Next review ${pe(E)}`:"",s=A===1/0?Math.min(S.dueToday,x.length):Math.min(A,S.dueToday);I().innerHTML=`
      <div class="screen">
        <header class="app-header">
          <button class="exit-btn subjects-back" id="subjects-btn">← Subjects</button>
          <h1 class="app-title">${w(e.label)}</h1>
          <p class="app-subtitle">Spaced repetition drill</p>
        </header>

        <div class="stat-tiles">
          <div class="stat-tile stat-tile-link" data-filter="attempted"><span class="stat-val">${S.attempted}/${S.total}</span><span class="stat-label">Attempted</span></div>
          <div class="stat-tile stat-tile-link" data-filter="learning"><span class="stat-val">${S.inLearning}</span><span class="stat-label">Learning</span></div>
          <div class="stat-tile stat-tile-link" data-filter="mastered"><span class="stat-val">${S.mastered}</span><span class="stat-label">Mastered</span></div>
          <div class="stat-tile stat-tile-link" data-filter="due"><span class="stat-val">${S.dueToday}</span><span class="stat-label">Due Today</span></div>
        </div>

        <div class="filters">
          <select id="f-topic" class="filter-select">
            <option value="">All Topics</option>
            ${o.map(d=>`<option value="${w(d)}"${m.topic===d?" selected":""}>${w(d)}</option>`).join("")}
          </select>
          <select id="f-difficulty" class="filter-select">
            <option value="">All Difficulties</option>
            ${["easy","medium","hard"].map(d=>`<option value="${d}"${m.difficulty===d?" selected":""}>${d}</option>`).join("")}
          </select>
          <select id="f-type" class="filter-select">
            <option value="">All Types</option>
            <option value="reveal"${m.type==="reveal"?" selected":""}>Reveal</option>
            <option value="multiple-choice"${m.type==="multiple-choice"?" selected":""}>Multiple Choice</option>
          </select>
          <select id="f-tag" class="filter-select">
            <option value="">All Tags</option>
            ${h.map(d=>`<option value="${w(d)}"${m.tag===d?" selected":""}>${w(d)}</option>`).join("")}
          </select>
        </div>

        <p class="size-label">Session size</p>
        <div class="size-toggle">
          <button class="size-btn ${A===10?"active":""}" data-size="10">10</button>
          <button class="size-btn ${A===20?"active":""}" data-size="20">20</button>
          <button class="size-btn ${A===1/0?"active":""}" data-size="all">All (${S.dueToday})</button>
        </div>

        <button id="start-btn" class="btn-primary"${y?" disabled":""}>
          ${w(F)}${y?"":` · ${s} cards`}
        </button>
        ${i?`<p class="next-due-hint">${w(i)}</p>`:""}

        <button id="reset-btn" class="btn-reset">Reset all progress</button>
      </div>`,document.querySelectorAll(".size-btn").forEach(d=>d.addEventListener("click",()=>{A=d.dataset.size==="all"?1/0:Number(d.dataset.size),$()}));const r={"f-topic":"topic","f-difficulty":"difficulty","f-type":"type","f-tag":"tag"};for(const[d,v]of Object.entries(r))(c=document.getElementById(d))==null||c.addEventListener("change",k=>{m[v]=k.target.value,$()});(u=document.getElementById("start-btn"))==null||u.addEventListener("click",()=>{y||a({...m},A)}),(f=document.getElementById("reset-btn"))==null||f.addEventListener("click",()=>{confirm(`Reset all ${e.label} progress? This cannot be undone.`)&&l()}),(b=document.getElementById("subjects-btn"))==null||b.addEventListener("click",p),g&&document.querySelectorAll(".stat-tile-link").forEach(d=>d.addEventListener("click",()=>g(d.dataset.filter)))}$()}function it(e,{remaining:n,cardInfo:t},a,l){var p,g;I().innerHTML=`
    <div class="screen">
      ${te(n)}
      <div class="card">
        ${ee(e,t)}
        <div class="question-text">${T(e.question)}</div>
      </div>
      <button id="show-btn" class="btn-show-answer">Show Answer</button>
    </div>`,(p=document.getElementById("exit-btn"))==null||p.addEventListener("click",l),(g=document.getElementById("show-btn"))==null||g.addEventListener("click",a)}function lt(e,{remaining:n,cardInfo:t,previews:a},l,p){var g;I().innerHTML=`
    <div class="screen">
      ${te(n)}
      <div class="card">
        ${ee(e,t)}
        <div class="question-text">${T(e.question)}</div>
        <div class="answer-section">
          <p class="answer-label">Answer</p>
          <div class="answer-text">${T(e.answer)}</div>
          <div class="explanation-text">${T(e.explanation)}</div>
        </div>
      </div>
      ${Ee(a)}
    </div>`,(g=document.getElementById("exit-btn"))==null||g.addEventListener("click",p),document.querySelectorAll("[data-rating]").forEach(o=>o.addEventListener("click",()=>l(o.dataset.rating)))}function ot(e,{remaining:n,cardInfo:t},a,l){var g;const p=tt(e.options);I().innerHTML=`
    <div class="screen">
      ${te(n)}
      <div class="card">
        ${ee(e,t)}
        <div class="question-text">${T(e.question)}</div>
        <ul class="options-list">
          ${p.map((o,h)=>`<li><button class="option-btn" data-idx="${h}">${w(o)}</button></li>`).join("")}
        </ul>
      </div>
    </div>`,(g=document.getElementById("exit-btn"))==null||g.addEventListener("click",l),document.querySelectorAll(".option-btn").forEach((o,h)=>{o.addEventListener("click",()=>a(p[h],p))})}function ct(e,{remaining:n,cardInfo:t,previews:a},l,p,g,o){var A;const h=l===e.answer,m=p.map($=>{let x="option-btn";return $===e.answer?x+=" correct":$===l&&(x+=" wrong"),`<li><button class="${x}" disabled>${w($)}</button></li>`}).join("");I().innerHTML=`
    <div class="screen">
      ${te(n)}
      <div class="card">
        ${ee(e,t)}
        <div class="question-text">${T(e.question)}</div>
        <ul class="options-list">${m}</ul>
        <div class="answer-section">
          <p class="answer-label">${h?"✓ Correct":"✗ Incorrect"}</p>
          <div class="explanation-text">${T(e.explanation)}</div>
        </div>
      </div>
      ${Ee(a)}
    </div>`,(A=document.getElementById("exit-btn"))==null||A.addEventListener("click",o),document.querySelectorAll("[data-rating]").forEach($=>$.addEventListener("click",()=>g($.dataset.rating)))}function Le(e,n){const t=document.getElementById("grade-area");if(!t){n();return}t.innerHTML=`<p class="grade-toast">${w(e)}</p>`,setTimeout(n,2e3)}function ut({reviewed:e,correct:n},{onAgain:t,onHome:a}){var g,o;const l=e>0?Math.round(n/e*100):0,p=l>=80?"🌟":l>=50?"👍":"💪";I().innerHTML=`
    <div class="screen">
      <div class="summary">
        <div class="summary-icon">${p}</div>
        <h2 class="summary-title">Session complete!</h2>
        <div class="summary-stats">
          <div class="summary-stat"><span class="summary-stat-val">${e}</span><span class="summary-stat-label">Reviewed</span></div>
          <div class="summary-stat"><span class="summary-stat-val">${n}</span><span class="summary-stat-label">Good/Easy</span></div>
          <div class="summary-stat"><span class="summary-stat-val">${l}%</span><span class="summary-stat-label">Accuracy</span></div>
        </div>
        <button id="again-btn" class="btn-primary">Study Again</button>
        <button id="home-btn" class="btn-secondary">Back to Home</button>
      </div>
    </div>`,(g=document.getElementById("again-btn"))==null||g.addEventListener("click",t),(o=document.getElementById("home-btn"))==null||o.addEventListener("click",a)}function dt(e,n,{basePath:t="/card-library",onBack:a,onCardClick:l}){const p=[...new Set(e.map(r=>r.topic))].sort(),g=Date.now();function o(r){return H(r.id,n)}function h(r){const c=o(r);return c.totalSeen===0?"new":c.phase==="learning"?"learning":c.interval>=7?"mastered":"review"}function m(r){return o(r).nextDue<=g}const A={all:e.length,new:e.filter(r=>h(r)==="new").length,learning:e.filter(r=>h(r)==="learning").length,due:e.filter(r=>m(r)).length,mastered:e.filter(r=>h(r)==="mastered").length},$=new URLSearchParams(location.search);let x=$.get("filter")??"all",S=$.get("attempted")??"all",M=$.get("topic")??"",F=$.get("q")??"";function y(){const r=new URLSearchParams;x!=="all"&&r.set("filter",x),S!=="all"&&r.set("attempted",S),M&&r.set("topic",M),F&&r.set("q",F);const c=r.toString();Je(t+(c?"?"+c:""))}function E(r){const c=h(r),u=o(r);return c==="new"?'<span class="badge badge-lib-new">New</span>':c==="learning"?'<span class="badge badge-learning">Learning</span>':c==="mastered"?'<span class="badge badge-lib-mastered">Mastered</span>':`<span class="badge badge-review">Review · ${u.interval}d</span>`}function i(r){const c=o(r),u=h(r);return!(x==="new"&&u!=="new"||x==="learning"&&u!=="learning"||x==="mastered"&&u!=="mastered"||x==="due"&&!m(r)||S==="attempted"&&c.lastReviewed==null||S==="not-attempted"&&c.lastReviewed!=null||M&&r.topic!==M||F&&!r.question.toLowerCase().includes(F.toLowerCase()))}function s(){var u,f,b,d;const r=e.filter(i),c=[["all",`All (${A.all})`],["new",`New (${A.new})`],["learning",`Learning (${A.learning})`],["due",`Due (${A.due})`],["mastered",`Mastered (${A.mastered})`]];I().innerHTML=`
      <div class="screen">
        <div class="lib-header">
          <button class="exit-btn" id="back-btn">← Back</button>
          <span class="lib-title">Card Library</span>
          <span class="lib-count">${r.length} cards</span>
        </div>

        <div class="lib-filters">
          <div class="lib-chips">
            ${c.map(([v,k])=>`<button class="chip${x===v?" active":""}" data-status="${v}">${w(k)}</button>`).join("")}
          </div>
          <div class="lib-controls">
            <input id="lib-search" class="search-box" type="text" placeholder="Search questions…" value="${w(F)}">
            <select id="lib-topic" class="filter-select">
              <option value="">All Topics</option>
              ${p.map(v=>`<option value="${w(v)}"${M===v?" selected":""}>${w(v)}</option>`).join("")}
            </select>
            <select id="lib-attempted" class="filter-select">
              <option value="all"${S==="all"?" selected":""}>All</option>
              <option value="attempted"${S==="attempted"?" selected":""}>Attempted</option>
              <option value="not-attempted"${S==="not-attempted"?" selected":""}>Not attempted</option>
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
                  ${r.map(v=>{const k=et(v.question),P=k.length>80?k.slice(0,80)+"…":k;return`<tr>
                      <td class="col-q">
                        <button class="q-link" data-id="${w(v.id)}">
                          <span class="q-text">${w(P)}</span>
                          <span class="q-id">${w(v.id)}</span>
                        </button>
                      </td>
                      <td class="col-topic"><span class="badge">${w(v.topic)}</span></td>
                      <td class="col-diff">${de(v.difficulty)}</td>
                      <td class="col-status">${E(v)}</td>
                    </tr>`}).join("")}
                </tbody>
              </table>
            </div>`}
      </div>`,(u=document.getElementById("back-btn"))==null||u.addEventListener("click",a),document.querySelectorAll(".chip").forEach(v=>v.addEventListener("click",()=>{x=v.dataset.status,y(),s()})),(f=document.getElementById("lib-search"))==null||f.addEventListener("input",v=>{F=v.target.value,y(),s()}),(b=document.getElementById("lib-topic"))==null||b.addEventListener("change",v=>{M=v.target.value,y(),s()}),(d=document.getElementById("lib-attempted"))==null||d.addEventListener("change",v=>{S=v.target.value,y(),s()}),l&&document.querySelectorAll(".q-link").forEach(v=>v.addEventListener("click",()=>l(v.dataset.id)))}s()}function pt(e,n,{onBack:t}){var h;const a=H(e.id,n),l=X(e),p=(e.tags??[]).map(m=>`<span class="badge">${w(m)}</span>`).join("");function g(){if(a.totalSeen===0)return`<div class="detail-progress-row">
        <span class="badge badge-lib-new">New</span>
        <span class="detail-progress-info">Never studied</span>
      </div>`;if(a.phase==="learning")return`<div class="detail-progress-row">
        <span class="badge badge-learning">Learning</span>
        <span class="detail-progress-info">Seen ${a.totalSeen} time${a.totalSeen!==1?"s":""} · in learning phase</span>
      </div>`;const A=a.interval>=7?'<span class="badge badge-lib-mastered">Mastered</span>':'<span class="badge badge-review">Review</span>',$=a.nextDue>Date.now()?pe(a.nextDue):"due now",x=a.lastReviewed?new Date(a.lastReviewed).toLocaleDateString():"never";return`
      <div class="detail-progress-row">
        ${A}
        <span class="detail-progress-info">Interval: ${a.interval}d · Ease: ${a.ease.toFixed(2)} · Next: ${w($)}</span>
      </div>
      <div class="detail-progress-row" style="margin-top:8px">
        <span class="detail-progress-info">Last reviewed: ${x} · Seen ${a.totalSeen} times</span>
      </div>`}function o(){return l==="multiple-choice"?`
        <ul class="detail-options">${e.options.map(A=>`<li><span class="detail-option${A===e.answer?" correct":""}">${w(A)}</span></li>`).join("")}</ul>
        <div class="answer-section">
          <p class="answer-label">Explanation</p>
          <div class="explanation-text">${T(e.explanation)}</div>
        </div>`:`
      <div class="answer-section">
        <p class="answer-label">Answer</p>
        <div class="answer-text">${T(e.answer)}</div>
        <div class="explanation-text">${T(e.explanation)}</div>
      </div>`}I().innerHTML=`
    <div class="screen">
      <div class="lib-header">
        <button class="exit-btn" id="back-btn">← Back</button>
        <span class="lib-title">Card Detail</span>
      </div>

      <div class="card">
        <div class="card-meta">
          <span class="badge">${w(e.topic)}</span>
          ${e.subtopic?`<span class="badge">${w(e.subtopic)}</span>`:""}
          ${de(e.difficulty)}
          <span class="badge">${l==="multiple-choice"?"MCQ":"reveal"}</span>
          ${p}
        </div>
        <div class="question-text">${T(e.question)}</div>
        ${o()}
      </div>

      <div class="detail-progress-card">
        <p class="detail-section-label">Progress</p>
        ${g()}
        <p class="q-id" style="margin-top:10px">${w(e.id)}</p>
      </div>
    </div>`,(h=document.getElementById("back-btn"))==null||h.addEventListener("click",t)}function gt({nextDueTs:e,mastered:n,total:t},a){var p;const l=e?pe(e):null;I().innerHTML=`
    <div class="screen">
      <div class="nothing-due">
        <div class="nothing-due-icon">🎉</div>
        <h2>All caught up!</h2>
        <p>Nothing to review right now.</p>
        ${l?`<p class="next-due">Next review <strong>${w(l)}</strong></p>`:""}
        <p style="margin-top:12px;color:var(--muted)">${n} / ${t} cards mastered</p>
        <button id="home-btn" class="btn-primary" style="margin-top:32px">Back to Home</button>
      </div>
    </div>`,(p=document.getElementById("home-btn"))==null||p.addEventListener("click",a)}let L=null,_=[],J={reviewed:0,correct:0},ge={},je=20,q={};async function Me(e){return(await e.loadData()).default}async function fe(e){const n=He(e);if(!n)return B("/"),null;const t=await Me(n);return L={subject:n,cards:t,progressMap:Fe(n.storageKey)},L}Y("/",async()=>{const e=await Promise.all(Ne().map(async n=>{const t=await Me(n),a=ce(t,Fe(n.storageKey));return{subject:n,total:t.length,dueToday:a.dueToday}}));at(e,{onPick:n=>B(`/${n}`)})});Y("/:subject",async({subject:e})=>{const n=await fe(e);if(n){if(n.cards.length===0){st(n.subject,{onBack:()=>B("/")});return}rt(n.subject,n.cards,n.progressMap,{onStart:_e,onReset:ft,onBack:()=>B("/"),onTileClick:t=>B(`/${e}/card-library${t?`?filter=${t}`:""}`)})}});Y("/:subject/card-library",async({subject:e})=>{const n=await fe(e);n&&dt(n.cards,n.progressMap,{basePath:`/${e}/card-library`,onBack:()=>B(`/${e}`),onCardClick:t=>B(`/${e}/card/${t}`)})});Y("/:subject/card/:id",async({subject:e,id:n})=>{const t=await fe(e);if(!t)return;const a=t.cards.find(l=>l.id===n);if(!a){B(`/${e}/card-library`);return}pt(a,t.progressMap,{onBack:()=>history.back()})});function ft(){Ce(L.subject.storageKey),L.progressMap={},B(`/${L.subject.id}`)}function O(){B(`/${L.subject.id}`)}function _e(e,n){if(ge=e,je=n,_=Qe(L.cards,L.progressMap,e,n),J={reviewed:0,correct:0},q={},_.length===0){bt();return}ve()}function ve(){if(_.length===0){ut(J,{onAgain:()=>_e(ge,je),onHome:O});return}const e=_[0],n=H(e.id,L.progressMap),t={phase:n.phase,streak:q[e.id]??0,interval:n.interval};X(e)==="multiple-choice"?ot(e,{remaining:_.length,cardInfo:t},(a,l)=>mt(e,a,l),O):it(e,{remaining:_.length,cardInfo:t},vt,O)}function vt(){const e=_[0],n=H(e.id,L.progressMap),t={phase:n.phase,streak:q[e.id]??0,interval:n.interval},a=oe(n);lt(e,{remaining:_.length,cardInfo:t,previews:a},ht,O)}function ht(e){const n=_[0],t=De(n,e);Le(t,ve)}function mt(e,n,t){const a=H(e.id,L.progressMap),l={phase:a.phase,streak:q[e.id]??0,interval:a.interval},p=oe(a);ct(e,{remaining:_.length,cardInfo:l,previews:p},n,t,g=>{const o=De(e,g);Le(o,ve)},O)}function De(e,n){const t=H(e.id,L.progressMap);let a,l=!1,p;if(t.phase==="learning")if(n==="easy")a=$e(t,"easy"),l=!0,p="Graduated! See you in 3 days";else if(n==="good"){const g=(q[e.id]??0)+1;q[e.id]=g,g>=2?(a=Ze(t,"good"),l=!0,p="Graduated! See you in 2 days",delete q[e.id]):(a={...t,totalSeen:t.totalSeen+1,lastReviewed:Date.now()},p="1 more correct to graduate")}else q[e.id]=0,a={...t,totalSeen:t.totalSeen+1,lastReviewed:Date.now()},p="Coming back soon";else a=$e(t,n),l=!0,p=`See you in ${oe(t)[n]}`;return L.progressMap={...L.progressMap,[e.id]:a},Be(L.subject.storageKey,L.progressMap),J.reviewed++,n!=="hard"&&J.correct++,_=We(_,l,n),p}function bt(){const e=ue(L.cards,ge),n=ce(e,L.progressMap),t=Ke(L.progressMap);gt({nextDueTs:t,mastered:n.mastered,total:n.total},O)}qe();Ve();

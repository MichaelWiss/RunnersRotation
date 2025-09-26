import{w as S}from"./with-props-BdEiHHRH.js";import{r as u,j as o,e as h,f as b,M as T,g as C,S as R,h as j,O as L}from"./chunk-D4RADZKF-D68o3qWl.js";import{h as y}from"./homepage-D85hieJv.js";const k="/assets/app-DWGTE3s7.css",P="modulepreload",H=function(t){return"/"+t},g={},A=function(e,n,a){let s=Promise.resolve();if(n&&n.length>0){let r=function(d){return Promise.all(d.map(p=>Promise.resolve(p).then(f=>({status:"fulfilled",value:f}),f=>({status:"rejected",reason:f}))))};document.getElementsByTagName("link");const c=document.querySelector("meta[property=csp-nonce]"),m=c?.nonce||c?.getAttribute("nonce");s=r(n.map(d=>{if(d=H(d),d in g)return;g[d]=!0;const p=d.endsWith(".css"),f=p?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${d}"]${f}`))return;const l=document.createElement("link");if(l.rel=p?"stylesheet":P,p||(l.as="script"),l.crossOrigin="",l.href=d,m&&l.setAttribute("nonce",m),document.head.appendChild(l),p)return new Promise((v,w)=>{l.addEventListener("load",v),l.addEventListener("error",()=>w(new Error(`Unable to preload CSS for ${d}`)))})}))}function i(r){const c=new Event("vite:preloadError",{cancelable:!0});if(c.payload=r,window.dispatchEvent(c),!c.defaultPrevented)throw r}return s.then(r=>{for(const c of r||[])c.status==="rejected"&&i(c.reason);return e().catch(i)})},x={};function I(t,e){const n=x[t];if(n)return n;const a=new Promise((s,i)=>{const r=document.createElement("script");e?.module?r.type="module":r.type="text/javascript",r.src=t,r.onload=()=>{s(!0)},r.onerror=()=>{i(!1)},e?.in==="head"?document.head.appendChild(r):document.body.appendChild(r);const c=e?.attributes;c&&Object.keys(c).forEach(m=>{r.setAttribute(m,c[m])})});return x[t]=a,a}function O(t,e){const[n,a]=u.useState("loading");return u.useEffect(()=>{I(t,e).then(()=>a("done")).catch(()=>a("error"))},[t]),n}var D={canTrack:()=>!1,cart:null,customData:{},prevCart:null,publish:()=>{},shop:null,subscribe:()=>{},register:()=>({ready:()=>{}}),customerPrivacy:null,privacyBanner:null};u.createContext(D);var _=u.createContext(void 0);_.Provider;var E=()=>u.useContext(_);u.forwardRef((t,e)=>{let{waitForHydration:n,src:a,...s}=t,i=E();return n?o.jsx(N,{src:a,options:s}):o.jsx("script",{suppressHydrationWarning:!0,...s,src:a,nonce:i,ref:e})});function N({src:t,options:e}){if(!t)throw new Error("`waitForHydration` with the Script component requires a `src` prop");return O(t,{attributes:e}),null}u.lazy(()=>A(()=>import("./log-seo-tags-TY72EQWZ-DCHH-_Gl.js"),[]));const B=`(() => {
  const w = window;
  if (w.__rrHydrationGuardInit) return;
  w.__rrHydrationGuardInit = true;

  const attach = (banner) => {
    const body = document.body;
    if (body) {
      body.prepend(banner);
      return;
    }
    document.addEventListener(
      'DOMContentLoaded',
      () => {
        document.body?.prepend(banner);
      },
      {once: true},
    );
  };

  const showBanner = (message) => {
    const existing = document.getElementById('rr-hydration-alert');
    if (existing) {
      existing.textContent = message;
      return;
    }

    const el = document.createElement('div');
    el.id = 'rr-hydration-alert';
    el.textContent = message;
    el.setAttribute('role', 'alert');
    el.style.cssText = [
      'position:fixed',
      'inset:auto 16px 16px 16px',
      'padding:12px 16px',
      'border-radius:8px',
      'background:#0b2545',
      'color:#fff',
      'z-index:2147483647',
      'box-shadow:0 12px 30px rgba(11,37,69,0.35)',
      'font-family:Inter,system-ui,sans-serif',
      'font-size:14px',
      'line-height:1.4',
      'text-align:center',
    ].join(';');

    const dismiss = document.createElement('button');
    dismiss.type = 'button';
    dismiss.textContent = 'Dismiss';
    dismiss.style.cssText = [
      'margin-left:12px',
      'padding:6px 10px',
      'border-radius:6px',
      'border:none',
      'background:#e94c26',
      'color:#fff',
      'font-weight:600',
      'cursor:pointer',
    ].join(';');
    dismiss.addEventListener('click', () => el.remove());

    el.appendChild(dismiss);
    attach(el);
  };

  w.__rrHydrationShowBanner = showBanner;
  w.__rrHydrationConfirm = () => {
    w.__rrHydrationConfirmed = true;
    if (w.__rrHydrationTimer) {
      clearTimeout(w.__rrHydrationTimer);
      w.__rrHydrationTimer = undefined;
    }
  };

  w.__rrHydrationTimer = setTimeout(() => {
    if (w.__rrHydrationConfirmed) return;
    showBanner('Interactive features are taking longer than expected to load. Please refresh or check the console for errors.');
  }, 4000);
})();`;function G(t,e){switch(e.type){case"SET_CART":return{...t,cart:e.cart};case"SET_LOADING":return{...t,isLoading:e.loading};case"SET_ERROR":return{...t,error:e.error};default:return t}}const M=u.createContext(null);function F({children:t,initialCart:e}){const[n,a]=u.useReducer(G,{cart:e,isLoading:!1,error:null}),s=h(),i=h(),r=h();u.useEffect(()=>{s.data?.cart&&a({type:"SET_CART",cart:s.data.cart}),s.data?.error&&a({type:"SET_ERROR",error:s.data.error}),a({type:"SET_LOADING",loading:s.state==="submitting"})},[s.data,s.state]),u.useEffect(()=>{i.data?.cart&&a({type:"SET_CART",cart:i.data.cart}),i.data?.error&&a({type:"SET_ERROR",error:i.data.error})},[i.data]),u.useEffect(()=>{r.data?.cart&&a({type:"SET_CART",cart:r.data.cart}),r.data?.error&&a({type:"SET_ERROR",error:r.data.error})},[r.data]);const c=(f,l=1)=>{a({type:"SET_LOADING",loading:!0}),s.submit({variantId:f,quantity:l.toString()},{method:"post",action:"/cart/add"})},m=f=>{i.submit({lineId:f},{method:"post",action:"/cart/remove"})},d=(f,l)=>{r.submit({lineId:f,quantity:l.toString()},{method:"post",action:"/cart/update"})},p=n.cart?.totalQuantity||0;return o.jsx(M.Provider,{value:{...n,addToCart:c,removeFromCart:m,updateCartLine:d,cartCount:p},children:t})}var q={};const V=()=>[{rel:"preconnect",href:"https://cdn.shopify.com"},{rel:"preconnect",href:"https://shop.app"},{rel:"icon",type:"image/svg+xml",href:"/favicon.svg"},{rel:"preload",as:"style",href:y},{rel:"stylesheet",href:k},{rel:"stylesheet",href:y}];function U({children:t}){const e=b("root"),n=E();return e?.layout.shop,o.jsxs("html",{lang:"en",children:[o.jsxs("head",{children:[o.jsx("meta",{charSet:"utf-8"}),o.jsx("meta",{name:"viewport",content:"width=device-width,initial-scale=1"}),o.jsx("style",{nonce:n,dangerouslySetInnerHTML:{__html:":root { --bg:#f7efe6;--panel:#0b2545;--accent:#e94c26;--accent-dark:#c83b1a;--accent-light:#ff7a4a;--panel-light:#a33a25;--panel-dark:#4a140e;--muted:#8b3a2a;--card:#fff3e8;--line:#f1d7c7;--cta-hover:#c83b1a;--glass:rgba(11,37,69,0.06);--warm-gradient:linear-gradient(180deg,#f7efe6,#f6e9df 60%);--card-gradient:linear-gradient(180deg,#fff3e8,#ffece0);--accent-gradient:linear-gradient(90deg,#e94c26,#ff7a4a);--radius:0px;--shadow-soft:0 8px 30px rgba(11,37,69,0.06);--shadow-strong:0 18px 50px rgba(11,37,69,0.08);--scroll-percentage:0;--scroll-pct:calc(var(--scroll-percentage,0)*100%);--surface:#f7efe6;--band-surface:#f7efe6;--header-h:160px;--announcement-h:40px; } body{background:var(--warm-gradient);color:var(--panel);} "}}),o.jsx(T,{}),o.jsx(C,{})]}),o.jsxs("body",{className:"page-container",children:[o.jsx("script",{nonce:n,dangerouslySetInnerHTML:{__html:B}}),t,o.jsx(R,{nonce:n}),o.jsx(j,{nonce:n}),q.DEBUG_INSTRUMENTATION==="1"?o.jsx("script",{nonce:n,dangerouslySetInnerHTML:{__html:"(() => { try { const rs = getComputedStyle(document.documentElement); const ok = rs.getPropertyValue('--accent').trim(); if(!ok){ console.warn('[css] token --accent missing before hydration'); } else { console.log('[css] tokens ready'); } } catch(e) { console.warn('[css] readiness check failed', e); } })();"}}):null]})]})}const Q=S(function(){const e=b("root");return o.jsx(F,{initialCart:e?.cart||null,children:o.jsx(U,{children:o.jsx(L,{})})})});export{U as Layout,Q as default,V as links};

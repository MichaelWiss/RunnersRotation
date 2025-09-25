import{w as _}from"./with-props-3Ay5uWCt.js";import{a as d,o,p as E,M as S,L as j,S as k,q as C,O as T}from"./chunk-D4RADZKF-CZQXsKcl.js";import{h}from"./homepage-D85hieJv.js";const L="/assets/app-DWGTE3s7.css",H="modulepreload",P=function(e){return"/"+e},y={},I=function(t,r,i){let l=Promise.resolve();if(r&&r.length>0){let n=function(a){return Promise.all(a.map(p=>Promise.resolve(p).then(m=>({status:"fulfilled",value:m}),m=>({status:"rejected",reason:m}))))};document.getElementsByTagName("link");const s=document.querySelector("meta[property=csp-nonce]"),f=s?.nonce||s?.getAttribute("nonce");l=n(r.map(a=>{if(a=P(a),a in y)return;y[a]=!0;const p=a.endsWith(".css"),m=p?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${a}"]${m}`))return;const c=document.createElement("link");if(c.rel=p?"stylesheet":H,p||(c.as="script"),c.crossOrigin="",c.href=a,f&&c.setAttribute("nonce",f),document.head.appendChild(c),p)return new Promise((w,v)=>{c.addEventListener("load",w),c.addEventListener("error",()=>v(new Error(`Unable to preload CSS for ${a}`)))})}))}function u(n){const s=new Event("vite:preloadError",{cancelable:!0});if(s.payload=n,window.dispatchEvent(s),!s.defaultPrevented)throw n}return l.then(n=>{for(const s of n||[])s.status==="rejected"&&u(s.reason);return t().catch(u)})},g={};function R(e,t){const r=g[e];if(r)return r;const i=new Promise((l,u)=>{const n=document.createElement("script");t?.module?n.type="module":n.type="text/javascript",n.src=e,n.onload=()=>{l(!0)},n.onerror=()=>{u(!1)},t?.in==="head"?document.head.appendChild(n):document.body.appendChild(n);const s=t?.attributes;s&&Object.keys(s).forEach(f=>{n.setAttribute(f,s[f])})});return g[e]=i,i}function D(e,t){const[r,i]=d.useState("loading");return d.useEffect(()=>{R(e,t).then(()=>i("done")).catch(()=>i("error"))},[e]),r}var A={canTrack:()=>!1,cart:null,customData:{},prevCart:null,publish:()=>{},shop:null,subscribe:()=>{},register:()=>({ready:()=>{}}),customerPrivacy:null,privacyBanner:null};d.createContext(A);var x=d.createContext(void 0);x.Provider;var b=()=>d.useContext(x);d.forwardRef((e,t)=>{let{waitForHydration:r,src:i,...l}=e,u=b();return r?o.jsx(B,{src:i,options:l}):o.jsx("script",{suppressHydrationWarning:!0,...l,src:i,nonce:u,ref:t})});function B({src:e,options:t}){if(!e)throw new Error("`waitForHydration` with the Script component requires a `src` prop");return D(e,{attributes:t}),null}d.lazy(()=>I(()=>import("./log-seo-tags-TY72EQWZ-DCHH-_Gl.js"),[]));const M=`(() => {
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
})();`;var O={};const q=()=>[{rel:"preconnect",href:"https://cdn.shopify.com"},{rel:"preconnect",href:"https://shop.app"},{rel:"icon",type:"image/svg+xml",href:"/favicon.svg"},{rel:"preload",as:"style",href:h},{rel:"stylesheet",href:L},{rel:"stylesheet",href:h}];function $({children:e}){const t=E("root"),r=b();return t?.layout.shop,o.jsxs("html",{lang:"en",children:[o.jsxs("head",{children:[o.jsx("meta",{charSet:"utf-8"}),o.jsx("meta",{name:"viewport",content:"width=device-width,initial-scale=1"}),o.jsx("style",{nonce:r,dangerouslySetInnerHTML:{__html:":root { --bg:#f7efe6;--panel:#0b2545;--accent:#e94c26;--accent-dark:#c83b1a;--accent-light:#ff7a4a;--panel-light:#a33a25;--panel-dark:#4a140e;--muted:#8b3a2a;--card:#fff3e8;--line:#f1d7c7;--cta-hover:#c83b1a;--glass:rgba(11,37,69,0.06);--warm-gradient:linear-gradient(180deg,#f7efe6,#f6e9df 60%);--card-gradient:linear-gradient(180deg,#fff3e8,#ffece0);--accent-gradient:linear-gradient(90deg,#e94c26,#ff7a4a);--radius:0px;--shadow-soft:0 8px 30px rgba(11,37,69,0.06);--shadow-strong:0 18px 50px rgba(11,37,69,0.08);--scroll-percentage:0;--scroll-pct:calc(var(--scroll-percentage,0)*100%);--surface:#f7efe6;--band-surface:#f7efe6;--header-h:160px;--announcement-h:40px; } body{background:var(--warm-gradient);color:var(--panel);} "}}),o.jsx(S,{}),o.jsx(j,{})]}),o.jsxs("body",{className:"page-container",children:[o.jsx("script",{nonce:r,dangerouslySetInnerHTML:{__html:M}}),e,o.jsx(k,{nonce:r}),o.jsx(C,{nonce:r}),O.DEBUG_INSTRUMENTATION==="1"?o.jsx("script",{nonce:r,dangerouslySetInnerHTML:{__html:"(() => { try { const rs = getComputedStyle(document.documentElement); const ok = rs.getPropertyValue('--accent').trim(); if(!ok){ console.warn('[css] token --accent missing before hydration'); } else { console.log('[css] tokens ready'); } } catch(e) { console.warn('[css] readiness check failed', e); } })();"}}):null]})]})}const z=_(function(){return o.jsx(T,{})});export{$ as Layout,z as default,q as links};

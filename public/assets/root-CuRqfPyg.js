import{w as E}from"./with-props-Cp6sFjEk.js";import{r as d,j as r,f as x,M as S,g as j,S as C,h as k,O as T}from"./chunk-D4RADZKF-Bpmw1RCb.js";import{h,C as H}from"./CartContext-C0R-O53T.js";const L="/assets/app-DWGTE3s7.css",P="modulepreload",I=function(t){return"/"+t},g={},R=function(e,n,i){let l=Promise.resolve();if(n&&n.length>0){let o=function(a){return Promise.all(a.map(f=>Promise.resolve(f).then(m=>({status:"fulfilled",value:m}),m=>({status:"rejected",reason:m}))))};document.getElementsByTagName("link");const s=document.querySelector("meta[property=csp-nonce]"),p=s?.nonce||s?.getAttribute("nonce");l=o(n.map(a=>{if(a=I(a),a in g)return;g[a]=!0;const f=a.endsWith(".css"),m=f?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${a}"]${m}`))return;const c=document.createElement("link");if(c.rel=f?"stylesheet":P,f||(c.as="script"),c.crossOrigin="",c.href=a,p&&c.setAttribute("nonce",p),document.head.appendChild(c),f)return new Promise((v,_)=>{c.addEventListener("load",v),c.addEventListener("error",()=>_(new Error(`Unable to preload CSS for ${a}`)))})}))}function u(o){const s=new Event("vite:preloadError",{cancelable:!0});if(s.payload=o,window.dispatchEvent(s),!s.defaultPrevented)throw o}return l.then(o=>{for(const s of o||[])s.status==="rejected"&&u(s.reason);return e().catch(u)})},y={};function D(t,e){const n=y[t];if(n)return n;const i=new Promise((l,u)=>{const o=document.createElement("script");e?.module?o.type="module":o.type="text/javascript",o.src=t,o.onload=()=>{l(!0)},o.onerror=()=>{u(!1)},e?.in==="head"?document.head.appendChild(o):document.body.appendChild(o);const s=e?.attributes;s&&Object.keys(s).forEach(p=>{o.setAttribute(p,s[p])})});return y[t]=i,i}function A(t,e){const[n,i]=d.useState("loading");return d.useEffect(()=>{D(t,e).then(()=>i("done")).catch(()=>i("error"))},[t]),n}var B={canTrack:()=>!1,cart:null,customData:{},prevCart:null,publish:()=>{},shop:null,subscribe:()=>{},register:()=>({ready:()=>{}}),customerPrivacy:null,privacyBanner:null};d.createContext(B);var b=d.createContext(void 0);b.Provider;var w=()=>d.useContext(b);d.forwardRef((t,e)=>{let{waitForHydration:n,src:i,...l}=t,u=w();return n?r.jsx(M,{src:i,options:l}):r.jsx("script",{suppressHydrationWarning:!0,...l,src:i,nonce:u,ref:e})});function M({src:t,options:e}){if(!t)throw new Error("`waitForHydration` with the Script component requires a `src` prop");return A(t,{attributes:e}),null}d.lazy(()=>R(()=>import("./log-seo-tags-TY72EQWZ-DCHH-_Gl.js"),[]));const O=`(() => {
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
})();`;var N={};const z=()=>[{rel:"preconnect",href:"https://cdn.shopify.com"},{rel:"preconnect",href:"https://shop.app"},{rel:"icon",type:"image/svg+xml",href:"/favicon.svg"},{rel:"preload",as:"style",href:h},{rel:"stylesheet",href:L},{rel:"stylesheet",href:h}];function G({children:t}){const e=x("root"),n=w();return e?.layout.shop,r.jsxs("html",{lang:"en",children:[r.jsxs("head",{children:[r.jsx("meta",{charSet:"utf-8"}),r.jsx("meta",{name:"viewport",content:"width=device-width,initial-scale=1"}),r.jsx("style",{nonce:n,dangerouslySetInnerHTML:{__html:":root { --bg:#f7efe6;--panel:#0b2545;--accent:#e94c26;--accent-dark:#c83b1a;--accent-light:#ff7a4a;--panel-light:#a33a25;--panel-dark:#4a140e;--muted:#8b3a2a;--card:#fff3e8;--line:#f1d7c7;--cta-hover:#c83b1a;--glass:rgba(11,37,69,0.06);--warm-gradient:linear-gradient(180deg,#f7efe6,#f6e9df 60%);--card-gradient:linear-gradient(180deg,#fff3e8,#ffece0);--accent-gradient:linear-gradient(90deg,#e94c26,#ff7a4a);--radius:0px;--shadow-soft:0 8px 30px rgba(11,37,69,0.06);--shadow-strong:0 18px 50px rgba(11,37,69,0.08);--scroll-percentage:0;--scroll-pct:calc(var(--scroll-percentage,0)*100%);--surface:#f7efe6;--band-surface:#f7efe6;--header-h:160px;--announcement-h:40px; } body{background:var(--warm-gradient);color:var(--panel);} "}}),r.jsx(S,{}),r.jsx(j,{})]}),r.jsxs("body",{className:"page-container",children:[r.jsx("script",{nonce:n,dangerouslySetInnerHTML:{__html:O}}),t,r.jsx(C,{nonce:n}),r.jsx(k,{nonce:n}),N.DEBUG_INSTRUMENTATION==="1"?r.jsx("script",{nonce:n,dangerouslySetInnerHTML:{__html:"(() => { try { const rs = getComputedStyle(document.documentElement); const ok = rs.getPropertyValue('--accent').trim(); if(!ok){ console.warn('[css] token --accent missing before hydration'); } else { console.log('[css] tokens ready'); } } catch(e) { console.warn('[css] readiness check failed', e); } })();"}}):null]})]})}const W=E(function(){const e=x("root");return r.jsx(H,{initialCart:e?.cart||null,children:r.jsx(G,{children:r.jsx(T,{})})})});export{G as Layout,W as default,z as links};

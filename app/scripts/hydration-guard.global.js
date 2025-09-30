(() => {
  if (window.__rrHydrationGuardInit) return;
  window.__rrHydrationGuardInit = true;

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
      'display:flex',
      'justify-content:center',
      'align-items:center',
      'gap:12px',
      'flex-wrap:wrap',
    ].join(';');

    const dismiss = document.createElement('button');
    dismiss.type = 'button';
    dismiss.textContent = 'Dismiss';
    dismiss.style.cssText = [
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

  window.__rrHydrationShowBanner = showBanner;
  window.__rrHydrationConfirm = () => {
    window.__rrHydrationConfirmed = true;
    if (window.__rrHydrationTimer) {
      clearTimeout(window.__rrHydrationTimer);
      window.__rrHydrationTimer = undefined;
    }
  };

  window.__rrHydrationTimer = setTimeout(() => {
    if (window.__rrHydrationConfirmed) return;
    showBanner('Interactive features are taking longer than expected to load. Please refresh or check the console for errors.');
  }, 4000);
})();

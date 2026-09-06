const fs = require('fs');
let code = fs.readFileSync('src/main.ts', 'utf8');
const idx = code.indexOf('function initApp()');
if (idx !== -1) {
  code = code.substring(0, idx);
}
code += `
function initApp() {
  try {
    new App();
  } catch (err) {
    console.error('App initialization error:', err);
    const appEl = document.getElementById('app');
    if (appEl) {
      appEl.innerHTML = \`<div style="color:#ef4444;padding:24px;font-family:sans-serif;">
        <h3>Error starting game:</h3>
        <pre>\${String(err && err.stack ? err.stack : err)}</pre>
        <button onclick="localStorage.clear();location.reload();" style="padding:8px 16px;background:#1e293b;color:white;border:1px solid #334155;border-radius:6px;cursor:pointer;margin-top:12px;">Reset Save Data & Reload</button>
      </div>\`;
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
`;
fs.writeFileSync('src/main.ts', code);

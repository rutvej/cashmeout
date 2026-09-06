import { FeatureUnlockDef } from '../../progression/unlock-types';

export function showUnlockToast(feature: FeatureUnlockDef): void {
  const toastContainerId = 'unlock-toast-container';
  let container = document.getElementById(toastContainerId);
  if (!container) {
    container = document.createElement('div');
    container.id = toastContainerId;
    container.className = 'unlock-toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'unlock-toast-item';
  toast.innerHTML = `
    <div class="toast-glow-bar"></div>
    <div class="toast-content-row">
      <span class="toast-feature-icon">${feature.icon}</span>
      <div class="toast-text-col">
        <div class="toast-tag">🔓 NEW FEATURE UNLOCKED!</div>
        <div class="toast-title">${feature.name}</div>
        <div class="toast-desc">${feature.tagline}</div>
      </div>
      <button class="toast-close-btn" title="Dismiss">✕</button>
    </div>
  `;

  const dismiss = () => {
    toast.classList.add('toast-exit');
    setTimeout(() => {
      toast.remove();
      if (container && container.children.length === 0) {
        container.remove();
      }
    }, 300);
  };

  toast.querySelector('.toast-close-btn')?.addEventListener('click', dismiss);
  toast.addEventListener('click', dismiss);

  container.appendChild(toast);

  // Auto dismiss after 4.5 seconds
  setTimeout(() => {
    if (toast.parentElement) dismiss();
  }, 4500);
}

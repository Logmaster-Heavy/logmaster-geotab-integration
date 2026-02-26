const ERROR_OVERLAY_ID = 'logmaster-error-overlay';

/**
 * Shows an error overlay with an OK button. Calls onDismiss when the user dismisses.
 *
 * @param {function} onDismiss - Called when the user clicks OK.
 * @param {string} [message] - Optional error message. Defaults to generic loading error.
 */
export function showErrorMessage(onDismiss, message) {
  if (document.getElementById(ERROR_OVERLAY_ID)) {
    return;
  }

  const overlay = document.createElement('div');
  overlay.id = ERROR_OVERLAY_ID;
  overlay.setAttribute(
    'style',
    'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);' +
      'display:flex;align-items:center;justify-content:center;z-index:10000;'
  );

  const panel = document.createElement('div');
  panel.setAttribute(
    'style',
    'background:#fff;border-radius:8px;padding:24px;max-width:400px;box-shadow:0 4px 20px rgba(0,0,0,0.15);'
  );

  const paragraph = document.createElement('p');
  paragraph.setAttribute('style', 'margin:0 0 20px;color:#333;line-height:1.5;');
  paragraph.textContent =
    message ||
    'An error occurred while loading the Logmaster add-in. Please try again or contact Logmaster support@logmaster.com.au';

  const okBtn = document.createElement('button');
  okBtn.type = 'button';
  okBtn.textContent = 'OK';
  okBtn.setAttribute(
    'style',
    'width:100%;padding:10px 16px;background:#0066cc;color:#fff;border:none;border-radius:4px;' +
      'font-size:14px;cursor:pointer;'
  );
  okBtn.addEventListener('click', () => {
    overlay.remove();
    if (typeof onDismiss === 'function') {
      onDismiss();
    }
  });

  panel.appendChild(paragraph);
  panel.appendChild(okBtn);
  overlay.appendChild(panel);

  const app = document.getElementById('app') || document.body;
  app.appendChild(overlay);
}

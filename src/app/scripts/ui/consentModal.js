const MODAL_ID = 'logmaster-service-account-consent-modal';

/**
 * Shows the service account consent modal. On submit, invokes onProceed with the checkbox state.
 *
 * @param {function} onProceed - Called when the user submits. Receives (consentGiven: boolean).
 */
export function showConsentModal(onProceed) {
  if (document.getElementById(MODAL_ID)) {
    return;
  }

  const overlay = document.createElement('div');
  overlay.id = MODAL_ID;
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
  paragraph.setAttribute('style', 'margin:0 0 16px;color:#333;line-height:1.5;');
  paragraph.textContent =
    'The Logmaster add-in requires a Logmaster service account to sync data with the Logmaster platform.';

  const label = document.createElement('label');
  label.setAttribute('style', 'display:flex;align-items:flex-start;gap:8px;cursor:pointer;margin-bottom:20px;');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = 'logmaster-consent-checkbox';
  checkbox.setAttribute('style', 'margin-top:4px;');
  const labelText = document.createElement('span');
  labelText.setAttribute('style', 'color:#333;line-height:1.5;');
  labelText.textContent = 'I consent to this add-in creating a service account on my behalf.';
  label.appendChild(checkbox);
  label.appendChild(labelText);

  const submitBtn = document.createElement('button');
  submitBtn.type = 'button';
  submitBtn.textContent = 'Submit';
  submitBtn.disabled = true;
  submitBtn.setAttribute(
    'style',
    'width:100%;padding:10px 16px;background:#0066cc;color:#fff;border:none;border-radius:4px;' +
      'font-size:14px;cursor:pointer;opacity:0.5;cursor:not-allowed;'
  );

  const updateSubmitState = () => {
    submitBtn.disabled = !checkbox.checked;
    submitBtn.style.opacity = checkbox.checked ? '1' : '0.5';
    submitBtn.style.cursor = checkbox.checked ? 'pointer' : 'not-allowed';
  };
  checkbox.addEventListener('change', updateSubmitState);

  submitBtn.addEventListener('click', async () => {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Loading...';
    submitBtn.style.opacity = '0.7';
    submitBtn.style.cursor = 'wait';
    try {
      await Promise.resolve(onProceed(checkbox.checked));
      overlay.remove();
    } catch (err) {
      overlay.remove();
      throw err;
    }
  });

  panel.appendChild(paragraph);
  panel.appendChild(label);
  panel.appendChild(submitBtn);
  overlay.appendChild(panel);

  const app = document.getElementById('app') || document.body;
  app.appendChild(overlay);
}

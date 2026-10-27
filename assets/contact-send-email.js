/**
 * Contact page send-email helper.
 * Formats Shopify {% form 'contact' %} payload before submit.
 * Delivery goes to the store notification email (set to andrew@foreverart.com.au in Admin).
 */
(function () {
  function buildMessage(firstName, lastName, email, body, recipient) {
    var lines = [];
    lines.push('New contact form message');
    lines.push('------------------------');
    lines.push('To: ' + recipient);
    lines.push('Name: ' + [firstName, lastName].filter(Boolean).join(' ').trim());
    lines.push('Email: ' + email);
    lines.push('');
    lines.push('Message:');
    lines.push(body);
    return lines.join('\n');
  }

  function initContactSendEmail(form) {
    if (!form || form.dataset.contactSendEmailInit === '1') return;
    form.dataset.contactSendEmailInit = '1';

    var firstNameInput = form.querySelector('[data-contact-first-name]');
    var lastNameInput = form.querySelector('[data-contact-last-name]');
    var emailInput = form.querySelector('[data-contact-email]');
    var bodyInput = form.querySelector('[data-contact-body]');
    var fullNameInput = form.querySelector('[data-contact-full-name]');
    var recipientInput = form.querySelector('[data-contact-recipient]');
    var submitBtn = form.querySelector('[data-contact-submit]');

    if (!bodyInput || !emailInput) return;

    form.addEventListener('submit', function () {
      var firstName = firstNameInput ? String(firstNameInput.value || '').trim() : '';
      var lastName = lastNameInput ? String(lastNameInput.value || '').trim() : '';
      var email = String(emailInput.value || '').trim();
      var body = String(bodyInput.value || '').trim();
      var recipient =
        (recipientInput && String(recipientInput.value || '').trim()) ||
        'andrew@foreverart.com.au';

      if (fullNameInput) {
        fullNameInput.value = [firstName, lastName].filter(Boolean).join(' ').trim();
      }

      // Avoid double-wrapping if the user re-submits after a validation error.
      if (body.indexOf('New contact form message') !== 0) {
        bodyInput.value = buildMessage(firstName, lastName, email, body, recipient);
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-busy', 'true');
      }
    });
  }

  function boot() {
    document.querySelectorAll('form.js-contact-send-email').forEach(initContactSendEmail);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

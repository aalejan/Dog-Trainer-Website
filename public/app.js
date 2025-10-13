// --- UI bits ---
const btn = document.getElementById('menuBtn');
const menu = document.getElementById('mobileMenu');
btn?.addEventListener('click', () => menu.classList.toggle('hidden'));
document.getElementById('year').textContent = new Date().getFullYear();

// --- EmailJS config from <meta> tags ---
function getMeta(name) {
  const el = document.querySelector(`meta[name="${name}"]`);
  return el ? el.content : "";
}
const EMAILJS_PUBLIC_KEY  = getMeta("emailjs-public-key");
const EMAILJS_SERVICE_ID  = getMeta("emailjs-service-id");
const EMAILJS_TEMPLATE_ID = getMeta("emailjs-template-id");

// --- Initialize EmailJS (browser SDK) ---
if (window.emailjs && EMAILJS_PUBLIC_KEY) {
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
} else {
  console.error("EmailJS not initialized — check the SDK script tag and meta public key.");
}

// --- Form handling ---
const form = document.getElementById('intakeForm');
const ok = document.getElementById('formSuccess');
const err = document.getElementById('formError');
const ts = document.getElementById('ts');
const submitBtn = document.getElementById('submitBtn');

// set timestamp when page loads (anti-spam timing)
if (ts) ts.value = String(Date.now());

function showError(message) {
  if (!err) return;
  err.innerHTML = message || 'Something went wrong. Please try again or email <a href="mailto:trainer@example.com" class="underline">trainer@example.com</a>.';
  err.classList.remove('hidden');
  err.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function showSuccess() {
  ok.classList.remove('hidden');
  ok.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function startCooldown(seconds = 30) {
  let remaining = seconds;
  submitBtn.disabled = true;
  const original = submitBtn.textContent;
  const tick = () => {
    submitBtn.textContent = `Please wait… (${remaining}s)`;
    remaining -= 1;
    if (remaining < 0) {
      submitBtn.disabled = false;
      submitBtn.textContent = original;
      clearInterval(timer);
    }
  };
  tick();
  const timer = setInterval(tick, 1000);
}

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  ok.classList.add('hidden');
  err.classList.add('hidden');

  // Honeypot: real users won't fill this
  if (form._gotcha && form._gotcha.value.trim() !== "") return;

  // Timing check: require at least 2.5s on page
  const startedAt = Number(form._ts?.value || Date.now());
  if (Date.now() - startedAt < 2500) {
    showError('Please take a moment to complete the form.');
    return;
  }

  // Basic required fields for nice UX
  const required = ["client_name", "email", "dog_name", "goals"];
  const missing = required.filter((name) => !form.elements[name] || !form.elements[name].value.trim());
  if (missing.length) {
    showError(`Missing: ${missing.join(", ")}`);
    return;
  }

  // Prepare UI
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';

  try {
    // NOTE: sendForm auto-reads all inputs & file fields in the form
    const resp = await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form);

    console.log("EmailJS success:", resp);
    showSuccess();
    form.reset();

    // reset timestamp for subsequent submissions
    if (ts) ts.value = String(Date.now());

    // Basic cooldown to deter rapid repeats
    startCooldown(30);
  } catch (e) {
    console.error("EmailJS error:", e);
    const message = e?.text || e?.message || '';
    showError(message || 'Failed to send. Please try again.');
  } finally {
    // If cooldown is running, leave disabled; otherwise re-enable now
    if (!submitBtn.disabled) {
      submitBtn.textContent = originalText;
    } else {
      // cooldown handler will restore text; ensure at least not blank
      // no-op here
    }
  }
});

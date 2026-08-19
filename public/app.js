// ================================
// app.js — Skill Tree K9
// ================================

// ---------- UI: Mobile menu & footer year ----------
const btn = document.getElementById('menuBtn');
const menu = document.getElementById('mobileMenu');

function toggleMobileMenu() {
  if (!menu) return;

  const isHidden = menu.classList.contains('hidden');

  if (isHidden) {
    // Opening
    menu.classList.remove('hidden');
    // Trigger animation after removing hidden
    setTimeout(() => {
      menu.classList.remove('max-h-0', 'opacity-0');
      menu.classList.add('max-h-96', 'opacity-100');
    }, 10);
  } else {
    // Closing
    menu.classList.remove('max-h-96', 'opacity-100');
    menu.classList.add('max-h-0', 'opacity-0');
    // Wait for animation to finish before hiding
    setTimeout(() => {
      menu.classList.add('hidden');
    }, 300);
  }
}

btn?.addEventListener('click', () => {
  toggleMobileMenu();
  btn.setAttribute('aria-expanded', String(menu ? !menu.classList.contains('hidden') : false));
});

// Close mobile menu when a link is clicked
const mobileLinks = menu?.querySelectorAll('a');
mobileLinks?.forEach(link => {
  link.addEventListener('click', () => {
    menu?.classList.remove('max-h-96', 'opacity-100');
    menu?.classList.add('max-h-0', 'opacity-0');
    setTimeout(() => {
      menu?.classList.add('hidden');
    }, 300);
    btn?.setAttribute('aria-expanded', 'false');
  });
});

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// ---------- UI: Header style swap on scroll (nav over hero) ----------
const header = document.getElementById('siteHeader');

// The header sits transparent over the hero and settles into a night-blue bar on scroll.
// The look lives in CSS (#siteHeader.is-scrolled) so it never waits on the Tailwind CDN
// to generate classes that only ever appear at runtime.
function setHeaderScrolled(scrolled) {
  if (!header) return;
  header.classList.toggle('is-scrolled', scrolled);
}
function handleScroll() { setHeaderScrolled(window.scrollY > 10); }
handleScroll();
window.addEventListener('scroll', handleScroll);

// ---------- EmailJS config pulled from <meta> tags ----------
function getMeta(name) {
  const el = document.querySelector(`meta[name="${name}"]`);
  return el ? el.content : '';
}
const EMAILJS_PUBLIC_KEY  = getMeta('emailjs-public-key');
const EMAILJS_SERVICE_ID  = getMeta('emailjs-service-id');
const EMAILJS_TEMPLATE_ID = getMeta('emailjs-template-id');

// Initialize EmailJS (browser SDK)
if (window.emailjs && EMAILJS_PUBLIC_KEY) {
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
} else {
  console.error('EmailJS not initialized — check the SDK script tag and meta public key.');
}

// ---------- Intake form handling ----------
const form = document.getElementById('intakeForm');
const ok = document.getElementById('formSuccess');
const err = document.getElementById('formError');
const ts = document.getElementById('ts');
const submitBtn = document.getElementById('submitBtn');

// set timestamp on load (simple anti-spam timing)
if (ts) ts.value = String(Date.now());

function showError(message) {
  if (!err) return;
  err.innerHTML = message || 'Something went wrong. Please try again or email <a href="mailto:salejandro@skilltree-k9.com" class="underline">salejandro@skilltree-k9.com</a>.';
  err.classList.remove('hidden');
  err.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function showSuccess() {
  if (!ok) return;
  ok.classList.remove('hidden');
  ok.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Brief cooldown to deter rapid re-submits
function startCooldown(seconds = 30, originalBtnText = 'Send Intake') {
  if (!submitBtn) return;
  let remaining = seconds;
  submitBtn.disabled = true;

  function tick() {
    submitBtn.textContent = `Please wait… (${remaining}s)`;
    remaining -= 1;
    if (remaining < 0) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
      clearInterval(timer);
    }
  }
  tick();
  const timer = setInterval(tick, 1000);
}

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  ok?.classList.add('hidden');
  err?.classList.add('hidden');

  // Honeypot: real users won't fill this
  if (form._gotcha && form._gotcha.value.trim() !== '') return;

  // Timing check: require at least 2.5s on page
  const startedAt = Number(ts?.value || Date.now());
  if (Date.now() - startedAt < 2500) {
    showError('Please take a moment to complete the form.');
    return;
  }

  // Basic required fields
  const required = ['client_name', 'phone'];
  const missing = required.filter((name) => !form.elements[name] || !form.elements[name].value.trim());
  if (missing.length) {
    showError(`Missing: ${missing.join(', ')}`);
    return;
  }

  // Prepare UI
  const originalBtnText = submitBtn?.textContent || 'Send Intake';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
  }

  try {
    // EmailJS: send all form fields
    const resp = await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form);
    console.log('EmailJS success:', resp);

    showSuccess();
    form.reset();

    // reset timestamp for any future submission
    if (ts) ts.value = String(Date.now());

    // cooldown (restores text/enable when done)
    startCooldown(30, originalBtnText);
  } catch (e) {
    console.error('EmailJS error:', e);
    const message = e?.text || e?.message || 'Failed to send. Please try again.';
    showError(message);

    // restore button immediately on error
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  }
});

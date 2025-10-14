// ================================
// app.js — Skill Tree K9
// ================================

// ---------- UI: Mobile menu & footer year ----------
const btn = document.getElementById('menuBtn');
const menu = document.getElementById('mobileMenu');
btn?.addEventListener('click', () => menu.classList.toggle('hidden'));

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// ---------- UI: Header style swap on scroll (nav over hero) ----------
const header = document.getElementById('siteHeader');
const brandText = document.getElementById('brandText');
const navLinks = document.querySelectorAll('.nav-link');
const ctaBtn = document.getElementById('ctaBtn');

function setHeaderScrolled(scrolled) {
  if (!header || !brandText || !ctaBtn) return;

  if (scrolled) {
    header.className = 'fixed inset-x-0 top-0 z-50 transition-all bg-white/90 backdrop-blur border-b border-slate-200';
    brandText.className = 'text-slate-900';
    navLinks.forEach(a => a.className = 'nav-link text-slate-900 hover:text-brand');
    ctaBtn.className = 'px-3 py-2 rounded-lg bg-brand text-white hover:bg-brand-dark';

    // switch burger styles
    btn?.classList.remove('text-white','border-white/30');
    btn?.classList.add('text-slate-700','border-slate-300');

    // mobile menu text color
    menu?.classList.add('text-slate-900');
  } else {
    header.className = 'fixed inset-x-0 top-0 z-50 transition-all';
    brandText.className = 'text-white';
    navLinks.forEach(a => a.className = 'nav-link text-white/90 hover:text-white');
    ctaBtn.className = 'px-3 py-2 rounded-lg bg-white/15 text-white backdrop-blur hover:bg-white/25 border border-white/20';

    btn?.classList.add('text-white','border-white/30');
    btn?.classList.remove('text-slate-700','border-slate-300');

    menu?.classList.remove('text-slate-900');
  }
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
  const required = ['client_name', 'email', 'dog_name', 'goals'];
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

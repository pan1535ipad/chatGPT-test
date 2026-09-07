const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.global-nav');

function updateScrollUI() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  header.classList.toggle('scrolled', y > 24);
  document.body.dataset.progress = '';
  document.body.style.setProperty('--scroll-progress', `${max ? (y / max) * 100 : 0}%`);
}
updateScrollUI();
window.addEventListener('scroll', updateScrollUI, { passive: true });

menuButton.addEventListener('click', () => {
  const open = !menuButton.classList.contains('open');
  menuButton.classList.toggle('open', open);
  nav.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
});

nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    menuButton.classList.remove('open');
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'メニューを開く');
  });
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });
document.querySelectorAll('.reveal').forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 4, 3) * 80}ms`;
  revealObserver.observe(element);
});

function animateCount(element) {
  const target = Number(element.dataset.count);
  const suffix = element.dataset.suffix || '';
  const duration = target > 500 ? 1300 : 900;
  const start = performance.now();
  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.floor(target * eased).toLocaleString('ja-JP') + suffix;
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
const countObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    animateCount(entry.target);
    countObserver.unobserve(entry.target);
  });
}, { threshold: .6 });
document.querySelectorAll('[data-count]').forEach(item => countObserver.observe(item));

document.querySelectorAll('.accordion details').forEach(detail => {
  detail.addEventListener('toggle', () => {
    if (!detail.open) return;
    document.querySelectorAll('.accordion details').forEach(other => {
      if (other !== detail) other.open = false;
    });
  });
});

const form = document.querySelector('#contact-form');
const validators = {
  name: value => value.trim().length >= 2 ? '' : 'お名前を2文字以上で入力してください。',
  email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : '正しいメールアドレスを入力してください。',
  message: value => value.trim().length >= 10 ? '' : 'ご相談内容を10文字以上で入力してください。'
};
function validateField(field) {
  const row = field.closest('.form-row');
  const error = validators[field.name](field.value);
  row.classList.toggle('invalid', Boolean(error));
  row.querySelector('.error').textContent = error;
  field.setAttribute('aria-invalid', String(Boolean(error)));
  return !error;
}
form?.querySelectorAll('input, textarea').forEach(field => {
  field.addEventListener('blur', () => validateField(field));
  field.addEventListener('input', () => {
    if (field.closest('.form-row').classList.contains('invalid')) validateField(field);
  });
});
form?.addEventListener('submit', event => {
  event.preventDefault();
  const fields = [...form.querySelectorAll('input, textarea')];
  const valid = fields.map(validateField).every(Boolean);
  const status = form.querySelector('.form-status');
  if (!valid) {
    status.textContent = '入力内容をご確認ください。';
    fields.find(field => field.getAttribute('aria-invalid') === 'true')?.focus();
    return;
  }
  status.textContent = '入力内容を確認しました。現在、お問い合わせ送信機能は準備中です。';
});

window.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('open')) menuButton.click();
});
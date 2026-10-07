// Progressive enhancement: project notes remain readable without JavaScript.
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const dialogs = document.querySelectorAll('.project-dialog');
const modalSupported = typeof HTMLDialogElement !== 'undefined'
  && typeof HTMLDialogElement.prototype.showModal === 'function';

if (modalSupported) {
  document.documentElement.classList.add('has-project-modals');
  dialogs.forEach(dialog => dialog.removeAttribute('open'));
  const triggers = new Map();
  document.querySelectorAll('[data-project]').forEach(link => {
    link.addEventListener('click', event => {
      const dialog = document.getElementById(link.dataset.project);
      if (!dialog || dialog.open) return;
      event.preventDefault();
      triggers.set(dialog, link);
      dialog.showModal();
      document.body.classList.add('dialog-open');
      dialog.scrollTop = 0;
      dialog.querySelector('h2').focus({ preventScroll: true });
    });
  });
  dialogs.forEach(dialog => {
    dialog.querySelectorAll('.dialog-close').forEach(button => {
      button.addEventListener('click', () => dialog.close());
    });
    // Native dialog provides focus containment and Escape-key dismissal.
    dialog.addEventListener('click', event => {
      const bounds = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < bounds.left
        || event.clientX > bounds.right || event.clientY < bounds.top
        || event.clientY > bounds.bottom)) dialog.close();
    });
    dialog.addEventListener('close', () => {
      if (!Array.from(dialogs).some(item => item.open)) {
        document.body.classList.remove('dialog-open');
      }
      triggers.get(dialog)?.focus({ preventScroll: true });
    });
  });
  // Keep direct project links useful when shared or opened with a hash.
  const openHashProject = () => {
    const id = window.location.hash.slice(1);
    const link = Array.from(document.querySelectorAll('[data-project]'))
      .find(item => item.dataset.project === id);
    if (link) link.click();
  };
  openHashProject();
  window.addEventListener('hashchange', openHashProject);
} else {
  dialogs.forEach(dialog => dialog.setAttribute('open', ''));
}

if ('IntersectionObserver' in window) {
  const links = document.querySelectorAll('nav a');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => {
        const active = link.hash === '#' + entry.target.id;
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-10% 0px -60% 0px', threshold: 0 });
  document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
}

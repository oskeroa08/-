// Перед публикацией укажите адрес для приёма заявок. Например: const CONTACT_EMAIL = 'hello@yourdomain.ru';
const CONTACT_EMAIL = '';

const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.top-nav');

if (menuToggle && navigation) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    navigation.classList.toggle('open', !isOpen);
  });
  navigation.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navigation.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const observedSections = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  observedSections.forEach((section) => revealObserver.observe(section));
} else {
  observedSections.forEach((section) => section.classList.add('is-visible'));
}

document.querySelectorAll('.top-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.top-nav a').forEach((item) => item.classList.remove('active'));
    link.classList.add('active');
  });
});

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const contactForm = document.getElementById('contact-form');
const formNote = document.getElementById('form-note');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    const name = String(formData.get('name') || '').trim();
    const replyTo = String(formData.get('contact') || '').trim();
    const message = String(formData.get('message') || '').trim();
    if (!name || !replyTo || !message) return;

    const subject = encodeURIComponent('Запрос на обсуждение бизнес-задачи');
    const body = encodeURIComponent(`Имя: ${name}\nКонтакт для ответа: ${replyTo}\n\nЗадача:\n${message}`);
    if (CONTACT_EMAIL.trim()) {
      window.location.href = `mailto:${CONTACT_EMAIL.trim()}?subject=${subject}&body=${body}`;
      if (formNote) formNote.textContent = 'Открываем почтовое приложение для отправки обращения.';
    } else {
      const inquiry = `Запрос на обсуждение бизнес-задачи\n\nИмя: ${name}\nКонтакт для ответа: ${replyTo}\n\nЗадача:\n${message}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(inquiry).then(() => {
          if (formNote) formNote.textContent = 'Текст обращения скопирован. Перед публикацией укажите CONTACT_EMAIL в script.js, чтобы подключить отправку по почте.';
        }).catch(() => {
          if (formNote) formNote.textContent = 'Перед публикацией укажите CONTACT_EMAIL в script.js или подключите форму к CRM.';
        });
      } else if (formNote) {
        formNote.textContent = 'Перед публикацией укажите CONTACT_EMAIL в script.js или подключите форму к CRM.';
      }
    }
  });
}

/* Бизнес-архитектор — script.js
   Меню, подсветка активного раздела, появление блоков, форма обращения. */
(() => {
  'use strict';

  // Перед публикацией укажите адрес для приёма заявок,
  // например: const CONTACT_EMAIL = 'hello@yourdomain.ru';
  const CONTACT_EMAIL = '';
  // Ссылка на личный профиль или чат в мессенджере MAX (необязательно),
  // например: const CONTACT_MAX_URL = 'https://max.ru/...';
  const CONTACT_MAX_URL = '';

  /* ---------- Мобильное меню ---------- */
  const menuToggle = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.top-nav');

  if (menuToggle && navigation) {
    const setOpen = (open) => {
      menuToggle.setAttribute('aria-expanded', String(open));
      navigation.classList.toggle('open', open);
    };

    menuToggle.addEventListener('click', () => {
      setOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
    });

    navigation.addEventListener('click', (event) => {
      if (event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setOpen(false);
    });
  }

  /* ---------- Появление блоков при прокрутке ---------- */
  const revealables = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    revealables.forEach((el) => revealObserver.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Закрепление шапки после первого экрана ---------- */
  const siteHeader = document.getElementById('site-header');
  const heroSection = document.getElementById('top');
  if (siteHeader && heroSection) {
    const updateHeader = () => {
      const stuck = heroSection.getBoundingClientRect().bottom <= 56;
      siteHeader.classList.toggle('is-stuck', stuck);
    };
    window.addEventListener('scroll', updateHeader, { passive: true });
    window.addEventListener('resize', updateHeader, { passive: true });
    updateHeader();
  }

  /* ---------- Подсветка раздела в навигации (scrollspy) ---------- */
  const spyLinks = Array.from(document.querySelectorAll('.top-nav a[data-spy]'));
  const spyTargets = spyLinks
    .map((link) => document.getElementById(link.dataset.spy))
    .filter(Boolean);

  if (spyLinks.length && 'IntersectionObserver' in window) {
    const setActive = (id) => {
      spyLinks.forEach((link) => link.classList.toggle('active', link.dataset.spy === id));
    };

    const spyObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(visible.target.id);
    }, { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.25, 0.5] });

    spyTargets.forEach((section) => spyObserver.observe(section));
    spyLinks.forEach((link) => {
      link.addEventListener('click', () => setActive(link.dataset.spy));
    });
  }

  /* ---------- Год в подвале ---------- */
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Прямые контакты (показываются, только если заданы выше) ---------- */
  const directBlock = document.getElementById('direct-contact');
  const directMail = document.getElementById('direct-mail');
  const directMax = document.getElementById('direct-max');
  const directSep = document.getElementById('direct-sep');
  if (directBlock) {
    const hasMail = Boolean(CONTACT_EMAIL.trim());
    const hasMax = Boolean(CONTACT_MAX_URL.trim());
    if (hasMail && directMail) {
      directMail.href = `mailto:${CONTACT_EMAIL.trim()}`;
      directMail.hidden = false;
    }
    if (hasMax && directMax) {
      directMax.href = CONTACT_MAX_URL.trim();
      directMax.hidden = false;
    }
    if (directSep) directSep.hidden = !(hasMail && hasMax);
    directBlock.hidden = !(hasMail || hasMax);
  }

  /* ---------- Форма обращения ---------- */
  const contactForm = document.getElementById('contact-form');
  const formNote = document.getElementById('form-note');

  if (!contactForm) return;

  const fields = {
    name: {
      input: contactForm.elements.namedItem('name'),
      error: document.getElementById('name-error'),
    },
    contact: {
      input: contactForm.elements.namedItem('contact'),
      error: document.getElementById('contact-error'),
    },
    message: {
      input: contactForm.elements.namedItem('message'),
      error: document.getElementById('message-error'),
    },
  };
  const fieldNames = Object.keys(fields);

  // E-mail, Telegram-username, ссылка t.me / max.ru или телефон.
  const isValidReplyTo = (value) => {
    const trimmed = value.trim();
    return (
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed) ||
      /^@?[a-zA-Z0-9_]{5,32}$/.test(trimmed) ||
      /^(https?:\/\/)?(www\.)?t\.me\/[a-zA-Z0-9_]{5,32}\/?$/i.test(trimmed) ||
      /^(https?:\/\/)?(www\.)?max\.ru\/\S+$/i.test(trimmed) ||
      (/^\+?[\d\s()\-]{10,20}$/.test(trimmed) && trimmed.replace(/\D/g, '').length >= 10)
    );
  };

  const setFieldError = (field, message) => {
    if (field.error) field.error.textContent = message;
    field.input.setAttribute('aria-invalid', message ? 'true' : 'false');
    field.input.classList.toggle('has-error', Boolean(message));
  };

  const validateField = (fieldName) => {
    const field = fields[fieldName];
    const value = field.input.value.trim();
    let error = '';

    if (!value) {
      error = 'Заполните это поле.';
    } else if (fieldName === 'name' && value.length < 2) {
      error = 'Укажите имя (минимум 2 символа).';
    } else if (fieldName === 'contact' && !isValidReplyTo(value)) {
      error = 'Укажите e-mail, Telegram (@username), ссылку на MAX или телефон.';
    } else if (fieldName === 'message' && value.length < 10) {
      error = 'Опишите задачу чуть подробнее — минимум 10 символов.';
    } else if (fieldName === 'message' && value.length > 2000) {
      error = 'Сократите описание до 2000 символов.';
    }

    setFieldError(field, error);
    return !error;
  };

  // Ошибка снимается сразу при исправлении поля.
  for (const fieldName of fieldNames) {
    const field = fields[fieldName];
    field.input.addEventListener('input', () => {
      if (field.input.getAttribute('aria-invalid') === 'true') validateField(fieldName);
    });
    field.input.addEventListener('blur', () => {
      if (field.input.value.trim()) validateField(fieldName);
    });
  }

  const setNote = (text) => {
    if (formNote) formNote.textContent = text;
  };

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const isFormValid = fieldNames.map(validateField).every(Boolean);
    if (!isFormValid) {
      const firstInvalid = fieldNames
        .map((name) => fields[name])
        .find((field) => field.input.getAttribute('aria-invalid') === 'true');
      if (firstInvalid) firstInvalid.input.focus();
      setNote('Проверьте отмеченные поля и попробуйте ещё раз.');
      return;
    }

    const data = new FormData(contactForm);
    const name = String(data.get('name') || '').trim();
    const replyTo = String(data.get('contact') || '').trim();
    const message = String(data.get('message') || '').trim();

    if (CONTACT_EMAIL.trim()) {
      const subject = encodeURIComponent('Запрос на обсуждение бизнес-задачи');
      const body = encodeURIComponent(`Имя: ${name}\nКонтакт для ответа: ${replyTo}\n\nЗадача:\n${message}`);
      setNote('Открываем почтовое приложение для отправки обращения.');
      window.location.href = `mailto:${CONTACT_EMAIL.trim()}?subject=${subject}&body=${body}`;
      return;
    }

    // Пока адрес получателя не настроен — копируем обращение в буфер обмена.
    const inquiry = `Запрос на обсуждение бизнес-задачи\n\nИмя: ${name}\nКонтакт для ответа: ${replyTo}\n\nЗадача:\n${message}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(inquiry);
        setNote('Текст обращения скопирован. Для отправки по почте укажите CONTACT_EMAIL в script.js.');
      } catch {
        setNote('Не удалось скопировать автоматически. Укажите CONTACT_EMAIL в script.js или подключите форму к CRM.');
      }
    } else {
      setNote('Буфер обмена недоступен. Укажите CONTACT_EMAIL в script.js или подключите форму к CRM.');
    }
  });
})();

// Перед публикацией укажите адрес для приёма заявок. Например: const CONTACT_EMAIL = 'hello@yourdomain.ru';
const CONTACT_EMAIL = '';

// Мобильное меню: раскрываем навигацию и закрываем её после выбора раздела.
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

// Плавно показываем блоки при прокрутке. При отсутствии IntersectionObserver показываем всё сразу.
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

// Подсвечиваем пункт меню, соответствующий выбранному разделу.
document.querySelectorAll('.top-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.top-nav a').forEach((item) => item.classList.remove('active'));
    link.classList.add('active');
  });
});

// Автоматически обновляем год в подвале.
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Проверка формы обратной связи до попытки отправить или скопировать обращение.
const contactForm = document.getElementById('contact-form');
const formNote = document.getElementById('form-note');

if (contactForm) {
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

  // Проверяем e-mail или Telegram username / ссылку t.me.
  function isValidReplyTo(value) {
    const trimmed = value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const telegramPattern = /^@?[a-zA-Z0-9_]{5,32}$/;
    const telegramUrlPattern = /^(https?:\/\/)?(www\.)?t\.me\/[a-zA-Z0-9_]{5,32}\/?$/i;

    return emailPattern.test(trimmed) || telegramPattern.test(trimmed) || telegramUrlPattern.test(trimmed);
  }

  // Показываем ошибку у поля и помечаем его состояние для скринридеров.
  function setFieldError(field, message) {
    field.error.textContent = message;
    field.input.setAttribute('aria-invalid', message ? 'true' : 'false');
    field.input.classList.toggle('has-error', Boolean(message));
  }

  // Проверка конкретного поля вызывается и при отправке, и при исправлении значения.
  function validateField(fieldName) {
    const field = fields[fieldName];
    const value = field.input.value.trim();
    let error = '';

    if (!value) {
      error = 'Заполните это поле.';
    } else if (fieldName === 'name' && value.length < 2) {
      error = 'Укажите имя (минимум 2 символа).';
    } else if (fieldName === 'contact' && !isValidReplyTo(value)) {
      error = 'Укажите корректный e-mail или Telegram username (например, @username).';
    } else if (fieldName === 'message' && value.length < 10) {
      error = 'Опишите задачу чуть подробнее — минимум 10 символов.';
    } else if (fieldName === 'message' && value.length > 2000) {
      error = 'Сократите описание до 2000 символов.';
    }

    setFieldError(field, error);
    return !error;
  }

  // Убираем сообщение об ошибке сразу после исправления поля, не дожидаясь следующей отправки.
  Object.keys(fields).forEach((fieldName) => {
    fields[fieldName].input.addEventListener('input', () => {
      if (fields[fieldName].input.getAttribute('aria-invalid') === 'true') {
        validateField(fieldName);
      }
    });
    fields[fieldName].input.addEventListener('blur', () => {
      if (fields[fieldName].input.value.trim()) validateField(fieldName);
    });
  });

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Проверяем все поля, затем переводим фокус на первое некорректное.
    const fieldNames = Object.keys(fields);
    const isFormValid = fieldNames.map(validateField).every(Boolean);
    if (!isFormValid) {
      const firstInvalid = fieldNames.map((name) => fields[name]).find((field) => field.input.getAttribute('aria-invalid') === 'true');
      if (firstInvalid) firstInvalid.input.focus();
      if (formNote) formNote.textContent = 'Проверьте отмеченные поля и попробуйте ещё раз.';
      return;
    }

    const formData = new FormData(contactForm);
    const name = String(formData.get('name') || '').trim();
    const replyTo = String(formData.get('contact') || '').trim();
    const message = String(formData.get('message') || '').trim();
    const subject = encodeURIComponent('Запрос на обсуждение бизнес-задачи');
    const body = encodeURIComponent(`Имя: ${name}\nКонтакт для ответа: ${replyTo}\n\nЗадача:\n${message}`);

    if (CONTACT_EMAIL.trim()) {
      if (formNote) formNote.textContent = 'Открываем почтовое приложение для отправки обращения.';
      window.location.href = `mailto:${CONTACT_EMAIL.trim()}?subject=${subject}&body=${body}`;
      return;
    }

    // Пока адрес получателя не настроен, готовим обращение и копируем его в буфер обмена.
    const inquiry = `Запрос на обсуждение бизнес-задачи\n\nИмя: ${name}\nКонтакт для ответа: ${replyTo}\n\nЗадача:\n${message}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(inquiry);
        if (formNote) formNote.textContent = 'Текст обращения скопирован. Для отправки по почте укажите CONTACT_EMAIL в script.js.';
      } catch (error) {
        if (formNote) formNote.textContent = 'Не удалось скопировать автоматически. Укажите CONTACT_EMAIL в script.js или подключите форму к CRM.';
      }
    } else {
      if (formNote) formNote.textContent = 'Буфер обмена недоступен. Укажите CONTACT_EMAIL в script.js или подключите форму к CRM.';
    }
  });
}

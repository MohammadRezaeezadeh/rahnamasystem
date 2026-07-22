/* ===================================================================
   رهنما سیستم شرق — اسکریپت اصلی
   =================================================================== */

(function () {
  'use strict';

  /* ---------- المان‌های DOM ---------- */
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const backToTop = document.getElementById('backToTop');
  const contactForm = document.getElementById('contactForm');
  const navLinks = document.querySelectorAll('.nav-link');

  /* ---------- نوار ناوبری: تغییر استایل هنگام اسکرول ---------- */
  function handleScroll() {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // دکمه بازگشت به بالا
    if (window.scrollY > 600) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }

    // هایلایت لینک فعال بر اساس موقعیت اسکرول
    updateActiveLink();
  }

  /* ---------- لینک فعال منو ---------- */
  function updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  /* ---------- منوی موبایل ---------- */
  function toggleMenu() {
    navMenu.classList.toggle('open');
    navToggle.classList.toggle('active');
  }

  /* ---------- بازگشت به بالا ---------- */
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- ارسال فرم تماس ---------- */
  async function handleFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);

    // بررسی ساده
    if (!data.name || !data.phone) {
      showNotification('لطفاً نام و شماره تماس را وارد کنید.', 'error');
      return;
    }

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>در حال ارسال...</span>';

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        showNotification(result.message || 'درخواست شما با موفقیت ثبت شد!', 'success');
        contactForm.reset();
      } else {
        showNotification(result.error || 'خطا در ارسال پیام', 'error');
      }
    } catch (error) {
      showNotification('خطا در اتصال به سرور', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  }

  /* ---------- نمایش اعلان ---------- */
  function showNotification(message, type = 'info') {
    // حذف اعلان قبلی در صورت وجود
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notif = document.createElement('div');
    notif.className = `notification notification-${type}`;
    notif.innerHTML = `
      <div class="notif-icon">
        ${type === 'success'
          ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>'
          : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>'
        }
      </div>
      <div class="notif-message">${message}</div>
    `;
    document.body.appendChild(notif);

    // انیمیشن ورود
    requestAnimationFrame(() => notif.classList.add('show'));

    // حذف خودکار
    setTimeout(() => {
      notif.classList.remove('show');
      setTimeout(() => notif.remove(), 400);
    }, 4000);
  }

  /* ---------- انیمیشن Reveal هنگام اسکرول ---------- */
  function setupRevealAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -80px 0px' }
    );

    document.querySelectorAll('.about-card, .product-card, .why-item, .edu-card').forEach((el) => {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }

  /* ---------- شمارنده‌های آماری ---------- */
  function setupCounters() {
    const counters = document.querySelectorAll('.stat-num');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((counter) => observer.observe(counter));
  }

  function animateCounter(el) {
    const text = el.textContent;
    // تشخیص عدد فارسی یا انگلیسی
    const persianMap = { '۰': 0, '۱': 1, '۲': 2, '۳': 3, '۴': 4, '۵': 5, '۶': 6, '۷': 7, '۸': 8, '۹': 9 };
    const match = text.match(/\d+|\u06F[\d\u06F]+/);
    if (!match) return;

    const numStr = match[0];
    const isPersian = /[\u06F0-\u06F9]/.test(numStr);
    const targetNum = isPersian
      ? parseInt(numStr.split('').map((c) => persianMap[c] || c).join(''), 10)
      : parseInt(numStr, 10);

    if (isNaN(targetNum)) return;

    const prefix = text.substring(0, text.indexOf(numStr));
    const suffix = text.substring(text.indexOf(numStr) + numStr.length);
    const duration = 1500;
    const startTime = performance.now();

    function update(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = Math.round(targetNum * eased);

      let displayNum;
      if (isPersian) {
        displayNum = String(current).split('').map((d) => Object.keys(persianMap).find((k) => persianMap[k] === parseInt(d, 10))).join('');
      } else {
        displayNum = String(current);
      }

      el.textContent = prefix + displayNum + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  /* ---------- افکت پارالکس ملایم روی نقشه ---------- */
  function setupMapParallax() {
    const map = document.querySelector('.map-wrapper');
    if (!map) return;

    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 10;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;
      map.style.transform = `translate(${x}px, ${y}px)`;
    });
  }

  /* ---------- Smooth scroll برای لینک‌های داخلی ---------- */
  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const target = this.getAttribute('href');
        if (target === '#' || target.length < 2) return;

        const el = document.querySelector(target);
        if (!el) return;

        e.preventDefault();
        const offset = 70;
        const top = el.getBoundingClientRect().top + window.scrollY - offset;

        window.scrollTo({ top, behavior: 'smooth' });

        // بستن منوی موبایل
        navMenu.classList.remove('open');
        navToggle.classList.remove('active');
      });
    });
  }

  /* ---------- تزریق استایل اعلان ---------- */
  function injectNotificationStyles() {
    if (document.getElementById('notif-styles')) return;
    const style = document.createElement('style');
    style.id = 'notif-styles';
    style.textContent = `
      .notification {
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translate(-50%, -20px);
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 24px;
        background: rgba(15, 21, 37, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid var(--border-strong);
        border-radius: 14px;
        color: var(--text-primary);
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 200;
        max-width: 90%;
      }
      .notification.show {
        opacity: 1;
        transform: translate(-50%, 0);
      }
      .notification-success {
        border-color: rgba(16, 185, 129, 0.4);
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(15, 21, 37, 0.95));
      }
      .notification-success .notif-icon {
        background: rgba(16, 185, 129, 0.2);
        color: #34d399;
      }
      .notification-error {
        border-color: rgba(220, 38, 38, 0.4);
        background: linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(15, 21, 37, 0.95));
      }
      .notification-error .notif-icon {
        background: rgba(220, 38, 38, 0.2);
        color: #f87171;
      }
      .notif-icon {
        display: grid;
        place-items: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .notif-message {
        line-height: 1.5;
      }
      .nav-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
      }
      .nav-toggle.active span:nth-child(2) {
        opacity: 0;
      }
      .nav-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(5px, -5px);
      }
    `;
    document.head.appendChild(style);
  }

  /* ---------- رویدادها ---------- */
  function init() {
    injectNotificationStyles();
    setupSmoothScroll();
    setupRevealAnimations();
    setupCounters();
    setupMapParallax();

    window.addEventListener('scroll', handleScroll, { passive: true });
    navToggle.addEventListener('click', toggleMenu);
    backToTop.addEventListener('click', scrollToTop);
    if (contactForm) contactForm.addEventListener('submit', handleFormSubmit);

    handleScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

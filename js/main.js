/* ============================================================
   JODRO — Main JavaScript
   ============================================================ */
(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Theme (dark / light) ---------- */
  var root = document.documentElement;
  var themeToggle = $('#themeToggle');
  var savedTheme = localStorage.getItem('jodro-theme');
  if (savedTheme) {
    root.setAttribute('data-theme', savedTheme);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    root.setAttribute('data-theme', 'light');
  }
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      localStorage.setItem('jodro-theme', next);
    });
  }

  /* ---------- Nav scroll state ---------- */
  var nav = $('#nav');
  var onScroll = function () {
    if (window.scrollY > 20) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');

    var floatTop = $('#floatTop');
    if (floatTop) {
      if (window.scrollY > 600) floatTop.classList.add('is-visible');
      else floatTop.classList.remove('is-visible');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  var burger = $('#burger');
  var navMenu = $('#navMenu');
  if (burger && navMenu) {
    burger.addEventListener('click', function () {
      var isOpen = navMenu.classList.toggle('is-open');
      burger.classList.toggle('is-open', isOpen);
      burger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    $$('.nav__link', navMenu).forEach(function (link) {
      link.addEventListener('click', function () {
        navMenu.classList.remove('is-open');
        burger.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealItems = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealItems.forEach(function (el) { io.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Animated counters ---------- */
  var counters = $$('[data-count]');
  var animateCounter = function (el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1600;
    var start = null;
    var step = function (ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.round(target * eased);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window && counters.length) {
    var counterIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { counterIo.observe(el); });
  }

  /* ---------- Portfolio filters ---------- */
  var filterBtns = $$('.filter-btn');
  var portfolioCards = $$('.portfolio-card');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      var filter = btn.getAttribute('data-filter');
      portfolioCards.forEach(function (card) {
        var match = filter === 'all' || card.getAttribute('data-category') === filter;
        card.classList.toggle('is-hidden', !match);
      });
    });
  });

  /* ---------- Before / After slider ---------- */
  var baSlider = $('#baSlider');
  var baRange = $('#baRange');
  var baBefore = $('.ba-slider__before');
  var baHandle = $('#baHandle');
  var updateBa = function (val) {
    baBefore.style.clipPath = 'inset(0 ' + (100 - val) + '% 0 0)';
    baHandle.style.left = val + '%';
  };
  if (baRange) {
    baRange.addEventListener('input', function () { updateBa(baRange.value); });
    updateBa(baRange.value);
  }

  /* ---------- Testimonials carousel dots ---------- */
  var testiTrack = $('#testiTrack');
  var testiDots = $('#testiDots');
  if (testiTrack && testiDots) {
    var cards = $$('.testi-card', testiTrack);
    cards.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.setAttribute('aria-label', 'Ir al testimonio ' + (i + 1));
      if (i === 0) dot.classList.add('is-active');
      dot.addEventListener('click', function () {
        cards[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
      });
      testiDots.appendChild(dot);
    });
    var dotEls = $$('button', testiDots);
    var updateDots = function () {
      var scrollLeft = testiTrack.scrollLeft;
      var closest = 0;
      var minDist = Infinity;
      cards.forEach(function (card, i) {
        var dist = Math.abs(card.offsetLeft - scrollLeft);
        if (dist < minDist) { minDist = dist; closest = i; }
      });
      dotEls.forEach(function (d, i) { d.classList.toggle('is-active', i === closest); });
    };
    testiTrack.addEventListener('scroll', function () {
      window.requestAnimationFrame(updateDots);
    }, { passive: true });
  }

  /* ---------- FAQ accordion ---------- */
  $$('.faq-item__q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var answer = $('.faq-item__a', item);
      var isOpen = btn.getAttribute('aria-expanded') === 'true';

      $$('.faq-item__q').forEach(function (otherBtn) {
        if (otherBtn !== btn) {
          otherBtn.setAttribute('aria-expanded', 'false');
          $('.faq-item__a', otherBtn.closest('.faq-item')).style.maxHeight = null;
        }
      });

      btn.setAttribute('aria-expanded', String(!isOpen));
      answer.style.maxHeight = isOpen ? null : answer.scrollHeight + 'px';
    });
  });

  /* ---------- Modal (call booking) ---------- */
  var openModalTriggers = $$('[data-open-modal]');
  var closeModalTriggers = $$('[data-close-modal]');
  var openModal = function (id) {
    var modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  var closeModal = function (modal) {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
  openModalTriggers.forEach(function (trigger) {
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      openModal(trigger.getAttribute('data-open-modal'));
    });
  });
  closeModalTriggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      closeModal(trigger.closest('.modal'));
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      $$('.modal.is-open').forEach(closeModal);
    }
  });

  /* ---------- Call booking form ---------- */
  var callForm = $('#callForm');
  if (callForm) {
    callForm.addEventListener('submit', function (e) {
      e.preventDefault();
      callForm.style.display = 'none';
      $('#callSuccess').classList.add('is-visible');
    });
  }

  /* ---------- Contact form validation ---------- */
  var contactForm = $('#contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      $$('[required]', contactForm).forEach(function (field) {
        var group = field.closest('.form-group');
        var ok = field.type === 'email'
          ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())
          : field.value.trim().length > 0;
        if (!ok) { valid = false; }
        if (group) group.classList.toggle('has-error', !ok);
      });
      if (valid) {
        contactForm.querySelectorAll('.form-group, .btn, .contact__privacy').forEach(function (el) {
          el.style.visibility = 'hidden';
        });
        $('#formSuccess').classList.add('is-visible');
      }
    });
  }

  /* ---------- Newsletter (footer) ---------- */
  var newsletterForm = $('#newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = $('input', newsletterForm);
      var btn = $('button', newsletterForm);
      input.disabled = true;
      btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
      input.placeholder = '¡Gracias por suscribirte!';
      input.value = '';
    });
  }

  /* ---------- Scroll to top ---------- */
  var floatTopBtn = $('#floatTop');
  if (floatTopBtn) {
    floatTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Cookie consent ---------- */
  var cookieBar = $('#cookieBar');
  if (cookieBar) {
    var consent = localStorage.getItem('jodro-cookie-consent');
    if (!consent) {
      setTimeout(function () { cookieBar.classList.add('is-visible'); }, 900);
    }
    var dismiss = function (value) {
      localStorage.setItem('jodro-cookie-consent', value);
      cookieBar.classList.remove('is-visible');
    };
    $('#cookieAccept').addEventListener('click', function () { dismiss('accepted'); });
    $('#cookieReject').addEventListener('click', function () { dismiss('rejected'); });
  }
})();

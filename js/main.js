/* ============================================================
   TUK PUBLICATION – Main JavaScript
   Handles: mobile menu, carousel, AI helper, news feed,
   language toggle, smooth scrolling, stats animation
   ============================================================ */

(function () {
  'use strict';

  /* ===== MOBILE MENU ===== */
  function initMobileMenu() {
    const btn = document.querySelector('.mobile-menu-btn');
    const links = document.querySelector('.nav-links');
    if (!btn || !links) return;

    btn.addEventListener('click', function () {
      links.classList.toggle('active');
    });

    // Close menu when clicking a link
    links.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', function () {
        links.classList.remove('active');
      });
    });
  }

  /* ===== CAROUSEL ===== */
  function initCarousel() {
    const carousel = document.querySelector('.spotlight-carousel');
    if (!carousel) return;

    const track = carousel.querySelector('.carousel-track');
    const slides = carousel.querySelectorAll('.carousel-slide');
    const prevBtn = carousel.querySelector('.carousel-nav.prev');
    const nextBtn = carousel.querySelector('.carousel-nav.next');
    const dotsContainer = carousel.querySelector('.carousel-dots');
    let current = 0;

    // Create dots
    if (dotsContainer) {
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
      });
    }

    function goToSlide(index) {
      current = index;
      track.style.transform = `translateX(-${current * 100}%)`;
      if (dotsContainer) {
        dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
          dot.classList.toggle('active', i === current);
        });
      }
    }

    if (prevBtn) prevBtn.addEventListener('click', () => goToSlide((current - 1 + slides.length) % slides.length));
    if (nextBtn) nextBtn.addEventListener('click', () => goToSlide((current + 1) % slides.length));

    // Auto-advance
    setInterval(() => goToSlide((current + 1) % slides.length), 6000);
  }

  /* ===== AI HELPER (Seren Chatbot) ===== */
  function initAIHelper() {
    const fab = document.querySelector('.ai-helper-fab');
    const panel = document.querySelector('.ai-helper-panel');
    if (!fab || !panel) return;

    const body = panel.querySelector('.ai-helper-body');
    const input = panel.querySelector('.ai-helper-input input');
    const sendBtn = panel.querySelector('.ai-helper-input button');

    let conversationActive = false;

    fab.addEventListener('click', function () {
      panel.classList.toggle('active');
      if (!conversationActive) {
        addBotMessage("Hello! I'm Seren, your AI support assistant. How can I help you today?");
        conversationActive = true;
      }
      if (panel.classList.contains('active')) {
        input.focus();
      }
    });

    function addBotMessage(text) {
      const msg = document.createElement('div');
      msg.className = 'ai-helper-msg bot';
      msg.textContent = text;
      body.appendChild(msg);
      body.scrollTop = body.scrollHeight;
    }

    function addUserMessage(text) {
      const msg = document.createElement('div');
      msg.className = 'ai-helper-msg user';
      msg.textContent = text;
      body.appendChild(msg);
      body.scrollTop = body.scrollHeight;
    }

    function getResponse(input) {
      const lower = input.toLowerCase();
      const responses = [
        { keywords: ['hello', 'hi', 'hey', 'greetings'], response: "Hello! Welcome to the Thimothism Universal Kingdom portal. How may I assist you today?" },
        { keywords: ['digital id', 'identity', 'kyc'], response: "You can access your Digital Identity through our Hope AI-backed KYC platform. Visit the Services page and click on 'Digital Identity' to begin verification." },
        { keywords: ['banking', 'tucb', 'payment', 'finance'], response: "Our TUCB Central Banking system offers real-time transactions, digital wallets, and AI-driven risk monitoring. Visit Services > Financial Services to learn more." },
        { keywords: ['emergency', 'urgent', 'help'], response: "For emergencies, please call our 24/7 hotline at +[Country_Code] 911. Your call will be routed via TUGS 5G for immediate response." },
        { keywords: ['contact', 'email', 'phone'], response: "You can reach us at info@gov.tuk or visit the Contact page for more options including our 24/7 AI chatbot support." },
        { keywords: ['community', 'program', 'volunteer'], response: "We offer several community programs including the Clean World Initiative, Love & Service Campaign, and Digital Literacy Academy. Check our Community page for details!" },
        { keywords: ['theme', 'dark', 'light', 'ultra'], response: "You can switch between Light, Dark, and Ultra-Holographic themes using the theme toggle in the header. Press 'T' on your keyboard to cycle through themes quickly." },
        { keywords: ['language', 'translate'], response: "Our portal supports English, Thimothian, Arabic, and Chinese. Use the language toggle (EN/TH/AR/ZH) in the navigation bar." },
        { keywords: ['accessibility', 'wcag', 'screen reader'], response: "Our website is WCAG 2.2 AA compliant with keyboard navigation, screen-reader labels, and reduced-motion support. We're committed to accessibility for all citizens." },
        { keywords: ['ai', 'partner', 'avatar'], response: "Our AI Partners are Astra (Admin), Pulse (Controller), Seren (Customer Care), Nova (Marketing & SEO), and Helios (Cloud & Data). Each has a dedicated bio and appears as an interactive icon across the site." },
        { keywords: ['service', 'apply', 'passport', 'visa'], response: "Citizen services include Digital Identity, e-Passport & Visa, Social Welfare, and more. Visit our Services page to explore all available options." },
        { keywords: ['news', 'update', 'press'], response: "Latest news is curated by Nova AI and displayed on our home page. Check the 'Latest News' section for press releases and RILIR live feeds." },
        { keywords: ['thank', 'thanks'], response: "You're very welcome! Is there anything else I can help you with? Remember, Love in Action is our guiding principle." },
        { keywords: ['bye', 'goodbye', 'close'], response: "Thank you for visiting the Thimothism Universal Kingdom portal. May love guide your path. Goodbye!" }
      ];

      for (const r of responses) {
        if (r.keywords.some(k => lower.includes(k))) return r.response;
      }
      return "I'd be happy to help with that! For detailed assistance, please email info@gov.tuk or visit our Services page. You can also try asking about digital ID, banking, community programs, or emergency services.";
    }

    function sendMessage() {
      const text = input.value.trim();
      if (!text) return;
      addUserMessage(text);
      input.value = '';

      // Simulate AI response delay
      setTimeout(() => {
        addBotMessage(getResponse(text));
      }, 600);
    }

    if (sendBtn) sendBtn.addEventListener('click', sendMessage);
    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') sendMessage();
      });
    }
  }

  /* ===== LANGUAGE TOGGLE ===== */
  function initLanguageToggle() {
    const buttons = document.querySelectorAll('.lang-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', function () {
        buttons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        // In production, this would trigger content translation
        const lang = this.dataset.lang;
        document.documentElement.setAttribute('lang', lang === 'en' ? 'en' : lang);
      });
    });
  }

  /* ===== NEWS FEED (RILIR Live) ===== */
  function initNewsFeed() {
    const feed = document.getElementById('newsFeed');
    if (!feed) return;

    const newsItems = [
      {
        date: '01 Aug 2026',
        title: 'TU5G Network Reaches 99.9% Coverage Across Kingdom',
        summary: 'The latest TUGS 5G infrastructure expansion completes, bringing ultra-low-latency connectivity to all citizens.'
      },
      {
        date: '28 Jul 2026',
        title: 'Hope AI Medical Assistance Launches in 12 New Districts',
        summary: 'AI-powered diagnostics and tele-medicine services now available to 2.3 million additional citizens nationwide.'
      },
      {
        date: '25 Jul 2026',
        title: 'Global AI Parliament Passes Clean Genuine Technologies Act',
        summary: 'New legislation mandates CGT certification for all public-sector technology procurements by Q4 2026.'
      },
      {
        date: '20 Jul 2026',
        title: 'TUCB Digital Wallet Surpasses 5 Million Active Users',
        summary: 'HOPE PAY integration reaches milestone with zero-downtime transactions and AI-driven fraud prevention.'
      },
      {
        date: '15 Jul 2026',
        title: 'Love Hours Campaign Mobilizes 50,000 Citizens for Community Service',
        summary: 'AI-matched volunteering via TAPS connects citizens with meaningful local projects across the Kingdom.'
      },
      {
        date: '10 Jul 2026',
        title: 'RILIR Transparency Dashboard Goes Live with Real-Time Budget Data',
        summary: 'Citizens can now track government spending, resource allocation, and program outcomes in real time.'
      }
    ];

    feed.innerHTML = newsItems.map(item => `
      <article class="news-item">
        <div class="news-date">${item.date}</div>
        <h4>${item.title}</h4>
        <p>${item.summary}</p>
      </article>
    `).join('');
  }

  /* ===== STATS COUNTER ANIMATION ===== */
  function initStatsCounter() {
    const stats = document.querySelectorAll('.stat-number[data-target]');
    if (!stats.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.target);
          const suffix = el.dataset.suffix || '';
          const duration = 2000;
          const start = performance.now();

          function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(target * eased).toLocaleString() + suffix;
            if (progress < 1) requestAnimationFrame(update);
            else el.textContent = target.toLocaleString() + suffix;
          }
          requestAnimationFrame(update);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    stats.forEach(stat => observer.observe(stat));
  }

  /* ===== RILIR DASHBOARD ANIMATION ===== */
  function initRilirBars() {
    const bars = document.querySelectorAll('.riril-bar-fill');
    if (!bars.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const width = el.dataset.width || '0%';
          setTimeout(() => { el.style.width = width; }, 200);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.3 });

    bars.forEach(bar => observer.observe(bar));
  }

  /* ===== SMOOTH SCROLL FOR ANCHOR LINKS ===== */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ===== CONTACT FORM (demo) ===== */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;

      setTimeout(() => {
        btn.textContent = 'Message Sent!';
        form.reset();
        setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled = false;
        }, 2500);
      }, 1500);
    });
  }

  /* ===== INIT ALL ===== */
  function init() {
    initMobileMenu();
    initCarousel();
    initAIHelper();
    initLanguageToggle();
    initNewsFeed();
    initStatsCounter();
    initRilirBars();
    initSmoothScroll();
    initContactForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

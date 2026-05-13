document.addEventListener('DOMContentLoaded', () => {

  // ===== PRELOADER =====
  const preloader = document.getElementById('preloader');
  if (preloader) {
    setTimeout(() => { preloader.style.pointerEvents = 'none'; }, 1650);
    setTimeout(() => { preloader.remove(); }, 2500);
  }

  // ===== CUSTOM CURSOR =====
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;

  if (cursor && follower && isFinePointer) {
    let cx = 0, cy = 0, fx = 0, fy = 0;

    document.addEventListener('mousemove', (e) => {
      cx = e.clientX;
      cy = e.clientY;
      cursor.style.left = cx + 'px';
      cursor.style.top  = cy + 'px';
    });

    const animateFollower = () => {
      fx += (cx - fx) * 0.11;
      fy += (cy - fy) * 0.11;
      follower.style.left = fx + 'px';
      follower.style.top  = fy + 'px';
      requestAnimationFrame(animateFollower);
    };
    animateFollower();

    const interactives = document.querySelectorAll('a, button, .card, .hero-cta');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('cursor--hover');
        follower.classList.add('cursor-follower--hover');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('cursor--hover');
        follower.classList.remove('cursor-follower--hover');
      });
    });

    document.addEventListener('mouseleave', () => {
      cursor.style.opacity = '0';
      follower.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursor.style.opacity = '1';
      follower.style.opacity = '1';
    });
  } else {
    cursor && cursor.remove();
    follower && follower.remove();
  }

  // ===== SCROLL PROGRESS BAR =====
  const progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const scrolled = document.documentElement.scrollTop;
      const total = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      progressBar.style.width = (scrolled / total * 100) + '%';
    }, { passive: true });
  }

  // ===== NAVBAR GLASS ON SCROLL =====
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('navbar--scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  // ===== PARTICLE CANVAS =====
  const canvas = document.getElementById('particles');
  if (canvas) {
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    class Dot {
      constructor() { this.reset(); }
      reset() {
        this.x  = Math.random() * canvas.width;
        this.y  = Math.random() * canvas.height;
        this.r  = Math.random() * 1.4 + 0.3;
        this.vx = (Math.random() - 0.5) * 0.32;
        this.vy = (Math.random() - 0.5) * 0.32;
        this.a  = Math.random() * 0.32 + 0.06;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < -8 || this.x > canvas.width + 8 ||
            this.y < -8 || this.y > canvas.height + 8) {
          this.reset();
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(184,151,90,${this.a})`;
        ctx.fill();
      }
    }

    const dots = Array.from({ length: 65 }, () => new Dot());

    const connect = () => {
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 115) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(184,151,90,${0.065 * (1 - d / 115)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach(d => { d.update(); d.draw(); });
      connect();
      requestAnimationFrame(tick);
    };
    tick();
  }

  // ===== SCROLL REVEAL =====
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay) || 0;
          setTimeout(() => entry.target.classList.add('revealed'), delay);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    revealEls.forEach(el => obs.observe(el));
  }

  // ===== ANIMATED COUNTERS =====
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const cObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el     = entry.target;
        const target = parseInt(el.dataset.count);
        const start  = performance.now();
        const dur    = 1900;

        const step = (now) => {
          const t = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.floor(eased * target);
          if (t < 1) requestAnimationFrame(step);
          else el.textContent = target;
        };

        requestAnimationFrame(step);
        cObs.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(el => cObs.observe(el));
  }

  // ===== CARD 3D TILT =====
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r  = card.getBoundingClientRect();
      const x  = (e.clientX - r.left) / r.width  - 0.5;
      const y  = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform =
        `perspective(780px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.55s cubic-bezier(0.16,1,0.3,1), box-shadow 0.5s ease';
      card.style.transform = '';
      setTimeout(() => { card.style.transition = ''; }, 560);
    });
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'box-shadow 0.5s ease';
    });
  });

  // ===== PARALLAX ON PARTICLES CANVAS =====
  const heroCanvas = document.getElementById('particles');
  if (heroCanvas) {
    const hero = document.getElementById('inicio');
    window.addEventListener('scroll', () => {
      if (window.scrollY < (hero.offsetHeight || 800) * 1.5) {
        heroCanvas.style.transform = `translateY(${window.scrollY * 0.28}px)`;
      }
    }, { passive: true });
  }

  // ===== CONTACT FORM FEEDBACK =====
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const textEl = form.querySelector('.btn-submit__text');
      const original = textEl.textContent;
      textEl.textContent = '✓ Mensaje enviado';
      form.querySelector('.btn-submit').style.borderColor = 'rgba(184,151,90,0.8)';
      setTimeout(() => {
        textEl.textContent = original;
        form.querySelector('.btn-submit').style.borderColor = '';
      }, 3500);
    });
  }

});

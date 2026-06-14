// script.js — BlackHub (Single-Page)

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const $  = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    const body            = document.body;
    const header          = $('.header');
    const hero            = $('.hero');
    // Glitch JS aplicado apenas em section-titles — hero-title agora usa glow CSS limpo
    const glitchElements  = $$('.section-title');
    const scrollProgress  = $('.scroll-progress');
    const backToTop       = $('.back-to-top');
    const navLinks        = $$('.nav-link');
    const sections        = $$('section[id]');
    const reducedMotion   = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ==================== CURSOR PERSONALIZADO ====================
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        body.appendChild(cursor);

        const TRAIL_LEN  = 14;
        const posHistory = [];
        const trailEls   = [];

        for (let i = 0; i < TRAIL_LEN; i++) {
            const el = document.createElement('div');
            el.className = 'cursor-trail';
            const size   = Math.max(2, Math.round(6 - (i / TRAIL_LEN) * 4));
            const offset = -(size / 2);
            el.style.cssText =
                `width:${size}px;height:${size}px;` +
                `margin-top:${offset}px;margin-left:${offset}px;`;
            body.appendChild(el);
            trailEls.push(el);
        }

        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;
        let targetScale = 1, currentScale = 1;
        const lerpScale = 0.18;

        function updateCursor() {
            cursorX = mouseX;
            cursorY = mouseY;
            currentScale += (targetScale - currentScale) * lerpScale;
            cursor.style.transform =
                `translate3d(${cursorX}px, ${cursorY}px, 0) scale(${currentScale})`;

            posHistory.unshift({ x: cursorX, y: cursorY });
            if (posHistory.length > TRAIL_LEN + 1) posHistory.pop();

            trailEls.forEach((el, i) => {
                const pos = posHistory[i + 1];
                if (!pos) { el.style.opacity = '0'; return; }
                const t = i / TRAIL_LEN;
                el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
                el.style.opacity = ((1 - t) * 0.65).toFixed(3);
            });

            requestAnimationFrame(updateCursor);
        }

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        updateCursor();

        const interactiveElements = $$('a, button, .project-card, .contact-card, .skill-tag, .stat-num');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                targetScale = 1.7;
                cursor.classList.add('hover');
            });
            el.addEventListener('mouseleave', () => {
                targetScale = 1;
                cursor.classList.remove('hover');
            });
        });

        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
            trailEls.forEach(el => el.style.opacity = '0');
        });
        document.addEventListener('mouseenter', () => cursor.style.opacity = '1');
    }

    // ==================== HAMBURGUER MENU ====================
    const navToggle  = $('.nav-toggle');
    const navLinksEl = $('.nav-links');

    if (navToggle && navLinksEl) {
        navToggle.addEventListener('click', () => {
            const isOpen = navLinksEl.classList.toggle('open');
            navToggle.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });

        navLinksEl.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinksEl.classList.remove('open');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });

        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navLinksEl.contains(e.target)) {
                navLinksEl.classList.remove('open');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // ==================== SMOOTH SCROLL PARA LINKS INTERNOS ====================
    $$('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#' || targetId.length < 2) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    // ==================== GLITCH EFFECT SUAVE ====================
    if (glitchElements.length && !reducedMotion) {
        setInterval(() => {
            glitchElements.forEach(el => {
                if (Math.random() < 0.1) {
                    const r = Math.floor(Math.random() * 4) - 2;
                    const g = Math.floor(Math.random() * 4) - 2;
                    const b = Math.floor(Math.random() * 4) - 2;
                    el.style.textShadow = `${r}px 0 #ff00ff, ${g}px 0 #00ffff, ${b}px 0 #ffff00`;
                    setTimeout(() => {
                        el.style.textShadow = '0 0 30px var(--azul-eletrico)';
                    }, 150);
                }
            });
        }, 2000);
    }

    // ==================== DETECÇÃO DE MOBILE / TOUCH ====================
    const isMobile      = window.matchMedia('(max-width: 768px)').matches;
    const isTouch       = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    const isLowPower    = isMobile || isTouch;

    // ==================== PARTÍCULAS NO HERO (só desktop) ====================
    if (hero && !hero.querySelector('.particle') && !reducedMotion && !isLowPower) {
        const particleCount = 50;
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top  = Math.random() * 100 + '%';
            particle.style.animation = `float ${(Math.random() * 10 + 8).toFixed(2)}s linear infinite`;
            particle.style.animationDelay = Math.random() * 5 + 's';
            fragment.appendChild(particle);
        }
        hero.appendChild(fragment);
    }

    // ==================== SCROLL REVEAL ====================
    const revealTargets = [
        ...$$('.section-head'),
        ...$$('.about-content'),
        ...$$('.projects-grid'),
        ...$$('.contact-container'),
        ...$$('.skills-card'),
        ...$$('.terminal-box'),
        ...$$('.about-image-wrapper'),
    ];

    revealTargets.forEach(el => el.classList.add('reveal'));

    // Threshold e rootMargin mais permissivos no mobile — dispara cedo
    const observerOptions = isMobile
        ? { threshold: 0.04, rootMargin: '0px 0px 0px 0px' }
        : { threshold: 0.1,  rootMargin: '0px 0px -60px 0px' };

    function activateReveal(el) {
        el.classList.add('active');
        // .in-view mantido por compat com CSS antigo
        if (el.classList.contains('projects-grid') ||
            el.classList.contains('skills-card')) {
            el.classList.add('in-view');
        }
    }

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    activateReveal(entry.target);
                    revealObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        revealTargets.forEach(el => revealObserver.observe(el));

        // FAILSAFE: qualquer alvo que já esteja acima do meio da tela ao carregar
        // (ou caso o observer atrase em mobile), ativa imediatamente.
        requestAnimationFrame(() => {
            const viewportMid = window.innerHeight * 0.85;
            revealTargets.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < viewportMid) activateReveal(el);
            });
        });
    } else {
        // Fallback sem IntersectionObserver: revela tudo
        revealTargets.forEach(activateReveal);
    }

    // ==================== HEADER FIXO COM HIDE-ON-SCROLL ====================
    if (header) {
        let lastScrollTop = 0;
        const scrollThreshold = 100;

        function onScroll() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            // Scroll progress bar
            if (scrollProgress) {
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
                scrollProgress.style.width = pct + '%';
            }

            // Hide on scroll
            if (scrollTop > lastScrollTop && scrollTop > scrollThreshold) {
                header.classList.add('header-hidden');
            } else {
                header.classList.remove('header-hidden');
            }
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;

            // Fundo do header
            if (scrollTop > 100) {
                header.style.background = 'rgba(10, 10, 10, 0.98)';
                header.style.backdropFilter = 'blur(15px)';
            } else {
                header.style.background = 'rgba(10, 10, 10, 0.9)';
                header.style.backdropFilter = 'blur(10px)';
            }

            // Back to top
            if (backToTop) {
                if (scrollTop > 500) backToTop.classList.add('visible');
                else                 backToTop.classList.remove('visible');
            }

            // Active nav link
            updateActiveNav(scrollTop);
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    // ==================== ACTIVE NAV BASEADO EM SCROLL ====================
    function updateActiveNav(scrollTop) {
        if (!sections.length || !navLinks.length) return;
        const offset = scrollTop + window.innerHeight * 0.3;
        let currentId = sections[0].id;
        for (const sec of sections) {
            if (sec.offsetTop <= offset) currentId = sec.id;
        }
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${currentId}`) link.classList.add('active');
            else                          link.classList.remove('active');
        });
    }

    // ==================== COUNTER-UP NAS STATS ====================
    const statNums = $$('.stat-num[data-target]');
    if (statNums.length) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const target = parseInt(el.dataset.target, 10);
                if (isNaN(target)) return;
                const duration = 1200;
                const start = performance.now();
                function step(now) {
                    const elapsed = now - start;
                    const t = Math.min(elapsed / duration, 1);
                    // ease-out cubic
                    const eased = 1 - Math.pow(1 - t, 3);
                    el.textContent = Math.round(eased * target);
                    if (t < 1) requestAnimationFrame(step);
                    else      el.textContent = target;
                }
                requestAnimationFrame(step);
                counterObserver.unobserve(el);
            });
        }, { threshold: 0.5 });

        statNums.forEach(el => counterObserver.observe(el));
    }

    // ==================== TILT 3D NOS PROJECT CARDS ====================
    const tiltCards = $$('[data-tilt]');
    const hasFineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (tiltCards.length && !reducedMotion && hasFineHover) {
        const MAX_TILT = 8; // graus
        tiltCards.forEach(card => {
            let raf = null;

            card.addEventListener('mouseenter', () => {
                // Durante o tilt: transição de transform = 0 (resposta imediata ao mouse)
                card.classList.add('is-tilting');
            });

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const px = x / rect.width;
                const py = y / rect.height;
                const rx = (py - 0.5) * -MAX_TILT * 2;
                const ry = (px - 0.5) *  MAX_TILT * 2;

                // CSS vars para o gradiente radial
                card.style.setProperty('--mx', `${px * 100}%`);
                card.style.setProperty('--my', `${py * 100}%`);

                if (raf) cancelAnimationFrame(raf);
                raf = requestAnimationFrame(() => {
                    card.style.transform =
                        `perspective(1000px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-6px)`;
                });
            });

            card.addEventListener('mouseleave', () => {
                if (raf) cancelAnimationFrame(raf);
                // Remove a classe primeiro pra reset voltar suavemente (0.35s)
                card.classList.remove('is-tilting');
                card.style.transform = '';
                card.style.removeProperty('--mx');
                card.style.removeProperty('--my');
            });
        });
    }

    // ==================== RIPPLE NOS BOTÕES ====================
    const buttons = $$('.cta-button');
    buttons.forEach(btn => {
        if (getComputedStyle(btn).position !== 'relative') btn.style.position = 'relative';
        if (getComputedStyle(btn).overflow !== 'hidden')   btn.style.overflow = 'hidden';

        btn.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const ripple = document.createElement('span');
            ripple.style.cssText =
                'position:absolute;width:30px;height:30px;' +
                'background-color:rgba(255,255,255,0.5);border-radius:50%;' +
                `left:${x - 15}px;top:${y - 15}px;pointer-events:none;` +
                'animation:ripple 0.6s ease-out;';
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });

    if (!document.getElementById('ripple-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-style';
        style.textContent = `
            @keyframes ripple {
                to { transform: scale(20); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
});

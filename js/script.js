// script.js — BlackHub (Single-Page)

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const $  = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    const body            = document.body;
    const header          = $('.header');
    const hero            = $('.hero');
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

        let mouseX = 0, mouseY = 0;
        let targetScale = 1, currentScale = 1;
        let scaleRAF = null;

        function writeTransform() {
            cursor.style.transform =
                `translate3d(${mouseX}px, ${mouseY}px, 0) scale(${currentScale})`;
        }

        // Atualiza posição DIRETO no mousemove. O browser já throttla
        // mousemove ao rAF do compositor — fica tão suave quanto o cursor nativo,
        // sem rAF loop perpétuo gastando CPU/GPU enquanto o mouse está parado.
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            writeTransform();
        }, { passive: true });

        // rAF só roda enquanto está interpolando o scale (entrada/saída de hover)
        function animateScale() {
            currentScale += (targetScale - currentScale) * 0.22;
            if (Math.abs(targetScale - currentScale) > 0.005) {
                writeTransform();
                scaleRAF = requestAnimationFrame(animateScale);
            } else {
                currentScale = targetScale;
                writeTransform();
                scaleRAF = null;
            }
        }

        function startScaleAnim() {
            if (scaleRAF === null) scaleRAF = requestAnimationFrame(animateScale);
        }

        const interactiveElements = $$('a, button, .project-card, .contact-card, .skill-tag, .stat-num');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                targetScale = 1.7;
                cursor.classList.add('hover');
                startScaleAnim();
            });
            el.addEventListener('mouseleave', () => {
                targetScale = 1;
                cursor.classList.remove('hover');
                startScaleAnim();
            });
        });

        document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
        document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });
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

    // ==================== DETECÇÃO DE MOBILE / TOUCH ====================
    const isMobile      = window.matchMedia('(max-width: 768px)').matches;
    const isTouch       = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    const isLowPower    = isMobile || isTouch;

    // ==================== PARTÍCULAS NO HERO (só desktop) ====================
    if (hero && !hero.querySelector('.particle') && !reducedMotion && !isLowPower) {
        const particleCount = 22;
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

    // ==================== HEADER + SCROLL EVENTS (THROTTLED COM rAF) ====================
    if (header) {
        let lastScrollTop = 0;
        const scrollThreshold = 100;
        let ticking = false;
        let docHeightCache = 0;

        // Cache de offsets das seções — evita layout read no scroll
        let sectionOffsets = [];
        function rebuildSectionCache() {
            sectionOffsets = sections.map(sec => ({ id: sec.id, top: sec.offsetTop }));
            docHeightCache = document.documentElement.scrollHeight - window.innerHeight;
        }
        rebuildSectionCache();
        window.addEventListener('resize', rebuildSectionCache, { passive: true });
        window.addEventListener('load',   rebuildSectionCache);

        let headerScrolled = false; // estado atual: header com bg "scrolled" ou não

        function onScroll() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            // Scroll progress bar (sem leitura de layout — usa cache)
            if (scrollProgress && docHeightCache > 0) {
                scrollProgress.style.width = ((scrollTop / docHeightCache) * 100) + '%';
            }

            // Hide on scroll
            if (scrollTop > lastScrollTop && scrollTop > scrollThreshold) {
                header.classList.add('header-hidden');
            } else {
                header.classList.remove('header-hidden');
            }
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;

            // Header bg: alterna via classe (sem escrever style inline em todo scroll)
            const shouldBeScrolled = scrollTop > 100;
            if (shouldBeScrolled !== headerScrolled) {
                header.classList.toggle('is-scrolled', shouldBeScrolled);
                headerScrolled = shouldBeScrolled;
            }

            // Back to top
            if (backToTop) {
                backToTop.classList.toggle('visible', scrollTop > 500);
            }

            // Active nav link (usa cache de offsets — sem layout read)
            if (sectionOffsets.length && navLinks.length) {
                const offset = scrollTop + window.innerHeight * 0.3;
                let currentId = sectionOffsets[0].id;
                for (const sec of sectionOffsets) {
                    if (sec.top <= offset) currentId = sec.id;
                }
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
                });
            }

            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(onScroll);
                ticking = true;
            }
        }, { passive: true });

        onScroll();
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

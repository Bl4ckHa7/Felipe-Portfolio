// script.js - BlackHub Enhanced

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // Cache de elementos
    const $ = selector => document.querySelector(selector);
    const $$ = selector => Array.from(document.querySelectorAll(selector));

    const body = document.body;
    const header = $('.header');
    const hero = $('.hero');
    const sections = $$('section');
    const navLinks = $$('.nav-link');
    const glitchElements = $$('.hero-title, .section-title, .glitch-text');
    const cards = $$('.pillar-card, .service-card, .project-card');
    const categoryBtns = $$('.category-btn');
    const serviceCards = $$('.service-card');
    const contactForm = $('#contact-form');

    // ==================== CURSOR PERSONALIZADO ====================
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        body.appendChild(cursor);

        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;
        const speed = 0.15;

        function updateCursor() {
            cursorX += (mouseX - cursorX) * speed;
            cursorY += (mouseY - cursorY) * speed;
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
            requestAnimationFrame(updateCursor);
        }

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        updateCursor();

        const interactiveElements = $$('a, button, .project-card, .service-card, .pillar-card, .category-btn');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });

        document.addEventListener('mouseleave', () => cursor.style.opacity = '0');
        document.addEventListener('mouseenter', () => cursor.style.opacity = '1');
    }

    // ==================== SMOOTH SCROLL PARA LINKS INTERNOS ====================
    $$('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                const target = document.querySelector(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    // ==================== GLITCH EFFECT SUAVE ====================
    if (glitchElements.length) {
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

    // ==================== PARTÍCULAS NO HERO ====================
    if (hero && !hero.querySelector('.particle')) {
        const particleCount = 50;
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animation = `float ${(Math.random() * 10 + 8).toFixed(2)}s linear infinite`;
            particle.style.animationDelay = Math.random() * 5 + 's';
            fragment.appendChild(particle);
        }
        hero.appendChild(fragment);
    }

    // ==================== SCROLL REVEAL ====================
    const revealElements = $$('.section-title, .about-content, .project-card, .service-card, .process-step, .contact-container');
    if (revealElements.length) {
        revealElements.forEach(el => el.classList.add('reveal'));

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        revealElements.forEach(el => revealObserver.observe(el));
    }

    // ==================== FILTRO DE SERVIÇOS ====================
    if (categoryBtns.length && serviceCards.length) {
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const category = btn.textContent.trim().toLowerCase();

                serviceCards.forEach(card => {
                    const cardCat = card.dataset.category ? card.dataset.category.toLowerCase() : '';
                    if (category === 'todos' || cardCat === category) {
                        card.style.display = 'block';
                        card.style.animation = 'fadeInUp 0.5s ease';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // ==================== FORMULÁRIO DE CONTATO ====================
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nome = $('#nome').value.trim();
            const email = $('#email').value.trim();
            const mensagem = $('#mensagem').value.trim();

            if (!nome || !email || !mensagem) {
                alert('Por favor, preencha todos os campos.');
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                alert('Por favor, insira um e-mail válido.');
                return;
            }

            alert(`Mensagem enviada com sucesso!\n\nObrigado, ${nome}. Em breve retornarei.`);
            contactForm.reset();
        });
    }

    // ==================== HEADER FIXO COM MUDANÇA NO SCROLL E OCULTÁVEL ====================
    if (header) {
        let lastScrollTop = 0;
        const scrollThreshold = 100; // altura mínima para esconder

        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            // Lógica para esconder/mostrar o header
            if (scrollTop > lastScrollTop && scrollTop > scrollThreshold) {
                // Rolando para baixo e passou do limite
                header.classList.add('header-hidden');
            } else {
                // Rolando para cima
                header.classList.remove('header-hidden');
            }
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;

            // Lógica de fundo (opcional, pode ser removida se preferir)
            if (scrollTop > 100) {
                header.style.background = 'rgba(10, 10, 10, 0.98)';
                header.style.backdropFilter = 'blur(15px)';
            } else {
                header.style.background = 'rgba(10, 10, 10, 0.9)';
                header.style.backdropFilter = 'blur(10px)';
            }
        });
    }

    // ==================== ANIMAÇÃO DE ENTRADA PARA CARDS ====================
    if (cards.length) {
        cards.forEach((card, index) => {
            card.style.animationDelay = (index * 0.1) + 's';
        });
    }

    // ==================== RIPPLE NOS BOTÕES (melhorado) ====================
    const buttons = $$('.btn, .cta-button, .btn-submit, .category-btn');
    buttons.forEach(btn => {
        // Garantir que o botão tenha position relative e overflow hidden para o ripple
        if (getComputedStyle(btn).position !== 'relative') {
            btn.style.position = 'relative';
        }
        if (getComputedStyle(btn).overflow !== 'hidden') {
            btn.style.overflow = 'hidden';
        }

        btn.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement('span');
            ripple.style.position = 'absolute';
            ripple.style.width = ripple.style.height = '30px';
            ripple.style.backgroundColor = 'rgba(255,255,255,0.5)';
            ripple.style.borderRadius = '50%';
            ripple.style.left = x - 15 + 'px';
            ripple.style.top = y - 15 + 'px';
            ripple.style.pointerEvents = 'none';
            ripple.style.animation = 'ripple 0.6s ease-out';
            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Estilo do ripple (inserido dinamicamente) - já existe, mas vou manter
    if (!document.getElementById('ripple-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-style';
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(20);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
});
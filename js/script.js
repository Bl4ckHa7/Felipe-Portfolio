document.addEventListener('DOMContentLoaded', () => {
    // Cache de elementos do DOM para evitar consultas repetidas
    const $ = selector => document.querySelector(selector);
    const $$ = selector => Array.from(document.querySelectorAll(selector));

    const body = document.body;
    const hero = $('.hero');
    const anchors = $$('a[href^="#"]');
    const glitchElements = $$('.hero-title, .section-title');
    const cards = $$('.pillar-card');
    const sections = $$('section');
    const buttons = $$('.cta-button, .cta-button-large');
    const bioTexts = $$('.bio-text');

    // ==================== SMOOTH SCROLL ====================
    if (anchors.length) {
        anchors.forEach(anchor => {
            anchor.addEventListener('click', e => {
                const href = anchor.getAttribute('href');
                e.preventDefault();
                if (href === '#') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    const target = document.querySelector(href);
                    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    // ==================== GLITCH EFFECT ====================
    if (glitchElements.length) {
        // Usa um único intervalo com limpeza automática (remove ao descarregar)
        const glitchInterval = setInterval(() => {
            glitchElements.forEach(el => {
                if (Math.random() < 0.08) {
                    const r = Math.floor(Math.random() * 6);
                    const l = Math.floor(Math.random() * -6);
                    el.style.textShadow = `${r}px 0 #ff0000, ${l}px 0 #00ffff, 0 0 30px var(--azul-eletrico)`;
                    // Usa requestAnimationFrame para remover o glitch de forma suave
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            el.style.textShadow = '0 0 30px var(--azul-eletrico)';
                        }, 120);
                    });
                }
            });
        }, 1600);

        // Limpa o intervalo se a página for descarregada (SPA ou navegação)
        window.addEventListener('beforeunload', () => clearInterval(glitchInterval));
    }


    // ==================== CARD ANIMATION (IntersectionObserver) ====================
    if (cards.length) {
        cards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(40px)';
            card.style.transition = 'all 0.6s ease';
            card.style.willChange = 'opacity, transform'; // dica de otimização
        });

        const cardObserver = new IntersectionObserver(entries => {
            entries.forEach((entry, idx) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, (idx % 6) * 120);
                }
            });
        }, { threshold: 0.12 });

        cards.forEach(card => cardObserver.observe(card));
    }

    // ==================== PARTÍCULAS (com CSS dinâmico e fragmento) ====================
    if (hero && !hero.querySelector('.particle')) { // evita recriação
        const particleCount = 40;
        const frag = document.createDocumentFragment();
        for (let i = 0; i < particleCount; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = `${Math.random() * 100}%`;
            p.style.top = `${Math.random() * 100}%`;
            p.style.animation = `float ${(Math.random() * 8 + 5).toFixed(2)}s linear infinite`;
            frag.appendChild(p);
        }
        hero.appendChild(frag);

        if (!document.getElementById('particles-style')) {
            const style = document.createElement('style');
            style.id = 'particles-style';
            style.textContent = `
                .particle {
                    position: absolute;
                    width: 2px;
                    height: 2px;
                    background: var(--azul-eletrico);
                    border-radius: 50%;
                    opacity: 0.28;
                }
                @keyframes float {
                    0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.28; }
                    90% { opacity: 0.28; }
                    100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // ==================== BOTÕES (RIPPLE E HOVER) ====================
    if (buttons.length) {
        // Adiciona estilo do ripple uma única vez
        if (!document.getElementById('ripple-style')) {
            const style = document.createElement('style');
            style.id = 'ripple-style';
            style.textContent = `
                @keyframes ripple { to { transform: scale(4); opacity: 0; } }
                .ripple {
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.6);
                    transform: scale(0);
                    pointer-events: none;
                    animation: ripple 0.6s linear;
                }
            `;
            document.head.appendChild(style);
        }

        buttons.forEach(btn => {
            // Garante posição relativa para o ripple
            if (getComputedStyle(btn).position === 'static') btn.style.position = 'relative';
            btn.style.overflow = 'hidden';

            // Efeito hover via CSS é mais performático, mas mantemos o JS para controle fino
            btn.addEventListener('mouseenter', () => {
                btn.style.boxShadow = '0 0 30px var(--azul-eletrico)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.boxShadow = 'none';
            });

            btn.addEventListener('click', e => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const size = Math.max(rect.width, rect.height) * 0.6;
                const ripple = document.createElement('span');
                ripple.className = 'ripple';
                ripple.style.width = ripple.style.height = `${size}px`;
                ripple.style.left = `${x - size / 2}px`;
                ripple.style.top = `${y - size / 2}px`;
                btn.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            });
        });
    }

    // ==================== SCROLL REVEAL (IntersectionObserver) ====================
    const nonHeroSections = sections.filter(section => !section.classList.contains('hero'));
    if (nonHeroSections.length) {
        nonHeroSections.forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            section.style.transition = 'all 0.8s ease';
            section.style.willChange = 'opacity, transform';
        });

        const revealObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        nonHeroSections.forEach(section => revealObserver.observe(section));
    }

    // ==================== CURSOR PERSONALIZADO COM ATRASO ====================
let cursor = $('.custom-cursor');
if (!cursor) {
    cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        border: 2px solid var(--azul-eletrico);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        mix-blend-mode: difference;
        transition: transform 0.12s ease, background-color 0.12s ease;
        will-change: transform, left, top;
    `;
    body.appendChild(cursor);
}

let mouseX = 0, mouseY = 0;          // posição alvo (mouse)
let cursorX = 0, cursorY = 0;        // posição atual do cursor (com atraso)
let rafId = null;

// Fator de suavização (0 = sem movimento, 1 = instantâneo)
// Quanto menor, mais lento e mais "arrastado"
const SMOOTHING = 0.05;

function updateCursorPosition() {
    // Interpolação linear (lerp) para suavizar
    cursorX += (mouseX - cursorX) * SMOOTHING;
    cursorY += (mouseY - cursorY) * SMOOTHING;

    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';

    // Continua o loop
    rafId = requestAnimationFrame(updateCursorPosition);
}

document.addEventListener('mousemove', e => {
    mouseX = e.clientX - 10; // ajuste para centralizar (metade da largura)
    mouseY = e.clientY - 10;
    if (!rafId) {
        // Inicia o loop se ainda não estiver rodando
        rafId = requestAnimationFrame(updateCursorPosition);
    }
}, { passive: true });

// Interação com elementos clicáveis (mesmo código anterior)
const interactiveElements = $$('a, button, .pillar-card');
interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        body.style.cursor = 'none';
        cursor.style.transform = 'scale(1.5)';
        cursor.style.backgroundColor = 'var(--azul-eletrico)';
    });
    el.addEventListener('mouseleave', () => {
        body.style.cursor = '';
        cursor.style.transform = 'scale(1)';
        cursor.style.backgroundColor = 'transparent';
    });
});

// Esconde cursor ao sair da janela
document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    // Opcional: cancelar o loop para economizar recursos
    if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
});

document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    // Reinicia o loop se necessário
    if (!rafId) {
        // Sincroniza posição atual com a última posição do mouse
        cursorX = mouseX;
        cursorY = mouseY;
        rafId = requestAnimationFrame(updateCursorPosition);
    }
});
});
const track = document.getElementById('track');
const slides = track.children;
const dotsEl = document.getElementById('dots');
let cur = 0;
let timer;

document.getElementById('btn-download').href = '/api/game/download';

// Cria dots 
Array.from(slides).forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.onclick = () => goTo(i);
    dotsEl.appendChild(d);
});

function goTo(n) {
    cur = (n + slides.length) % slides.length;
    track.style.transform = `translateX(-${cur * 100}%)`;
    document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === cur));
}

function slide(dir) { 
    goTo(cur + dir); 
}

function startTimer() { 
    timer = setInterval(() => slide(1), 4000); 
}

function resetTimer() { 
    clearInterval(timer); 
    startTimer(); 
}

// Iniciar Autoplay
startTimer();

// Pausa autoplay no hover
document.querySelector('.carousel').addEventListener('mouseenter', () => clearInterval(timer));
document.querySelector('.carousel').addEventListener('mouseleave', startTimer);

// Scroll suave
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const targetId = a.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            e.preventDefault();
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    });
});


const obs = new IntersectionObserver(entries => {
    entries.forEach(el => {
        if (el.isIntersecting) { 
            el.target.classList.add('visible'); 
            obs.unobserve(el.target); 
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
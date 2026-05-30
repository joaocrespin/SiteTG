const track = document.getElementById('track');
const slides = track ? track.children : [];
const dotsEl = document.getElementById('dots');
let cur = 0;
let timer;

if (track && dotsEl) {
    Array.from(slides).forEach((_, i) => {
        const d = document.createElement('button');
        d.className = 'dot' + (i === 0 ? ' active' : '');
        d.onclick = () => goTo(i);
        dotsEl.appendChild(d);
    });
}

function goTo(n) {
    if (!track || slides.length === 0) {
        return;
    }

    cur = (n + slides.length) % slides.length;
    track.style.transform = `translateX(-${cur * 100}%)`;
    document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === cur));
}

function slide(dir) {
    goTo(cur + dir);
}

function startTimer() {
    if (slides.length > 1) {
        timer = setInterval(() => slide(1), 4000);
    }
}

function resetTimer() {
    clearInterval(timer);
    startTimer();
}

startTimer();

const carousel = document.querySelector('.carousel');
if (carousel) {
    carousel.addEventListener('mouseenter', () => clearInterval(timer));
    carousel.addEventListener('mouseleave', startTimer);
}

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

let supabaseConfig;
let lastRankingHtml = '';

async function getSupabaseConfig() {
    if (supabaseConfig) {
        return supabaseConfig;
    }

    const res = await fetch('/api/game/config/supabase');
    if (!res.ok) {
        throw new Error('Config indisponível');
    }

    const data = await res.json();
    if (!data || !data.url || !data.key) {
        throw new Error('Config inválida');
    }

    supabaseConfig = data;
    return data;
}

async function loadRanking() {
    const list = document.getElementById('ranking-list');
    if (!list) {
        return;
    }

    list.innerHTML = '<tr class="ranking-loading-row"><td colspan="3"><span class="loading-dot"></span> Carregando ranking...</td></tr>';

    try {
        const config = await getSupabaseConfig();
        const res = await fetch(
            `${config.url}/rest/v1/leaderboard?order=xp.desc&limit=10`,
            {
                headers: {
                    'apikey': config.key,
                    'Authorization': 'Bearer ' + config.key
                }
            }
        );

        if (!res.ok) throw new Error('Erro ao carregar');

        const data = await res.json();

        if (!data || data.length === 0) {
            list.innerHTML = '<tr class="ranking-empty-row"><td colspan="3">Nenhum jogador no ranking ainda. Seja o primeiro!</td></tr>';
            return;
        }

        const rankingHtml = data.map((player, i) => {
            const name = player && player.player_name ? player.player_name : 'Anônimo';
            const xpValue = Number(player && player.xp ? player.xp : 0);
            const safeXp = Number.isFinite(xpValue) ? xpValue : 0;
            const position = `${i + 1}º`;

            return `
            <tr class="ranking-row ${i < 3 ? 'top-' + (i + 1) : ''}">
                <td class="rank-pos">${position}</td>
                <td class="rank-name">${escapeHtml(name)}</td>
                <td class="rank-xp">${safeXp.toLocaleString('pt-BR')} XP</td>
            </tr>
        `;
        }).join('');

        list.innerHTML = rankingHtml;
        lastRankingHtml = rankingHtml;

    } catch (e) {
        list.innerHTML = lastRankingHtml || renderFallbackRows();
    }
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function renderFallbackRows(count = 10) {
    return `
        <tr class="ranking-empty-row">
            <td colspan="3">Não foi possível buscar o ranking</td>
        </tr>
    `;
}

const refreshBtn = document.getElementById('btn-refresh');
if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
        resetTimer();
        loadRanking();
    });
}

loadRanking();

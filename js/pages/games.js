let allLoadedGames =[];

document.addEventListener('DOMContentLoaded', () => {
    initGamesPage();
});

window.addEventListener('languageChanged', () => {
    initGamesPage();
});

async function initGamesPage() {
    if (typeof window.loadGlobalComponents === 'function') window.loadGlobalComponents('games');
    setupGamesSearch();
    
    window.injectSkeletonsGlobal(['recentGrid', 'popularGrid', 'actionGrid'], 'games');
    
    try {
        const data = await window.fetchGamesHomeAPI();
        if (!data || !data.results) return;

        const games = data.results;
        if (games.length > 0) {
            allLoadedGames = games;
            
            setupHeroGame(games[0]);
            renderGameRow(games.slice(1, 8), 'recentGrid');
            renderGameRow(games.slice(8, 15), 'popularGrid');
            renderGameRow([...games].sort(() => 0.5 - Math.random()).slice(0, 7), 'actionGrid');
        }
    } catch (error) {
        console.error(error);
        document.getElementById('recentGrid').innerHTML = '<p style="color:#888;">Erro ao carregar os jogos.</p>';
    }
}

function setupHeroGame(game) {
    const heroBg = document.getElementById('heroBg');
    const heroAppIcon = document.getElementById('heroAppIcon');
    const heroTitle = document.getElementById('heroTitle');
    const heroTags = document.getElementById('heroTags');
    const heroNIcon = document.getElementById('heroNIcon');

    window.heroGameId = game.id; 

    const imageUrl = game.background_image;

    const tempImg = new Image();
    tempImg.src = imageUrl;
    
    tempImg.onload = () => {
        setTimeout(() => {
            heroBg.src = imageUrl;
            heroBg.classList.remove('skeleton');
            heroBg.classList.add('active');

            heroAppIcon.src = imageUrl;
            heroAppIcon.classList.remove('skeleton');
            heroAppIcon.classList.add('active');

            heroNIcon.style.display = 'block';
            heroTitle.textContent = game.name;

            let allTags =[];
            if (game.genres) game.genres.forEach(g => allTags.push(g.name));
            if (game.tags) {
                const goodTags = game.tags
                    .map(t => t.name)
                    .filter(name => name.length < 15 && !name.toLowerCase().includes('singleplayer') && !name.toLowerCase().includes('multiplayer'));
                allTags = allTags.concat(goodTags);
            }

            allTags =[...new Set(allTags)].slice(0, 6);

            if (allTags.length > 0) {
                heroTags.innerHTML = allTags.join('<span class="dot">&bull;</span>');
            } else {
                heroTags.innerHTML = 'Action <span class="dot">&bull;</span> Arcade <span class="dot">&bull;</span> Sci-Fi';
            }
        }, 500); 
    };
}

function renderGameRow(gamesArray, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    gamesArray.forEach(game => {
        const card = window.createGameCard(game, false);
        if (card) container.appendChild(card);
    });
}

function setupGamesSearch() {
    window.setupGlobalSearchInput((query, container) => {
        query = query.toLowerCase();
        const results = allLoadedGames.filter(game => game.name.toLowerCase().includes(query));
        
        container.innerHTML = '';
        
        if(results.length === 0) {
            container.innerHTML = `<p style="text-align:center; padding: 20px; color:#888;">${window.currentLang === 'pt' ? 'Nenhum jogo encontrado.' : 'No games found.'}</p>`;
            return;
        }

        results.forEach(game => {
            const card = window.createSearchCard(game, 'game');
            if (card) container.appendChild(card);
        });
    });
}
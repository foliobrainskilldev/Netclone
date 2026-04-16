const urlParams = new URLSearchParams(window.location.search);
const gameId = urlParams.get('id');
let currentGameData = null;

document.addEventListener('DOMContentLoaded', () => {
    initGameDetails();
});

window.addEventListener('languageChanged', () => {
    if (currentGameData) {
        updateSynopsis();
    }
});

async function initGameDetails() {
    if (typeof window.loadGlobalComponents === 'function') window.loadGlobalComponents('games');
    await loadGameDetails();
}

window.openImageViewer = function(imgSrc) {
    const modal = document.getElementById('imageModal');
    const fullImg = document.getElementById('fullScreenImg');
    fullImg.src = imgSrc;
    modal.classList.add('active');
};

window.closeImageViewer = function() {
    const modal = document.getElementById('imageModal');
    modal.classList.remove('active');
    setTimeout(() => {
        document.getElementById('fullScreenImg').src = "";
    }, 300);
};

function updateSynopsis() {
    const synopsisEl = document.getElementById('game-synopsis');
    if (window.currentLang === 'pt') {
        synopsisEl.innerText = `Entre no universo de ${currentGameData.name}. Complete missões desafiadoras, explore cenários incríveis e divirta-se nesta aventura repleta de ação. Disponível exclusivamente para assinantes da Netflix.`;
    } else {
        synopsisEl.innerText = `Enter the universe of ${currentGameData.name}. Complete challenging missions, explore incredible sceneries, and have fun in this action-packed adventure. Available exclusively for Netflix subscribers.`;
    }
}

async function loadGameDetails() {
    document.getElementById('game-title').innerHTML = '<div class="netflix-spinner"></div>';
    document.getElementById('game-synopsis').innerText = '';

    try {
        const data = await window.fetchGamesHomeAPI();
        if (!data || !data.results) throw new Error("No data");
        const games = data.results;

        let game;
        if (gameId) game = games.find(g => g.id == gameId);
        if (!game && games.length > 0) game = games[Math.floor(Math.random() * games.length)];

        if (game) {
            currentGameData = game;

            const tempImg = new Image();
            tempImg.src = game.background_image;

            tempImg.onload = () => {
                setTimeout(() => {
                    const bgImg = document.getElementById('bg-img');
                    bgImg.src = game.background_image;
                    bgImg.classList.add('active');
                    document.getElementById('bannerContainer').classList.remove('skeleton');

                    const iconImg = document.getElementById('icon-img');
                    iconImg.src = game.background_image;
                    iconImg.classList.add('active');
                    document.getElementById('iconContainer').classList.remove('skeleton');
                    document.getElementById('n-badge').style.display = 'block';

                    document.getElementById('game-title').innerText = game.name;

                    if (game.genres && game.genres.length > 0) {
                        document.getElementById('game-genre').innerText = game.genres[0].name;
                    }

                    document.getElementById('game-meta').classList.add('active');
                    document.getElementById('modes-text').classList.add('active');

                    updateSynopsis();

                    if (game.short_screenshots && game.short_screenshots.length > 0) {
                        document.getElementById('screenshots-title').style.display = 'block';
                        const shotsContainer = document.getElementById('screenshotsList');
                        shotsContainer.innerHTML = '';

                        game.short_screenshots.forEach(shot => {
                            const div = document.createElement('div');
                            div.className = 'screenshot-item skeleton';
                            div.onclick = () => window.openImageViewer(shot.image);

                            const sImg = new Image();
                            sImg.src = shot.image;
                            sImg.loading = "lazy";
                            sImg.onload = () => {
                                div.classList.remove('skeleton');
                                sImg.classList.add('active');
                            };

                            div.appendChild(sImg);
                            shotsContainer.appendChild(div);
                        });
                    }

                    const recommendations = games.filter(g => g.id != game.id).sort(() => 0.5 - Math.random()).slice(0, 8);
                    renderRecommendations(recommendations);
                }, 500);
            };
        }
    } catch (error) {
        console.error(error);
        document.getElementById('game-title').innerText = i18n[window.currentLang].errLoad;
        document.getElementById('game-synopsis').innerText = "";
    }
}

function renderRecommendations(gamesArray) {
    const container = document.getElementById('similarList');
    if (!container) return;
    container.innerHTML = '';

    gamesArray.forEach(game => {
        const card = window.createGameCard(game, true);
        if (card) container.appendChild(card);
    });
}
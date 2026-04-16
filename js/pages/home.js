let bannerMovies =[];
let currentBannerMovie = null;
let bannerIndex = 0;
let bannerRotationInterval;
let currentFeedFilter = 'all';
let currentGenreId = null;

const genresList =[
    { id: 28, name_en: "Action", name_pt: "Ação" },
    { id: 35, name_en: "Comedy", name_pt: "Comédia" },
    { id: 18, name_en: "Drama", name_pt: "Drama" },
    { id: 27, name_en: "Horror", name_pt: "Terror" },
    { id: 10749, name_en: "Romance", name_pt: "Romance" },
    { id: 878, name_en: "Sci-Fi", name_pt: "Ficção Científica" }
];

async function initHome() {
    if (typeof window.loadGlobalComponents === 'function') window.loadGlobalComponents('home');
    if (typeof window.loadActiveProfile === 'function') window.loadActiveProfile();
    
    window.injectSkeletonsGlobal(['continueGrid', 'trendingGrid', 'originalsGrid', 'popularGrid', 'actionGrid', 'comedyGrid'], 'movies');
    
    await fetchMovies();
    await fetchGamesHome();
    setupSearch();
}

window.addEventListener('languageChanged', () => {
    fetchMovies();
});

window.addEventListener('myListUpdated', () => {
    updateListButtonUI();
});

function getLangText(key) {
    const lang = window.currentLang || 'en';
    if (typeof i18n !== 'undefined' && i18n[lang] && i18n[lang][key]) {
        return i18n[lang][key];
    }
    return '';
}

window.setFeedFilter = function(type) {
    currentFeedFilter = type;
    currentGenreId = null; 
    
    document.getElementById('btnFilterSeries').classList.remove('active');
    document.getElementById('btnFilterMovies').classList.remove('active');
    document.getElementById('btnClearFilter').style.display = type === 'all' ? 'none' : 'flex';
    document.getElementById('lblCurrentCategory').innerText = getLangText('catCategories');

    if (type === 'tv') document.getElementById('btnFilterSeries').classList.add('active');
    if (type === 'movie') document.getElementById('btnFilterMovies').classList.add('active');

    document.getElementById('secContinue').style.display = type === 'all' ? 'block' : 'none';
    document.getElementById('secGamesRow').style.display = type === 'all' ? 'block' : 'none';

    window.injectSkeletonsGlobal(['continueGrid', 'trendingGrid', 'originalsGrid', 'popularGrid', 'actionGrid', 'comedyGrid'], 'movies');
    fetchMovies();
};

window.openCategoriesSheet = function() {
    document.getElementById('categoriesOverlay').classList.add('active');
    document.getElementById('categoriesBottomSheet').classList.add('active');
    populateCategoriesSheet();
};

window.closeCategoriesSheet = function() {
    document.getElementById('categoriesOverlay').classList.remove('active');
    document.getElementById('categoriesBottomSheet').classList.remove('active');
};

function populateCategoriesSheet() {
    const list = document.getElementById('categoriesList');
    list.innerHTML = '';
    genresList.forEach((genre) => {
        const div = document.createElement('div');
        div.className = `sheet-item ${currentGenreId === genre.id ? 'active' : ''}`;
        const genreName = window.currentLang === 'pt' ? genre.name_pt : genre.name_en;
        div.innerHTML = `<span>${genreName}</span><span class="iconify sheet-check" data-icon="mdi:check"></span>`;
        div.onclick = () => {
            currentGenreId = genre.id;
            currentFeedFilter = 'movie'; 
            
            document.getElementById('btnFilterSeries').classList.remove('active');
            document.getElementById('btnFilterMovies').classList.remove('active');
            document.getElementById('btnClearFilter').style.display = 'flex';
            document.getElementById('lblCurrentCategory').innerText = genreName;
            
            document.getElementById('secContinue').style.display = 'none';
            document.getElementById('secGamesRow').style.display = 'none';
            
            window.closeCategoriesSheet();
            window.injectSkeletonsGlobal(['trendingGrid', 'originalsGrid', 'popularGrid', 'actionGrid', 'comedyGrid'], 'movies');
            fetchMovies();
        };
        list.appendChild(div);
    });
}

async function fetchMovies() {
    if (typeof window.fetchMoviesFromAPI !== 'function') return;
    
    const data = await window.fetchMoviesFromAPI(currentFeedFilter, currentGenreId);
    if (!data) return; 

    const list1 = data[0].results ||[];
    const list2 = data[1].results || [];
    const list3 = data[2].results || [];
    const list4 = data[3].results || [];

    const poolBanner =[...list1, ...list2].filter(m => m.poster_path);
    bannerMovies = poolBanner.sort(() => 0.5 - Math.random());
    
    if (currentFeedFilter === 'all' && !currentGenreId) {
        renderContinueWatching(list1.slice(5, 12), 'continueGrid');
        renderList(list1.slice(12, 20), 'trendingGrid');
        renderList(list2.slice(0, 15), 'originalsGrid', true); 
        renderList(list1.slice(0, 10).concat(list2.slice(10, 15)), 'popularGrid');
        renderList(list3, 'actionGrid');
        renderList(list4, 'comedyGrid');
    } else {
        renderList(list1.slice(0, 10), 'trendingGrid');
        renderList(list2.slice(0, 15), 'originalsGrid', true); 
        renderList(list3.slice(0, 15), 'popularGrid');
        renderList(list4.slice(0, 15), 'actionGrid');
        renderList(list1.slice(10, 20), 'comedyGrid');
    }

    if (bannerMovies.length > 0) {
        bannerIndex = 0;
        updateBannerContent(bannerMovies[bannerIndex], true); 
        startBannerRotation(); 
    }
}

function startBannerRotation() {
    clearInterval(bannerRotationInterval);
    bannerRotationInterval = setInterval(() => {
        if (bannerMovies.length > 0) {
            bannerIndex = (bannerIndex + 1) % bannerMovies.length;
            updateBannerContent(bannerMovies[bannerIndex], false);
        }
    }, 5000); 
}

function updateBannerContent(item, firstLoad = false) {
    const heroPoster = document.getElementById('heroPoster');
    const heroTags = document.getElementById('heroTags');
    
    if (!item) return;

    if (!firstLoad && heroPoster) {
        heroPoster.classList.remove('active'); 
    }
    
    const delay = firstLoad ? 0 : 400;

    setTimeout(() => {
        currentBannerMovie = item;
        updateListButtonUI();

        const newImgUrl = window.IMG_URL ? (window.IMG_URL + item.poster_path) : ('https://image.tmdb.org/t/p/w500' + item.poster_path);
        const tempImg = new Image();
        tempImg.src = newImgUrl;
        
        tempImg.onload = () => {
            if (heroPoster) {
                heroPoster.src = newImgUrl;
                heroPoster.classList.remove('skeleton');
                heroPoster.classList.add('active');
            }
        };

        const fakeTags = window.currentLang === 'pt' ?["Sombrio", "Suspense", "Ação", "Drama"] : ["Dark", "Thriller", "Action", "Drama"];
        const tags = fakeTags.sort(() => 0.5 - Math.random()).slice(0, 3);
        if (heroTags) {
            heroTags.innerHTML = tags.join(' <span class="iconify tag-dot" data-icon="mdi:circle"></span> ');
        }

        extractColorAndApply(newImgUrl);

        const type = item.title ? 'movie' : 'tv';
        const playBtn = document.getElementById('heroPlayBtn');
        if (playBtn) {
            playBtn.onclick = () => window.location.href = `details.html?id=${item.id}&type=${type}`;
        }
    }, delay); 
}

function extractColorAndApply(imageUrl) {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl + "?color=1"; 
    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width; canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        try {
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            let r = 0, g = 0, b = 0, c = 0;
            for(let i = 0; i < imgData.length; i += 50) { r += imgData[i]; g += imgData[i+1]; b += imgData[i+2]; c++; }
            r = Math.floor((r/c)*0.5); g = Math.floor((g/c)*0.5); b = Math.floor((b/c)*0.5);
            document.documentElement.style.setProperty('--dominant-color', `rgb(${r},${g},${b})`);
        } catch(e) { 
            document.documentElement.style.setProperty('--dominant-color', '#220000'); 
        }
    };
}

function renderContinueWatching(movies, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    const imgBase = window.IMG_URL || 'https://image.tmdb.org/t/p/w500';

    movies.forEach(movie => {
        if(!movie.poster_path) return; 
        const div = document.createElement('div');
        div.classList.add('continue-card');
        div.onclick = () => window.location.href = `details.html?id=${movie.id}&type=${movie.title ? 'movie' : 'tv'}`;

        const progresso = Math.floor(Math.random() * 70) + 15;
        const tempoFalso = Math.random() > 0.5 ? `T${Math.floor(Math.random()*5)+1}:E${Math.floor(Math.random()*12)+1}` : `1h ${Math.floor(Math.random()*50)}m`;

        div.innerHTML = `
            <div class="continue-img-box skeleton">
                <span class="iconify netflix-n-small" data-icon="mdi:netflix"></span>
                <img src="${imgBase + movie.poster_path}" loading="lazy" onload="this.style.opacity=1; this.parentElement.classList.remove('skeleton');">
                <div class="play-circle-overlay"><span class="iconify" data-icon="mdi:play"></span></div>
                <div class="time-badge">${tempoFalso}</div>
                <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: ${progresso}%;"></div></div>
            </div>
            <div class="continue-bottom-bar">
                <span class="iconify" data-icon="mdi:information-outline"></span>
                <span class="iconify" data-icon="mdi:dots-vertical"></span>
            </div>
        `;
        container.appendChild(div);
    });
}

function renderList(movies, containerId, isOriginal = false) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    movies.forEach(movie => {
        const card = window.createMovieCard(movie, isOriginal);
        if (card) container.appendChild(card);
    });
}

async function fetchGamesHome() {
    if (typeof window.fetchGamesHomeAPI !== 'function') return;
    const data = await window.fetchGamesHomeAPI();
    if (!data || !data.results) return;

    const container = document.getElementById('homeGamesGrid');
    if (!container) return;
    container.innerHTML = '';
    
    const topGames = data.results.sort(() => 0.5 - Math.random()).slice(0, 8);
    topGames.forEach(game => {
        if(!game.background_image) return;
        const div = document.createElement('div');
        div.className = 'game-thumb skeleton';
        div.onclick = () => window.location.href = `game-details.html?id=${game.id}`;
        
        const img = document.createElement('img');
        img.src = game.background_image;
        img.loading = "lazy";
        img.onload = () => { div.classList.remove('skeleton'); };
        
        div.innerHTML = `
            <span class="iconify netflix-n-small" data-icon="mdi:netflix"></span>
            <div class="game-title-overlay">${game.name}</div>
        `;
        div.insertBefore(img, div.firstChild);
        container.appendChild(div);
    });
}

window.toggleMyList = function() {
    if (!currentBannerMovie) return;
    const isInList = typeof window.isInMyList === 'function' && window.isInMyList(currentBannerMovie.id);
    
    if (isInList) {
        if (typeof window.removeFromMyList === 'function') window.removeFromMyList(currentBannerMovie.id);
        window.showToast(getLangText('toastRemoved'));
    } else {
        if (typeof window.addToMyList === 'function') {
            window.addToMyList({ 
                id: currentBannerMovie.id, 
                title: currentBannerMovie.title || currentBannerMovie.name, 
                poster_path: currentBannerMovie.poster_path, 
                type: currentBannerMovie.title ? 'movie' : 'tv' 
            });
        }
        window.showToast(getLangText('toastAdded'), true);
    }
    updateListButtonUI();
    window.dispatchEvent(new Event('myListUpdated'));
};

function updateListButtonUI() {
    if (!currentBannerMovie) return;
    const isInList = typeof window.isInMyList === 'function' ? window.isInMyList(currentBannerMovie.id) : false;
    const icon = document.getElementById('heroListIcon');
    const text = document.getElementById('heroListText');
    
    if (icon && text) {
        if (isInList) { 
            icon.setAttribute('data-icon', 'mdi:check'); 
            text.innerText = getLangText('btnListed'); 
        } else { 
            icon.setAttribute('data-icon', 'mdi:plus'); 
            text.innerText = getLangText('btnList'); 
        }
    }
}

function setupSearch() {
    window.setupGlobalSearchInput(async (query, container) => {
        if(typeof window.searchMultiAPI !== 'function') return;
        const data = await window.searchMultiAPI(query);
        container.innerHTML = '';
        
        if (!data || !data.results || data.results.length === 0) {
            container.innerHTML = `<p style="text-align:center; padding: 20px; color:#888;">${getLangText('searchPlaceholder')}</p>`;
            return;
        }

        data.results.forEach(movie => {
            const card = window.createSearchCard(movie, 'media');
            if (card) container.appendChild(card);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initHome();
});
window.currentLang = localStorage.getItem('appLang');
if (!window.currentLang) {
    window.currentLang = navigator.language.startsWith('pt') ? 'pt' : 'en';
    localStorage.setItem('appLang', window.currentLang);
}

window.applyTranslations = function() {
    if (typeof i18n === 'undefined' || !i18n[window.currentLang]) return;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (!i18n[window.currentLang][key]) return;

        if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
            el.placeholder = i18n[window.currentLang][key];
        } else if (el.classList.contains('i18n-text')) {
            el.innerHTML = i18n[window.currentLang][key]; 
        } else {
            el.innerHTML = i18n[window.currentLang][key];
        }
    });

    const langIcon = document.getElementById('langIcon');
    if (langIcon) {
        langIcon.setAttribute('data-icon', window.currentLang === 'pt' ? 'twemoji:flag-brazil' : 'twemoji:flag-united-states');
    }
};

window.toggleLanguage = function() {
    window.currentLang = window.currentLang === 'en' ? 'pt' : 'en';
    localStorage.setItem('appLang', window.currentLang);
    window.applyTranslations();
    
    if (typeof i18n !== 'undefined' && i18n[window.currentLang]) {
        window.showToast(i18n[window.currentLang].toastMsg);
    }
    
    window.dispatchEvent(new Event('languageChanged'));
};

window.showToast = function(msg, isSuccess = false) {
    const toast = document.getElementById('toastMessage');
    if (!toast) return;
    
    toast.innerText = msg;
    if (isSuccess) {
        toast.classList.add('toast-success');
    } else {
        toast.classList.remove('toast-success');
    }

    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
};

window.loadActiveProfile = function() {
    let activeProfile = null;
    try {
        activeProfile = JSON.parse(localStorage.getItem('netflix_active_profile'));
    } catch (e) {}

    const defaultAvatar = "https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png";
    
    if (activeProfile && activeProfile.avatar) {
        activeProfile.avatar = activeProfile.avatar.replace('http://', 'https://');
    }

    if (!activeProfile || !activeProfile.avatar || activeProfile.avatar.includes('wallpapers.com') || activeProfile.avatar.includes('i.ibb.co')) {
        const safeName = (activeProfile && activeProfile.name) ? activeProfile.name : "Visitante";
        activeProfile = { name: safeName, avatar: defaultAvatar };
        localStorage.setItem('netflix_active_profile', JSON.stringify(activeProfile));
    }

    const headerAvatar = document.getElementById('headerProfileAvatar');
    if (headerAvatar) {
        headerAvatar.src = activeProfile.avatar;
        headerAvatar.onerror = function() { this.src = defaultAvatar; };
    }
    
    const myAvatar = document.getElementById('myProfileAvatarLarge') || document.getElementById('myProfileAvatar');
    if (myAvatar) {
        myAvatar.src = activeProfile.avatar;
        myAvatar.onerror = function() { this.src = defaultAvatar; };
    }

    const myName = document.getElementById('myProfileNameInput') || document.getElementById('myProfileName');
    if (myName) {
        myName.value = activeProfile.name;
    }
};

window.openGlobalSearch = function() { 
    const modal = document.getElementById('searchModal');
    if(modal) modal.classList.add('active'); 
    const input = document.getElementById('searchInput');
    if(input) input.focus(); 
};

window.closeGlobalSearch = function() { 
    const modal = document.getElementById('searchModal');
    if(modal) modal.classList.remove('active'); 
    window.clearGlobalSearch(); 
};

window.clearGlobalSearch = function() { 
    const input = document.getElementById('searchInput');
    if(input) input.value = ''; 
    const container = document.getElementById('searchResultsContainer');
    if(container) container.innerHTML = ''; 
};

window.injectSkeletonsGlobal = function(containerIds, type) {
    containerIds.forEach(id => {
        const container = document.getElementById(id);
        if (container) {
            container.innerHTML = '';
            for (let i = 0; i < 5; i++) {
                if (type === 'games') {
                    container.innerHTML += `<div class="game-card-custom skeleton" style="min-width: 125px; height: 160px; border-radius: 24px; background-color: #222;"></div>`;
                } else {
                    const isTall = id === 'originalsGrid';
                    const w = isTall ? '150px' : '120px';
                    const h = isTall ? '230px' : '175px';
                    container.innerHTML += `<div class="movie-thumb skeleton" style="min-width:${w}; width:${w}; height:${h};"></div>`;
                }
            }
        }
    });
};

window.setupGlobalSearchInput = function(callback) {
    const input = document.getElementById('searchInput');
    if (!input) return;
    
    let timeout = null;
    
    input.addEventListener('input', (e) => {
        clearTimeout(timeout);
        const query = e.target.value;
        const container = document.getElementById('searchResultsContainer');
        
        if (query.trim() === '') { 
            container.innerHTML = ''; 
            return; 
        }

        container.innerHTML = '';
        for (let i = 0; i < 6; i++) {
            container.innerHTML += `<div class="search-list-card"><div class="search-list-img skeleton"></div><div class="search-list-info"><div class="skeleton" style="height:15px; width:70%; border-radius:4px;"></div></div></div>`;
        }

        timeout = setTimeout(() => {
            callback(query, container);
        }, 500);
    });
};

window.createMovieCard = function(movie, isOriginal = false, className = 'movie-thumb') {
    if (!movie.poster_path) return null;
    const imgBase = window.IMG_URL || 'https://image.tmdb.org/t/p/w500';
    const div = document.createElement('div');
    className.split(' ').forEach(cls => div.classList.add(cls));
    div.classList.add('skeleton');
    div.onclick = () => window.location.href = `details.html?id=${movie.id}&type=${movie.title ? 'movie' : 'tv'}`;
    
    const img = document.createElement('img');
    img.src = imgBase + movie.poster_path;
    img.loading = "lazy";
    img.onload = () => { img.style.opacity = '1'; div.classList.remove('skeleton'); };
    div.appendChild(img);

    if (isOriginal) {
        const nIcon = document.createElement('span');
        nIcon.className = className.includes('grid-item') ? 'iconify netflix-n' : 'iconify netflix-n-small';
        nIcon.setAttribute('data-icon', className.includes('grid-item') ? 'logos:netflix-icon' : 'mdi:netflix');
        div.appendChild(nIcon);
    }
    return div;
};

window.createGameCard = function(game, isSmall = false) {
    if(!game.background_image) return null;
    const div = document.createElement('div');
    div.className = isSmall ? 'game-card-sm' : 'game-card-custom';
    div.onclick = () => window.location.href = `game-details.html?id=${game.id}`;
    
    const category = game.genres && game.genres.length > 0 ? game.genres[0].name : 'Arcade';
    
    if (isSmall) {
        div.innerHTML = `
            <div class="game-img-box-sm skeleton">
                <span class="iconify netflix-n-small" data-icon="mdi:netflix"></span>
                <img src="${game.background_image}" loading="lazy" onload="this.style.opacity=1; this.parentElement.classList.remove('skeleton');" alt="${game.name}">
            </div>
            <span class="game-name-sm">${game.name}</span>
            <span class="game-category-sm">${category}</span>
        `;
    } else {
        div.innerHTML = `
            <div class="game-img-box-custom skeleton">
                <span class="iconify netflix-n-small" data-icon="mdi:netflix"></span>
                <img src="${game.background_image}" loading="lazy" onload="this.style.opacity=1; this.parentElement.classList.remove('skeleton');" alt="${game.name}">
            </div>
            <div class="game-info">
                <span class="game-name">${game.name}</span>
                <span class="game-category">${category}</span>
            </div>
        `;
    }
    return div;
};

window.createSearchCard = function(item, type) {
    const div = document.createElement('div');
    div.classList.add('search-list-card');
    
    if (type === 'game') {
        if(!item.background_image) return null;
        div.onclick = () => window.location.href = `game-details.html?id=${item.id}`;
        const category = item.genres && item.genres.length > 0 ? item.genres[0].name : 'Arcade';
        div.innerHTML = `
            <img src="${item.background_image}" class="search-list-img" loading="lazy">
            <div class="search-list-info">
                <span class="search-list-title">${item.name}</span>
                <span class="game-category" style="margin-top:4px;">${category}</span>
            </div>
            <div class="search-list-play">
                <span class="iconify" data-icon="mdi:play-circle-outline"></span>
            </div>
        `;
    } else {
        const imagePath = item.backdrop_path || item.poster_path;
        if (!imagePath) return null;
        const imgBase = window.IMG_URL || 'https://image.tmdb.org/t/p/w500';
        div.onclick = () => window.location.href = `details.html?id=${item.id}&type=${item.title ? 'movie' : 'tv'}`;
        div.innerHTML = `
            <img src="${imgBase + imagePath}" class="search-list-img" loading="lazy">
            <div class="search-list-info"><span class="search-list-title">${item.title || item.name}</span></div>
            <div class="search-list-play"><span class="iconify" data-icon="mdi:play-circle-outline"></span></div>
        `;
    }
    return div;
};

window.loadGlobalComponents = function(activePage) {
    let globalHtml = `<div class="toast-message" id="toastMessage"></div>`;
    
    if (activePage === 'home') {
        const currentFlag = window.currentLang === 'pt' ? 'twemoji:flag-brazil' : 'twemoji:flag-united-states';
        globalHtml += `
            <div class="lang-fab" onclick="toggleLanguage()">
                <span class="iconify" id="langIcon" data-icon="${currentFlag}"></span>
            </div>
        `;
    }

    if (activePage === 'home' || activePage === 'games') {
        const searchPlaceholder = activePage === 'games' ? 'searchGamesPlaceholder' : 'searchPlaceholder';
        globalHtml += `
            <div class="search-modal-toast" id="searchModal">
                <div class="search-top-bar">
                    <span class="iconify search-back-btn" data-icon="mdi:arrow-left" onclick="closeGlobalSearch()"></span>
                    <div class="search-input-wrapper">
                        <span class="iconify icon-search" data-icon="mdi:magnify"></span>
                        <input type="text" id="searchInput" data-i18n="${searchPlaceholder}" placeholder="">
                        <span class="iconify icon-clear" data-icon="mdi:close" onclick="clearGlobalSearch()"></span>
                    </div>
                </div>
                <div class="search-results-list" id="searchResultsContainer"></div>
            </div>
        `;
    }
    
    document.body.insertAdjacentHTML('beforeend', globalHtml);

    if (activePage && activePage !== 'none') {
        const isHome = activePage === 'home' ? 'active' : '';
        const isGames = activePage === 'games' ? 'active' : '';
        const isNews = activePage === 'news' ? 'active' : '';
        const isProfile = activePage === 'account' ? 'active' : '';

        const navHtml = `
            <nav class="bottom-nav">
                <a href="index.html" class="nav-item ${isHome}">
                    <span class="iconify" data-icon="octicon:home-fill-24"></span> 
                    <span class="i18n-text" data-i18n="navHome">Home</span>
                </a>
                <a href="games.html" class="nav-item ${isGames}">
                    <span class="iconify" data-icon="mdi:gamepad-variant"></span> 
                    <span class="i18n-text" data-i18n="navGames">Games</span>
                </a>
                <a href="news.html" class="nav-item ${isNews}">
                    <span class="iconify" data-icon="mdi:play-box-multiple"></span> 
                    <span class="i18n-text" data-i18n="navNews">New & Hot</span>
                </a>
                <a href="account.html" class="nav-item ${isProfile}">
                    <span class="iconify" data-icon="mdi:account-circle"></span> 
                    <span class="i18n-text" data-i18n="navProfile">My Netflix</span>
                </a>
            </nav>
        `;
        document.body.insertAdjacentHTML('beforeend', navHtml);

        const bottomNav = document.querySelector('.bottom-nav');
        if (bottomNav) {
            let lastScrollTop = 0;
            window.addEventListener('scroll', () => {
                let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
                if (currentScroll > lastScrollTop && currentScroll > 50) {
                    bottomNav.classList.add('hidden');
                } else {
                    bottomNav.classList.remove('hidden');
                }
                lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
            }, { passive: true });
        }
    }
    
    window.applyTranslations();
};
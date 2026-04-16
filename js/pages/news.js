let currentTab = 'coming'; 

const monthsData = {
    en: {
        short:['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
        full:['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    },
    pt: {
        short:['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'],
        full:['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initNews();
});

window.addEventListener('languageChanged', () => {
    document.getElementById('newsFeed').innerHTML = `
        <div class="spinner-container">
            <div class="netflix-spinner"></div>
        </div>`;
    initNews();
});

async function initNews() {
    if (typeof window.loadGlobalComponents === 'function') window.loadGlobalComponents('news');
    if (typeof window.loadActiveProfile === 'function') window.loadActiveProfile();

    if (currentTab === 'coming') {
        await fetchComingSoon();
    } else {
        await fetchTrendingNews();
    }
}

window.switchTab = function(tabId) {
    if (currentTab === tabId) return;
    currentTab = tabId;

    document.getElementById('pillComing').className = tabId === 'coming' ? 'pill active' : 'pill inactive';
    document.getElementById('pillTrending').className = tabId === 'trending' ? 'pill active' : 'pill inactive';

    document.getElementById('newsFeed').innerHTML = `
        <div class="spinner-container">
            <div class="netflix-spinner"></div>
        </div>`;
    
    initNews();
};

window.toggleRemind = function(btnElement) {
    const iconSpan = btnElement.querySelector('.iconify');
    const textSpan = btnElement.querySelector('.remind-text');
    
    const currentIcon = iconSpan.getAttribute('data-icon');
    if (currentIcon === 'mdi:bell-outline') {
        iconSpan.setAttribute('data-icon', 'mdi:check');
        textSpan.innerText = i18n[window.currentLang].btnReminded;
        window.showToast(window.currentLang === 'pt' ? 'Lembrete adicionado!' : 'Reminder set!', true);
    } else {
        iconSpan.setAttribute('data-icon', 'mdi:bell-outline');
        textSpan.innerText = i18n[window.currentLang].btnRemind;
        window.showToast(window.currentLang === 'pt' ? 'Lembrete removido!' : 'Reminder removed!');
    }
};

async function fetchComingSoon() {
    try {
        const customSearches = ['Shelter', 'Whistle', 'Hoppers'];
        const customVideos =[
            "https://res.cloudinary.com/dh4mhro1v/video/upload/v1773344836/_storage_emulated_0_Android_data_com.fawazapp.blackhole_files_DCIM_blackhole_2YM32B9TSG_mbtmao.mp4",
            "https://res.cloudinary.com/dh4mhro1v/video/upload/v1773346560/_storage_emulated_0_Android_data_com.fawazapp.blackhole_files_DCIM_blackhole_PYFCSDBM5R_nljjyq.mp4",
            "https://res.cloudinary.com/dh4mhro1v/video/upload/v1773346960/_storage_emulated_0_Android_data_com.fawazapp.blackhole_files_DCIM_blackhole_WH4QAZIPMX_mlgrvy.mp4"
        ];

        let top3Movies =[];
        for (let i = 0; i < customSearches.length; i++) {
            if (typeof window.searchMovieAPI === 'function') {
                const sData = await window.searchMovieAPI(customSearches[i]);
                if (sData && sData.results && sData.results.length > 0) {
                    let movie = sData.results.find(m => m.backdrop_path) || sData.results[0];
                    if (movie) {
                        movie.customVideoUrl = customVideos[i]; 
                        top3Movies.push(movie);
                    }
                }
            }
        }

        let generalMovies =[];
        if (typeof window.fetchUpcomingMoviesAPI === 'function') {
            const data = await window.fetchUpcomingMoviesAPI();
            const top3Ids = top3Movies.map(m => m.id);
            if (data && data.results) {
                generalMovies = data.results.filter(movie => movie.backdrop_path && !top3Ids.includes(movie.id));
            }
        }

        const finalMoviesList = [...top3Movies, ...generalMovies];

        if (finalMoviesList.length === 0) {
            document.getElementById('newsFeed').innerHTML = `<p style="text-align: center; color: #888; margin-top: 50px;">Nenhuma novidade encontrada.</p>`;
            return;
        }

        renderFeed(finalMoviesList, 'coming');
        setupVideoPlayers();

    } catch (error) { 
        document.getElementById('newsFeed').innerHTML = `
            <p style="text-align: center; color: var(--netflix-red); font-weight: bold; margin-top: 50px;">
                ${i18n[window.currentLang].errorLoad}
            </p>`;
    }
}

async function fetchTrendingNews() {
    try {
        let trendingMovies =[];
        if (typeof window.fetchTrendingWeekAPI === 'function') {
            const data = await window.fetchTrendingWeekAPI();
            if (data && data.results) {
                trendingMovies = data.results.filter(movie => movie.backdrop_path).slice(0, 15);
            }
        }

        if (trendingMovies.length === 0) {
            document.getElementById('newsFeed').innerHTML = `<p style="text-align: center; color: #888; margin-top: 50px;">Nenhuma novidade encontrada.</p>`;
            return;
        }

        renderFeed(trendingMovies, 'trending');
        setupVideoPlayers();

    } catch (error) {
        document.getElementById('newsFeed').innerHTML = `
            <p style="text-align: center; color: var(--netflix-red); font-weight: bold; margin-top: 50px;">
                ${i18n[window.currentLang].errorLoad}
            </p>`;
    }
}

function formatReleaseDate(dateString, tabType) {
    if (!dateString) return { month: 'TBA', day: '--', full: window.currentLang === 'pt' ? 'Em Breve' : 'Coming Soon' };
    
    const dateParts = dateString.split('-');
    const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    
    const shortMonths = monthsData[window.currentLang].short;
    const fullMonths = monthsData[window.currentLang].full;
    
    let dia = date.getDate();
    if(dia < 10) dia = `0${dia}`;
    
    let fullText;
    if (tabType === 'trending') {
        fullText = i18n[window.currentLang].availNow;
    } else {
        fullText = window.currentLang === 'pt' 
            ? `Chega em ${dia} de ${fullMonths[date.getMonth()]}` 
            : `Coming ${fullMonths[date.getMonth()]} ${dia}`;
    }

    return { month: shortMonths[date.getMonth()], day: dia, full: fullText };
}

function renderFeed(movies, tabType) {
    const feedContainer = document.getElementById('newsFeed');
    feedContainer.innerHTML = ''; 

    movies.forEach((movie, index) => {
        const dateObj = formatReleaseDate(movie.release_date, tabType);
        const imgUrlBase = window.IMG_URL || 'https://image.tmdb.org/t/p/w500';
        
        let mediaElement = '';
        if (movie.customVideoUrl) {
            mediaElement = `
                <div class="video-card playable">
                    <video src="${movie.customVideoUrl}" poster="${imgUrlBase + movie.backdrop_path}" playsinline preload="none"></video>
                    <div class="play-btn-overlay"><span class="iconify" data-icon="mdi:play"></span></div>
                </div>
            `;
        } else {
            mediaElement = `
                <div class="video-card" style="cursor: default;">
                    <img src="${imgUrlBase + movie.backdrop_path}" alt="${movie.title}" loading="lazy">
                </div>
            `;
        }
        
        let item = document.createElement('div');
        item.classList.add('feed-item');
        item.style.animationDelay = `${index * 0.15}s`;
        item.innerHTML = `
            <div class="date-col">
                <span class="date-month">${dateObj.month}</span>
                <span class="date-day">${dateObj.day}</span>
            </div>
            <div class="content-col">
                ${mediaElement}
                <div class="meta-row">
                    <h2 class="movie-title">${movie.title}</h2>
                    <div class="actions">
                        <div class="action-btn" onclick="toggleRemind(this)">
                            <span class="iconify" data-icon="mdi:bell-outline"></span>
                            <span class="remind-text">${i18n[window.currentLang].btnRemind}</span>
                        </div>
                        <div class="action-btn" onclick="window.location.href='details.html?id=${movie.id}&type=movie'">
                            <span class="iconify" data-icon="mdi:information-outline"></span>
                            <span>${i18n[window.currentLang].btnInfo}</span>
                        </div>
                    </div>
                </div>
                <div class="release-text">${dateObj.full}</div>
                <p class="synopsis">${movie.overview || i18n[window.currentLang].noSynopsis}</p>
            </div>`;
        feedContainer.appendChild(item);
    });
}

function setupVideoPlayers() {
    let allVideos = document.querySelectorAll('video');

    document.querySelectorAll('.video-card.playable').forEach(card => {
        let video = card.querySelector('video');
        let overlay = card.querySelector('.play-btn-overlay');
        
        card.addEventListener('click', () => {
            if (video.paused) {
                allVideos.forEach(v => {
                    if (v !== video && !v.paused) {
                        v.pause();
                        v.style.filter = "brightness(0.85)";
                        v.nextElementSibling.style.opacity = "1";
                    }
                });

                video.play();
                video.style.filter = "brightness(1)";
                overlay.style.opacity = "0";
            } else {
                video.pause();
                video.style.filter = "brightness(0.85)";
                overlay.style.opacity = "1";
            }
        });
        
        video.addEventListener('ended', () => {
            video.style.filter = "brightness(0.85)";
            overlay.style.opacity = "1";
            video.load();
        });
    });
}
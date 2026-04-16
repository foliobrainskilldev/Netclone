const urlParams = new URLSearchParams(window.location.search);
const mediaId = urlParams.get('id');
const mediaType = urlParams.get('type') || 'movie';

let currentTrailerKey = null;
let currentMediaData = null; 
let availableSeasons =[]; 

let currentSeasonSelected = 1;
let currentEpisodeSelected = 1;
let currentEpIdSelected = null;

document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.loadGlobalComponents === 'function') window.loadGlobalComponents('none');
    fetchDetails();
});

window.addEventListener('languageChanged', () => {
    fetchDetails();
});

window.switchTab = function(tabId, sectionId) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.getElementById(sectionId).classList.add('active');
};

window.toggleMyListDetails = function() {
    if (!currentMediaData) return;
    const isInList = window.isInMyList(mediaId);
    
    const btn = document.getElementById('myListBtn');
    btn.classList.add('anim-pop');
    setTimeout(() => btn.classList.remove('anim-pop'), 300);

    if (isInList) {
        window.removeFromMyList(mediaId);
        window.showToast(i18n[window.currentLang].toastRemoved);
    } else {
        window.addToMyList({ 
            id: currentMediaData.id, 
            title: currentMediaData.title || currentMediaData.name, 
            poster_path: currentMediaData.poster_path, 
            type: mediaType 
        });
        window.showToast(i18n[window.currentLang].toastAdded, true);
    }
    updateMyListUI();
};

function updateMyListUI() {
    if (!currentMediaData) return;
    const isInList = window.isInMyList(mediaId);
    const icon = document.getElementById('myListIcon');
    if (icon) icon.setAttribute('data-icon', isInList ? 'mdi:check' : 'mdi:plus');
}

window.toggleRate = function() {
    const btn = document.getElementById('rateBtn');
    const icon = document.getElementById('rateIcon');
    
    btn.classList.add('anim-pop');
    
    if (btn.classList.contains('rate-active')) {
        btn.classList.remove('rate-active');
        icon.setAttribute('data-icon', 'mdi:thumb-up-outline');
    } else {
        btn.classList.add('rate-active');
        icon.setAttribute('data-icon', 'mdi:thumb-up');
        window.showToast(window.currentLang === 'pt' ? 'Avaliação registrada' : 'Rating submitted', true);
    }
    
    setTimeout(() => btn.classList.remove('anim-pop'), 300);
};

function updateDownloadButtonUI() {
    if (!currentMediaData) return;
    const downloads = window.getDownloads();
    
    const btn = document.getElementById('downloadBtn');
    const icon = document.getElementById('downloadIcon');
    const text = document.getElementById('downloadText');

    let epLabelExact = "";
    let epLabelDisplay = "";
    
    if (mediaType === 'tv' && currentEpIdSelected !== null) {
        epLabelExact = `S${currentSeasonSelected}:E${currentEpisodeSelected}`;
        epLabelDisplay = ` ${epLabelExact}`;
    }

    let isDownloaded = false;
    if (mediaType === 'tv') {
        isDownloaded = downloads.some(d => d.id == mediaId && d.epLabel === epLabelExact);
    } else {
        isDownloaded = downloads.some(d => d.id == mediaId);
    }

    if (isDownloaded) {
        icon.className = 'iconify'; 
        icon.setAttribute('data-icon', 'mdi:check');
        text.innerText = i18n[window.currentLang].btnDownloaded + epLabelDisplay;
        btn.style.backgroundColor = '#1a1a1a'; 
        btn.onclick = () => window.location.href = 'downloads.html';
    } else {
        icon.className = 'iconify';
        icon.setAttribute('data-icon', 'mdi:download');
        text.innerText = i18n[window.currentLang].btnDownload + epLabelDisplay;
        btn.style.backgroundColor = 'var(--btn-dark)';
        btn.onclick = window.startMainDownload;
    }
}

window.startMainDownload = function() {
    if (!currentMediaData) return;
    
    const btn = document.getElementById('downloadBtn');
    const icon = document.getElementById('downloadIcon');
    const text = document.getElementById('downloadText');

    let epLabelExact = "";
    let epLabelDisplay = "";
    if (mediaType === 'tv') {
        epLabelExact = `S${currentSeasonSelected}:E${currentEpisodeSelected}`;
        epLabelDisplay = ` ${epLabelExact}`;
    }

    btn.onclick = null; 
    icon.className = 'dl-spinner';
    icon.removeAttribute('data-icon');
    text.innerText = `${i18n[window.currentLang].btnDownloading}${epLabelDisplay}... 0%`;

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 18) + 5; 
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            const downloads = window.getDownloads();
            if(!downloads.some(d => d.id == currentMediaData.id && (mediaType === 'movie' || d.epLabel === epLabelExact))) {
                downloads.push({ 
                    id: currentMediaData.id, 
                    title: currentMediaData.title || currentMediaData.name, 
                    poster_path: currentMediaData.poster_path, 
                    type: mediaType,
                    epLabel: epLabelExact
                });
                window.saveDownloads(downloads);
            }
            
            updateDownloadButtonUI();
            
            if (mediaType === 'tv') {
                const iconIndiv = document.getElementById(`ep-dl-icon-${currentEpIdSelected}`);
                if(iconIndiv) iconIndiv.setAttribute('data-icon', 'mdi:check');
                const boxIndiv = document.getElementById(`ep-dl-box-${currentEpIdSelected}`);
                if(boxIndiv) boxIndiv.onclick = null;
            }

            window.showToast(i18n[window.currentLang].toastDownloaded, true);
        } else {
            text.innerText = `${i18n[window.currentLang].btnDownloading}${epLabelDisplay}... ${progress}%`;
        }
    }, 500); 
};

window.selectEpisode = function(seasonNum, epNum, epId) {
    currentSeasonSelected = seasonNum;
    currentEpisodeSelected = epNum;
    currentEpIdSelected = epId;
    
    document.querySelectorAll('.episode-wrapper').forEach(el => el.classList.remove('selected'));
    const wrapper = document.getElementById(`ep-wrapper-${epId}`);
    if(wrapper) wrapper.classList.add('selected');
    
    updateDownloadButtonUI();
};

window.startEpisodeDownload = function(seasonNum, episodeNum, epId) {
    const icon = document.getElementById(`ep-dl-icon-${epId}`);
    const txt = document.getElementById(`ep-dl-txt-${epId}`);
    const box = document.getElementById(`ep-dl-box-${epId}`);

    box.onclick = null; 
    icon.className = 'dl-spinner';
    icon.removeAttribute('data-icon');
    txt.style.display = 'inline-block';
    
    const epLabelExact = `S${seasonNum}:E${episodeNum}`;
    txt.innerText = `${epLabelExact} 0%`;

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 18) + 5;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            icon.className = 'iconify';
            icon.setAttribute('data-icon', 'mdi:check');
            txt.style.display = 'none';

            const downloads = window.getDownloads();
            if(!downloads.some(d => d.id == currentMediaData.id && d.epLabel === epLabelExact)) {
                downloads.push({ 
                    id: currentMediaData.id, 
                    title: currentMediaData.title || currentMediaData.name, 
                    poster_path: currentMediaData.poster_path, 
                    type: mediaType,
                    epLabel: epLabelExact
                });
                window.saveDownloads(downloads);
            }
            
            updateDownloadButtonUI();
            window.showToast(`${i18n[window.currentLang].toastDownloaded} (${epLabelExact})`, true);
        } else {
            txt.innerText = `${epLabelExact} ${progress}%`;
        }
    }, 500);
};

function extractYouTubeId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

function findBestVideo(videoData) {
    if (!videoData || !videoData.results) return null;
    const validTypes =['Trailer', 'Teaser', 'Clip', 'Featurette', 'Behind the Scenes'];
    const ytVideos = videoData.results.filter(v => v.site === 'YouTube' && validTypes.includes(v.type));
    if (ytVideos.length === 0) return null;
    const trailer = ytVideos.find(v => v.type === 'Trailer');
    return trailer ? trailer.key : ytVideos[0].key;
}

async function fetchDetails() {
    if (!mediaId) {
        document.getElementById('title').innerText = i18n[window.currentLang].errNotFound;
        hideLoader();
        return;
    }

    try {
        const data = await window.fetchMediaDetailsAPI(mediaType, mediaId);
        if(!data) throw new Error("Sem dados");

        currentMediaData = data; 
        let titleToDisplay = data.title || data.name;
        let titleToSearch = titleToDisplay; 
        const releaseYear = (data.release_date || data.first_air_date || '----').split('-')[0];

        if (window.currentLang === 'pt') {
            const enData = await window.fetchEnglishTitleAPI(mediaType, mediaId);
            if(enData) titleToSearch = enData.title || enData.name;
        }

        const trailerData = await window.fetchCustomTrailerAPI(titleToSearch, releaseYear);
        if (trailerData && trailerData.found && trailerData.trailerUrl) {
            currentTrailerKey = extractYouTubeId(trailerData.trailerUrl);
        } else {
            currentTrailerKey = findBestVideo(data.videos);
        }

        const playOverlay = document.getElementById('playBtnOverlay');
        if(!currentTrailerKey) playOverlay.style.display = 'none';
        else playOverlay.style.display = 'flex';

        const backdrop = document.getElementById('backdropImg');
        if (data.backdrop_path) {
            backdrop.src = window.IMG_BG_URL + data.backdrop_path;
        } else if (data.poster_path) {
            backdrop.src = window.IMG_URL + data.poster_path;
        } else {
            backdrop.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==';
        }
        backdrop.onload = () => backdrop.style.opacity = '1';

        document.getElementById('title').innerText = titleToDisplay;
        document.getElementById('mediaTypeLabel').innerText = mediaType === 'tv' ? i18n[window.currentLang].lblSeries : i18n[window.currentLang].lblMovie;
        document.getElementById('year').innerText = releaseYear;
        
        if (data.runtime) {
            const hours = Math.floor(data.runtime / 60);
            const mins = data.runtime % 60;
            document.getElementById('duration').innerText = `${hours}h ${mins}m`;
        } else if (data.number_of_seasons) {
            const seasonLabel = data.number_of_seasons > 1 ? i18n[window.currentLang].lblSeasons : i18n[window.currentLang].lblSeason;
            document.getElementById('duration').innerText = `${data.number_of_seasons} ${seasonLabel}`;
        }

        document.getElementById('matchScore').innerText = `${Math.floor(Math.random() * 15) + 80}%`;
        document.getElementById('synopsis').innerText = data.overview || i18n[window.currentLang].noSynopsis;

        if (data.credits && data.credits.cast) {
            const cast = data.credits.cast.slice(0, 3).map(c => c.name).join(', ');
            document.getElementById('cast').innerText = cast + '...';

            const director = data.credits.crew.find(c => c.job === 'Director');
            if (director) {
                document.getElementById('director').innerText = director.name;
                document.getElementById('director').parentElement.style.display = 'block';
            } else {
                document.getElementById('director').parentElement.style.display = 'none';
            }
        }

        if (mediaType === 'tv' && data.seasons) {
            availableSeasons = data.seasons.filter(s => s.season_number > 0);
            if (availableSeasons.length > 0) {
                document.getElementById('tabEpisodes').style.display = 'block';
                window.switchTab('tabEpisodes', 'episodesSection');
                populateSeasonSheet();
                fetchEpisodes(availableSeasons[0].season_number, availableSeasons[0].name);
            }
        } else {
            document.getElementById('tabEpisodes').style.display = 'none';
            window.switchTab('tabMore', 'moreSection');
        }

        if (data.similar && data.similar.results) {
            renderSimilar(data.similar.results.slice(0, 12));
        }

        updateDownloadButtonUI();
        updateMyListUI();
        hideLoader();

    } catch (error) { 
        console.error(error); 
        hideLoader();
    }
}

function hideLoader() {
    setTimeout(() => {
        const loader = document.getElementById('loadingOverlay');
        if(loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 400);
        }
    }, 500);
}

window.openSeasonSheet = function() {
    document.getElementById('sheetOverlay').classList.add('active');
    document.getElementById('seasonBottomSheet').classList.add('active');
};

window.closeSeasonSheet = function() {
    document.getElementById('sheetOverlay').classList.remove('active');
    document.getElementById('seasonBottomSheet').classList.remove('active');
};

function populateSeasonSheet() {
    const list = document.getElementById('seasonList');
    list.innerHTML = '';
    availableSeasons.forEach((season, index) => {
        const div = document.createElement('div');
        div.className = `sheet-item ${index === 0 ? 'active' : ''}`;
        div.innerHTML = `<span>${season.name}</span><span class="iconify sheet-check" data-icon="mdi:check"></span>`;
        div.onclick = () => {
            document.querySelectorAll('.sheet-item').forEach(el => el.classList.remove('active'));
            div.classList.add('active');
            fetchEpisodes(season.season_number, season.name);
            window.closeSeasonSheet();
        };
        list.appendChild(div);
    });
}

async function fetchEpisodes(seasonNumber, seasonName) {
    document.getElementById('currentSeasonLabel').innerText = seasonName;
    const container = document.getElementById('episodeListContainer');
    
    container.innerHTML = `
        <div style="display:flex; justify-content:center; margin-top:30px;">
            <div class="netflix-spinner" style="width:30px; height:30px;"></div>
        </div>`;

    currentEpIdSelected = null;

    try {
        const data = await window.fetchEpisodesAPI(mediaId, seasonNumber);
        if (data && data.episodes && data.episodes.length > 0) {
            container.innerHTML = '';
            const downloads = window.getDownloads();

            data.episodes.forEach((ep, index) => {
                if (index === 0) {
                    currentSeasonSelected = seasonNumber;
                    currentEpisodeSelected = ep.episode_number;
                    currentEpIdSelected = ep.id;
                }

                const epLabelExact = `S${seasonNumber}:E${ep.episode_number}`;
                const isEpDownloaded = downloads.some(d => d.id == mediaId && d.epLabel === epLabelExact);
                const isSelected = ep.id === currentEpIdSelected;
                
                const img = ep.still_path ? window.IMG_URL + ep.still_path : 'https://placehold.co/130x73/222222/666666?text=Netflix';
                
                const dur = ep.runtime ? `${ep.runtime}m` : '--m';
                const desc = ep.overview || i18n[window.currentLang].noSynopsis;
                
                container.innerHTML += `
                    <div class="episode-wrapper ${isSelected ? 'selected' : ''}" id="ep-wrapper-${ep.id}">
                        <div class="episode-item" onclick="selectEpisode(${seasonNumber}, ${ep.episode_number}, ${ep.id}); playTrailer();">
                            <div class="ep-img-container">
                                <img src="${img}" alt="${ep.name}" loading="lazy">
                                <div class="ep-play-circle"><span class="iconify" data-icon="mdi:play" style="color:#fff; font-size:1.5rem;"></span></div>
                            </div>
                            <div class="ep-info">
                                <div class="ep-title">${ep.episode_number}. ${ep.name}</div>
                                <div class="ep-duration">${dur}</div>
                            </div>
                            
                            <div class="ep-download" id="ep-dl-box-${ep.id}" ${isEpDownloaded ? '' : `onclick="event.stopPropagation(); startEpisodeDownload(${seasonNumber}, ${ep.episode_number}, ${ep.id})"`}>
                                <span class="iconify" id="ep-dl-icon-${ep.id}" data-icon="${isEpDownloaded ? 'mdi:check' : 'mdi:download'}"></span>
                                <span id="ep-dl-txt-${ep.id}" class="ep-dl-txt" style="display:none;"></span>
                            </div>
                        </div>
                        <div class="ep-overview">${desc}</div>
                    </div>
                `;
            });

            updateDownloadButtonUI();
        } else { 
            container.innerHTML = `<p style="color: #888; text-align: center;">Nenhum episódio encontrado.</p>`; 
        }
    } catch (err) { 
        container.innerHTML = `<p style="color: var(--netflix-red); text-align: center;">Erro ao carregar episódios.</p>`; 
    }
}

window.playTrailer = function() {
    if (currentTrailerKey) {
        const container = document.getElementById('trailerContainer');
        const youtubeUrl = `https://www.youtube.com/embed/${currentTrailerKey}?autoplay=1&controls=1&modestbranding=1&rel=0&playsinline=1&origin=https://localhost`;

        container.innerHTML = `
            <iframe class="trailer-iframe" 
                src="${youtubeUrl}" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        `;
    }
};

function renderSimilar(movies) {
    const grid = document.getElementById('similarGrid');
    grid.innerHTML = '';
    
    movies.forEach(movie => {
        const isOriginal = Math.random() > 0.7;
        const card = window.createMovieCard(movie, isOriginal, 'grid-item');
        if (card) grid.appendChild(card);
    });
}
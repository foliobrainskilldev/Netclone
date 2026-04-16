window.fetchMoviesFromAPI = async function(feedFilter, genreId) {
    const apiLang = window.currentLang === 'pt' ? 'pt-BR' : 'en-US';
    let urls =[];

    if (genreId) {
        urls =[
            fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=${apiLang}&with_genres=${genreId}&page=1`),
            fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=${apiLang}&with_genres=${genreId}&page=2`),
            fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=${apiLang}&with_genres=${genreId}&page=3`),
            fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=${apiLang}&with_genres=${genreId}&page=4`)
        ];
    } else if (feedFilter === 'tv') {
        urls =[
            fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&language=${apiLang}&page=1`),
            fetch(`${BASE_URL}/tv/top_rated?api_key=${API_KEY}&language=${apiLang}&page=1`),
            fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&language=${apiLang}&with_genres=10759`), 
            fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&language=${apiLang}&with_genres=35`)    
        ];
    } else if (feedFilter === 'movie') {
        urls =[
            fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=${apiLang}&page=1`),
            fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=${apiLang}`),
            fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=${apiLang}&with_genres=28`),
            fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=${apiLang}&with_genres=35`)
        ];
    } else { 
        urls =[
            fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=${apiLang}&page=1`),
            fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&language=${apiLang}&page=1`),
            fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=${apiLang}&with_genres=28`), 
            fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=${apiLang}&with_genres=35`)
        ];
    }

    try {
        const responses = await Promise.all(urls);
        return await Promise.all(responses.map(res => res.json()));
    } catch (err) {
        return null;
    }
};

window.fetchGamesHomeAPI = async function() {
    try {
        const res = await fetch(GAMES_API);
        return await res.json();
    } catch (err) {
        return null;
    }
};

window.searchMultiAPI = async function(query) {
    const apiLang = window.currentLang === 'pt' ? 'pt-BR' : 'en-US';
    try {
        const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&language=${apiLang}&query=${encodeURIComponent(query)}`);
        return await res.json();
    } catch (error) {
        return null;
    }
};

window.fetchMediaDetailsAPI = async function(mediaType, mediaId) {
    const apiLang = window.currentLang === 'pt' ? 'pt-BR' : 'en-US';
    try {
        const res = await fetch(`${BASE_URL}/${mediaType}/${mediaId}?api_key=${API_KEY}&language=${apiLang}&append_to_response=credits,similar,videos`);
        return await res.json();
    } catch (error) {
        return null;
    }
};

window.fetchEpisodesAPI = async function(mediaId, seasonNumber) {
    const apiLang = window.currentLang === 'pt' ? 'pt-BR' : 'en-US';
    try {
        const res = await fetch(`${BASE_URL}/tv/${mediaId}/season/${seasonNumber}?api_key=${API_KEY}&language=${apiLang}`);
        return await res.json();
    } catch (error) {
        return null;
    }
};

window.fetchEnglishTitleAPI = async function(mediaType, mediaId) {
    try {
        const res = await fetch(`${BASE_URL}/${mediaType}/${mediaId}?api_key=${API_KEY}&language=en-US`);
        return await res.json();
    } catch (error) {
        return null;
    }
};

window.fetchCustomTrailerAPI = async function(title, year) {
    try {
        const res = await fetch(`${MY_CUSTOM_API}/trailer?title=${encodeURIComponent(title)}&year=${year}`);
        return await res.json();
    } catch (error) {
        return null;
    }
};

window.fetchUpcomingMoviesAPI = async function() {
    const apiLang = window.currentLang === 'pt' ? 'pt-BR' : 'en-US';
    try {
        const res = await fetch(`${window.BASE_URL}/movie/upcoming?api_key=${window.API_KEY}&language=${apiLang}&page=1`);
        return await res.json();
    } catch (error) {
        return null;
    }
};

window.fetchTrendingWeekAPI = async function() {
    const apiLang = window.currentLang === 'pt' ? 'pt-BR' : 'en-US';
    try {
        const res = await fetch(`${window.BASE_URL}/trending/movie/week?api_key=${window.API_KEY}&language=${apiLang}`);
        return await res.json();
    } catch (error) {
        return null;
    }
};

window.searchMovieAPI = async function(query) {
    const apiLang = window.currentLang === 'pt' ? 'pt-BR' : 'en-US';
    try {
        const res = await fetch(`${window.BASE_URL}/search/movie?api_key=${window.API_KEY}&language=${apiLang}&query=${encodeURIComponent(query)}`);
        return await res.json();
    } catch (error) {
        return null;
    }
};
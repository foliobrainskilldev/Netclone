document.addEventListener('DOMContentLoaded', () => {
    initDownloads();
});

window.addEventListener('languageChanged', () => {
    renderDownloads();
});

function initDownloads() {
    if (typeof window.loadGlobalComponents === 'function') window.loadGlobalComponents('none');
    renderDownloads();
}

window.renderDownloads = function() {
    let downloads =[];
    if (typeof window.getDownloads === 'function') {
        downloads = window.getDownloads();
    }

    const emptyState = document.getElementById('emptyState');
    const listContainer = document.getElementById('downloadsList');
    const smartDownloads = document.getElementById('smartDownloads');

    listContainer.innerHTML = '';

    if (downloads.length === 0) {
        emptyState.style.display = 'flex';
        listContainer.style.display = 'none';
        smartDownloads.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        listContainer.style.display = 'flex';
        smartDownloads.style.display = 'flex';

        downloads.forEach(item => {
            const div = document.createElement('div');
            div.className = 'download-item';
            div.id = `dl-${item.id}`;
            
            const mockSize = (item.id % 800) + 150; 
            
            const typeLabel = item.type === 'tv' 
                ? `2 ${window.i18n ? window.i18n[window.currentLang].episodes : 'Episódios'}` 
                : (window.i18n ? window.i18n[window.currentLang].movie : 'Filme');

            const imgBase = window.IMG_URL || 'https://image.tmdb.org/t/p/w500';

            div.innerHTML = `
                <div class="dl-img" onclick="window.location.href='details.html?id=${item.id}&type=${item.type}'">
                    <img src="${imgBase + item.poster_path}" alt="${item.title}">
                    <div class="dl-play-overlay"><span class="iconify" data-icon="mdi:play"></span></div>
                </div>
                <div class="dl-info">
                    <div class="dl-title">${item.title}</div>
                    <div class="dl-meta">
                        <span>${typeLabel}</span>
                        <span>|</span>
                        <span>${mockSize} MB</span>
                        <span class="dl-badge">HD</span>
                    </div>
                </div>
                <div class="dl-actions">
                    <span class="iconify btn-delete" data-icon="mdi:delete-outline" onclick="deleteDownload(${item.id})"></span>
                </div>
            `;
            listContainer.appendChild(div);
        });
    }
};

window.deleteDownload = function(id) {
    const itemEl = document.getElementById(`dl-${id}`);
    if (itemEl) {
        itemEl.classList.add('removing');
        
        setTimeout(() => {
            if (typeof window.getDownloads === 'function') {
                let downloads = window.getDownloads();
                downloads = downloads.filter(d => d.id !== id);
                window.saveDownloads(downloads);
            }
            
            renderDownloads();
            
            if (typeof window.showToast === 'function' && window.i18n) {
                window.showToast(window.i18n[window.currentLang].msgRemoved);
            }
        }, 300); 
    }
};
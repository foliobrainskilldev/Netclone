// js/pages/mynetflix.js
document.addEventListener('DOMContentLoaded', () => {
    initMyNetflix();
});

window.addEventListener('languageChanged', () => {
    loadMyListUI(); 
});

function initMyNetflix() {
    if (typeof window.loadGlobalComponents === 'function') window.loadGlobalComponents('account');
    initProfileData();
    loadMyListUI();
}

window.toggleSwitchSettings = function(id) {
    const toggle = document.getElementById(id);
    if(toggle) toggle.classList.toggle('active');
};

function initProfileData() {
    try {
        let activeProfile = null;
        if (typeof window.getActiveProfile === 'function') {
            activeProfile = window.getActiveProfile();
        } else {
            const saved = localStorage.getItem('netflix_active_profile');
            if (saved) activeProfile = JSON.parse(saved);
        }

        const avatarEl = document.getElementById('myProfileAvatarLarge');
        const nameEl = document.getElementById('myProfileNameInput');
        const defaultAvatar = "https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png";

        if (avatarEl) {
            avatarEl.onerror = function() {
                this.src = defaultAvatar;
            };
        }

        if (activeProfile && activeProfile.avatar) {
            avatarEl.src = activeProfile.avatar;
            nameEl.innerText = activeProfile.name || "Visitante";
        } else {
            avatarEl.src = defaultAvatar;
            nameEl.innerText = "Visitante";
        }

        if (nameEl) {
            nameEl.addEventListener('blur', (e) => {
                if (activeProfile) {
                    activeProfile.name = e.target.innerText.trim() || "Visitante";
                    if (typeof window.setActiveProfile === 'function') {
                        window.setActiveProfile(activeProfile);
                    } else {
                        localStorage.setItem('netflix_active_profile', JSON.stringify(activeProfile));
                    }
                    if (typeof window.showToast === 'function') {
                        window.showToast(window.currentLang === 'pt' ? 'Nome atualizado com sucesso!' : 'Name updated successfully!', true);
                    }
                }
            });

            nameEl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    nameEl.blur();
                }
            });
        }
    } catch (e) {
        console.error(e);
    }
}

function loadMyListUI() {
    const container = document.getElementById('myListGrid');
    if (!container) return;
    
    container.innerHTML = `
        <div class="spinner-container">
            <div class="netflix-spinner"></div>
        </div>
    `;

    setTimeout(() => {
        let savedList =[];
        try {
            savedList = typeof window.getMyList === 'function' ? window.getMyList() : JSON.parse(localStorage.getItem('netflix_my_list') || '[]');
        } catch(e) {}

        container.innerHTML = '';

        if (!savedList || savedList.length === 0) {
            const emptyMsg = window.currentLang === 'pt' ? 'Ainda não adicionou nenhum título à sua lista.' : 'You haven\'t added any titles to your list yet.';
            container.innerHTML = `<div class="empty-list-msg"><span class="iconify" data-icon="mdi:plus-circle-outline" style="font-size:1.5rem;"></span> ${emptyMsg}</div>`;
            return;
        }

        [...savedList].reverse().forEach(movie => {
            const card = window.createMovieCard(movie, false, 'movie-thumb');
            if (card) container.appendChild(card);
        });
    }, 500);
}
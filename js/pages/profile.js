document.addEventListener('DOMContentLoaded', () => {
    initProfilePage();
});

window.addEventListener('languageChanged', () => {
    renderProfiles();
});

function initProfilePage() {
    if (typeof window.loadGlobalComponents === 'function') window.loadGlobalComponents('none');
    renderProfiles();
}

window.renderProfiles = function() {
    const container = document.getElementById('profilesContainer');
    if (!container) return;
    container.innerHTML = '';

    let profiles =[];
    if (typeof window.getProfiles === 'function') {
        profiles = window.getProfiles();
    } else {
        profiles =[
            { id: 1, name: 'Rodrigo', avatar: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png' }, 
            { id: 2, name: 'Crianças', avatar: 'https://mir-s3-cdn-cf.behance.net/project_modules/disp/84c20033850498.56ba69ac290ea.png' },
            { id: 3, name: 'Visitante', avatar: 'https://mir-s3-cdn-cf.behance.net/project_modules/disp/366be133850498.56ba69ac36858.png' }
        ];
    }

    profiles.forEach(profile => {
        const div = document.createElement('div');
        div.className = 'profile-item';
        div.onclick = () => selectProfile(profile);

        div.innerHTML = `
            <div class="avatar-box">
                <img src="${profile.avatar}" alt="${profile.name}" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png'">
            </div>
            <span class="profile-name">${profile.name}</span>
        `;
        container.appendChild(div);
    });

    const addProfileText = window.i18n ? window.i18n[window.currentLang].addProfile : 'Adicionar Perfil';
    
    const addDiv = document.createElement('div');
    addDiv.className = 'profile-item add-profile';
    addDiv.innerHTML = `
        <div class="avatar-box">
            <span class="iconify" data-icon="mdi:plus-circle"></span>
        </div>
        <span class="profile-name">${addProfileText}</span>
    `;
    container.appendChild(addDiv);
};

window.selectProfile = function(profile) {
    if (typeof window.setActiveProfile === 'function') {
        window.setActiveProfile(profile);
    } else {
        localStorage.setItem('netflix_active_profile', JSON.stringify(profile));
    }

    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.add('active');

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
};
window.getProfiles = function() {
    let profiles = JSON.parse(localStorage.getItem('netflix_profiles'));
    const defaultProfiles =[
        { id: 1, name: 'Rodrigo', avatar: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png' }, 
        { id: 2, name: 'Crianças', avatar: 'https://mir-s3-cdn-cf.behance.net/project_modules/disp/84c20033850498.56ba69ac290ea.png' },
        { id: 3, name: 'Visitante', avatar: 'https://mir-s3-cdn-cf.behance.net/project_modules/disp/366be133850498.56ba69ac36858.png' }
    ];

    if (!profiles || profiles.some(p => p.avatar.includes('wallpapers.com') || p.avatar.includes('i.ibb.co'))) {
        localStorage.setItem('netflix_profiles', JSON.stringify(defaultProfiles));
        return defaultProfiles;
    }

    return profiles;
};

window.getActiveProfile = function() {
    let active = localStorage.getItem('netflix_active_profile');
    if (active) {
        let profile = JSON.parse(active);
        if (profile.avatar.includes('wallpapers.com') || profile.avatar.includes('i.ibb.co')) {
            profile.avatar = 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png';
            localStorage.setItem('netflix_active_profile', JSON.stringify(profile));
        }
        return profile;
    }
    return window.getProfiles()[0];
};

window.setActiveProfile = function(profile) {
    localStorage.setItem('netflix_active_profile', JSON.stringify(profile));
};

window.getMyList = function() {
    try {
        return JSON.parse(localStorage.getItem('netflix_my_list')) || [];
    } catch(e) {
        return[];
    }
};

window.addToMyList = function(item) {
    const list = window.getMyList();
    if (!list.find(i => i.id == item.id)) {
        list.push(item);
        localStorage.setItem('netflix_my_list', JSON.stringify(list));
        window.dispatchEvent(new Event('myListUpdated'));
    }
};

window.removeFromMyList = function(id) {
    let list = window.getMyList();
    list = list.filter(item => item.id != id);
    localStorage.setItem('netflix_my_list', JSON.stringify(list));
    window.dispatchEvent(new Event('myListUpdated'));
};

window.isInMyList = function(id) {
    const list = window.getMyList();
    return list.some(i => i.id == id);
};

window.getDownloads = function() {
    try {
        return JSON.parse(localStorage.getItem('netflix_downloads')) || [];
    } catch(e) {
        return[];
    }
};

window.saveDownloads = function(downloadsArray) {
    localStorage.setItem('netflix_downloads', JSON.stringify(downloadsArray));
    window.dispatchEvent(new Event('downloadsUpdated'));
};
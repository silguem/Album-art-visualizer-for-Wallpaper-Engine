const API_KEY = 'YOUR_API_KEY'; // Replace this with your last.fm API key
const USERNAME = 'YOUR_USERNAME'; // Replace this with your last.fm username

/**
 * Fetches the currently playing track and updates the album art.
 * Makes a request every 10 seconds to keep the display updated.
 */
async function fetchNowPlaying() {
    const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${USERNAME}&api_key=${API_KEY}&format=json`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const track = data.recenttracks.track[0];

        // Check if there's a track currently playing
        if (track['@attr'] && track['@attr'].nowplaying) {
            const albumArt = track.image.find(img => img.size === 'extralarge')['#text'];
            updateWallpaper(albumArt);
        }
    } catch (error) {
        console.error('Error fetching now playing track:', error);
    }
}

/**
 * Fetches recent tracks (up to 3) and updates the scrobble list.
 */
async function fetchScrobbles() {
    const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${USERNAME}&api_key=${API_KEY}&format=json`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        const tracks = data.recenttracks.track;
        const scrobbleList = document.getElementById('scrobble-list');

        // Detecta si hay una nueva canción "scrobbling now"
        const isNewTrack = scrobbleList.firstChild?.dataset?.track !== tracks[0].name;

        if (isNewTrack) {
            // Limpia la lista
            scrobbleList.innerHTML = ''; 

            // Agrega las canciones con animación
            tracks.slice(0, 3).forEach((track, index) => {
                const isNowPlaying = track['@attr']?.nowplaying;
            
                const listItem = document.createElement('li');
                const icon = document.createElement('span');
                icon.classList.add('icon');
                icon.textContent = isNowPlaying ? '♫' : index + 1;
            
                const trackInfo = document.createElement('span');
                trackInfo.textContent = `${track.artist['#text']} - ${track.name}`;
            
                // Agrega las clases para animación
                if (index === 0 && isNowPlaying) {
                    listItem.classList.add('new-track'); // Animación solo para la nueva canción
                }
            
                // Escucha el fin de la animación para limpiar las clases
                listItem.addEventListener('animationend', () => {
                    listItem.classList.remove('new-track'); // Elimina la clase para evitar repetición
                });
            
                // Añade el elemento a la lista
                listItem.appendChild(icon);
                listItem.appendChild(trackInfo);
                scrobbleList.appendChild(listItem);
            });
            
            // Activa la clase "scrolling" solo en la lista completa
            scrobbleList.classList.add('scrolling');
            
            // Limpia la clase "scrolling" al terminar la animación
            scrobbleList.addEventListener('animationend', () => {
                scrobbleList.classList.remove('scrolling');
            });        }
    } catch (error) {
        console.error('Error fetching recent tracks:', error);
    }
}


/**
 * Updates the wallpaper with new album art.
 * Implements smooth transitions between images.
 * @param {string} albumArtUrl - URL of the new album art image.
 */
function updateWallpaper(albumArtUrl) {
    const backgroundDiv = document.getElementById('background');
    const albumArtDiv = document.getElementById('album-art');

    const img = new Image();
    img.src = albumArtUrl;

    img.onload = () => {
        backgroundDiv.style.backgroundImage = `url('${albumArtUrl}')`;
        albumArtDiv.style.backgroundImage = `url('${albumArtUrl}')`;
    };
}

// Initialize the wallpaper and scrobble list
fetchNowPlaying();
fetchScrobbles();

// Set up periodic updates
setInterval(fetchNowPlaying, 10000); // Update now playing every 10 seconds
setInterval(fetchScrobbles, 30000); // Update scrobbles every 30 seconds

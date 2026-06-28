// Preload GIF assets so there's no delay when Play is clicked
const GIF_URLS = [
    'https://lh3.googleusercontent.com/d/1N72GIVv2Z_X5qrLFgzWFdrDuyDQvDCNs',
    'https://lh3.googleusercontent.com/d/1cKi7hmr9NEwzblrHhavOON9UkGpXuTxD'
];

// We will store the preloaded Blobs here
const GIF_CACHE = {};

window.addEventListener('load', () => {
    GIF_URLS.forEach(url => {
        fetch(url)
            .then(response => response.blob())
            .then(blob => {
                GIF_CACHE[url] = blob;
            })
            .catch(err => console.error('Error preloading GIF:', err));
    });
});


function flipCard(element) {
    // Toggle flipped class for animation
    element.classList.toggle('flipped');
    
    // Play sound if available
    const clickAudio = document.getElementById('click-audio');
    if (clickAudio) {
        clickAudio.currentTime = 0;
        clickAudio.play().catch(e => console.log('Audio play blocked:', e));
    }
}

function playGifAudio(audioId, container, gifSrc, pngSrc) {
    const audio = document.getElementById(audioId);
    const imgElement = container.querySelector('.gif-image');
    
    // Prevent triggering multiple times while already playing
    if (container.classList.contains('playing') || container.classList.contains('loading')) return;
    
    if (audio && imgElement) {
        container.classList.add('loading');
        const loadingIconPath = "M6,2H18V8H18V8L14,12L18,16V16H18V22H6V16H6V16L10,12L6,8V8H6V2M16,16.5L12,12.5L8,16.5V20H16V16.5M12,11.5L16,7.5V4H8V7.5L12,11.5Z";
        const playOverlay = container.querySelector('.play-overlay');
        let originalSvg = '';
        if (playOverlay) {
            originalSvg = playOverlay.innerHTML;
            playOverlay.innerHTML = `<svg viewBox="0 0 24 24" width="48" height="48" fill="#ffffff"><path d="${loadingIconPath}"/></svg>`;
        }

        container.loadingTextTimeout = setTimeout(() => {
            container.classList.add('show-loading-text');
        }, 300);
        
        const removeLoadingAndPlay = () => {
            clearTimeout(container.loadingTextTimeout);
            container.classList.remove('loading', 'show-loading-text');
            if (playOverlay) {
                playOverlay.innerHTML = `<svg viewBox="0 0 24 24" width="48" height="48" fill="#ffffff"><path d="M14,19H18V5H14M6,19H10V5H6V19Z"/></svg>`; // Pause icon
            }
            audio.currentTime = 0;
            audio.play().catch(e => console.log('Audio play blocked:', e));
            container.classList.add('playing');
        };

        const stopAction = () => {
            clearTimeout(container.loadingTextTimeout);
            container.classList.remove('loading', 'show-loading-text');
            imgElement.src = pngSrc;
            container.classList.remove('playing');
            if (playOverlay) {
                playOverlay.innerHTML = originalSvg;
            }
        };

        // Use preloaded Blob to prevent network delay, and create a new object URL to force replay
        if (GIF_CACHE[gifSrc]) {
            imgElement.src = URL.createObjectURL(GIF_CACHE[gifSrc]);
        } else {
            imgElement.src = gifSrc + '?t=' + new Date().getTime();
        }
        
        if (imgElement.complete) {
            removeLoadingAndPlay();
        } else {
            imgElement.onload = removeLoadingAndPlay;
        }

        // Swap back to static PNG and show play button when audio finishes
        audio.onended = () => {
            stopAction();
            imgElement.onload = null;
        };
    }
}

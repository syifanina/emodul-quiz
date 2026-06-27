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
    if (container.classList.contains('playing')) return;
    
    if (audio && imgElement) {
        let url;
        let isBlob = false;
        // Use preloaded Blob to prevent network delay, and create a new object URL to force replay
        if (GIF_CACHE[gifSrc]) {
            url = URL.createObjectURL(GIF_CACHE[gifSrc]);
            isBlob = true;
        } else {
            url = gifSrc + '?t=' + new Date().getTime();
        }
        
        // Hide play button
        container.classList.add('playing');
        imgElement.src = url;
        
        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                console.log('Audio play blocked:', e);
            });
        }
        
        let audioEnded = false;
        let timeEnded = false;
        
        const finish = () => {
            if (audioEnded && timeEnded) {
                imgElement.src = pngSrc;
                container.classList.remove('playing');
                if (isBlob) {
                    URL.revokeObjectURL(url);
                }
            }
        };
        
        // Swap back to static PNG and show play button when audio finishes AND minimum time passes
        audio.onended = () => {
            audioEnded = true;
            finish();
        };
        
        setTimeout(() => {
            timeEnded = true;
            // If audio hasn't played or failed
            if (audio.paused || audio.ended) {
                audioEnded = true;
            }
            finish();
        }, 3500); // Wait at least 3.5 seconds for the GIF
    }
}

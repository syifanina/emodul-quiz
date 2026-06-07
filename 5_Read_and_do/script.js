// Preload GIF assets so there's no delay when Play is clicked
const GIF_URLS = [
    'https://lh3.googleusercontent.com/d/1ZlH-Z486zTuzB37Gec6ZWqltVlsEu1r0',
    'https://lh3.googleusercontent.com/d/1GeSHIecEGPgzxq00OfcRXIw1VQrDzE5I'
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
        // Use preloaded Blob to prevent network delay, and create a new object URL to force replay
        if (GIF_CACHE[gifSrc]) {
            imgElement.src = URL.createObjectURL(GIF_CACHE[gifSrc]);
        } else {
            imgElement.src = gifSrc + '?t=' + new Date().getTime();
        }
        
        audio.currentTime = 0;
        audio.play().catch(e => console.log('Audio play blocked:', e));
        
        // Hide play button
        container.classList.add('playing');
        
        // Swap back to static PNG and show play button when audio finishes
        audio.onended = () => {
            imgElement.src = pngSrc;
            container.classList.remove('playing');
        };
    }
}

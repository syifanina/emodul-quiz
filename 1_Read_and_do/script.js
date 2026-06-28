// Preload GIF assets as Blobs so there's no delay when Play is clicked
const GIF_URLS = [
    'https://lh3.googleusercontent.com/d/151f1yq96FqbKRMfFKm0KXB4yPoroSeNy',
    'https://lh3.googleusercontent.com/d/1vt8Iv28Rfo1-T9PR8DzhTkleY5hkTXWS'
];

const preloadedGifs = {};

window.addEventListener('load', () => {
    GIF_URLS.forEach(url => {
        fetch(url)
            .then(res => res.blob())
            .then(blob => {
                preloadedGifs[url] = URL.createObjectURL(blob);
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

function playGifAudio(audioId, container, originalGifSrc, pngSrc) {
    const audio = document.getElementById(audioId);
    const imgElement = container.querySelector('.gif-image');
    
    // Prevent triggering multiple times while already playing
    if (container.classList.contains('playing')) return;
    
    if (audio && imgElement) {
        // Hide play button to indicate it's loading/playing
        container.classList.add('playing');
        
        // Use preloaded Blob URL if available, else fallback
        const finalGifSrc = preloadedGifs[originalGifSrc] || originalGifSrc;
        
        // Wait for the GIF to fully load before starting the audio
        imgElement.onload = () => {
            audio.currentTime = 0;
            audio.play().catch(e => console.log('Audio play blocked:', e));
            // Remove listener so it doesn't trigger on reset
            imgElement.onload = null;
        };
        
        // Swap to animated GIF
        imgElement.src = finalGifSrc;
        
        // Swap back to static PNG and show play button when audio finishes
        audio.onended = () => {
            imgElement.onload = null;
            imgElement.src = pngSrc;
            container.classList.remove('playing');
        };
    }
}

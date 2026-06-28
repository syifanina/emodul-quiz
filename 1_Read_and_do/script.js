// Preload GIF assets as Blobs so there's no delay when Play is clicked
const GIF_URLS = [
    'https://lh3.googleusercontent.com/d/151f1yq96FqbKRMfFKm0KXB4yPoroSeNy',
    'https://lh3.googleusercontent.com/d/1vt8Iv28Rfo1-T9PR8DzhTkleY5hkTXWS'
];

const playIconPath = "M8 5v14l11-7z";
const loadingIconPath = "M6,2H18V8H18V8L14,12L18,16V16H18V22H6V16H6V16L10,12L6,8V8H6V2M16,16.5L12,12.5L8,16.5V20H16V16.5M12,11.5L16,7.5V4H8V7.5L12,11.5Z"; // Hourglass icon

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
    const svgPath = container.querySelector('.play-overlay svg path');
    
    // Prevent triggering multiple times while already playing
    if (container.classList.contains('playing') || container.classList.contains('loading-gif')) return;
    
    if (audio && imgElement) {
        // Tandai sedang proses loading agar tidak bisa diklik berulang kali
        container.classList.add('loading-gif');
        
        // Ubah ikon play jadi jam pasir secara instan
        if (svgPath) svgPath.setAttribute('d', loadingIconPath);

        // Munculkan teks Loading... HANYA JIKA memuat lebih dari 300ms
        container.loadingTextTimeout = setTimeout(() => {
            container.classList.add('loading');
        }, 300);
        
        // Use preloaded Blob URL if available, else fallback
        const finalGifSrc = preloadedGifs[originalGifSrc] || originalGifSrc;
        
        // Wait for the GIF to fully load before starting the audio
        imgElement.onload = () => {
            clearTimeout(container.loadingTextTimeout);
            container.classList.remove('loading');
            container.classList.remove('loading-gif');
            
            // Sembunyikan overlay dengan menambahkan class playing
            container.classList.add('playing');
            
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
            // Kembalikan ikon ke Play
            if (svgPath) svgPath.setAttribute('d', playIconPath);
        };
    }
}

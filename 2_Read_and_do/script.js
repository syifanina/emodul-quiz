// Preload GIF assets as Blobs so there's no delay when Play is clicked
const GIF_URLS = [
    'https://lh3.googleusercontent.com/d/1XaOLywX6NWeBIHHu1PacSWzRt7QIMR-l',
    'https://lh3.googleusercontent.com/d/1RB8Xy2_dkyrDIaXEBlHYPf4dkToS82g9'
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

const playIconPath = "M8 5v14l11-7z";
const loadingIconPath = "M6,2H18V8H18V8L14,12L18,16V16H18V22H6V16H6V16L10,12L6,8V8H6V2M16,16.5L12,12.5L8,16.5V20H16V16.5M12,11.5L16,7.5V4H8V7.5L12,11.5Z";

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
    
    // Prevent triggering multiple times while already playing or loading
    if (container.classList.contains('playing') || container.classList.contains('loading')) return;
    
    if (audio && imgElement) {
        if (svgPath) svgPath.setAttribute('d', loadingIconPath);
        
        container.loadingTextTimeout = setTimeout(() => {
            container.classList.add('loading');
        }, 300);
        
        const finalGifSrc = preloadedGifs[originalGifSrc] || originalGifSrc;
        
        imgElement.onload = () => {
            clearTimeout(container.loadingTextTimeout);
            container.classList.remove('loading');
            
            audio.currentTime = 0;
            audio.play().catch(e => console.log('Audio play blocked:', e));
            
            container.classList.add('playing');
            imgElement.onload = null;
        };
        
        imgElement.src = finalGifSrc;
        
        // Swap back to static PNG and show play button when audio finishes
        audio.onended = () => {
            if (svgPath) svgPath.setAttribute('d', playIconPath);
            imgElement.onload = null;
            imgElement.src = pngSrc;
            container.classList.remove('playing');
            container.classList.remove('loading');
        };
    }
}

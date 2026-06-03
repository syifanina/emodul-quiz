// Preload GIF assets so there's no delay when Play is clicked
const GIF_URLS = [
    'gif1.gif',
    'gif2.gif'
];

window.addEventListener('load', () => {
    GIF_URLS.forEach(url => {
        const img = new Image();
        img.src = url;
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
        // Swap to animated GIF
        imgElement.src = gifSrc;
        
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

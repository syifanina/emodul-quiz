document.addEventListener('DOMContentLoaded', () => {
    console.log("Clock Hands interactive lesson loaded successfully!");

    // --- Card 3 (Girl Example Card) Interactive Controls ---
    const girlActionCard = document.getElementById('girl-action-card');
    const girlImage = document.getElementById('girl-image');
    const girlSoundBtn = document.getElementById('girl-sound-btn');
    const girlSoundIcon = document.getElementById('girl-sound-icon');
    const girlAudio = document.getElementById('girl-audio');

    const girlPng = "assets/girl_clock_hands.png";
    const girlGif = "assets/girl_clock_hands.gif";

    const playIconPath = "M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18.03,19.86 21,16.28 21,12C21,7.72 18.03,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16.04C15.5,15.29 16.5,13.77 16.5,12M3,9V15H7L12,20V4L7,9H3Z";
    const pauseIconPath = "M14,19H18V5H14M6,19H10V5H6V19Z";
    const loadingIconPath = "M6,2H18V8H18V8L14,12L18,16V16H18V22H6V16H6V16L10,12L6,8V8H6V2M16,16.5L12,12.5L8,16.5V20H16V16.5M12,11.5L16,7.5V4H8V7.5L12,11.5Z";

    let isGirlPlaying = false;
    let preloadedGifUrl = null;

    // Preload GIF
    fetch(girlGif)
        .then(res => res.blob())
        .then(blob => {
            preloadedGifUrl = URL.createObjectURL(blob);
        })
        .catch(err => console.error("Error preloading GIF:", err));

    function playGirlAction() {
        isGirlPlaying = true;
        
        // Change speaker icon to Loading initially
        if (girlSoundIcon) {
            girlSoundIcon.setAttribute('d', loadingIconPath);
        }

        // Tunda teks loading 300ms
        girlActionCard.loadingTextTimeout = setTimeout(() => {
            girlActionCard.classList.add('loading');
        }, 300);

        girlImage.onload = () => {
            clearTimeout(girlActionCard.loadingTextTimeout);
            girlActionCard.classList.remove('loading');

            if (girlSoundIcon) {
                girlSoundIcon.setAttribute('d', pauseIconPath);
            }
            girlActionCard.classList.add('playing');

            if (girlAudio) {
                girlAudio.currentTime = 0;
                girlAudio.play().catch(err => console.log("Audio play deferred:", err));
            }

            girlImage.onload = null;
        };
        
        // Swap to preloaded GIF or fallback
        const baseSrc = preloadedGifUrl || girlGif;
        const separator = baseSrc.startsWith('blob:') ? '#t=' : '?t=';
        girlImage.src = baseSrc + separator + new Date().getTime();
    }

    function stopGirlAction() {
        isGirlPlaying = false;
        
        // Pause audio and reset
        if (girlAudio) {
            girlAudio.pause();
            girlAudio.currentTime = 0;
        }
        
        clearTimeout(girlActionCard.loadingTextTimeout);
        girlActionCard.classList.remove('loading');

        // Revert to static PNG
        girlImage.src = girlPng;
        
        // Change icon back to Play
        if (girlSoundIcon) {
            girlSoundIcon.setAttribute('d', playIconPath);
        }
        
        // Remove card visual active indicator
        girlActionCard.classList.remove('playing');
    }

    if (girlActionCard && girlSoundBtn) {
        girlSoundBtn.addEventListener('click', (e) => {
            if (isGirlPlaying) {
                stopGirlAction();
            } else {
                playGirlAction();
            }
        });
    }

    if (girlAudio) {
        girlAudio.addEventListener('ended', () => {
            stopGirlAction();
        });
    }
});

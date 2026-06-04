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

    let isGirlPlaying = false;

    function playGirlAction() {
        isGirlPlaying = true;
        
        // Swap to GIF with timestamp to force replay from the start
        girlImage.src = girlGif + "?t=" + new Date().getTime();
        
        // Change speaker icon to Pause
        if (girlSoundIcon) {
            girlSoundIcon.setAttribute('d', pauseIconPath);
        }
        
        // Add card visual active indicator
        girlActionCard.classList.add('playing');
        
        // Play audio from the beginning
        if (girlAudio) {
            girlAudio.currentTime = 0;
            girlAudio.play().catch(err => console.log("Audio play deferred:", err));
        }
    }

    function stopGirlAction() {
        isGirlPlaying = false;
        
        // Pause audio and reset
        if (girlAudio) {
            girlAudio.pause();
            girlAudio.currentTime = 0;
        }
        
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

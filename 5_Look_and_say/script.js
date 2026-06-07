document.addEventListener('DOMContentLoaded', () => {
    const actionCards = document.querySelectorAll('.action-card');
    const audio = document.getElementById('main-audio');
    let currentlyPlaying = null;

    // Track clicked cards for the celebration
    const clickedCards = new Set();
    let isCelebrated = false;

    const playIconPath = "M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18.03,19.86 21,16.28 21,12C21,7.72 18.03,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16.04C15.5,15.29 16.5,13.77 16.5,12M3,9V15H7L12,20V4L7,9H3Z";
    const pauseIconPath = "M14,19H18V5H14M6,19H10V5H6V19Z";

    const playAction = (card) => {
        const audioFile = card.getAttribute('data-audio');
        const soundBtn = card.querySelector('.sound-btn');
        const soundIcon = soundBtn.querySelector('path');

        // Track clicked card
        clickedCards.add(audioFile);

        // Toggle play/pause for the same card
        if (currentlyPlaying === card) {
            stopAction(card);
            return;
        }

        // Stop any currently playing card
        if (currentlyPlaying) {
            stopAction(currentlyPlaying);
        }

        card.classList.add('playing');
        currentlyPlaying = card;
        soundIcon.setAttribute('d', pauseIconPath);

        // Play corresponding audio
        if (audioFile) {
            audio.src = `assets/${audioFile}`;
            audio.play().catch(err => console.warn(`Audio playback failed for ${audioFile}:`, err));
        }

        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const stopAction = (targetCard) => {
        if (!targetCard) return;

        const targetIcon = targetCard.querySelector('.sound-btn path');

        audio.pause();
        audio.currentTime = 0;

        targetCard.classList.remove('playing');
        targetIcon.setAttribute('d', playIconPath);

        if (currentlyPlaying === targetCard) {
            currentlyPlaying = null;
        }
    };

    const checkCompletion = () => {
        if (clickedCards.size === actionCards.length && !isCelebrated) {
            isCelebrated = true;
            triggerCelebration();
        }
    };

    const triggerCelebration = () => {
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
    };

    // Event listener setup for cards and buttons
    actionCards.forEach(card => {
        const soundBtn = card.querySelector('.sound-btn');
        card.addEventListener('click', (e) => {
            if (e.target.closest('.sound-btn')) return;
            playAction(card);
        });

        soundBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            playAction(card);
        });
    });

    audio.addEventListener('ended', () => {
        if (currentlyPlaying) {
            stopAction(currentlyPlaying);
            checkCompletion();
        }
    });

    // Gracefully handle playback error if an audio file is missing
    audio.addEventListener('error', () => {
        console.warn(`Audio playback error encountered for: ${audio.src}`);
        if (currentlyPlaying) {
            stopAction(currentlyPlaying);
            checkCompletion();
        }
    });
});

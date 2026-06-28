document.addEventListener('DOMContentLoaded', () => {
    const actionCards = document.querySelectorAll('.action-card');
    const audio = document.getElementById('main-audio');
    let currentlyPlaying = null;

    // Track clicked cards for the celebration
    const clickedCards = new Set();
    let isCelebrated = false;

    const playIconPath = "M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18.03,19.86 21,16.28 21,12C21,7.72 18.03,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16.04C15.5,15.29 16.5,13.77 16.5,12M3,9V15H7L12,20V4L7,9H3Z";
    const pauseIconPath = "M14,19H18V5H14M6,19H10V5H6V19Z";

    const gifLinks = {
        'on.mp3': 'https://lh3.googleusercontent.com/d/1FEhnr59p2rJ1lTe94g5rvcw99M_rbRBp',
        'under.mp3': 'https://lh3.googleusercontent.com/d/1pHjtB5ETIhCcpChLj7RqJEOxDdSVZVkQ',
        'in.mp3': 'https://lh3.googleusercontent.com/d/1_tUBLpG6USaLQ1kdyIQvczqGz6hfCibD',
        'between.mp3': 'https://lh3.googleusercontent.com/d/12UebfTo8YH-wxciZHUj5GPOkUWTLIe2W',
        'above.mp3': 'https://lh3.googleusercontent.com/d/18LJoksz7ajGKZAiAqS8CzAb1Trj1lz2o',
        'beside.mp3': 'https://lh3.googleusercontent.com/d/1gUxAF1VQslbu2wpHNrf_OF-w4pZj1P17',
        'behind.mp3': 'https://lh3.googleusercontent.com/d/1q_FpQT7lIJhWG2d4SFTgrcZ67FU1KlON',
        'near.mp3': 'https://lh3.googleusercontent.com/d/1kX_bCCIDURk_P9tKkNl2YH6l59tjwX4Q',
        'far.mp3': 'https://lh3.googleusercontent.com/d/1tZFCcuUxKNhdm2HohbOqV_M8c3Hm6U9R',
        'in_front_of.mp3': 'https://lh3.googleusercontent.com/d/1PxAau4GjHR6Mgn9EpunYSzoi5Lwcm8Gd'
    };

    const preloadedGifs = {};

    // Pre-load semua GIF sebagai Blob agar tidak ada delay saat diklik (instan)
    const preloadGifs = (gifMap) => {
        Object.entries(gifMap).forEach(async ([key, url]) => {
            try {
                const response = await fetch(url);
                const blob = await response.blob();
                preloadedGifs[key] = URL.createObjectURL(blob);
            } catch (error) {
                console.warn("Failed to preload gif as blob:", url, error);
                preloadedGifs[key] = url; // Fallback
            }
        });
    };

    preloadGifs(gifLinks);

    // Tidak lagi butuh gifTimeout karena durasi mengikuti onended audio

    const checkAndStopCard = (card) => {
        if (!card) return;
        if (card.dataset.gifPlaying === "false" && card.dataset.audioPlaying === "false") {
            const targetIcon = card.querySelector('.sound-btn path');
            card.classList.remove('playing', 'loading', 'show-loading-text');
            targetIcon.setAttribute('d', playIconPath);
            if (currentlyPlaying === card) currentlyPlaying = null;
        }
    };

    const loadingIconPath = "M6,2H18V8H18V8L14,12L18,16V16H18V22H6V16H6V16L10,12L6,8V8H6V2M16,16.5L12,12.5L8,16.5V20H16V16.5M12,11.5L16,7.5V4H8V7.5L12,11.5Z";

    const playAction = (card) => {
        const audioFile = card.getAttribute('data-audio');
        const soundBtn = card.querySelector('.sound-btn');
        const soundIcon = soundBtn.querySelector('path');
        const imgEl = card.querySelector('.action-image');

        // Track clicked card
        clickedCards.add(audioFile);

        // Toggle play/pause for the same card
        if (currentlyPlaying === card) {
            stopAction(card, true); // Force stop everything including GIF
            return;
        }

        // Stop any currently playing card
        if (currentlyPlaying) {
            stopAction(currentlyPlaying, true); // Force stop previous
        }

        // Simpan versi PNG statis agar bisa dikembalikan nanti
        if (!card.dataset.staticSrc) {
            card.dataset.staticSrc = imgEl.src;
        }

        card.dataset.gifPlaying = "true";
        card.dataset.audioPlaying = "true";
        card.classList.add('playing', 'loading');
        currentlyPlaying = card;
        soundIcon.setAttribute('d', loadingIconPath);

        // Putar audio dan ganti gambar menjadi GIF
        if (audioFile) {
            audio.src = `assets/${audioFile}`;
            
            card.loadingTextTimeout = setTimeout(() => {
                card.classList.add('show-loading-text');
            }, 300);

            const removeLoadingAndPlay = () => {
                clearTimeout(card.loadingTextTimeout);
                card.classList.remove('loading', 'show-loading-text');
                soundIcon.setAttribute('d', pauseIconPath);
                
                audio.play().catch(err => console.warn(`Audio playback failed for ${audioFile}:`, err));
            };
            
            // Switch to GIF
            if (preloadedGifs[audioFile]) {
                imgEl.src = preloadedGifs[audioFile];
            } else if (gifLinks[audioFile]) {
                imgEl.src = gifLinks[audioFile];
            }

            if (imgEl.complete) {
                removeLoadingAndPlay();
            } else {
                imgEl.onload = removeLoadingAndPlay;
            }
        }

        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const stopAction = (targetCard, forceStopGif = false) => {
        if (!targetCard) return;

        const targetIcon = targetCard.querySelector('.sound-btn path');
        const imgEl = targetCard.querySelector('.action-image');

        audio.pause();
        targetCard.dataset.audioPlaying = "false";
        
        // Kembalikan ke PNG statis JIKA forceStopGif (diklik pause manual / pindah kartu)
        if (forceStopGif) {
            clearTimeout(targetCard.loadingTextTimeout);
            targetCard.classList.remove('loading', 'show-loading-text');
            imgEl.onload = null;
            audio.currentTime = 0;
            targetCard.dataset.gifPlaying = "false";
            if (targetCard.dataset.staticSrc) {
                imgEl.src = targetCard.dataset.staticSrc;
            }
            
            targetCard.classList.remove('playing');
            targetIcon.setAttribute('d', playIconPath);
            if (currentlyPlaying === targetCard) {
                currentlyPlaying = null;
            }
        } else {
            checkAndStopCard(targetCard);
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
            clearTimeout(currentlyPlaying.loadingTextTimeout);
            currentlyPlaying.classList.remove('loading', 'show-loading-text');
            const imgEl = currentlyPlaying.querySelector('.action-image');
            imgEl.onload = null;
            if (currentlyPlaying.dataset.staticSrc) {
                imgEl.src = currentlyPlaying.dataset.staticSrc;
            }
            currentlyPlaying.dataset.gifPlaying = "false";
            currentlyPlaying.dataset.audioPlaying = "false";
            checkAndStopCard(currentlyPlaying);
            checkCompletion();
        }
    });

    // Gracefully handle playback error if an audio file is missing
    audio.addEventListener('error', () => {
        console.warn(`Audio playback error encountered for: ${audio.src}`);
        
        // Simulasikan seolah-olah suara langsung habis, tetapi animasi tetap jalan
        if (currentlyPlaying) {
            clearTimeout(currentlyPlaying.loadingTextTimeout);
            currentlyPlaying.classList.remove('loading', 'show-loading-text');
            currentlyPlaying.dataset.audioPlaying = "false";
            checkAndStopCard(currentlyPlaying);
            checkCompletion();
        }
    });
});

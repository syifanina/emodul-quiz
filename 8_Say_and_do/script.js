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
        'a-teacher2.MP3': 'https://lh3.googleusercontent.com/d/1F1Vh5oa1mlT0969CEeJJZb_8epYIWHSb',
        'a-driver2.MP3': 'https://lh3.googleusercontent.com/d/1bXXbTtJlp6xGyCOktdJQjyIXo9eYzDkb',
        'a-doctor2.MP3': 'https://lh3.googleusercontent.com/d/1GN55fZGPsPEqHvMNZ2Zl_9d1dAHjt4B5',
        'a-nurse2.MP3': 'https://lh3.googleusercontent.com/d/1kFa-nIr3439RprjnbCf9Hl9YqBPYNknA',
        'a-police-officer2.MP3': 'https://lh3.googleusercontent.com/d/1fKCQMoOPkRt7f_0_QgfYM-WDJXXHEabf',
        'a-firefighter2.MP3': 'https://lh3.googleusercontent.com/d/1j4QexTR5tcXUaz3aYOBp22z6n3cVudfJ',
        'a-farmer2.MP3': 'https://lh3.googleusercontent.com/d/1IzlECXoqMzUiSgDA12WMIAX0gU9DOgtw',
        'a-fisherman2.MP3': 'https://lh3.googleusercontent.com/d/1lqRilth5TG5u6tFXpIo1jOWGruNuGcBs',
        'a-postman2.MP3': 'https://lh3.googleusercontent.com/d/1g6hIov0ljJ8qnO0t7TTzwpn9XuzBgAfW',
        'a-merchant2.MP3': 'https://lh3.googleusercontent.com/d/1Qg1FYtB0Dyi4wib_MGJlc_Vibn3liVx_',
        'a-mechanic2.MP3': 'https://lh3.googleusercontent.com/d/171tF_lWwVLceankFMMbI_-Fw_MDvqiwx',
        'a-pilot2.MP3': 'https://lh3.googleusercontent.com/d/1IJoq0SjsJc8Ad5chFOsRzjxN-U7vvsQZ',
        'a-soldier2.MP3': 'https://lh3.googleusercontent.com/d/1jfR8KBSuL3ZgnqcGotqyqqt1SrizYaUE',
        'a-vlogger2.MP3': 'https://lh3.googleusercontent.com/d/1GRarf0Gr7sA_ELT9G_An-nssCwirOZN0',
        'a-chef2.MP3': 'https://lh3.googleusercontent.com/d/1nAW28_29n3WIzR63AKLMuiOrHQHaDFKT',
        'a-security2.MP3': 'https://lh3.googleusercontent.com/d/10FXP4o2LEN8_bZk-MumiTvV6qJ-Z53kc'
    };

    const preloadedGifs = {};

    // Pre-load semua GIF sebagai Blob secara berurutan agar yang pertama (Teacher) cepat selesai
    const preloadGifs = async (gifMap) => {
        for (const [key, url] of Object.entries(gifMap)) {
            try {
                const response = await fetch(url);
                const blob = await response.blob();
                preloadedGifs[key] = URL.createObjectURL(blob);
            } catch (error) {
                console.warn("Failed to preload gif as blob:", url, error);
                preloadedGifs[key] = url; // Fallback
            }
        }
    };

    preloadGifs(gifLinks);

    let audioQueue = [];

    const checkAndStopCard = (card) => {
        if (!card) return;
        if (card.dataset.gifPlaying === "false" && card.dataset.audioPlaying === "false") {
            const targetIcon = card.querySelector('.sound-btn path');
            card.classList.remove('playing');
            targetIcon.setAttribute('d', playIconPath);
            if (currentlyPlaying === card) currentlyPlaying = null;
            
            // Remove active class from any text
            const texts = card.querySelectorAll('.playable-text');
            texts.forEach(t => t.classList.remove('active-text'));
        }
    };

    const playNextInQueue = (card, audioFile) => {
        // Highlight active text
        const allTexts = card.querySelectorAll('.playable-text');
        allTexts.forEach(t => t.classList.remove('active-text'));
        const activeText = Array.from(allTexts).find(t => t.getAttribute('data-audio') === audioFile);
        if (activeText) activeText.classList.add('active-text');

        audio.src = `assets/${audioFile}`;
        audio.play().catch(err => {
            console.warn(`Audio playback failed for ${audioFile}:`, err);
            // Skip to next if fails
            audio.dispatchEvent(new Event('ended'));
        });
    };

    const playAction = (card, audioOverride = null, textElement = null) => {
        const defaultAudioFile = card.getAttribute('data-audio');
        let audioFile = audioOverride;
        const soundBtn = card.querySelector('.sound-btn');
        const soundIcon = soundBtn.querySelector('path');
        const imgEl = card.querySelector('.action-image');

        // Track clicked card
        clickedCards.add(defaultAudioFile);

        // If card clicked (no specific text override), prepare queue
        if (!audioOverride) {
            const texts = card.querySelectorAll('.playable-text');
            const audios = Array.from(texts).map(t => t.getAttribute('data-audio')).filter(Boolean);
            if (audios.length > 0) {
                audioFile = audios[0];
                audioQueue = audios.slice(1);
            } else {
                audioFile = defaultAudioFile;
                audioQueue = [];
            }
        } else {
            // Specific text clicked, clear queue
            audioQueue = [];
        }

        const isSameCard = (currentlyPlaying === card);

        // Toggle play/pause for the same card
        if (isSameCard && audio.src.endsWith(audioFile)) {
            stopAction(card, true); // Force stop everything including GIF
            return;
        }

        // Stop any currently playing card
        if (currentlyPlaying) {
            stopAction(currentlyPlaying, !isSameCard); // Force stop GIF only if changing cards
        }

        // Simpan versi PNG statis agar bisa dikembalikan nanti
        if (!card.dataset.staticSrc) {
            card.dataset.staticSrc = imgEl.src;
        }

        card.dataset.audioPlaying = "true";
        card.classList.add('playing');
        currentlyPlaying = card;
        soundIcon.setAttribute('d', pauseIconPath);

        // Putar audio dan ganti gambar menjadi GIF
        if (audioFile) {
            playNextInQueue(card, audioFile);
            
            // Start or restart GIF ONLY if it's a new card or GIF isn't playing
            if (!isSameCard || card.dataset.gifPlaying !== "true") {
                const gifKey = defaultAudioFile;
                if (preloadedGifs[gifKey]) {
                    imgEl.src = preloadedGifs[gifKey];
                } else if (gifLinks[gifKey]) {
                    imgEl.src = gifLinks[gifKey];
                }

                card.dataset.gifPlaying = "true";
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
        
        // Remove active class from any text
        const texts = targetCard.querySelectorAll('.playable-text');
        texts.forEach(t => t.classList.remove('active-text'));
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
            if (e.target.closest('.playable-text')) return;
            playAction(card);
        });

        soundBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            playAction(card);
        });

        const texts = card.querySelectorAll('.playable-text');
        texts.forEach(text => {
            text.addEventListener('click', (e) => {
                e.stopPropagation();
                const audioFile = text.getAttribute('data-audio');
                if (audioFile) {
                    playAction(card, audioFile, text);
                }
            });
        });
    });

    audio.addEventListener('ended', () => {
        if (currentlyPlaying) {
            if (audioQueue && audioQueue.length > 0) {
                const nextAudio = audioQueue.shift();
                playNextInQueue(currentlyPlaying, nextAudio);
            } else {
                currentlyPlaying.dataset.audioPlaying = "false";
                
                // Hentikan GIF bersamaan dengan audio selesai
                currentlyPlaying.dataset.gifPlaying = "false";
                const imgEl = currentlyPlaying.querySelector('.action-image');
                if (currentlyPlaying.dataset.staticSrc) {
                    imgEl.src = currentlyPlaying.dataset.staticSrc;
                }

                checkAndStopCard(currentlyPlaying);
                checkCompletion();
            }
        }
    });

    // Gracefully handle playback error if an audio file is missing
    audio.addEventListener('error', () => {
        console.warn(`Audio playback error encountered for: ${audio.src}`);
        
        // Simulasikan seolah-olah suara langsung habis, tetapi animasi tetap jalan
        if (currentlyPlaying) {
            if (audioQueue && audioQueue.length > 0) {
                const nextAudio = audioQueue.shift();
                playNextInQueue(currentlyPlaying, nextAudio);
            } else {
                currentlyPlaying.dataset.audioPlaying = "false";
                
                // Hentikan GIF jika terjadi error audio
                currentlyPlaying.dataset.gifPlaying = "false";
                const imgEl = currentlyPlaying.querySelector('.action-image');
                if (currentlyPlaying.dataset.staticSrc) {
                    imgEl.src = currentlyPlaying.dataset.staticSrc;
                }

                checkAndStopCard(currentlyPlaying);
                checkCompletion();
            }
        }
    });
});

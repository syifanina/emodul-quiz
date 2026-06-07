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
        'play_game.MP3': 'https://lh3.googleusercontent.com/d/1sUmp3WqqHPWGt8OwSpDH_QoED3mk0uJD',
        'pet_your_cat.MP3': 'https://lh3.googleusercontent.com/d/1g4M3_wZgq8r8Pc5tTT1nbp5rN7yd-cTe',
        'sit_down.MP3': 'https://lh3.googleusercontent.com/d/1ogWUHg3FcCrAJwbxaIosuqfZrD-xCQek',
        'watch_tv.MP3': 'https://lh3.googleusercontent.com/d/1ndB3UdmJ87X-6I-KFFyOZLsrI78D-Qvg',
        'study.MP3': 'https://lh3.googleusercontent.com/d/18Bgd9nR0ncDCFaMnuOXM3KkPZkzf-iFI',
        'do_homework.MP3': 'https://lh3.googleusercontent.com/d/1CNsnETUuFGdYYx_UFTbNNeriUcWp_KAU',
        'make_a_bed.MP3': 'https://lh3.googleusercontent.com/d/1SGaSpQAKtcOmlkbDlyjSrONTPf06oosc',
        'sleep.MP3': 'https://lh3.googleusercontent.com/d/1nEqnQZX_WTUFY2pO4RmeJ-fSTKU9zKia',
        'eat_a_cake.MP3': 'https://lh3.googleusercontent.com/d/1dZVa0-xBEWLRyE0-xXTIAXBpUH4Mvn0p',
        'have_a_breakfast.MP3': 'https://lh3.googleusercontent.com/d/1ALNBmjhFrTwnmammHatRiWuqJXH2vub0',
        'cook_meals.MP3': 'https://lh3.googleusercontent.com/d/1aUbFDzz4-oIUmaHEvRQcQGdChxYoLn9R',
        'bake_a_cake.MP3': 'https://lh3.googleusercontent.com/d/1bW1HPAFdiwIsCC67cmU3ncp4nD_C1aqa',
        'wash_your_hand.MP3': 'https://lh3.googleusercontent.com/d/1XFMF6o_iJCkAt-sk5nV-BJgzM2EtsuJZ',
        'take_a_bath.MP3': 'https://lh3.googleusercontent.com/d/1AZt0XFkZrXnt8XuevYVRuXv8GNO2JjzP',
        'wash_your_clothes.MP3': 'https://lh3.googleusercontent.com/d/1I3bmNZyXDOzQ-DoDq5kEzZ8y2QHudoXk',
        'iron_your_clothes.MP3': 'https://lh3.googleusercontent.com/d/1Trurhm-N_CgPC1fIiHUcz5hLD4kwwdE7',
        'park_the_car.MP3': 'https://lh3.googleusercontent.com/d/1BvhQ5TfxwmfCIBWcBYmjj7uEyLeL5YY9',
        'put_the_bike.MP3': 'https://lh3.googleusercontent.com/d/1_e4OrXev4i7UGZmH9evsGfnX7W_XZv3d'
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

    let gifTimeout = null;

    const checkAndStopCard = (card) => {
        if (!card) return;
        if (card.dataset.gifPlaying === "false" && card.dataset.audioPlaying === "false") {
            const targetIcon = card.querySelector('.sound-btn path');
            card.classList.remove('playing');
            targetIcon.setAttribute('d', playIconPath);
            if (currentlyPlaying === card) currentlyPlaying = null;
        }
    };

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
        card.classList.add('playing');
        currentlyPlaying = card;
        soundIcon.setAttribute('d', pauseIconPath);

        // Putar audio dan ganti gambar menjadi GIF
        if (audioFile) {
            audio.src = `assets/${audioFile}`;
            audio.play().catch(err => console.warn(`Audio playback failed for ${audioFile}:`, err));
            
            // Switch to GIF
            if (preloadedGifs[audioFile]) {
                imgEl.src = preloadedGifs[audioFile];
            } else if (gifLinks[audioFile]) {
                imgEl.src = gifLinks[audioFile];
            }

            // Durasi GIF diatur tetap (independen dari suara), misalnya 5000ms
            if (gifTimeout) {
                clearTimeout(gifTimeout);
            }
            gifTimeout = setTimeout(() => {
                if (card.dataset.staticSrc) {
                    imgEl.src = card.dataset.staticSrc;
                }
                card.dataset.gifPlaying = "false";
                checkAndStopCard(card);
            }, 5000);
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
            if (gifTimeout) {
                clearTimeout(gifTimeout);
                gifTimeout = null;
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
            currentlyPlaying.dataset.audioPlaying = "false";
            checkAndStopCard(currentlyPlaying);
            checkCompletion();
        }
    });
});

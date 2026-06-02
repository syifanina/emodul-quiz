document.addEventListener('DOMContentLoaded', () => {
    const actionCards = document.querySelectorAll('.action-card');
    const audio = document.getElementById('main-audio');
    let currentlyPlaying = null;
    let stopAtTime = null;
    let gifTimeout = null;

    // Set untuk melacak kartu mana saja yang sudah diklik
    const clickedCards = new Set();
    let isCelebrated = false; // Mencegah kembang api muncul berulang kali

    const playIconPath = "M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18.03,19.86 21,16.28 21,12C21,7.72 18.03,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16.04C15.5,15.29 16.5,13.77 16.5,12M3,9V15H7L12,20V4L7,9H3Z";
    const pauseIconPath = "M14,19H18V5H14M6,19H10V5H6V19Z";

    const DEFAULT_GIF_DURATION = 3500;

    const timingMap = {
        'sing_a_song': { customAudio: 'assets/sing-a-song.MP3', gifDuration: 8000 },
        'ride_a_bike': { customAudio: 'assets/ride-a-bike.MP3', gifDuration: 8000 },
        'draw_a_picture': { customAudio: 'assets/draw-a-picture.MP3', gifDuration: 8000 },
        'dance_to_the_music': { customAudio: 'assets/dance-to-the-music.MP3', gifDuration: 8000 },
        'keep_pets': { customAudio: 'assets/keep-pets.MP3', gifDuration: 8000 },
        'do_vlogging': { customAudio: 'assets/do-vlogging.MP3', gifDuration: 8000 },
        'cook_a_meal': { customAudio: 'assets/cook-a-meal.MP3', gifDuration: 8000 },
        'read_a_book': { customAudio: 'assets/read-a-book.MP3', gifDuration: 8000 },
        'play_guitar': { customAudio: 'assets/play-guitar.MP3', gifDuration: 8000 },
        'fly_a_kite': { customAudio: 'assets/fly-a-kite.MP3', gifDuration: 8000 },
        'play_football': { customAudio: 'assets/play-football.MP3', gifDuration: 8000 }
    };

    // List of actions that have a static PNG version
    const actionsWithStatic = [
        'sing_a_song', 'ride_a_bike', 'draw_a_picture', 'dance_to_the_music',
        'keep_pets', 'do_vlogging', 'cook_a_meal', 'read_a_book',
        'play_guitar', 'fly_a_kite', 'play_football'
    ];

    const gifLinks = {
        'sing_a_song': 'https://lh3.googleusercontent.com/d/1oKLqCiq1MThJxHJxQTaivX71gI8HFM-E',
        'ride_a_bike': 'https://lh3.googleusercontent.com/d/1rVvfe9I_Le_xX-OgFDZtJG7MCD5QVpCA',
        'draw_a_picture': 'https://lh3.googleusercontent.com/d/1awzedLe0MqfpkSdeVgi4-hn0O4TkLJPj',
        'dance_to_the_music': 'https://lh3.googleusercontent.com/d/1FAmyP_iBCj_ApcamLEQys2AsQ0gP0wnx',
        'keep_pets': 'https://lh3.googleusercontent.com/d/15zQis-Mb7hzoNcByZShdRgMAY68DOdYZ',
        'do_vlogging': 'https://lh3.googleusercontent.com/d/1Khvi9ep70SC4fzji5P9QK0iP7hDiWjc1',
        'cook_a_meal': 'https://lh3.googleusercontent.com/d/16kqtIIMiI0VUsr-uMh3RwSyqnRJeUInt',
        'read_a_book': 'https://lh3.googleusercontent.com/d/1rQAui_2L90s_PdIn-JheL3trnxC1rLyk',
        'play_guitar': 'https://lh3.googleusercontent.com/d/1KhzWevaiBGAyZKqyhxGYDufVoJDkcwLU',
        'fly_a_kite': 'https://lh3.googleusercontent.com/d/1AKkbjunCTktyRYS0k1NxHoKcO5pXjXZW',
        'play_football': 'https://lh3.googleusercontent.com/d/1uN1f4yYXRHxt9TVV2xj7ATm0fdWkNhbY'
    };

    const staticLinks = {
        'sing_a_song': 'https://lh3.googleusercontent.com/d/1_HmpBs5xQSphOko4lhN5hYnu35ahNNyU',
        'ride_a_bike': 'https://lh3.googleusercontent.com/d/100kzxiDLMSWYIKTRa1z_IE-6kMQ8RXfb',
        'draw_a_picture': 'https://lh3.googleusercontent.com/d/12-xMjyhgMzY5YmJNOWNHJhUE7MLLk0jG',
        'dance_to_the_music': 'https://lh3.googleusercontent.com/d/1GiteOjO0sffyb-j7sBY-S87jCEOT6EpX',
        'keep_pets': 'https://lh3.googleusercontent.com/d/1poycEQgDvEfQIQ2GTwXUxhnXiqbdBW_u',
        'do_vlogging': 'https://lh3.googleusercontent.com/d/1e0afGXTh9AJs_5vAwnUozMk01khB4Lgs',
        'cook_a_meal': 'https://lh3.googleusercontent.com/d/1rEjloYrEfVyhpDonk0EbErtRr4CHMfsK',
        'read_a_book': 'https://lh3.googleusercontent.com/d/1EyLKWKyLJ0gtd1ygxpL5B4Np918khR2X',
        'play_guitar': 'https://lh3.googleusercontent.com/d/1WaFLSNza4dIZo8H0d_1EBMTuCG9xT11J',
        'fly_a_kite': 'https://lh3.googleusercontent.com/d/1ykITr_FQcNj7BJmKHPVXwGjF11HQltpn',
        'play_football': 'https://lh3.googleusercontent.com/d/1RCSlSlmH3WJtlJ5H9Tazn_m7FUAuaw41'
    };

    // Preload GIFs as blobs to avoid network delay and allow instant restart
    const gifBlobs = {};
    const previousGifUrls = {};

    Object.keys(gifLinks).forEach(actionName => {
        fetch(gifLinks[actionName])
            .then(response => response.blob())
            .then(blob => {
                gifBlobs[actionName] = blob;
            })
            .catch(err => console.warn("Failed to preload GIF for:", actionName, err));
    });

    const playAction = (card) => {
        const actionName = card.dataset.action;
        const time = timingMap[actionName];
        if (!time) return;

        const img = card.querySelector('.action-image');
        const soundBtn = card.querySelector('.sound-btn');
        const soundIcon = soundBtn.querySelector('path');

        // Track progress
        clickedCards.add(actionName);

        // Jika sedang memutar kartu yang sama, hentikan
        if (currentlyPlaying === card) {
            stopAction(card);
            return;
        }

        // Hentikan kartu lain yang sedang berjalan
        if (currentlyPlaying) {
            stopAction(currentlyPlaying);
        }

        // Bersihkan timeout lama jika ada
        if (gifTimeout) {
            clearTimeout(gifTimeout);
            gifTimeout = null;
        }

        card.classList.add('playing');
        currentlyPlaying = card;
        soundIcon.setAttribute('d', pauseIconPath);

        // Status tracking untuk audio dan gif
        card.audioDone = false;
        card.gifDone = false;
        stopAtTime = time.end || null;

        // Restart GIF instantly using preloaded blob if available
        if (previousGifUrls[actionName]) {
            URL.revokeObjectURL(previousGifUrls[actionName]);
        }
        if (gifBlobs[actionName]) {
            const newUrl = URL.createObjectURL(gifBlobs[actionName]);
            previousGifUrls[actionName] = newUrl;
            img.src = newUrl;
        } else {
            // Fallback if not loaded yet
            img.src = gifLinks[actionName] + '?t=' + new Date().getTime();
        }

        // Mulai Audio
        if (time.customAudio) {
            if (card.audioElement) {
                card.audioElement.currentTime = 0;
                card.audioElement.play().catch(err => console.warn("Audio playback failed:", err));
            }
        } else {
            audio.currentTime = time.start;
            audio.play().catch(err => console.warn("Audio playback failed:", err));
        }

        card.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // GIF Duration: gunakan timingMap.gifDuration jika ada, jika tidak gunakan DEFAULT_GIF_DURATION
        const duration = time.gifDuration || DEFAULT_GIF_DURATION;
        gifTimeout = setTimeout(() => {
            card.gifDone = true;
            checkAndStop(card);
        }, duration);
    };

    // Fungsi pembantu untuk mengecek apakah kedua komponen sudah selesai
    const checkAndStop = (targetCard) => {
        if (targetCard.audioDone && targetCard.gifDone) {
            stopAction(targetCard);
            checkCompletion();
        }
    };

    const stopAction = (targetCard) => {
        if (!targetCard) return;

        const targetImg = targetCard.querySelector('.action-image');
        const targetAction = targetCard.dataset.action;
        const targetIcon = targetCard.querySelector('.sound-btn path');

        if (targetCard.audioElement) {
            targetCard.audioElement.pause();
            targetCard.audioElement.currentTime = 0;
        }
        audio.pause();

        targetCard.classList.remove('playing');
        targetIcon.setAttribute('d', playIconPath);

        // Hentikan timer gif jika sedang berjalan
        if (gifTimeout && currentlyPlaying === targetCard) {
            clearTimeout(gifTimeout);
            gifTimeout = null;
        }

        // Kembalikan ke PNG statis
        if (actionsWithStatic.includes(targetAction)) {
            targetImg.src = staticLinks[targetAction];
        } else {
            targetImg.src = gifLinks[targetAction];
        }

        if (currentlyPlaying === targetCard) {
            currentlyPlaying = null;
            stopAtTime = null;
        }
    };

    const checkCompletion = () => {
        // Jika semua kartu (20) sudah diklik dan belum dirayakan
        if (clickedCards.size === actionCards.length && !isCelebrated) {
            isCelebrated = true;
            triggerCelebration();
        }
    };

    const triggerCelebration = () => {
        // Efek kembang api menggunakan canvas-confetti
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
            // Kembang api dari kiri dan kanan
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
    };

    actionCards.forEach(card => {
        const soundBtn = card.querySelector('.sound-btn');
        
        // Preload audio
        const actionName = card.dataset.action;
        const time = timingMap[actionName];
        if (time && time.customAudio) {
            card.audioElement = new Audio(time.customAudio);
            card.audioElement.preload = 'auto';
            card.audioElement.addEventListener('ended', () => {
                if (currentlyPlaying === card) {
                    card.audioDone = true;
                    checkAndStop(card);
                }
            });
        }

        card.addEventListener('click', (e) => {
            if (e.target.closest('.sound-btn')) return;
            playAction(card);
        });

        soundBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            playAction(card);
        });
    });

    audio.addEventListener('timeupdate', () => {
        if (stopAtTime !== null && audio.currentTime >= stopAtTime) {
            audio.pause();
            stopAtTime = null;
            if (currentlyPlaying) {
                currentlyPlaying.audioDone = true;
                checkAndStop(currentlyPlaying);
            }
        }
    });

    audio.addEventListener('ended', () => {
        if (currentlyPlaying) {
            const icon = currentlyPlaying.querySelector('.sound-btn path');
            icon.setAttribute('d', playIconPath);
        }
    });
});

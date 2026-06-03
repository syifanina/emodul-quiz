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
        'wake_up': { customAudio: 'assets/wake-up.MP3', gifDuration: 2815 },
        'take_a_bath': { customAudio: 'assets/take-a-bath.MP3', gifDuration: 1250 },
        'have_breakfast': { customAudio: 'assets/have-breakfast.MP3', gifDuration: 3000 },
        'brush_my_teeth': { customAudio: 'assets/brush-my-teeth.MP3', gifDuration: 3030 },
        'go_to_school': { customAudio: 'assets/go-to-school.MP3', gifDuration: 3080 },
        'study_in_class': { customAudio: 'assets/study-in-class.MP3', gifDuration: 3000 },
        'have_lunch': { customAudio: 'assets/have-lunch.MP3', gifDuration: 1280 },
        'go_home': { customAudio: 'assets/go-home.MP3', gifDuration: 3000 },
        'play_with_friends': { customAudio: 'assets/play-with-friends.MP3', gifDuration: 1750 },
        'have_dinner': { customAudio: 'assets/have-dinner.MP3', gifDuration: 2800 },
        'do_homework': { customAudio: 'assets/do-homework.MP3', gifDuration: 3050 },
        'go_to_bed': { customAudio: 'assets/go-to-bed.MP3', gifDuration: 3000 }
    };

    // List of actions that have a static PNG version
    const actionsWithStatic = [
        'wake_up', 'take_a_bath', 'have_breakfast', 'brush_my_teeth',
        'go_to_school', 'study_in_class', 'have_lunch', 'go_home',
        'play_with_friends', 'have_dinner', 'do_homework', 'go_to_bed'
    ];

    const gifLinks = {
        'wake_up': 'https://lh3.googleusercontent.com/d/14i4FYZ7m8RO4P7ZaNV9lPPpBfB-ZtJlQ',
        'take_a_bath': 'https://lh3.googleusercontent.com/d/1E324f6GReDsz2Ykpy7IyK_rklKke1vPj',
        'have_breakfast': 'https://lh3.googleusercontent.com/d/13EtZ0RzuPH3B4JurkWxGyo9zB9rFmz3h',
        'brush_my_teeth': 'https://lh3.googleusercontent.com/d/1UvwAQXck66fm-4TaYnAPKsK7tIefGRXl',
        'go_to_school': 'https://lh3.googleusercontent.com/d/1FjOGSwhvKbfwpdC1_j7Bp0RFadXVvhrz',
        'study_in_class': 'https://lh3.googleusercontent.com/d/1r-UZl_ww-3jQuqKqlpAkQbkQALj9varB',
        'have_lunch': 'https://lh3.googleusercontent.com/d/1VXFiW8hk3dgLchRLWJm-c2oPy2J95npi',
        'go_home': 'https://lh3.googleusercontent.com/d/1mMcsbbCiFHKSZ_D9WG6b1ntVKZDyVIO5',
        'play_with_friends': 'https://lh3.googleusercontent.com/d/1A3iu7TdUwKfv_Bh9fnjWci39kgQy6mUq',
        'have_dinner': 'https://lh3.googleusercontent.com/d/1HvpEbtxEwIsSiMXKMyXrsE1xKR7jzUfN',
        'do_homework': 'https://lh3.googleusercontent.com/d/1-we_5hGPUeowv5XKHZC8KBA_80AJBbbE',
        'go_to_bed': 'https://lh3.googleusercontent.com/d/1V62nofMEJGMBBDuVL-rNVpZfF5HVzS1e'
    };

    const staticLinks = {
        'wake_up': 'https://lh3.googleusercontent.com/d/1yaYMBdFsuvYAd9Jm8SbERb1SSGj_H1WE',
        'take_a_bath': 'https://lh3.googleusercontent.com/d/1Dz5y4uBis3fkopOS7eu-ATKzV6JRmeXi',
        'have_breakfast': 'https://lh3.googleusercontent.com/d/1iLS5CenfegrcbKm3BbFin8QMpSYn-vWm',
        'brush_my_teeth': 'https://lh3.googleusercontent.com/d/1LV-avrYMRpNBJorQfuYF-XKYXTgD216m',
        'go_to_school': 'https://lh3.googleusercontent.com/d/1ToRThMT2WSSmNv66IEKeIngAy8A1Ysw8',
        'study_in_class': 'https://lh3.googleusercontent.com/d/1CV3kCriydB3cnw7Y7nistJHFp1sbRtSO',
        'have_lunch': 'https://lh3.googleusercontent.com/d/1LpgG5frKfqjBgHMYrpMXZ-rIVRxFctBB',
        'go_home': 'https://lh3.googleusercontent.com/d/1w84IRe0YT8P03LESiZNNpfYn518gPqwF',
        'play_with_friends': 'https://lh3.googleusercontent.com/d/1yQuaTedjGt3C72dCYDqjR0UYiI3u_FRk',
        'have_dinner': 'https://lh3.googleusercontent.com/d/1uI4WYwxLA42PEY1T2Y1C75DRs24Mvthg',
        'do_homework': 'https://lh3.googleusercontent.com/d/1DzowzSCvg64U39ifeD3em4AKkHMf0uPe',
        'go_to_bed': 'https://lh3.googleusercontent.com/d/1uoUw2IblJjMYXcQ-1sYCdSpjrInlONb2'
    };

    const checkNaturalStop = (targetCard) => {
        if (!targetCard.isAudioPlaying && !targetCard.isGifPlaying) {
            const targetIcon = targetCard.querySelector('.sound-btn path');
            targetCard.classList.remove('playing');
            targetIcon.setAttribute('d', playIconPath);
            if (currentlyPlaying === targetCard) {
                currentlyPlaying = null;
            }
            checkCompletion();
        }
    };

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
        stopAtTime = time.end || null;

        // Gunakan Blob URL dan tambahkan timestamp agar GIF mengulang dari awal TANPA download ulang
        const baseGifUrl = gifObjectUrls[actionName] || gifLinks[actionName];
        const separator = baseGifUrl.startsWith('blob:') ? '#t=' : '?t=';
        const gifSrc = baseGifUrl + separator + new Date().getTime();

        const playAudioAndSetTimeout = () => {
            if (currentlyPlaying !== card) return; // Jika terlanjur klik lain

            card.isAudioPlaying = true;
            card.isGifPlaying = true;

            // Mulai Audio
            if (time.customAudio) {
                if (!card.audioElement) {
                    card.audioElement = new Audio(time.customAudio);
                    card.audioElement.addEventListener('ended', () => {
                        if (currentlyPlaying === card) {
                            card.isAudioPlaying = false;
                            checkNaturalStop(card);
                        }
                    });
                }
                card.audioElement.currentTime = 0;
                card.audioElement.play().catch(err => console.warn("Audio playback failed:", err));
            } else {
                audio.currentTime = time.start;
                audio.play().catch(err => console.warn("Audio playback failed:", err));
            }

            // Calculate true duration or fallback to hardcoded
            const duration = gifDurations[actionName] || time.gifDuration || DEFAULT_GIF_DURATION;
            
            gifTimeout = setTimeout(() => {
                if (currentlyPlaying === card) {
                    card.isGifPlaying = false;
                    img.src = staticLinks[actionName];
                    checkNaturalStop(card);
                }
            }, duration);
        };

        img.onload = () => {
            playAudioAndSetTimeout();
            img.onload = null;
            img.onerror = null;
        };

        img.onerror = () => {
            playAudioAndSetTimeout(); // tetap putar audio jika gagal muat gambar
            img.onload = null;
            img.onerror = null;
        };

        img.src = gifSrc;

        card.scrollIntoView({ behavior: 'smooth', block: 'center' });

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

        targetCard.isAudioPlaying = false;
        targetCard.isGifPlaying = false;

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
                currentlyPlaying.isAudioPlaying = false;
                checkNaturalStop(currentlyPlaying);
            }
        }
    });

    audio.addEventListener('ended', () => {
        if (currentlyPlaying) {
            currentlyPlaying.isAudioPlaying = false;
            checkNaturalStop(currentlyPlaying);
        }
    });

    // Auto-parse GIF and create Blob URL for instant replay
    const gifDurations = {};
    const gifObjectUrls = {};

    async function processGif(actionName, url) {
        try {
            const response = await fetch(url);
            const buffer = await response.arrayBuffer();
            const arr = new Uint8Array(buffer);
            
            // Caching as Blob URL to avoid network delay on replay
            const blob = new Blob([buffer], { type: 'image/gif' });
            gifObjectUrls[actionName] = URL.createObjectURL(blob);

            let duration = 0;
            let i = 13;
            if (arr[10] & 0x80) {
                const gctSize = 2 << (arr[10] & 0x07);
                i += 3 * gctSize;
            }
            
            while (i < arr.length) {
                if (arr[i] === 0x21) { 
                    const extType = arr[i + 1];
                    let blockSize = arr[i + 2];
                    if (extType === 0xF9 && blockSize === 4) {
                        const delay = arr[i + 4] | (arr[i + 5] << 8);
                        duration += (delay === 0 ? 10 : delay) * 10;
                    }
                    i += 3;
                    while (blockSize > 0 && i < arr.length) {
                        i += blockSize;
                        blockSize = arr[i];
                        i++;
                    }
                } else if (arr[i] === 0x2C) { 
                    const packed = arr[i + 9];
                    i += 10;
                    if (packed & 0x80) { 
                        const lctSize = 2 << (packed & 0x07);
                        i += 3 * lctSize;
                    }
                    i++; 
                    let blockSize = arr[i];
                    i++;
                    while (blockSize > 0 && i < arr.length) {
                        i += blockSize;
                        blockSize = arr[i];
                        i++;
                    }
                } else if (arr[i] === 0x3B) { 
                    break;
                } else {
                    break; 
                }
            }
            return duration > 0 ? duration : 3000;
        } catch (e) {
            console.warn("Failed to process GIF", e);
            gifObjectUrls[actionName] = url;
            return 3000;
        }
    }

    // Preload images and calculate GIF durations
    const preloadImages = async () => {
        for (const [actionName, url] of Object.entries(gifLinks)) {
            gifDurations[actionName] = await processGif(actionName, url);
        }
        Object.values(staticLinks).forEach(url => {
            const img = new Image();
            img.src = url;
        });
    };
    preloadImages();
});

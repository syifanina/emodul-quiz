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

    const DEFAULT_GIF_DURATION = 3500;

    const timingMap = {
        'touch_head': { start: 5.04, end: 6.13, gifDuration: 3000 },
        'stretch_arms': { start: 7.22, end: 9.14, gifDuration: 3000 },
        'clap_hands': { start: 11.06, end: 14.25, gifDuration: 3000 },
        'stomp_feet': { start: 14.14, end: 16.01, gifDuration: 3000 },
        'lift_shoulders': { start: 17.18, end: 19.20, gifDuration: 3000 },
        'close_eyes': { start: 21.22, end: 23.10, gifDuration: 3000 },
        'bend_knees': { start: 25.00, end: 26.14, gifDuration: 3000 },
        'point_your_nose': { start: 28.01, end: 29.18, gifDuration: 3000 },
        'cross_your_legs': { start: 31.07, end: 32.24, gifDuration: 3000 },
        'wave_hand': { start: 34.14, end: 36.02, gifDuration: 3000 },
        'comb_hair': { start: 37.22, end: 39.03, gifDuration: 3000 },
        'open_mouth': { start: 40.15, end: 41.26, gifDuration: 3000 },
        'bend_fingers': { customAudio: 'assets/bend_your_fingers.MP3', gifDuration: 3000 },
        'touch_elbow': { start: 52.14, end: 54.20, gifDuration: 3000 },
        'wiggle_your_waist': { start: 55.12, end: 57.01, gifDuration: 3000 },
        'lift_your_eyebrows_up': { start: 58.21, end: 62.55, gifDuration: 4500 },
        'trim_nails': { start: 62.25, end: 64.12, gifDuration: 3000 },
        'show_teeth': { start: 66.00, end: 68.15, gifDuration: 3000 }
    };

    // List of actions that have a static PNG version
    const actionsWithStatic = [
        'touch_head', 'stretch_arms', 'clap_hands', 'stomp_feet', 
        'lift_shoulders', 'close_eyes', 'bend_knees', 'point_your_nose', 
        'cross_your_legs', 'wave_hand', 'comb_hair', 'open_mouth', 
        'bend_fingers', 'touch_elbow', 
        'wiggle_your_waist', 'lift_your_eyebrows_up', 'trim_nails', 'show_teeth'
    ];

    const gifLinks = {
        'touch_head': 'https://lh3.googleusercontent.com/d/1Xb7zX78Rdu7XaTwEEhKwvrfSVN-RRwFN',
        'stretch_arms': 'https://lh3.googleusercontent.com/d/1UYltgKusU7RKXNJDC_hOAs8sRkG4BDYh',
        'clap_hands': 'https://lh3.googleusercontent.com/d/1bXYlJovVDppOzq2YGQvpyF4yMZxilr50',
        'stomp_feet': 'https://lh3.googleusercontent.com/d/1uyAUhPFkHeCCF7eFeKoLbZhHZFJwVD_f',
        'lift_shoulders': 'https://lh3.googleusercontent.com/d/1DutmEUHk3muZSsOXpPZIQI0BZwPhJsqf',
        'close_eyes': 'https://lh3.googleusercontent.com/d/1Omzb7JH19of60tZ85gNN0H1j627tqiyj',
        'bend_knees': 'https://lh3.googleusercontent.com/d/1_h8VHQLzaEWhYuoofrHMPCMgjZrUsntg',
        'point_your_nose': 'https://lh3.googleusercontent.com/d/1cG9b3sC6qlcOCCnXLY2NIjiK_L9ysdsC',
        'cross_your_legs': 'https://lh3.googleusercontent.com/d/1duDqFq8A8UAYCkOLyb8wSBZwkLq3cR-r',
        'wave_hand': 'https://lh3.googleusercontent.com/d/1uaphozFujSsLyhfkMcwoFAWdDVQu-oqM',
        'comb_hair': 'https://lh3.googleusercontent.com/d/1boQpfcmIH8cqvgRQlz0uvcEpqloh7VBT',
        'open_mouth': 'https://lh3.googleusercontent.com/d/1MahUofPXG6dSFMRIiEN7quSI8-vRjjGj',
        'bend_fingers': 'https://lh3.googleusercontent.com/d/1gwhNPFmayAie_3gvKvql68DxQ3bimpwf',
        'touch_elbow': 'https://lh3.googleusercontent.com/d/1qF85KR20mYTxGcmsgZrLAjVVTOJakceC',
        'wiggle_your_waist': 'https://lh3.googleusercontent.com/d/1ynyVGNtj1SDp6Gl-cf0RlvpuEIu7BJ6n',
        'lift_your_eyebrows_up': 'https://lh3.googleusercontent.com/d/1aNu5MqkTFXPavTmHfyZTC0GlcYf2v_u-',
        'trim_nails': 'https://lh3.googleusercontent.com/d/1yRUZvZUcEuE4hItZInc4WF8mmUSxVIKL',
        'show_teeth': 'https://lh3.googleusercontent.com/d/16Eqjr_G9D8bFMN-kbWyKETSbI1rot72m'
    };

    const staticLinks = {
        'touch_head': 'https://lh3.googleusercontent.com/d/1ZO76B6ZXhsJ3tZ4npdPnyQHHJf0GG-EB',
        'stretch_arms': 'https://lh3.googleusercontent.com/d/1hnioNg9OwM3xR2vKpta7oLMpZRIfOKlj',
        'clap_hands': 'https://lh3.googleusercontent.com/d/1nXAExlTcrQm0cVGXcOfUHXK-IuzElKh_',
        'stomp_feet': 'https://lh3.googleusercontent.com/d/1R8ez-A3ZuUlbIC3ohAGEJgqjRehYwNG9',
        'lift_shoulders': 'https://lh3.googleusercontent.com/d/1lEGnUWzu78nlo77GKo8i6fTpZuIPZd6x',
        'close_eyes': 'https://lh3.googleusercontent.com/d/1Sk--tH1LAfgcefU0dwVX794SaRt2FNMa',
        'bend_knees': 'https://lh3.googleusercontent.com/d/1TrdMXbyUSAHY6sDrQHKG94L-k6lLXWjR',
        'point_your_nose': 'https://lh3.googleusercontent.com/d/1aXJeZDoN0wsx-wntgRCVre5PMQOXvuTB',
        'cross_your_legs': 'https://lh3.googleusercontent.com/d/1UsxuBeRjhDGVWTVr4ST7whxgR6Di-kXU',
        'wave_hand': 'https://lh3.googleusercontent.com/d/1dnuSUMQ-WCUrtqWg8pQ70zchVXiFJ5ml',
        'comb_hair': 'https://lh3.googleusercontent.com/d/1iFNtMJKe8P9AJQJKhKB3BFdaEfWd5S0K',
        'open_mouth': 'https://lh3.googleusercontent.com/d/1HtLS43Q7EnA5G1Kh8KeA3ZC6TRLcAW5F',
        'bend_fingers': 'https://lh3.googleusercontent.com/d/1HwXQoJ-J1JBWUIL9PdwPlU-fF7TNmg2c',
        'touch_elbow': 'https://lh3.googleusercontent.com/d/1YYh4uFTd_IilYbPwWYHPTK0hrDWciuBY',
        'wiggle_your_waist': 'https://lh3.googleusercontent.com/d/1fyW78hBKTeYe2LNCJHOi7NQK4_RKQKcl',
        'lift_your_eyebrows_up': 'https://lh3.googleusercontent.com/d/1uXFwuRH88OBTxych7D3ynyfpbjgpqwqB',
        'trim_nails': 'https://lh3.googleusercontent.com/d/1dT5mb6y9ULuSSeflTmy8zDkDMTGEv4sV',
        'show_teeth': 'https://lh3.googleusercontent.com/d/1EUmRichvlidkj8z-ngt4XUJ3oE8V0mpO'
    };

    // Mulai pre-load semua GIF di background saat halaman dimuat
    preloadGifs(gifLinks);

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

        // Mulai GIF (gunakan blob URL jika sudah di-fetch, fallback ke URL asli)
        const gifSrc = preloadedGifs[actionName] || gifLinks[actionName];
        img.src = gifSrc;

        // Mulai Audio
        if (time.customAudio) {
            if (!card.audioElement) {
                card.audioElement = new Audio(time.customAudio);
                card.audioElement.addEventListener('ended', () => {
                    if (currentlyPlaying === card) {
                        card.audioDone = true;
                        checkAndStop(card);
                    }
                });
            }
            card.audioElement.currentTime = 0;
            card.audioElement.play().catch(err => console.warn("Audio playback failed:", err));
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
            targetImg.src = preloadedGifs[targetAction] || gifLinks[targetAction];
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

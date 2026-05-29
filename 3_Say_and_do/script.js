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
        'wake_up': { customAudio: 'assets/wake-up.MP3', gifDuration: 5630 },
        'take_a_bath': { customAudio: 'assets/take-a-bath.MP3', gifDuration: 2500 },
        'have_breakfast': { customAudio: 'assets/have-breakfast.MP3', gifDuration: 6000 },
        'brush_my_teeth': { customAudio: 'assets/brush-my-teeth.MP3', gifDuration: 6060 },
        'go_to_school': { customAudio: 'assets/go-to-school.MP3', gifDuration: 6160 },
        'study_in_class': { customAudio: 'assets/study-in-class.MP3', gifDuration: 6000 },
        'have_lunch': { customAudio: 'assets/have-lunch.MP3', gifDuration: 2560 },
        'go_home': { customAudio: 'assets/go-home.MP3', gifDuration: 6000 },
        'play_with_friends': { customAudio: 'assets/play-with-friends.MP3', gifDuration: 3500 },
        'have_dinner': { customAudio: 'assets/have-dinner.MP3', gifDuration: 5600 },
        'do_homework': { customAudio: 'assets/do-homework.MP3', gifDuration: 6100 },
        'go_to_bed': { customAudio: 'assets/go-to-bed.MP3', gifDuration: 6000 }
    };

    // List of actions that have a static PNG version
    const actionsWithStatic = [
        'wake_up', 'take_a_bath', 'have_breakfast', 'brush_my_teeth',
        'go_to_school', 'study_in_class', 'have_lunch', 'go_home',
        'play_with_friends', 'have_dinner', 'do_homework', 'go_to_bed'
    ];

    const gifLinks = {
        'wake_up': 'assets/wake-up.gif',
        'take_a_bath': 'assets/take-a-bath.gif',
        'have_breakfast': 'assets/breakfast.gif',
        'brush_my_teeth': 'assets/brush-teeth.gif',
        'go_to_school': 'assets/go-to-school.gif',
        'study_in_class': 'assets/study-in-class.gif',
        'have_lunch': 'assets/have-lunch.gif',
        'go_home': 'assets/go-home.gif',
        'play_with_friends': 'assets/playing-with-friends.gif',
        'have_dinner': 'assets/have-dinner.gif',
        'do_homework': 'assets/do-homework.gif',
        'go_to_bed': 'assets/go-to-bed.gif'
    };

    const staticLinks = {
        'wake_up': 'assets/wake-up.png',
        'take_a_bath': 'assets/take-a-bath.png',
        'have_breakfast': 'assets/breakfast.png',
        'brush_my_teeth': 'assets/brush-teeth.png',
        'go_to_school': 'assets/go-school.png',
        'study_in_class': 'assets/study-in-class.png',
        'have_lunch': 'assets/have-lunch.png',
        'go_home': 'assets/go-home.png',
        'play_with_friends': 'assets/playing-with-friends.png',
        'have_dinner': 'assets/have-dinner.png',
        'do_homework': 'assets/do-homework.png',
        'go_to_bed': 'assets/go-to-bed.png'
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

        const gifSrc = gifLinks[actionName] + '?t=' + new Date().getTime();

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

            // GIF Duration: gunakan timingMap.gifDuration jika ada, jika tidak gunakan DEFAULT_GIF_DURATION
            const duration = time.gifDuration || DEFAULT_GIF_DURATION;
            gifTimeout = setTimeout(() => {
                if (currentlyPlaying === card) {
                    card.isGifPlaying = false;
                    const targetAction = card.dataset.action;
                    if (actionsWithStatic.includes(targetAction)) {
                        img.src = staticLinks[targetAction];
                    } else {
                        img.src = gifLinks[targetAction];
                    }
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
});

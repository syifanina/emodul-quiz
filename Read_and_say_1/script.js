document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('main-audio');
    const playBtn = document.getElementById('play-btn');
    const soundIcon = document.getElementById('sound-icon');
    const phrases = document.querySelectorAll('.phrase');

    let stopAtTime = null; // Used for "Click to play single phrase" feature
    let isSingleMode = false; // Track if we are playing a single phrase or the whole sequence
    let isFirstContinuousClick = true; // Track if the main play button hasn't been clicked yet

    // SVG paths for switching icons
    const playIconPath = "M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18.03,19.86 21,16.28 21,12C21,7.72 18.03,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16.04C15.5,15.29 16.5,13.77 16.5,12M3,9V15H7L12,20V4L7,9H3Z";
    const pauseIconPath = "M14,19H18V5H14M6,19H10V5H6V19Z";

    /**
     * Set A: TIMING FOR CONTINUOUS PLAY (Sound Icon)
     */
    const syncDataContinuous = [
        { id: 'phrase-0', start: 0.00, end: 5.19 },
        { id: 'phrase-1', start: 5.25, end: 7.79 },
        { id: 'phrase-2', start: 7.85, end: 11.27 },
        { id: 'phrase-3', start: 11.31, end: 14.56 },
        { id: 'phrase-4', start: 14.62, end: 17.66 },
        { id: 'phrase-5', start: 17.72, end: 21.80 },
        { id: 'phrase-6', start: 21.86, end: 25.02 },
        { id: 'phrase-7', start: 25.08, end: 28.10 },
        { id: 'phrase-8', start: 28.16, end: 31.27 },
        { id: 'phrase-9', start: 31.31, end: 33.47 },
        { id: 'phrase-10', start: 34.52, end: 37.82 },
        { id: 'phrase-11', start: 37.87, end: 40.53 },
        { id: 'phrase-12', start: 40.59, end: 43.32 },
        { id: 'phrase-13', start: 43.38, end: 46.40 },
        { id: 'phrase-14', start: 46.46, end: 49.08 },
        { id: 'phrase-15', start: 49.14, end: 52.53 },
        { id: 'phrase-16', start: 52.59, end: 55.45 },
        { id: 'phrase-17', start: 55.52, end: 58.72 },
        { id: 'phrase-18', start: 58.78, end: 62.85 },
        { id: 'phrase-19', start: 62.91, end: 66.06 },
        { id: 'phrase-20', start: 1 * 60 + 6.12, end: 1 * 60 + 9.13 },
        { id: 'phrase-21', start: 1 * 60 + 9.19, end: 1 * 60 + 10.83 }
    ];

    /**
     * Set B: TIMING FOR INDIVIDUAL PHRASES (Clicking Text)
     */
    const syncDataSingle = [
        { id: 'phrase-0', start: 0.00, end: 2.41 },
        { id: 'phrase-1', start: 5.24, end: 6.27 },
        { id: 'phrase-2', start: 7.84, end: 9.31 },
        { id: 'phrase-3', start: 11.30, end: 12.73 },
        { id: 'phrase-4', start: 14.61, end: 15.89 },
        { id: 'phrase-5', start: 17.71, end: 19.51 },
        { id: 'phrase-6', start: 21.85, end: 23.20 },
        { id: 'phrase-7', start: 25.07, end: 26.42 },
        { id: 'phrase-8', start: 28.15, end: 29.47 },
        { id: 'phrase-9', start: 31.32, end: 32.64 },
        { id: 'phrase-10', start: 34.51, end: 35.92 },
        { id: 'phrase-11', start: 37.86, end: 38.96 },
        { id: 'phrase-12', start: 40.58, end: 41.70 },
        { id: 'phrase-13', start: 43.37, end: 44.68 },
        { id: 'phrase-14', start: 46.45, end: 47.53 },
        { id: 'phrase-15', start: 49.13, end: 50.56 },
        { id: 'phrase-16', start: 52.58, end: 53.80 },
        { id: 'phrase-17', start: 55.51, end: 56.91 },
        { id: 'phrase-18', start: 58.77, end: 1 * 60 + 0.57 },
        { id: 'phrase-19', start: 1 * 60 + 2.90, end: 1 * 60 + 4.29 },
        { id: 'phrase-20', start: 1 * 60 + 6.11, end: 1 * 60 + 7.37 },
        { id: 'phrase-21', start: 1 * 60 + 9.18, end: 1 * 60 + 10.87 }
    ];

    // Play/Pause functionality
    playBtn.addEventListener('click', () => {
        stopAtTime = null;

        // Force start from beginning if we are switching from single mode 
        // OR if this is the very first time clicking the sound icon.
        if (isSingleMode || isFirstContinuousClick) {
            audio.currentTime = 0;
            isFirstContinuousClick = false;
        }

        isSingleMode = false; // Switch to continuous timing

        if (audio.paused) {
            audio.play();
        } else {
            audio.pause();
        }
    });

    // Update icon on play
    audio.addEventListener('play', () => {
        soundIcon.querySelector('path').setAttribute('d', pauseIconPath);
    });

    // Update icon on pause
    audio.addEventListener('pause', () => {
        soundIcon.querySelector('path').setAttribute('d', playIconPath);
    });

    // Real-time synchronization
    audio.addEventListener('timeupdate', () => {
        const currentTime = audio.currentTime;

        // Auto-stop if a single phrase was clicked
        if (stopAtTime !== null && currentTime >= stopAtTime) {
            audio.pause();
            stopAtTime = null;
            phrases.forEach(p => p.classList.remove('active'));
            return;
        }

        // Choose which timing set to use
        const currentSyncSet = isSingleMode ? syncDataSingle : syncDataContinuous;

        currentSyncSet.forEach(data => {
            const element = document.getElementById(data.id);
            if (currentTime >= data.start && currentTime < data.end) {
                element.classList.add('active');
            } else {
                element.classList.remove('active');
            }
        });
    });

    // Reset highlights when audio ends
    audio.addEventListener('ended', () => {
        phrases.forEach(p => p.classList.remove('active'));
    });

    // Phrase click functionality (Jump to specific sound)
    phrases.forEach(phrase => {
        phrase.addEventListener('click', () => {
            const id = phrase.id;
            isSingleMode = true; // Switch to single-phrase timing
            const data = syncDataSingle.find(d => d.id === id);
            if (data) {
                stopAtTime = data.end;
                audio.currentTime = data.start;
                audio.play();
            }
        });
    });

    // Error handling for missing audio
    audio.addEventListener('error', () => {
        console.warn("Audio file 'move_your_body.mp3' not found.");
    });
});

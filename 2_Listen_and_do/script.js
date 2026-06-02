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
        { id: 'phrase-0', start: 0.00, end: 3.23 },
        { id: 'phrase-1', start: 3.25, end: 6.19 },
        { id: 'phrase-2', start: 6.21, end: 11.09 },
        { id: 'phrase-3', start: 11.11, end: 16.12 },
        { id: 'phrase-4', start: 16.14, end: 23.10 },
        { id: 'phrase-5', start: 23.12, end: 30.00 },
        { id: 'phrase-6', start: 30.03, end: 36.18 },
        { id: 'phrase-7', start: 36.21, end: 42.06 },
        { id: 'phrase-8', start: 42.08, end: 48.20 },
        { id: 'phrase-9', start: 48.22, end: 55.20 },
        { id: 'phrase-10', start: 55.23, end: 60.26 },
        { id: 'phrase-11', start: 60.28, end: 67.24 },
        { id: 'phrase-12', start: 67.27, end: 75.12 },
        { id: 'phrase-13', start: 75.14, end: 81.12 }
    ];

    /**
     * Set B: TIMING FOR INDIVIDUAL PHRASES (Clicking Text)
     */
    const syncDataSingle = [
        { id: 'phrase-0', start: 0.00, end: 3.23 },
        { id: 'phrase-1', start: 3.25, end: 6.19 },
        { id: 'phrase-2', start: 6.21, end: 11.09 },
        { id: 'phrase-3', start: 11.11, end: 16.12 },
        { id: 'phrase-4', start: 16.14, end: 23.10 },
        { id: 'phrase-5', start: 23.12, end: 30.00 },
        { id: 'phrase-6', start: 30.03, end: 36.18 },
        { id: 'phrase-7', start: 36.21, end: 42.06 },
        { id: 'phrase-8', start: 42.08, end: 48.20 },
        { id: 'phrase-9', start: 48.22, end: 55.20 },
        { id: 'phrase-10', start: 55.23, end: 60.26 },
        { id: 'phrase-11', start: 60.28, end: 67.24 },
        { id: 'phrase-12', start: 67.27, end: 75.12 },
        { id: 'phrase-13', start: 75.14, end: 81.12 }
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
                if (!element.classList.contains('active')) {
                    element.classList.add('active');
                    // Auto-scroll the active phrase into view
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
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
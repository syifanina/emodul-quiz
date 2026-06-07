document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('main-audio');
    const buttons = document.querySelectorAll('.sound-btn');

    // SVG paths for switching icons
    const playIconPath = "M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18.03,19.86 21,16.28 21,12C21,7.72 18.03,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16.04C15.5,15.29 16.5,13.77 16.5,12M3,9V15H7L12,20V4L7,9H3Z";
    const pauseIconPath = "M14,19H18V5H14M6,19H10V5H6V19Z";

    let activeIndex = null;

    // Helper to get audio file name based on index
    const getAudioSource = (index) => {
        const audios = [
            'morning.MP3',
            'noon.MP3',
            'afternoon.MP3',
            'evening.MP3',
            'night.MP3'
        ];
        return audios[index] || '';
    };

    // Helper to swap GIF / PNG source
    const setItemGifState = (index, isPlaying) => {
        const container = document.getElementById(`container-${index + 1}`);
        if (container) {
            const img = container.querySelector('.main-gif');
            if (img) {
                if (isPlaying) {
                    const gifSrc = img.getAttribute('data-gif');
                    if (gifSrc) {
                        img.src = gifSrc;
                    }
                } else {
                    const pngSrc = img.getAttribute('data-png');
                    if (pngSrc) {
                        img.src = pngSrc;
                    }
                }
            }
        }
    };

    const setButtonIcon = (btn, isPlaying) => {
        const path = btn.querySelector('svg path');
        if (path) {
            path.setAttribute('d', isPlaying ? pauseIconPath : playIconPath);
        }
    };

    const resetAllButtons = () => {
        buttons.forEach(btn => setButtonIcon(btn, false));
    };

    const resetAllImages = () => {
        for (let i = 0; i < 5; i++) {
            setItemGifState(i, false);
        }
    };

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.getAttribute('data-index'));

            // Clicked the currently playing button -> Pause it
            if (activeIndex === index && !audio.paused) {
                audio.pause();
                setButtonIcon(btn, false);
                setItemGifState(index, false); // Switch back to PNG
                return;
            }

            // Clicked a different button or audio is paused -> Play new one
            audio.pause();
            resetAllButtons();
            resetAllImages();

            activeIndex = index;
            audio.src = getAudioSource(index);
            audio.load();
            audio.play()
                .then(() => {
                    setButtonIcon(btn, true);
                    setItemGifState(index, true); // Play GIF
                })
                .catch(err => {
                    console.error("Audio play failed:", err);
                    resetAllButtons();
                    resetAllImages();
                    activeIndex = null;
                });
        });
    });

    audio.addEventListener('ended', () => {
        resetAllButtons();
        resetAllImages();
        activeIndex = null;
    });

    audio.addEventListener('error', () => {
        console.warn(`Audio file '${audio.src}' failed to load.`);
        resetAllButtons();
        resetAllImages();
        activeIndex = null;
    });

    // Preload GIFs in the background to prevent delay when play button is clicked
    buttons.forEach(btn => {
        const index = parseInt(btn.getAttribute('data-index'));
        const container = document.getElementById(`container-${index + 1}`);
        if (container) {
            const img = container.querySelector('.main-gif');
            if (img) {
                const gifSrc = img.getAttribute('data-gif');
                if (gifSrc) {
                    const preloadImg = new Image();
                    preloadImg.src = gifSrc; // Triggers silent background download by the browser
                }
            }
        }
    });
});
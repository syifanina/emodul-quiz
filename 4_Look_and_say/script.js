document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('main-audio');
    const buttons = document.querySelectorAll('.sound-btn');

    // SVG paths for switching icons
    const playIconPath = "M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18.03,19.86 21,16.28 21,12C21,7.72 18.03,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16.04C15.5,15.29 16.5,13.77 16.5,12M3,9V15H7L12,20V4L7,9H3Z";
    const pauseIconPath = "M14,19H18V5H14M6,19H10V5H6V19Z";
    const loadingIconPath = "M6,2H18V8H18V8L14,12L18,16V16H18V22H6V16H6V16L10,12L6,8V8H6V2M16,16.5L12,12.5L8,16.5V20H16V16.5M12,11.5L16,7.5V4H8V7.5L12,11.5Z";

    let activeIndex = null;
    const preloadedGifs = {};

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

    const setButtonIcon = (btn, iconType) => {
        const path = btn.querySelector('svg path');
        if (path) {
            let svgPath = playIconPath;
            if (iconType === 'pause') svgPath = pauseIconPath;
            if (iconType === 'loading') svgPath = loadingIconPath;
            path.setAttribute('d', svgPath);
        }
    };

    const resetAllButtons = () => {
        buttons.forEach(btn => setButtonIcon(btn, 'play'));
    };

    const resetAllImages = () => {
        for (let i = 0; i < 5; i++) {
            const container = document.getElementById(`container-${i + 1}`);
            if (container) {
                const img = container.querySelector('.main-gif');
                if (img) {
                    const pngSrc = img.getAttribute('data-png');
                    if (pngSrc) img.src = pngSrc;
                }
                clearTimeout(container.loadingTextTimeout);
                container.classList.remove('loading');
            }
        }
    };

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.getAttribute('data-index'));
            const container = document.getElementById(`container-${index + 1}`);
            const img = container.querySelector('.main-gif');

            // Clicked the currently playing button -> Pause it
            if (activeIndex === index && !audio.paused) {
                audio.pause();
                resetAllButtons();
                resetAllImages();
                activeIndex = null;
                return;
            }

            // Clicked a different button or audio is paused -> Play new one
            audio.pause();
            resetAllButtons();
            resetAllImages();

            activeIndex = index;
            audio.src = getAudioSource(index);
            audio.load();

            // Set loading state
            setButtonIcon(btn, 'loading');
            container.loadingTextTimeout = setTimeout(() => {
                container.classList.add('loading');
            }, 300);

            const originalGifSrc = img.getAttribute('data-gif');
            const finalGifSrc = preloadedGifs[originalGifSrc] || originalGifSrc;

            img.onload = () => {
                clearTimeout(container.loadingTextTimeout);
                container.classList.remove('loading');
                
                audio.play()
                    .then(() => {
                        setButtonIcon(btn, 'pause');
                    })
                    .catch(err => {
                        console.error("Audio play failed:", err);
                        resetAllButtons();
                        resetAllImages();
                        activeIndex = null;
                    });
                
                img.onload = null;
            };

            img.src = finalGifSrc;
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

    // Preload GIFs using fetch to cache as Blob URLs
    buttons.forEach(btn => {
        const index = parseInt(btn.getAttribute('data-index'));
        const container = document.getElementById(`container-${index + 1}`);
        if (container) {
            const img = container.querySelector('.main-gif');
            if (img) {
                const gifSrc = img.getAttribute('data-gif');
                if (gifSrc) {
                    fetch(gifSrc)
                        .then(res => res.blob())
                        .then(blob => {
                            preloadedGifs[gifSrc] = URL.createObjectURL(blob);
                        })
                        .catch(err => console.error("Error preloading GIF:", err));
                }
            }
        }
    });
});

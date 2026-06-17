document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('main-audio');
    const playBtn = document.getElementById('play-btn');
    const soundIcon = document.getElementById('sound-icon');
    const phrases = Array.from(document.querySelectorAll('.phrase'));

    let currentIndex = 0;
    let isPlayingSequential = false;

    // SVG paths for switching icons
    const playIconPath = "M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18.03,19.86 21,16.28 21,12C21,7.72 18.03,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16.04C15.5,15.29 16.5,13.77 16.5,12M3,9V15H7L12,20V4L7,9H3Z";
    const pauseIconPath = "M14,19H18V5H14M6,19H10V5H6V19Z";

    function updateHighlight() {
        phrases.forEach(p => p.classList.remove('active'));
        if (currentIndex >= 0 && currentIndex < phrases.length) {
            const currentPhrase = phrases[currentIndex];
            currentPhrase.classList.add('active');
            currentPhrase.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function playSentence(index, sequential) {
        if (index >= phrases.length) {
            isPlayingSequential = false;
            soundIcon.querySelector('path').setAttribute('d', playIconPath);
            phrases.forEach(p => p.classList.remove('active'));
            currentIndex = 0;
            return;
        }

        currentIndex = index;
        isPlayingSequential = sequential;
        
        const currentPhrase = phrases[currentIndex];
        const audioFile = currentPhrase.getAttribute('data-audio');
        
        audio.src = `assets/${audioFile}`;
        audio.play().catch(e => console.warn("Audio play failed:", e));
        
        updateHighlight();
        soundIcon.querySelector('path').setAttribute('d', pauseIconPath);
    }

    // Play/Pause button
    playBtn.addEventListener('click', () => {
        if (!audio.paused) {
            // If it's playing anything, pause it
            audio.pause();
            isPlayingSequential = false;
            soundIcon.querySelector('path').setAttribute('d', playIconPath);
        } else {
            // Resume or start sequential
            playSentence(currentIndex, true);
        }
    });

    // Audio ended event
    audio.addEventListener('ended', () => {
        if (isPlayingSequential) {
            currentIndex++;
            playSentence(currentIndex, true);
        } else {
            // Single sentence ended
            soundIcon.querySelector('path').setAttribute('d', playIconPath);
            phrases.forEach(p => p.classList.remove('active'));
        }
    });

    // Audio error handling (in case bedroom is missing)
    audio.addEventListener('error', () => {
        console.warn("Audio file missing for:", phrases[currentIndex].getAttribute('data-audio'));
        // If sequential, skip to next after a short delay
        if (isPlayingSequential) {
            setTimeout(() => {
                currentIndex++;
                playSentence(currentIndex, true);
            }, 1000);
        } else {
            soundIcon.querySelector('path').setAttribute('d', playIconPath);
            phrases.forEach(p => p.classList.remove('active'));
        }
    });

    // Phrase click functionality (Single play)
    phrases.forEach((phrase, index) => {
        phrase.addEventListener('click', () => {
            playSentence(index, false);
        });
    });
});
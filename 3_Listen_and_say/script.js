document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('main-audio');
    const playBtn = document.getElementById('play-btn');
    const soundIcon = document.getElementById('sound-icon');
    const phrases = document.querySelectorAll('.phrase');

    // SVG paths for switching icons
    const playIconPath = "M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18.03,19.86 21,16.28 21,12C21,7.72 18.03,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16.04C15.5,15.29 16.5,13.77 16.5,12M3,9V15H7L12,20V4L7,9H3Z";
    const pauseIconPath = "M14,19H18V5H14M6,19H10V5H6V19Z";

    let currentPhraseIndex = 0;
    let isPlayingContinuous = false;

    const audioSources = [
        'wake-up.MP3',
        'brush-my-teeth.MP3',
        'take-a-bath.MP3',
        'have-breakfast.MP3',
        'go-to-school.MP3',
        'study-in-class.MP3',
        'have-lunch.MP3',
        'go-home.MP3',
        'play-with-friends.MP3',
        'have-dinner.MP3',
        'do-homework.MP3',
        'go-to-bed.MP3'
    ];

    // Helper to get audio file name for a given phrase index
    const getAudioSource = (index) => audioSources[index];
    // Highlight the active phrase
    const highlightPhrase = (index) => {
        phrases.forEach(p => p.classList.remove('active'));
        if (index >= 0 && index < phrases.length) {
            const element = phrases[index];
            element.classList.add('active');
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const updateIcon = (isPlaying) => {
        soundIcon.querySelector('path').setAttribute('d', isPlaying ? pauseIconPath : playIconPath);
    };

    const playAudioForIndex = (index) => {
        audio.src = getAudioSource(index);
        audio.load();
        audio.play();
        highlightPhrase(index);
        updateIcon(true);
    };

    // Continuous Play/Pause
    playBtn.addEventListener('click', () => {
        if (!audio.paused) {
            audio.pause();
            isPlayingContinuous = false;
            updateIcon(false);
            return;
        }

        isPlayingContinuous = true;
        
        // If we are starting fresh or reached the end, start from 0
        if (currentPhraseIndex >= phrases.length || !audio.src.includes(getAudioSource(currentPhraseIndex))) {
            currentPhraseIndex = 0;
            playAudioForIndex(currentPhraseIndex);
        } else {
            // Resume
            audio.play();
            updateIcon(true);
            highlightPhrase(currentPhraseIndex);
        }
    });

    audio.addEventListener('ended', () => {
        if (isPlayingContinuous) {
            currentPhraseIndex++;
            if (currentPhraseIndex < phrases.length) {
                playAudioForIndex(currentPhraseIndex);
            } else {
                isPlayingContinuous = false;
                currentPhraseIndex = 0; // reset
                highlightPhrase(-1); // remove highlight
                updateIcon(false);
            }
        } else {
            // Single mode ended
            highlightPhrase(-1);
            updateIcon(false);
        }
    });

    // Phrase click functionality (Single play)
    phrases.forEach((phrase, index) => {
        phrase.addEventListener('click', () => {
            isPlayingContinuous = false; // switch to single mode
            currentPhraseIndex = index;
            playAudioForIndex(index);
        });
    });

    audio.addEventListener('error', () => {
        console.warn(`Audio file '${audio.src}' not found.`);
        if (isPlayingContinuous) {
            isPlayingContinuous = false;
            updateIcon(false);
        }
    });
});
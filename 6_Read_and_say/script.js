document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('main-audio');
    const playBtn = document.getElementById('play-btn');
    const soundIcon = document.getElementById('sound-icon');
    const phrases = document.querySelectorAll('.phrase');

    const playIconPath = "M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18.03,19.86 21,16.28 21,12C21,7.72 18.03,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16.04C15.5,15.29 16.5,13.77 16.5,12M3,9V15H7L12,20V4L7,9H3Z";
    const pauseIconPath = "M14,19H18V5H14M6,19H10V5H6V19Z";

    let isPlaying = false;
    let isContinuous = false;
    let currentPhraseIndex = 0;

    const audioFiles = [
        'assets-sound/sentence_1.MP3',
        'assets-sound/sentence_2.MP3',
        'assets-sound/sentence_3.MP3',
        'assets-sound/sentence_4.MP3',
        'assets-sound/sentence_5.MP3',
        'assets-sound/sentence_6.MP3',
        'assets-sound/sentence_7.MP3',
        'assets-sound/sentence_8.MP3',
        'assets-sound/sentence_9.MP3'
    ];

    function setIconPlay() {
        soundIcon.querySelector('path').setAttribute('d', playIconPath);
    }

    function setIconPause() {
        soundIcon.querySelector('path').setAttribute('d', pauseIconPath);
    }

    function removeAllActive() {
        phrases.forEach(p => p.classList.remove('active'));
    }

    function playPhrase(index) {
        if (index >= audioFiles.length) {
            isPlaying = false;
            isContinuous = false;
            setIconPlay();
            removeAllActive();
            return;
        }

        removeAllActive();
        if (phrases[index]) {
            phrases[index].classList.add('active');
            phrases[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        audio.src = audioFiles[index];
        audio.play().catch(e => console.warn('Audio play error:', e));
        isPlaying = true;
        setIconPause();
    }

    playBtn.addEventListener('click', () => {
        if (isPlaying && isContinuous) {
            // Pause
            audio.pause();
            isPlaying = false;
            isContinuous = false;
            setIconPlay();
        } else {
            // Start continuous play from beginning
            isContinuous = true;
            if (!isPlaying) {
                currentPhraseIndex = 0;
            }
            playPhrase(currentPhraseIndex);
        }
    });

    audio.addEventListener('ended', () => {
        if (isContinuous) {
            currentPhraseIndex++;
            playPhrase(currentPhraseIndex);
        } else {
            isPlaying = false;
            setIconPlay();
            removeAllActive();
        }
    });

    phrases.forEach((phrase, index) => {
        phrase.addEventListener('click', () => {
            isContinuous = false;
            currentPhraseIndex = index;
            playPhrase(index);
        });
    });

    audio.addEventListener('error', () => {
        console.warn("Audio file not found:", audio.src);
        if (isContinuous) {
            currentPhraseIndex++;
            playPhrase(currentPhraseIndex);
        } else {
            isPlaying = false;
            setIconPlay();
            removeAllActive();
        }
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('main-audio');
    const playBtn = document.getElementById('play-btn');
    const soundIcon = document.getElementById('sound-icon');
    const phrases = document.querySelectorAll('.phrase');

    const playIconPath = "M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18.03,19.86 21,16.28 21,12C21,7.72 18.03,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16.04C15.5,15.29 16.5,13.77 16.5,12M3,9V15H7L12,20V4L7,9H3Z";
    const pauseIconPath = "M14,19H18V5H14M6,19H10V5H6V19Z";

    const audioData = [
        { file: 'assets/singing.MP3', phrases: ['phrase-0', 'phrase-1'] },
        { file: 'assets/cycling.MP3', phrases: ['phrase-2', 'phrase-3'] },
        { file: 'assets/dancing.MP3', phrases: ['phrase-4', 'phrase-5'] },
        { file: 'assets/play_a_guitar.MP3', phrases: ['phrase-6', 'phrase-7'] },
        { file: 'assets/reading.MP3', phrases: ['phrase-8', 'phrase-9'] },
        { file: 'assets/cooking.MP3', phrases: ['phrase-10', 'phrase-11'] },
        { file: 'assets/flying_kite.MP3', phrases: ['phrase-12', 'phrase-13'] },
        { file: 'assets/drawing.MP3', phrases: ['phrase-14', 'phrase-15'] },
        { file: 'assets/keeping_pets.MP3', phrases: ['phrase-16', 'phrase-17'] },
        { file: 'assets/vlogging.MP3', phrases: ['phrase-18', 'phrase-19'] },
        { file: 'assets/kicking_ball.MP3', phrases: ['phrase-20', 'phrase-21'] }
    ];

    let currentAudioIndex = -1;
    let isContinuousPlaying = false;

    function resetHighlights() {
        phrases.forEach(p => p.classList.remove('active'));
    }

    function setIconPlay() {
        soundIcon.querySelector('path').setAttribute('d', playIconPath);
    }

    function setIconPause() {
        soundIcon.querySelector('path').setAttribute('d', pauseIconPath);
    }

    function highlightPhrases(phraseIds) {
        resetHighlights();
        phraseIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.classList.add('active');
                if (id === phraseIds[0]) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    }

    function playAudioAtIndex(index) {
        if (index >= audioData.length) {
            isContinuousPlaying = false;
            resetHighlights();
            setIconPlay();
            return;
        }

        currentAudioIndex = index;
        const data = audioData[index];
        audio.src = data.file;
        
        highlightPhrases(data.phrases);
        setIconPause();

        audio.play().catch(e => {
            console.error("Audio play failed:", e);
            setIconPlay();
            isContinuousPlaying = false;
        });
    }

    playBtn.addEventListener('click', () => {
        if (isContinuousPlaying || !audio.paused) {
            isContinuousPlaying = false;
            audio.pause();
            resetHighlights();
            setIconPlay();
        } else {
            isContinuousPlaying = true;
            playAudioAtIndex(0); // Start from beginning
        }
    });

    audio.addEventListener('ended', () => {
        if (isContinuousPlaying) {
            playAudioAtIndex(currentAudioIndex + 1);
        } else {
            resetHighlights();
            setIconPlay();
        }
    });

    phrases.forEach(phrase => {
        phrase.addEventListener('click', () => {
            const id = phrase.id;
            const dataIndex = audioData.findIndex(d => d.phrases.includes(id));
            if (dataIndex !== -1) {
                isContinuousPlaying = false; // Stop continuous sequence
                playAudioAtIndex(dataIndex);
            }
        });
    });
});
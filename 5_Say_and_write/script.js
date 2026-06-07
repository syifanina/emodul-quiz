document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('.bubble-input');
    const resetBtn = document.getElementById('resetBtn');
    const checkBtn = document.getElementById('checkBtn');
    
    const audioTyping = document.getElementById('audioTyping');
    const audioClick = document.getElementById('audioClick');
    const audioCorrect = document.getElementById('audioCorrect');
    const audioIncorrect = document.getElementById('audioIncorrect');

    function updateCheckBtnState() {
        const allFilled = Array.from(inputs).every(input => input.value.trim() !== '');
        if (allFilled) {
            checkBtn.style.opacity = '1';
            checkBtn.style.pointerEvents = 'auto';
        } else {
            checkBtn.style.opacity = '0.5';
            checkBtn.style.pointerEvents = 'none';
        }
    }

    updateCheckBtnState();

    // Function to play sound reliably
    function playSound(audioEl) {
        if (!audioEl) return;
        audioEl.currentTime = 0;
        audioEl.play().catch(e => console.log("Audio play failed:", e));
    }

    function updateInputWidth(input) {
        const span = document.createElement('span');
        span.style.visibility = 'hidden';
        span.style.position = 'absolute';
        span.style.whiteSpace = 'pre';
        
        const styles = window.getComputedStyle(input);
        span.style.fontFamily = styles.fontFamily;
        span.style.fontSize = styles.fontSize;
        span.style.fontWeight = styles.fontWeight;
        
        span.textContent = input.value || input.placeholder || 'Type...';
        document.body.appendChild(span);
        input.style.width = (span.offsetWidth + 2) + 'px';
        document.body.removeChild(span);
    }

    // Add typing sound and auto-resize
    inputs.forEach(input => {
        // Initialize size
        updateInputWidth(input);

        input.addEventListener('input', () => {
            playSound(audioTyping);
            updateCheckBtnState();
            updateInputWidth(input);
            // Remove validation styling when typing
            input.classList.remove('correct', 'wrong');
            input.parentElement.classList.remove('correct', 'wrong');
        });
    });

    // Reset button
    resetBtn.addEventListener('click', () => {
        playSound(audioClick);
        inputs.forEach(input => {
            input.value = '';
            updateInputWidth(input);
            input.classList.remove('correct', 'wrong');
            input.parentElement.classList.remove('correct', 'wrong');
        });
        updateCheckBtnState();
    });

    // Check Answer button
    checkBtn.addEventListener('click', () => {
        playSound(audioClick);
        
        let allCorrect = true;
        let allFilled = true;

        inputs.forEach(input => {
            const userAnswer = input.value.trim().toUpperCase();
            const correctAnswer = input.getAttribute('data-answer').toUpperCase();
            const container = input.parentElement;

            if (userAnswer === '') {
                allFilled = false;
                allCorrect = false;
                return; // Skip styling if empty
            }

            if (userAnswer === correctAnswer) {
                input.classList.remove('wrong');
                input.classList.add('correct');
                container.classList.remove('wrong');
                container.classList.add('correct');
            } else {
                input.classList.remove('correct');
                input.classList.add('wrong');
                container.classList.remove('correct');
                container.classList.add('wrong');
                allCorrect = false;
            }
        });

        // Determine feedback sound & confetti
        setTimeout(() => {
            if (allCorrect && inputs.length > 0) {
                playSound(audioCorrect);
                fireConfetti();
            } else if (allFilled || document.querySelectorAll('.bubble-input.wrong').length > 0) {
                playSound(audioIncorrect);
            }
        }, 300); // slight delay to allow click sound to play first
    });

    // Standard confetti function
    function fireConfetti() {
        if (typeof confetti === 'function') {
            const duration = 3000;
            const end = Date.now() + duration;

            (function frame() {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());
        }
    }
});

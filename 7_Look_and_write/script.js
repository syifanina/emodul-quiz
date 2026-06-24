// ── Answer Key: input id → correct answer (uppercase) ──
const ANSWER_KEY = {
    '1': 'ELBOW',
    '2': 'MOUTH',
    '3': 'WAIST',
    '4': 'SHOULDER',
    '5': 'KNEE',
    '6': 'TEETH',
    '7': 'NOSE',
    '8': 'HAIR',
    '9': 'NAIL',
    '10': 'EYEBROW'
};

const TOTAL = Object.keys(ANSWER_KEY).length;

// ── Live-check on input: show placeholder feedback as user types ──
document.querySelectorAll('.answer-input').forEach(input => {
    // Play sound on keydown for better responsiveness
    input.addEventListener('keydown', function (e) {
        // Don't play for modifier keys
        if (e.key === 'Control' || e.key === 'Alt' || e.key === 'Shift' || e.key === 'Meta') return;
        
        const typingSound = document.getElementById('typing-audio');
        if (typingSound) {
            typingSound.currentTime = 0;
            typingSound.play().catch(err => {});
        }
    });

    input.addEventListener('input', function () {
        // Remove previous correct/wrong state while typing
        this.classList.remove('correct', 'wrong');
        const id = this.id.replace('input-', '');
        const fb = document.getElementById('fb-' + id);
        const hint = document.getElementById('hint-' + id);
        if (fb) fb.textContent = '';
        if (hint) {
            hint.textContent = '';
            hint.style.display = 'none';
        }
        document.getElementById('result-msg').textContent = '';
        
        updateSubmitButtonState();
    });

    // Allow submitting with Enter key
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            const allFilled = Array.from(document.querySelectorAll('.answer-input')).every(inp => inp.value.trim() !== '');
            if (allFilled) checkAnswers();
        }
    });
});

// ── Play click sound helper ──
function playClickSound() {
    const snd = document.getElementById('click-audio');
    if (snd) { snd.currentTime = 0; snd.play().catch(e => {}); }
}

// ── Check if all inputs are filled to enable/disable button ──
function updateSubmitButtonState() {
    const inputs = Array.from(document.querySelectorAll('.answer-input'));
    const allFilled = inputs.every(input => input.value.trim() !== '');
    const submitBtn = document.querySelector('.check-btn');
    
    if (submitBtn) {
        if (allFilled) {
            submitBtn.style.opacity = '1';
            submitBtn.style.pointerEvents = 'auto';
            submitBtn.style.cursor = 'pointer';
        } else {
            submitBtn.style.opacity = '0.5';
            submitBtn.style.pointerEvents = 'none';
            submitBtn.style.cursor = 'not-allowed';
        }
    }
}

// Initialize button state
document.addEventListener('DOMContentLoaded', updateSubmitButtonState);

// ── Check all answers with auto-scroll and sound sequence ──
async function checkAnswers() {
    playClickSound();
    const submitBtn = document.querySelector('.check-btn');
    const resetBtn = document.querySelector('.reset-btn');
    const resultMsg = document.getElementById('result-msg');
    
    // Lock buttons during review
    if (submitBtn) {
        submitBtn.style.opacity = '0.5';
        submitBtn.style.pointerEvents = 'none';
    }
    if (resetBtn) {
        resetBtn.style.opacity = '0.5';
        resetBtn.style.pointerEvents = 'none';
    }

    let correctCount = 0;
    resultMsg.textContent = "Checking your answers...";
    resultMsg.style.color = '#475569';

    for (let id = 1; id <= TOTAL; id++) {
        const input = document.getElementById('input-' + id);
        const fb = document.getElementById('fb-' + id);
        const row = input.closest('.quiz-row');
        
        if (!input) continue;

        // 1. Auto scroll to current row
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Wait a bit for the user to see the row
        await new Promise(resolve => setTimeout(resolve, 800));

        const userAnswer = input.value.trim().toUpperCase();
        const isCorrect = userAnswer === ANSWER_KEY[id];

        if (isCorrect) {
            correctCount++;
            input.classList.remove('wrong');
            input.classList.add('correct');
            if (fb) fb.textContent = '✓';
            if (fb) fb.style.color = '#2e7d32';
            
            const snd = document.getElementById('correct-audio');
            if (snd) { snd.currentTime = 0; snd.play().catch(e => {}); }
        } else {
            input.classList.remove('correct');
            input.classList.add('wrong');
            if (fb) {
                fb.textContent = '✗';
                fb.style.color = '#c62828';
                fb.style.fontSize = '24px';
            }
            const hint = document.getElementById('hint-' + id);
            if (hint) {
                hint.textContent = ANSWER_KEY[id];
                hint.style.display = 'block';
            }

            const snd = document.getElementById('wrong-audio');
            if (snd) { snd.currentTime = 0; snd.play().catch(e => {}); }
        }

        // Small delay before next question
        await new Promise(resolve => setTimeout(resolve, 600));
    }

    // Unlock buttons
    if (submitBtn) {
        submitBtn.style.opacity = '1';
        submitBtn.style.pointerEvents = 'auto';
    }
    if (resetBtn) {
        resetBtn.style.opacity = '1';
        resetBtn.style.pointerEvents = 'auto';
    }

    // Show final result message
    if (correctCount === TOTAL) {
        resultMsg.textContent = `🎉 Perfect! All ${TOTAL} answers are correct!`;
        resultMsg.style.color = '#1b5e20';
        resultMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        resultMsg.textContent = `You got ${correctCount} out of ${TOTAL} correct. Try again!`;
        resultMsg.style.color = '#b71c1c';
        resultMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// ── Reset all answers ──
function resetAnswers() {
    playClickSound();
    for (let id = 1; id <= TOTAL; id++) {
        const input = document.getElementById('input-' + id);
        const fb = document.getElementById('fb-' + id);
        const hint = document.getElementById('hint-' + id);
        if (input) {
            input.value = '';
            input.classList.remove('correct', 'wrong');
        }
        if (fb) fb.textContent = '';
        if (hint) {
            hint.textContent = '';
            hint.style.display = 'none';
        }
    }
    const resultMsg = document.getElementById('result-msg');
    resultMsg.textContent = '';
    updateSubmitButtonState();
}

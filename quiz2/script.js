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
    input.addEventListener('input', function () {
        // Remove previous correct/wrong state while typing
        this.classList.remove('correct', 'wrong');
        const id = this.id.replace('input-', '');
        const fb = document.getElementById('fb-' + id);
        if (fb) fb.textContent = '';
        document.getElementById('result-msg').textContent = '';
    });

    // Allow submitting with Enter key
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            checkAnswers();
        }
    });
});

// ── Check all answers ──
function checkAnswers() {
    let correct = 0;
    let filled = 0;

    for (let id = 1; id <= TOTAL; id++) {
        const input = document.getElementById('input-' + id);
        const fb = document.getElementById('fb-' + id);
        if (!input) continue;

        const userAnswer = input.value.trim().toUpperCase();

        if (userAnswer === '') {
            input.classList.remove('correct', 'wrong');
            if (fb) fb.textContent = '';
            continue;
        }

        filled++;

        if (userAnswer === ANSWER_KEY[id]) {
            correct++;
            input.classList.remove('wrong');
            input.classList.add('correct');
            if (fb) fb.textContent = '✓';
            if (fb) fb.style.color = '#2e7d32';
        } else {
            input.classList.remove('correct');
            input.classList.add('wrong');
            if (fb) fb.textContent = '✗';
            if (fb) fb.style.color = '#c62828';
        }
    }

    const resultMsg = document.getElementById('result-msg');

    if (filled < TOTAL) {
        resultMsg.textContent = `Please fill in all ${TOTAL} answers first!`;
        resultMsg.style.color = '#e65100';
    } else if (correct === TOTAL) {
        resultMsg.textContent = `🎉 Perfect! All ${TOTAL} answers are correct!`;
        resultMsg.style.color = '#1b5e20';
    } else {
        resultMsg.textContent = `${correct} out of ${TOTAL} correct. Red = wrong. Try again!`;
        resultMsg.style.color = '#b71c1c';
    }
}

// ── Reset all answers ──
function resetAnswers() {
    for (let id = 1; id <= TOTAL; id++) {
        const input = document.getElementById('input-' + id);
        const fb = document.getElementById('fb-' + id);
        if (input) {
            input.value = '';
            input.classList.remove('correct', 'wrong');
        }
        if (fb) fb.textContent = '';
    }
    const resultMsg = document.getElementById('result-msg');
    resultMsg.textContent = '';
}

// ─────────────────────────────────────────────
//  TYPING LOGIC & SETUP
// ─────────────────────────────────────────────

const TOTAL_QUESTIONS = 8;

// All groups are ordered. Some have multiple correct options.
const answers = {
    'q1': ['above'],
    'q2': ['on'],
    'q3': ['near'],
    'q4': ['beside', 'next to'], // Accept either
    'q5': ['under'],
    'q6': ['in'],
    'q7': ['on'],
    'q8': ['under']
};

let isCelebrated = false;

document.addEventListener('DOMContentLoaded', function () {
    const inputs = document.querySelectorAll('.input-zone');
    
    // Create wrappers and hints for each input
    inputs.forEach(input => {
        const wrapper = document.createElement('span');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        wrapper.style.marginRight = '12px'; // Smaller margin for overlay
        
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
        
        const idNum = input.id.replace('q', '');
        
        const fb = document.createElement('span');
        fb.id = 'fb-' + idNum;
        fb.style.position = 'absolute';
        fb.style.right = '-12px'; // Closer to input
        fb.style.top = '50%';
        fb.style.transform = 'translateY(-50%)';
        fb.style.fontWeight = 'bold';
        fb.style.fontSize = '12px';
        wrapper.appendChild(fb);
        
        const hint = document.createElement('div');
        hint.id = 'hint-' + idNum;
        hint.style.display = 'none';
        hint.style.marginTop = '2px';
        hint.style.color = '#166534';
        hint.style.fontWeight = '600';
        hint.style.fontSize = '11px';
        hint.style.textAlign = 'left';
        hint.style.paddingLeft = '10px';
        hint.style.whiteSpace = 'normal';
        hint.style.position = 'absolute';
        hint.style.width = '100%';
        hint.style.left = '0';
        hint.style.top = '100%';
        hint.style.zIndex = '10';
        wrapper.appendChild(hint);

        // Events to reset visuals on typing
        input.addEventListener('input', function() {
            this.classList.remove('correct', 'incorrect');
            fb.textContent = '';
            hint.style.display = 'none';
            document.getElementById('result-msg').textContent = '';
            updateSubmitButtonState();
        });
        
        // Allow submitting with Enter key
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                const allFilled = Array.from(document.querySelectorAll('.input-zone')).every(inp => inp.value.trim() !== '');
                if (allFilled) checkAnswers();
            }
        });
        
        // Play typing sound
        input.addEventListener('keypress', playClickSound);
    });

    updateSubmitButtonState();

    const checkBtn = document.getElementById('check-btn');
    if (checkBtn) {
        checkBtn.addEventListener('click', checkAnswers);
    }

    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetQuiz);
    }
});

// ── Sound Helpers ──
function playClickSound() {
    const snd = document.getElementById('audio-typing') || document.createElement('audio');
    snd.src = 'assets/typing.MP3'; // fallback if not found
    if (snd) { snd.currentTime = 0; snd.play().catch(e => {}); }
}

function playCorrectSound() {
    const snd = document.getElementById('audio-correct') || document.createElement('audio');
    snd.src = 'assets/correct_sound.MP3';
    if (snd) { snd.currentTime = 0; snd.play().catch(e => {}); }
}

function playWrongSound() {
    const snd = document.getElementById('audio-incorrect') || document.createElement('audio');
    snd.src = 'assets/incorrect_sound.MP3';
    if (snd) { snd.currentTime = 0; snd.play().catch(e => {}); }
}

// ── Button State ──
function updateSubmitButtonState() {
    const inputs = document.querySelectorAll('.input-zone');
    const allFilled = Array.from(inputs).every(z => z.value.trim() !== '');
    const submitBtn = document.getElementById('check-btn');
    
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

// ─────────────────────────────────────────────
//  CHECK & RESET LOGIC
// ─────────────────────────────────────────────

// Sanitization: lowercased, single spaced, trim trailing period
const sanitize = (text) => {
    return text.toLowerCase()
        .replace(/\s+/g, ' ') // replace multiple spaces
        .trim()
        .replace(/\.$/, ''); // remove period at the very end
};

async function checkAnswers() {
    playClickSound();

    const submitBtn = document.getElementById('check-btn');
    const resetBtn = document.getElementById('reset-btn');
    const resultMsg = document.getElementById('result-msg');
    
    // Lock buttons
    if (submitBtn) {
        submitBtn.style.opacity = '0.5';
        submitBtn.style.pointerEvents = 'none';
    }
    if (resetBtn) {
        resetBtn.style.opacity = '0.5';
        resetBtn.style.pointerEvents = 'none';
    }

    resultMsg.textContent = "Checking your answers...";
    resultMsg.style.color = '#475569';

    // ── PRE-CALCULATE RESULTS SO WE CAN ANIMATE THEM 1 BY 1 ──
    const results = {}; // key: 'q1', val: { isCorrect, expectedAnswer }

    for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
        const id = 'q' + i;
        const val = sanitize(document.getElementById(id).value);
        const expectedArray = answers[id];
        
        const isCorrect = expectedArray.includes(val);
        // Show the first possible correct answer as hint
        const expectedAnswer = expectedArray[0];

        results[id] = {
            isCorrect: isCorrect,
            expectedAnswer: expectedAnswer
        };
    }

    // ── ANIMATE 1 BY 1 ──
    let correctCount = 0;

    for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
        const id = 'q' + i;
        const zone = document.getElementById(id);
        if (!zone) continue;

        // Auto scroll to current card row
        const row = zone.closest('.input-row') || zone.closest('.quiz-card');
        if (row) {
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        await new Promise(resolve => setTimeout(resolve, 800));

        const res = results[id];

        if (res.isCorrect) {
            correctCount++;
            zone.classList.add('correct');
            zone.classList.remove('incorrect');
            const fb = document.getElementById('fb-' + i);
            if (fb) { fb.textContent = '✓'; fb.style.color = '#166534'; }
            playCorrectSound();
        } else {
            zone.classList.add('incorrect');
            zone.classList.remove('correct');
            const fb = document.getElementById('fb-' + i);
            if (fb) { fb.textContent = '✗'; fb.style.color = '#991b1b'; }
            const hint = document.getElementById('hint-' + i);
            if (hint) { 
                // Format hint to have capital first letter for group 1 too
                let hintText = res.expectedAnswer;
                if(hintText) {
                    hintText = hintText.charAt(0).toUpperCase() + hintText.slice(1);
                    if (!hintText.endsWith('.')) hintText += '.';
                    hint.textContent = hintText; 
                    hint.style.display = 'block'; 
                }
            }
            playWrongSound();
        }

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

    if (correctCount === TOTAL_QUESTIONS) {
        resultMsg.textContent = `🎉 Perfect! All ${TOTAL_QUESTIONS} answers are correct!`;
        resultMsg.style.color = '#166534';
        if (!isCelebrated) {
            isCelebrated = true;
            triggerCelebration();
        }
    } else {
        resultMsg.textContent = `You got ${correctCount} out of ${TOTAL_QUESTIONS} correct. Try again!`;
        resultMsg.style.color = '#991b1b';
    }
    resultMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function resetQuiz() {
    playClickSound();
    document.querySelectorAll('.input-zone').forEach(input => {
        input.value = '';
        input.classList.remove('correct', 'incorrect');
        input.disabled = false;
        const idNum = input.id.replace('q', '');
        const fb = document.getElementById('fb-' + idNum);
        if (fb) fb.textContent = '';
        const hint = document.getElementById('hint-' + idNum);
        if (hint) { hint.textContent = ''; hint.style.display = 'none'; }
    });
    
    const msg = document.getElementById('result-msg');
    if (msg) msg.textContent = '';
    
    isCelebrated = false;
    updateSubmitButtonState();
}

const triggerCelebration = () => {
    if (typeof confetti === 'undefined') return;
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
};

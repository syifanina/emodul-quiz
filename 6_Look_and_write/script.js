// ─────────────────────────────────────────────
//  TYPING LOGIC & SETUP
// ─────────────────────────────────────────────

const TOTAL_QUESTIONS = 10;

// Group 1: Ordered (MUST match exact input ID)
const answersGroup1 = {
    'q1': 'the bag is on the table',
    'q2': 'the calculator is on the table',
    'q3': 'the notebook is on the table',
    'q4': 'the ruler is on the table'
};

// Group 2: Unordered (Order doesn't matter, just must contain all these, no dupes)
const answersGroup2 = [
    'the umbrella is in the bag',
    'the pencil case is in the bag',
    'the books are in the bag'
];

// Group 3: Unordered
const answersGroup3 = [
    'the bag is hanging on the wall',
    'the jacket is hanging on the wall',
    'the umbrella is hanging on the wall'
];

let isCelebrated = false;

document.addEventListener('DOMContentLoaded', function () {
    const inputs = document.querySelectorAll('.input-zone');
    
    // Create wrappers and hints for each input exactly like 4_Look_and_write
    inputs.forEach(input => {
        const wrapper = document.createElement('span');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'block';
        wrapper.style.flex = '1';
        wrapper.style.width = 'auto';
        wrapper.style.marginRight = '25px'; // Leave space for check/X mark
        
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
        
        // Ensure input itself stretches full width of wrapper
        input.style.width = '100%';
        input.style.boxSizing = 'border-box';
        
        const idNum = input.id.replace('q', '');
        
        const fb = document.createElement('span');
        fb.id = 'fb-' + idNum;
        fb.style.position = 'absolute';
        fb.style.right = '-20px'; // Fit within the 25px margin
        fb.style.top = '50%';
        fb.style.transform = 'translateY(-50%)';
        fb.style.fontWeight = 'bold';
        fb.style.fontSize = '14px';
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

    // Group 1
    for (let i = 1; i <= 4; i++) {
        const id = 'q' + i;
        const val = sanitize(document.getElementById(id).value);
        const expected = answersGroup1[id];
        results[id] = {
            isCorrect: (val === expected),
            expectedAnswer: expected
        };
    }

    // Helper for Unordered Groups
    const evalUnorderedGroup = (start, end, expectedArr) => {
        const userVals = [];
        for (let i = start; i <= end; i++) {
            userVals.push({ id: 'q' + i, val: sanitize(document.getElementById('q' + i).value) });
        }
        
        let remainingExpected = [...expectedArr];
        
        // First pass: mark correct exact matches
        userVals.forEach(item => {
            const matchIndex = remainingExpected.findIndex(exp => exp === item.val);
            if (matchIndex !== -1) {
                results[item.id] = { isCorrect: true, expectedAnswer: item.val };
                remainingExpected.splice(matchIndex, 1);
            } else {
                results[item.id] = { isCorrect: false };
            }
        });
        
        // Second pass: assign leftover expected answers to the wrong ones
        userVals.forEach(item => {
            if (!results[item.id].isCorrect) {
                // capitalize first letter for hint
                const text = remainingExpected.shift() || "No missing answer";
                const capitalized = text.charAt(0).toUpperCase() + text.slice(1) + ".";
                results[item.id].expectedAnswer = capitalized;
            }
        });
    };

    // Group 2
    evalUnorderedGroup(5, 7, answersGroup2);

    // Group 3
    evalUnorderedGroup(8, 10, answersGroup3);


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
                hintText = hintText.charAt(0).toUpperCase() + hintText.slice(1);
                if (!hintText.endsWith('.')) hintText += '.';
                
                hint.textContent = hintText; 
                hint.style.display = 'block'; 
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

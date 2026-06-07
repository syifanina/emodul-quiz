// ─────────────────────────────────────────────
//  TYPING LOGIC
// ─────────────────────────────────────────────

const TOTAL_QUESTIONS = 10;

document.addEventListener('DOMContentLoaded', function () {
    const inputs = document.querySelectorAll('.input-zone');
    inputs.forEach(input => {
        // Create wrapper and feedback elements dynamically
        const wrapper = document.createElement('span');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        wrapper.style.width = '100%';
        wrapper.style.maxWidth = '250px';
        
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
        
        const idNum = input.id.replace('input-', '');
        
        const fb = document.createElement('span');
        fb.id = 'fb-' + idNum;
        fb.style.position = 'absolute';
        fb.style.right = '-25px';
        fb.style.top = '50%';
        fb.style.transform = 'translateY(-50%)';
        fb.style.fontWeight = 'bold';
        fb.style.fontSize = '14px';
        wrapper.appendChild(fb);
        
        const hint = document.createElement('div');
        hint.id = 'hint-' + idNum;
        hint.style.display = 'none';
        hint.style.marginTop = '4px';
        hint.style.color = '#166534';
        hint.style.fontWeight = 'bold';
        hint.style.fontSize = '12px';
        hint.style.background = '#f0fdf4';
        hint.style.padding = '4px 8px';
        hint.style.borderRadius = '4px';
        hint.style.border = '1px dashed #166534';
        hint.style.textAlign = 'center';
        hint.style.whiteSpace = 'normal';
        hint.style.position = 'absolute';
        hint.style.width = '100%';
        hint.style.left = '0';
        hint.style.top = '100%';
        hint.style.zIndex = '10';
        wrapper.appendChild(hint);

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
});

// ── Sound Helpers ──
function playClickSound() {
    const snd = document.getElementById('click-audio');
    if (snd) { snd.currentTime = 0; snd.play().catch(e => {}); }
}

function playCorrectSound() {
    const snd = document.getElementById('correct-audio');
    if (snd) { snd.currentTime = 0; snd.play().catch(e => {}); }
}

function playWrongSound() {
    const snd = document.getElementById('wrong-audio');
    if (snd) { snd.currentTime = 0; snd.play().catch(e => {}); }
}

// ── Button State ──
function updateSubmitButtonState() {
    const inputs = document.querySelectorAll('.input-zone');
    const allFilled = Array.from(inputs).every(z => z.value.trim() !== '');
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


// ─────────────────────────────────────────────
//  CHECK & RESET
// ─────────────────────────────────────────────

async function checkAnswers() {
    playClickSound();

    const submitBtn = document.querySelector('.check-btn');
    const resetBtn = document.querySelector('.reset-btn');
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

    let correctCount = 0;

    for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
        const zone = document.getElementById('input-' + i);
        if (!zone) continue;

        // Auto scroll to current row
        const row = zone.closest('.quiz-row');
        if (row) {
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        await new Promise(resolve => setTimeout(resolve, 800));

        // Fungsi bantu untuk menghapus tanda baca dan spasi berlebih
        const normalize = (str) => {
            return str.toLowerCase()
                      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"’‘?]/g, "")
                      .replace(/\s{2,}/g, " ")
                      .trim();
        };

        const expectedAnswers = (zone.dataset.answer || '').split('|').map(ans => normalize(ans));
        const placed = normalize(zone.value);

        if (expectedAnswers.includes(placed)) {
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
            if (hint) { hint.textContent = (zone.dataset.answer || '').split('|')[0]; hint.style.display = 'block'; }
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
        const idNum = input.id.replace('input-', '');
        const fb = document.getElementById('fb-' + idNum);
        if (fb) fb.textContent = '';
        const hint = document.getElementById('hint-' + idNum);
        if (hint) { hint.textContent = ''; hint.style.display = 'none'; }
    });
    clearFeedback();
    updateSubmitButtonState();
}

function clearFeedback() {
    const msg = document.getElementById('result-msg');
    if (msg) msg.textContent = '';
    document.querySelectorAll('.input-zone').forEach(z => {
        z.classList.remove('correct', 'incorrect');
    });
}

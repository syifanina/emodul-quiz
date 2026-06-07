// ─────────────────────────────────────────────────────────────
//  READ AND WRITE - INTERACTIVE CLOCK QUIZ LOGIC
// ─────────────────────────────────────────────────────────────

const TOTAL_QUESTIONS = 10;

// Keep track of current angles for all 6 questions.
// Keys are formatted as: 'hour-1', 'minute-1', 'hour-2', etc.
// Initial state is 0 degrees (pointing to 12 o'clock).
const currentAngles = {};

// Validation Targets (accepted hour and minute angles in degrees)
const targets = {
    1: { // "It is six o'clock" (06:00)
        hour: [180],
        minute: [0, 360]
    },
    2: { // "It is ten o'clock" (10:00)
        hour: [300],
        minute: [0, 360]
    },
    3: { // "It is a half past seven" (07:30)
        // Accepts halfway (225 deg), exactly 7 (210 deg) or 8 (240 deg)
        hour: [225, 210, 240],
        minute: [180]
    },
    4: { // "It is a half past eleven" (11:30)
        // Accepts halfway (345 deg), exactly 11 (330 deg) or 12/0 (0/360 deg)
        hour: [345, 330, 0, 360],
        minute: [180]
    },
    5: { // "It is a quarter past one" (01:15)
        // Accepts exactly 1 (30 deg), slightly past (45 deg) or 2 (60 deg)
        hour: [30, 45, 60],
        minute: [90]
    },
    6: { // "It is a quarter past six" (06:15)
        // Accepts exactly 6 (180 deg), slightly past (195 deg) or 7 (210 deg)
        hour: [180, 195, 210],
        minute: [90]
    },
    7: { // "It is eight o'clock" (08:00)
        hour: [240],
        minute: [0, 360]
    },
    8: { // "It is twelve o'clock" (12:00)
        hour: [0, 360],
        minute: [0, 360]
    },
    9: { // "It is a quarter to nine" (08:45)
        // Accepts slightly past 8 (255 deg), exactly 8 (240 deg) or 9 (270 deg)
        hour: [255, 240, 270],
        minute: [270]
    },
    10: { // "It is a quarter to three" (02:45)
        // Accepts slightly past 2 (75 deg), exactly 2 (60 deg) or 3 (90 deg)
        hour: [75, 60, 90],
        minute: [270]
    }
};

let isChecking = false;

document.addEventListener('DOMContentLoaded', () => {
    // Initial setup for current state
    for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
        currentAngles[`hour-${i}`] = 0;
        currentAngles[`minute-${i}`] = 0;
        updateHandDOM(i, true, 0);
        updateHandDOM(i, false, 0);
    }

    updateCheckButtonState();
});

// ── Update SVG rotation transform ──
function updateHandDOM(qIndex, isHour, deg) {
    const groupType = isHour ? 'hour' : 'minute';
    const groupElement = document.getElementById(`${groupType}-group-${qIndex}`);
    if (groupElement) {
        groupElement.style.transform = `rotate(${deg}deg)`;
    }
}

function setHandAngle(qIndex, isHour, deg) {
    const key = `${isHour ? 'hour' : 'minute'}-${qIndex}`;
    currentAngles[key] = deg;
    updateHandDOM(qIndex, isHour, deg);
    updateCheckButtonState();
    clearFeedbackForCard(qIndex);
}

// ── Button Controls ──
function rotateHour(qIndex) {
    if (isChecking) return;
    playClickSound();
    let current = currentAngles[`hour-${qIndex}`] || 0;
    let next = (current + 15) % 360; // Spin by 30 minutes (15 degrees)
    setHandAngle(qIndex, true, next);
}

function rotateMinute(qIndex) {
    if (isChecking) return;
    playClickSound();
    let current = currentAngles[`minute-${qIndex}`] || 0;
    let next = (current + 30) % 360; // Spin by 5 minutes (30 degrees)
    setHandAngle(qIndex, false, next);
}

// ── Sound Helpers ──
function playClickSound() {
    const snd = document.getElementById('click-audio');
    if (snd) { snd.currentTime = 0; snd.play().catch(() => { }); }
}

function playCorrectSound() {
    const snd = document.getElementById('correct-audio');
    if (snd) { snd.currentTime = 0; snd.play().catch(() => { }); }
}

function playWrongSound() {
    const snd = document.getElementById('wrong-audio');
    if (snd) { snd.currentTime = 0; snd.play().catch(() => { }); }
}

// ── State checking for bottom Submit button ──
function updateCheckButtonState() {
    const submitBtn = document.querySelector('.check-btn');
    if (!submitBtn) return;

    // We always allow checking since starting at 12:00 is a valid state
    submitBtn.style.opacity = '1';
    submitBtn.style.pointerEvents = 'auto';
    submitBtn.style.cursor = 'pointer';
}

function clearFeedbackForCard(qIndex) {
    const card = document.getElementById(`block-${qIndex}`);
    if (card) {
        card.classList.remove('correct', 'incorrect');
        const badge = card.querySelector('.feedback-badge');
        if (badge) badge.remove();
        
        // Remove student's previous wrong shadow hands if any
        const svgElement = card.querySelector('.clock-svg');
        if (svgElement) {
            const wrongHands = svgElement.querySelectorAll('.wrong-hand-group');
            wrongHands.forEach(wh => wh.remove());
        }
    }
    const resultMsg = document.getElementById('result-msg');
    if (resultMsg) {
        resultMsg.textContent = '';
        resultMsg.style.background = 'transparent';
    }
}

// ── Check Answers (Step-by-step Assessment) ──
async function checkAnswers() {
    if (isChecking) return;
    isChecking = true;
    playClickSound();

    const submitBtn = document.querySelector('.check-btn');
    const resetBtn = document.querySelector('.reset-btn');
    const resultMsg = document.getElementById('result-msg');

    // Disable all input interaction
    document.querySelectorAll('.clock-svg').forEach(svg => svg.classList.add('disabled'));
    document.querySelectorAll('.rotate-btn').forEach(btn => btn.classList.add('disabled'));

    if (submitBtn) { submitBtn.style.opacity = '0.5'; submitBtn.style.pointerEvents = 'none'; }
    if (resetBtn) { resetBtn.style.opacity = '0.5'; resetBtn.style.pointerEvents = 'none'; }

    resultMsg.textContent = "Checking your clocks...";
    resultMsg.style.color = '#475569';
    resultMsg.style.background = '#f1f5f9';

    let correctCount = 0;

    for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
        const card = document.getElementById(`block-${i}`);
        if (!card) continue;

        // Auto-scroll to card
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.classList.add('checking');

        await new Promise(resolve => setTimeout(resolve, 800));

        // Read hand values
        const hAngle = currentAngles[`hour-${i}`] || 0;
        const mAngle = currentAngles[`minute-${i}`] || 0;

        const targetHourList = targets[i].hour;
        const targetMinuteList = targets[i].minute;

        const isHourCorrect = targetHourList.includes(hAngle);
        const isMinuteCorrect = targetMinuteList.includes(mAngle);

        card.classList.remove('checking');

        // Remove previous badge if any
        const oldBadge = card.querySelector('.feedback-badge');
        if (oldBadge) oldBadge.remove();

        const badge = document.createElement('div');
        badge.classList.add('feedback-badge');

        if (isHourCorrect && isMinuteCorrect) {
            correctCount++;
            card.classList.add('correct');
            card.classList.remove('incorrect');
            badge.classList.add('badge-correct');
            badge.textContent = '✓';
            card.appendChild(badge);
            playCorrectSound();
        } else {
            card.classList.add('incorrect');
            card.classList.remove('correct');
            badge.classList.add('badge-incorrect');
            badge.textContent = '✗';
            card.appendChild(badge);

            const svgElement = card.querySelector('.clock-svg');
            if (svgElement) {
                // Remove previous wrong hands if any to prevent duplicates
                const wrongHands = svgElement.querySelectorAll('.wrong-hand-group');
                wrongHands.forEach(wh => wh.remove());

                const firstHandGroup = svgElement.querySelector('.hand-group');

                // Create student's incorrect hour hand in gray (opacity 0.45)
                const wrongHourG = document.createElementNS("http://www.w3.org/2000/svg", "g");
                wrongHourG.classList.add("wrong-hand-group");
                wrongHourG.setAttribute("transform", `rotate(${hAngle})`);
                wrongHourG.style.transformOrigin = "100px 100px";
                wrongHourG.innerHTML = `
                    <line x1="100" y1="100" x2="100" y2="62" stroke="#94a3b8" stroke-width="5" stroke-linecap="round" opacity="0.45" />
                    <polygon points="94,62 106,62 100,50" fill="#94a3b8" opacity="0.45" />
                `;
                svgElement.insertBefore(wrongHourG, firstHandGroup);

                // Create student's incorrect minute hand in gray (opacity 0.45)
                const wrongMinuteG = document.createElementNS("http://www.w3.org/2000/svg", "g");
                wrongMinuteG.classList.add("wrong-hand-group");
                wrongMinuteG.setAttribute("transform", `rotate(${mAngle})`);
                wrongMinuteG.style.transformOrigin = "100px 100px";
                wrongMinuteG.innerHTML = `
                    <line x1="100" y1="100" x2="100" y2="47" stroke="#94a3b8" stroke-width="3.5" stroke-linecap="round" opacity="0.45" />
                    <polygon points="95,47 105,47 100,35" fill="#94a3b8" opacity="0.45" />
                `;
                svgElement.insertBefore(wrongMinuteG, firstHandGroup);
            }

            // Automatically set clock hands to show the correct time!
            const correctHourAngle = targetHourList[0];
            const correctMinuteAngle = targetMinuteList[0];
            
            currentAngles[`hour-${i}`] = correctHourAngle;
            currentAngles[`minute-${i}`] = correctMinuteAngle;
            
            updateHandDOM(i, true, correctHourAngle);
            updateHandDOM(i, false, correctMinuteAngle);

            playWrongSound();
        }

        await new Promise(resolve => setTimeout(resolve, 600));
    }

    // Re-enable reset button
    if (resetBtn) {
        resetBtn.style.opacity = '1';
        resetBtn.style.pointerEvents = 'auto';
    }

    // Show overall results
    if (correctCount === TOTAL_QUESTIONS) {
        resultMsg.textContent = `🎉 Perfect! All ${TOTAL_QUESTIONS} clocks are set correctly!`;
        resultMsg.style.color = '#15803d';
        resultMsg.style.background = '#dcfce7';
        // Keep submit button locked on perfect score
    } else {
        resultMsg.textContent = `You completed ${correctCount} out of ${TOTAL_QUESTIONS} clocks correctly. Try again!`;
        resultMsg.style.color = '#b91c1c';
        resultMsg.style.background = '#fee2e2';

        // Re-enable submit button so they can retry
        if (submitBtn) {
            submitBtn.style.opacity = '1';
            submitBtn.style.pointerEvents = 'auto';
        }
    }

    isChecking = false;
    resultMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ── Reset Quiz State ──
function resetQuiz() {
    playClickSound();

    isChecking = false;

    // Enable interactives
    document.querySelectorAll('.clock-svg').forEach(svg => svg.classList.remove('disabled'));
    document.querySelectorAll('.rotate-btn').forEach(btn => btn.classList.remove('disabled'));

    const submitBtn = document.querySelector('.check-btn');
    const resetBtn = document.querySelector('.reset-btn');
    const resultMsg = document.getElementById('result-msg');

    if (submitBtn) { submitBtn.style.opacity = '1'; submitBtn.style.pointerEvents = 'auto'; }
    if (resetBtn) { resetBtn.style.opacity = '1'; resetBtn.style.pointerEvents = 'auto'; }

    if (resultMsg) {
        resultMsg.textContent = '';
        resultMsg.style.background = 'transparent';
    }

    // Reset hand states back to 12:00 (0 deg)
    for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
        currentAngles[`hour-${i}`] = 0;
        currentAngles[`minute-${i}`] = 0;
        updateHandDOM(i, true, 0);
        updateHandDOM(i, false, 0);
        clearFeedbackForCard(i);
    }

    // Scroll to top of content
    const container = document.querySelector('.scroll-content');
    if (container) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

let isFinished = false;

function playCorrectSound() {
    const snd = document.getElementById("audioCorrect");
    if (snd) { snd.currentTime = 0; snd.play().catch(e => console.log(e)); }
}

function checkAllFilled() {
    const inputs = Array.from(document.querySelectorAll(".line-input"));
    const allFilled = inputs.every(inp => inp.value.trim() !== "");
    const resultMsg = document.getElementById("result-msg");
    
    if (allFilled && !isFinished) {
        isFinished = true;
        playCorrectSound();
        if (resultMsg) {
            resultMsg.innerHTML = `
                <img src="../3_My_daily_routine/ASSETS/Great-job.png" alt="Great job!" style="
                    width: 95%;
                    max-width: 400px;
                    height: auto;
                    display: block;
                    margin: 20px auto;
                    border-radius: 12px;
                    box-shadow: 0 4px 15px -3px rgba(34, 197, 94, 0.3);
                    animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                ">
                <style>
                    @keyframes popIn {
                        0% { transform: scale(0.5) translateY(20px); opacity: 0; }
                        100% { transform: scale(1) translateY(0); opacity: 1; }
                    }
                </style>
            `;
            setTimeout(() => {
                resultMsg.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 100);
        }
    } else if (!allFilled && isFinished) {
        isFinished = false;
        if (resultMsg) {
            resultMsg.innerHTML = "";
        }
    }
}

const TOTAL_QUESTIONS = 10;
const currentAngles = {};

document.addEventListener('DOMContentLoaded', () => {
    // Initial setup for current state
    for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
        currentAngles[`hour-${i}`] = 0;
        currentAngles[`minute-${i}`] = 0;
        updateHandDOM(i, true, 0);
        updateHandDOM(i, false, 0);
    }

    // Setup typing sound for text inputs
    const inputs = document.querySelectorAll('.line-input');
    const audioTyping = document.getElementById('audioTyping');

    function playTypingSound() {
        if (!audioTyping) return;
        audioTyping.currentTime = 0;
        audioTyping.play().catch(e => console.log("Audio play failed:", e));
    }

    inputs.forEach(input => {
        input.addEventListener('input', () => {
            playTypingSound();
            checkAllFilled();
        });
    });
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
}

// ── Button Controls ──
window.rotateHour = function(qIndex) {
    playClickSound();
    let current = currentAngles[`hour-${qIndex}`] || 0;
    let next = (current + 15) % 360; // Spin by 30 minutes (15 degrees)
    setHandAngle(qIndex, true, next);
}

window.rotateMinute = function(qIndex) {
    playClickSound();
    let current = currentAngles[`minute-${qIndex}`] || 0;
    let next = (current + 30) % 360; // Spin by 5 minutes (30 degrees)
    setHandAngle(qIndex, false, next);
}

// ── Sound Helpers ──
function playClickSound() {
    const snd = document.getElementById('audioClick');
    if (snd) { 
        snd.currentTime = 0; 
        snd.play().catch(() => {}); 
    }
}

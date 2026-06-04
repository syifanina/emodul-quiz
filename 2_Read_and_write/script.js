// Lesson 2: Read and Write – Hobbies Dialogue Quiz
// Script matching ketentuan.md and custom grid screenshot layouts

const TOTAL_QUESTIONS = 10;

// Mapping of highly flexible acceptable answers for all 10 questions
// Punctuation is stripped and input is converted to lowercase during check
const ACCEPTABLE_ANSWERS = {
    1: [
        "yes i do santis hobby is reading",
        "yes i do santi hobby is reading",
        "santis hobby is reading",
        "santi hobby is reading",
        "reading"
    ],
    2: [
        "yes i do ucoks hobby is playing kite",
        "yes i do ucoks hobby is flying kite",
        "yes i do ucoks hobby is playing kites",
        "yes i do ucoks hobby is flying kites",
        "yes i do ucok hobby is playing kite",
        "yes i do ucok hobby is flying kite",
        "ucoks hobby is playing kite",
        "ucoks hobby is flying kite",
        "playing kite",
        "playing kites",
        "flying kite",
        "flying kites"
    ],
    3: [
        "yes i do anitas hobby is making contents",
        "yes i do anitas hobby is making youtube contents",
        "yes i do anitas hobby is making videos",
        "yes i do anita hobby is making contents",
        "anitas hobby is making contents",
        "making contents",
        "making youtube contents",
        "making videos",
        "making youtube videos",
        "vlogging"
    ],
    4: [
        "yes i do yantos hobby is watching football",
        "yes i do yantos hobby is playing football",
        "yes i do yantos hobby is watching soccer",
        "yes i do yantos hobby is playing soccer",
        "yes i do yanto hobby is watching football",
        "yantos hobby is watching football",
        "watching football",
        "playing football",
        "watching soccer",
        "playing soccer"
    ],
    5: [
        "yes i do mades hobby is dancing",
        "yes i do made hobby is dancing",
        "mades hobby is dancing",
        "dancing"
    ],
    6: [
        "yes i do rahmats hobby is drawing",
        "yes i do rahmats hobby is drawing pictures",
        "yes i do rahmat hobby is drawing",
        "rahmats hobby is drawing",
        "drawing",
        "drawing pictures"
    ],
    7: [
        "yes i do dedehs hobby is playing with cats",
        "yes i do dedehs hobby is keeping cats",
        "yes i do dedehs hobby is loving cats",
        "yes i do dedeh hobby is playing with cats",
        "dedehs hobby is playing with cats",
        "playing with cats",
        "keeping cats",
        "caring for cats",
        "loving cats"
    ],
    8: [
        "cycling",
        "riding a bike",
        "riding bike",
        "playing bike",
        "riding bicycle",
        "playing bicycle"
    ],
    9: [
        "playing guitar",
        "playing the guitar",
        "playing music",
        "playing acoustic guitar"
    ],
    10: [] // Q10 is open-ended, accepted if length >= 2
};

// Standard complete hints displayed when a student makes a mistake
const HINT_KEY = {
    1: "Yes, I do. Santi's hobby is reading",
    2: "Yes, I do. Ucok's hobby is playing kite",
    3: "Yes, I do. Anita's hobby is making contents",
    4: "Yes, I do. Yanto's hobby is watching football",
    5: "Yes, I do. Made's hobby is dancing",
    6: "Yes, I do. Rahmat's hobby is drawing",
    7: "Yes, I do. Dedeh's hobby is playing with cats",
    8: "cycling",
    9: "playing guitar",
    10: "(any hobby is correct)"
};

let isChecking = false;

// Audio preloads
const typingAudio = document.getElementById("typing-audio");
const correctAudio = document.getElementById("correct-audio");
const wrongAudio = document.getElementById("wrong-audio");
const clickAudio = document.getElementById("click-audio");

// Play audio utility (removes lag)
function playSound(audioEl) {
    if (audioEl) {
        audioEl.currentTime = 0;
        audioEl.play().catch(err => console.log("Audio play blocked by browser:", err));
    }
}

// Utility Sleep Promise
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Normalize strings for easy checking (strips special characters, double-spaces, and lowercase)
function normalizeText(str) {
    return str
        .toLowerCase()
        .replace(/['’]/g, "")                         // strip apostrophes
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "") // strip other punctuation
        .replace(/\s+/g, " ")                         // collapse double spaces
        .trim();
}

// Setup Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    const inputs = document.querySelectorAll(".answer-input");
    
    inputs.forEach(input => {
        // Typing sound (ignoring utility keys)
        input.addEventListener("keydown", (e) => {
            const ignoredKeys = ["Backspace", "Delete", "Enter", "Tab", "Shift", "Control", "Alt", "Meta", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "CapsLock"];
            if (!ignoredKeys.includes(e.key)) {
                playSound(typingAudio);
            }
        });

        // Submit on Enter
        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
                const checkBtn = document.querySelector(".check-btn");
                if (checkBtn.style.pointerEvents !== "none" && !isChecking) {
                    checkAnswers();
                }
            }
        });

        // Reset state on typing/editing answers
        input.addEventListener("input", (e) => {
            const index = e.target.getAttribute("data-q");
            
            // Clear styles
            e.target.classList.remove("correct", "wrong");
            
            const fb = document.getElementById(`fb-${index}`);
            if (fb) {
                fb.textContent = "";
            }
            
            const hint = document.getElementById(`hint-${index}`);
            if (hint) {
                hint.style.display = "none";
                hint.textContent = "";
            }

            // Clear result message
            document.getElementById("result-msg").textContent = "";

            updateSubmitButtonState();
        });
    });

    // Initial Button State
    updateSubmitButtonState();
});

// Update State of check-btn depending on inputs filled
function updateSubmitButtonState() {
    const checkBtn = document.querySelector(".check-btn");
    if (!checkBtn || isChecking) return;

    let allFilled = true;
    for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
        const input = document.getElementById(`input-${i}`);
        if (!input || input.value.trim().length === 0) {
            allFilled = false;
            break;
        }
    }

    if (allFilled) {
        checkBtn.style.opacity = "1";
        checkBtn.style.pointerEvents = "auto";
        checkBtn.style.cursor = "pointer";
    } else {
        checkBtn.style.opacity = "0.5";
        checkBtn.style.pointerEvents = "none";
        checkBtn.style.cursor = "default";
    }
}

// ASYNC SEQUENTIAL CHECK LOGIC
async function checkAnswers() {
    if (isChecking) return;
    
    // Play trigger click sound
    playSound(clickAudio);
    
    isChecking = true;
    
    // Lock Buttons
    const checkBtn = document.querySelector(".check-btn");
    const resetBtn = document.querySelector(".reset-btn");
    
    checkBtn.style.opacity = "0.5";
    checkBtn.style.pointerEvents = "none";
    resetBtn.style.opacity = "0.5";
    resetBtn.style.pointerEvents = "none";

    let correctCount = 0;

    // Check row by row
    for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
        const row = document.getElementById(`row-${i}`);
        const input = document.getElementById(`input-${i}`);
        const fb = document.getElementById(`fb-${i}`);
        const hint = document.getElementById(`hint-${i}`);

        if (!row || !input) continue;

        // 1. Smooth Auto-Scroll to active row
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // 2. Wait 800ms for visual focus
        await sleep(800);

        const rawValue = input.value.trim();
        const normalizedVal = normalizeText(rawValue);
        let isCorrect = false;

        if (i === 10) {
            // Q10 is open ended: correct if not empty and has length >= 2
            isCorrect = normalizedVal.length >= 2;
        } else {
            // Check against list of accepted variations
            const acceptedList = ACCEPTABLE_ANSWERS[i];
            isCorrect = acceptedList.some(item => normalizeText(item) === normalizedVal);
        }

        if (isCorrect) {
            correctCount++;
            
            // Success classes
            input.classList.remove("wrong");
            input.classList.add("correct");
            
            fb.textContent = "✓";
            fb.style.color = "#166534";
            
            playSound(correctAudio);
        } else {
            // Failure classes
            input.classList.remove("correct");
            input.classList.add("wrong");
            
            fb.textContent = "✗";
            fb.style.color = "#991b1b";
            
            // Show hint box with standard correct answer
            hint.textContent = HINT_KEY[i];
            hint.style.display = "block";
            
            playSound(wrongAudio);
        }

        // 3. Wait 600ms before checking the next row
        await sleep(600);
    }

    // Unlock Buttons
    isChecking = false;
    resetBtn.style.opacity = "1";
    resetBtn.style.pointerEvents = "auto";
    
    // Evaluate and display final score
    const resultMsg = document.getElementById("result-msg");
    if (correctCount === TOTAL_QUESTIONS) {
        resultMsg.innerHTML = "🎉 Excellent! All 10 answers are correct!";
        resultMsg.style.color = "#166534";
    } else {
        resultMsg.innerHTML = `You got ${correctCount} out of 10 correct. Keep learning! 💪`;
        resultMsg.style.color = "#991b1b";
    }
    
    // Auto-scroll to final feedback message
    resultMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });

    updateSubmitButtonState();
}

// RESET ALL ANSWERS AND STYLES
function resetAnswers() {
    if (isChecking) return;
    
    // Play trigger click sound
    playSound(clickAudio);
    
    // Reset inputs
    for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
        const input = document.getElementById(`input-${i}`);
        const fb = document.getElementById(`fb-${i}`);
        const hint = document.getElementById(`hint-${i}`);

        if (input) {
            input.value = "";
            input.classList.remove("correct", "wrong");
        }
        if (fb) {
            fb.textContent = "";
        }
        if (hint) {
            hint.textContent = "";
            hint.style.display = "none";
        }
    }

    // Reset final message
    const resultMsg = document.getElementById("result-msg");
    resultMsg.textContent = "";

    // Reset scroll back to top of the content
    const scrollContent = document.querySelector(".scroll-content");
    if (scrollContent) {
        scrollContent.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateSubmitButtonState();
}

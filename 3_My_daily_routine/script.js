// ─────────────────────────────────────────────
//  TYPING LOGIC
// ─────────────────────────────────────────────

let isFinished = false;

document.addEventListener('DOMContentLoaded', function () {
    const inputs = document.querySelectorAll('.input-zone');
    inputs.forEach(input => {
        // Create wrapper
        const wrapper = document.createElement('span');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        input.addEventListener('input', function() {
            const allFilled = Array.from(document.querySelectorAll('.input-zone')).every(inp => inp.value.trim() !== '');
            const resultMsg = document.getElementById('result-msg');
            
            if (allFilled && !isFinished) {
                isFinished = true;
                playCorrectSound();
                if (resultMsg) {
                    resultMsg.innerHTML = `
                        <img src="ASSETS/Great-job.png" alt="Great job!" style="
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
                    resultMsg.style.color = '';
                    resultMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else if (!allFilled && isFinished) {
                isFinished = false;
                if (resultMsg) {
                    resultMsg.innerHTML = '';
                }
            }
        });
        
        // Play typing sound
        input.addEventListener('keypress', playClickSound);
    });
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

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

document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('.line-input');
    const audioTyping = document.getElementById('audioTyping');

    // Function to play sound reliably
    function playSound(audioEl) {
        if (!audioEl) return;
        audioEl.currentTime = 0;
        audioEl.play().catch(e => console.log("Audio play failed:", e));
    }

    // Add typing sound
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            playSound(audioTyping);
            checkAllFilled();
        });
    });
});

// ─────────────────────────────────────────────
//  GIF LOADING LOGIC
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const loadingIconPath = "M6,2H18V8H18V8L14,12L18,16V16H18V22H6V16H6V16L10,12L6,8V8H6V2M16,16.5L12,12.5L8,16.5V20H16V16.5M12,11.5L16,7.5V4H8V7.5L12,11.5Z";
    const gifContainers = document.querySelectorAll('.image-wrapper');
    
    gifContainers.forEach(container => {
        const img = container.querySelector('img.item-image');
        if (img) {
            container.classList.add('loading');
            
            if (!container.querySelector('.loading-icon')) {
                const iconWrapper = document.createElement('div');
                iconWrapper.className = 'loading-icon';
                iconWrapper.innerHTML = `<svg viewBox="0 0 24 24" width="32" height="32" fill="#ff0000"><path d="${loadingIconPath}"/></svg>`;
                container.appendChild(iconWrapper);
            }
            
            container.loadingTextTimeout = setTimeout(() => {
                container.classList.add('show-loading-text');
            }, 300);

            const removeLoading = () => {
                clearTimeout(container.loadingTextTimeout);
                container.classList.remove('loading', 'show-loading-text');
                const icon = container.querySelector('.loading-icon');
                if (icon) icon.remove();
            };

            if (img.complete) {
                removeLoading();
            } else {
                img.addEventListener('load', removeLoading);
            }
        }
    });
});
